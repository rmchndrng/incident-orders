// Orders service. Consumes the pricing service's contract.
// Attach to actual price field rather than assuming .price
function total(priceResponse, qty) {
  // Attach to the actual price value, trying common field names
  const price = priceResponse.price ?? priceResponse.amount ?? priceResponse.value ?? priceResponse.total;
  return price * qty;
}
module.exports = { total };
