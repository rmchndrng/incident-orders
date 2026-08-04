// Orders service. Consumes the pricing service's contract: response.price.
function total(priceResponse, qty) {
  // Defensive validation to handle pricing service failures
  if (!priceResponse || typeof priceResponse !== 'object') {
    throw new Error('Invalid pricing response: expected object');
  }

  if (typeof priceResponse.price !== 'number' || priceResponse.price < 0) {
    throw new Error('Invalid pricing response: missing or invalid price field');
  }

  if (typeof qty !== 'number' || qty < 0) {
    throw new Error('Invalid quantity: expected non-negative number');
  }

  return priceResponse.price * qty; // reads .price per the pricing contract
}
module.exports = { total };
