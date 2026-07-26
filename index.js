// Orders service. Consumes the pricing service's contract: response.price.
function total(priceResponse, qty) {
  // Handle unit field: when unit is "cents", convert to dollars before multiplying
  if (priceResponse.unit === "cents") {
    const priceInDollars = priceResponse.price / 100;
    return priceInDollars * qty;
  } else {
    // Legacy: when unit is absent, assume dollars
    return priceResponse.price * qty;
  }
}
module.exports = { total };
