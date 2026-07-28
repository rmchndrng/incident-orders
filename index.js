// Orders service. Consumes the pricing service's contract: response.amount.
const http = require('http');

function total(priceResponse, qty) {
  return priceResponse.amount * qty; // reads .amount per the pricing contract
}
module.exports = { total };

// Service entrypoint — only when executed directly (`node index.js`), so the unit
// test can require() this module without binding a port.
//
// This is the CROSS-SERVICE edge: orders calls pricing over HTTP and applies the
// contract. The pricing service returns { amount } which `total` uses to compute
// the order total.
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
