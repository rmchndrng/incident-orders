// Orders service. Consumes the pricing service's contract: response.price.
function total(priceResponse, qty) {
  return priceResponse.price * qty; // reads .price per the pricing contract
}
module.exports = { total };
