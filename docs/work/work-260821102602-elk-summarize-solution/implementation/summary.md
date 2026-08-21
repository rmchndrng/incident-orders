# Order Processing Solution Summary: incident-orders

**Repository:** incident-orders
**Date:** 2026-08-21
**Work Item:** work-260821102602-elk-summarize-solution

---

## Service Overview

**Service Name:** `incident-orders`

**Purpose:** Orders service responsible for calculating checkout totals in the order processing workflow.

**Technology Stack:** Node.js

**Source:** `[CODE: README.md:3]`, `[CODE: package.json:1]`

---

## Core Functionality

### `total(priceResponse, qty)` Function

**Signature:** `total(priceResponse, qty)`

**Purpose:** Calculates the order total by multiplying the unit price from the pricing service response by the quantity ordered.

**Implementation Details:**
- Reads the `price` field from the `priceResponse` parameter
- Performs multiplication: `priceResponse.price * qty`
- Returns the calculated total

**Source:** `[CODE: index.js:2-4]`

**Code Reference:**
```javascript
function total(priceResponse, qty) {
  return priceResponse.price * qty; // reads .price per the pricing contract
}
```

---

## Dependencies and Contracts

### Dependency: `incident-pricing` Service

**Relationship:** `incident-orders` → `incident-pricing` (consumer relationship)

**Contract Expectation:** The pricing service must return a response object containing a `price` field.

**Contract Field:** `response.price`

**Integration Point:** The `total()` function directly consumes the `priceResponse.price` field from the pricing service's API response.

**Source:** `[CODE: README.md:3]`, `[CODE: index.js:1]`, `[CODE: index.test.js:5-6]`

**Detailed Pricing Service Implementation:** `[UNKNOWN]` - The internal API structure, endpoint details, and current deployment configuration of the pricing service are owned by the `incident-pricing` repository.

---

## Known Issues and Incidents

### Incident: Checkout Totals Became `NaN`

**Symptom:** Checkout totals returned `NaN` (Not a Number) instead of valid numeric values.

**Trigger:** The issue occurred after a deployment of the pricing service.

**Root Cause Context:** Contract violation - the pricing service response structure changed, likely resulting in the `price` field being missing, undefined, or in an unexpected format. When `priceResponse.price` is undefined, the multiplication operation (`undefined * qty`) produces `NaN`.

**Impact:** Order checkout functionality broken, preventing customers from completing purchases.

**Source:** `[CODE: README.md:4]`

**Resolution Status:** `[UNKNOWN]` - The current fix status and whether the pricing service contract has been restored is not documented in this repository.

---

## Testing and Validation

### Test Framework

**Framework:** Node.js native test runner (`node:test` module)

**Test Command:** `npm test`

**Source:** `[CODE: README.md:4]`, `[CODE: package.json:1]`

### Test Coverage

**Primary Test:** Contract validation test ensuring correct consumption of the `.price` field from the pricing service response.

**Test Implementation:**
```javascript
test('orders totals a pricing response correctly (expects the .price contract)', () => {
  assert.strictEqual(total({ price: 100 }, 2), 200);
});
```

**What It Validates:**
- The `total()` function correctly reads the `price` field from the response object
- Multiplication logic produces the expected result (100 × 2 = 200)
- The contract expectation (`response.price`) is met

**Source:** `[CODE: index.test.js:1-7]`

---

## References

### Source Code Files
- `index.js` - Core service implementation
- `index.test.js` - Test suite and contract validation
- `package.json` - Service metadata and scripts
- `README.md` - Service description and incident documentation

### Related Repositories
- `incident-pricing` - Pricing service dependency (provides the `response.price` contract)

---

## Summary

The `incident-orders` service is a lightweight Node.js order processing component that calculates checkout totals by consuming a pricing contract from the `incident-pricing` service. Its core function multiplies a unit price by quantity, depending on the external pricing service to provide a valid `price` field in its response. The service experienced a production incident where checkout totals became `NaN` following a pricing service deployment that violated the expected contract, highlighting the critical dependency on the `response.price` field structure.
