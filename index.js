// Orders service. Consumes the pricing service's contract: response.price.
const http = require('http');

function total(priceResponse, qty) {
  // Read .price per the pricing contract
  let priceValue = priceResponse.price;

  // If unit is declared as "cents", convert to dollars (major units)
  if (priceResponse.unit === "cents") {
    priceValue = priceValue / 100;
  }
  // If unit is absent, keep legacy dollar behavior (back-compat)

  return priceValue * qty;
}
module.exports = { total };

// Service entrypoint — only when executed directly (`node index.js`), so the unit
// test can require() this module without binding a port.
//
// This is the CROSS-SERVICE edge: orders calls pricing over HTTP and applies the
// contract. When pricing serves { amount } instead of { price }, `total` yields NaN
// — the incident, observable end to end rather than only in a unit test.
if (require.main === module) {
  const port = Number(process.env.PORT || 3002);
  const pricingUrl = (process.env.PRICING_URL || 'http://127.0.0.1:3001').replace(/\/$/, '');

  http
    .createServer(async (req, res) => {
      const [path, query] = (req.url || '').split('?');
      if (path === '/health') {
        res.writeHead(200, { 'content-type': 'text/plain' });
        return res.end('ok');
      }
      if (path === '/total') {
        const qty = Number(new URLSearchParams(query || '').get('qty') || 1);
        try {
          const upstream = await fetch(`${pricingUrl}/price`);
          const priceResponse = await upstream.json();
          const value = total(priceResponse, qty);
          res.writeHead(200, { 'content-type': 'application/json' });
          return res.end(JSON.stringify({ total: value, qty, pricing: priceResponse }));
        } catch (err) {
          res.writeHead(502, { 'content-type': 'application/json' });
          return res.end(JSON.stringify({ error: `pricing unreachable: ${err.message}` }));
        }
      }
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
    })
    .listen(port, '0.0.0.0', () => console.log(`[orders] listening on ${port} → pricing ${pricingUrl}`));
}
