# Remediation Plan: Orders Service Bugs

**Project:** incident-orders
**Date:** 2026-08-21
**Work Item:** work-260821133013-koala-bug-check

---

## Overview

This document provides concrete, actionable recommendations for fixing the 5 bugs identified in the bug report. Fixes are prioritized by severity and include code examples, test cases, and implementation guidance.

---

## Priority 1: BUG 1 - Add Input Validation (CRITICAL)

**Target:** Prevent null/undefined access that caused the NaN production incident

### Recommended Code Changes

**File:** `index.js`

**Option A: Defensive with Default Behavior (Recommended)**
```javascript
function total(priceResponse, qty) {
  // Validate priceResponse exists and has price field
  if (!priceResponse || typeof priceResponse.price !== 'number') {
    throw new Error('Invalid priceResponse: must have numeric price field');
  }

  // Validate quantity
  if (typeof qty !== 'number') {
    throw new Error('Invalid quantity: must be a number');
  }

  // Validate no NaN or Infinity values
  if (isNaN(priceResponse.price) || !isFinite(priceResponse.price)) {
    throw new Error('Invalid price: must be a finite number');
  }

  if (isNaN(qty) || !isFinite(qty)) {
    throw new Error('Invalid quantity: must be a finite number');
  }

  return priceResponse.price * qty;
}
```

**Option B: Graceful Fallback (Alternative)**
```javascript
function total(priceResponse, qty) {
  // Provide default of 0 for invalid inputs (less safe but no exceptions)
  const price = (priceResponse && typeof priceResponse.price === 'number')
    ? priceResponse.price
    : 0;
  const quantity = typeof qty === 'number' ? qty : 0;

  // Log warnings for debugging
  if (price === 0 && (!priceResponse || typeof priceResponse.price !== 'number')) {
    console.warn('Invalid priceResponse, using 0:', priceResponse);
  }
  if (quantity === 0 && typeof qty !== 'number') {
    console.warn('Invalid quantity, using 0:', qty);
  }

  return price * quantity;
}
```

**Recommendation:** Use Option A (throw errors) for fail-fast behavior. This makes bugs visible immediately rather than silently producing incorrect totals.

### Required Test Cases

**File:** `index.test.js`

```javascript
// Add these tests for BUG 1:

test('throws error when priceResponse is null', () => {
  assert.throws(() => total(null, 2), /Invalid priceResponse/);
});

test('throws error when priceResponse is undefined', () => {
  assert.throws(() => total(undefined, 2), /Invalid priceResponse/);
});

test('throws error when price field is missing', () => {
  assert.throws(() => total({}, 2), /Invalid priceResponse/);
});

test('throws error when price field is wrong name', () => {
  assert.throws(() => total({ amount: 100 }, 2), /Invalid priceResponse/);
});

test('throws error when quantity is null', () => {
  assert.throws(() => total({ price: 100 }, null), /Invalid quantity/);
});

test('throws error when quantity is undefined', () => {
  assert.throws(() => total({ price: 100 }, undefined), /Invalid quantity/);
});

test('throws error when price is NaN', () => {
  assert.throws(() => total({ price: NaN }, 2), /must be a finite number/);
});

test('throws error when price is Infinity', () => {
  assert.throws(() => total({ price: Infinity }, 2), /must be a finite number/);
});
```

### Implementation Steps

1. Update `index.js` with validation logic (Option A recommended)
2. Add test cases to `index.test.js`
3. Run tests: `npm test`
4. Verify all new tests pass
5. Verify existing test still passes (regression check)

### Success Criteria

- ✅ Function throws errors for null/undefined inputs
- ✅ Function throws errors for missing `price` field
- ✅ Function throws errors for non-numeric types
- ✅ All test cases pass
- ✅ No NaN values can be produced

---

## Priority 2: BUG 2 - Add Error Handling and Logging (HIGH)

**Target:** Improve observability and debugging capability

### Recommended Code Changes

**File:** `index.js`

```javascript
function total(priceResponse, qty) {
  try {
    // Validation logic from BUG 1 fix above
    if (!priceResponse || typeof priceResponse.price !== 'number') {
      throw new Error('Invalid priceResponse: must have numeric price field');
    }

    if (typeof qty !== 'number') {
      throw new Error('Invalid quantity: must be a number');
    }

    if (isNaN(priceResponse.price) || !isFinite(priceResponse.price)) {
      throw new Error('Invalid price: must be a finite number');
    }

    if (isNaN(qty) || !isFinite(qty)) {
      throw new Error('Invalid quantity: must be a finite number');
    }

    const result = priceResponse.price * qty;

    // Log successful calculation (optional - remove if too verbose)
    // console.log(`Calculated total: ${priceResponse.price} * ${qty} = ${result}`);

    return result;

  } catch (error) {
    // Log error with context
    console.error('Error calculating order total:', {
      error: error.message,
      priceResponse,
      qty,
      timestamp: new Date().toISOString()
    });

    // Re-throw to caller
    throw error;
  }
}
```

**Alternative: Separate Logging Function**
```javascript
function logError(message, context) {
  console.error({
    timestamp: new Date().toISOString(),
    service: 'orders',
    function: 'total',
    error: message,
    context
  });
}

function total(priceResponse, qty) {
  if (!priceResponse || typeof priceResponse.price !== 'number') {
    logError('Invalid priceResponse', { priceResponse, qty });
    throw new Error('Invalid priceResponse: must have numeric price field');
  }

  // ... rest of validation

  return priceResponse.price * qty;
}
```

### Implementation Steps

1. Add try-catch wrapper around validation and calculation
2. Add structured error logging with context
3. Add optional success logging (can be removed if too verbose)
4. Ensure errors are re-thrown (don't swallow them)
5. Test that errors are logged properly

### Success Criteria

- ✅ All errors are logged with context (inputs, timestamp, error message)
- ✅ Errors are still thrown to callers (not swallowed)
- ✅ Log format is structured (JSON-like) for parsing
- ✅ Debugging is easier with logged context

---

## Priority 3: BUG 3 - Add Type Checking (MEDIUM)

**Target:** Prevent type coercion issues

### Recommended Code Changes

**Note:** BUG 1 fix already includes type checking via `typeof === 'number'`

The validation from BUG 1 fix handles this:
```javascript
if (typeof priceResponse.price !== 'number') {
  throw new Error('Invalid priceResponse: must have numeric price field');
}

if (typeof qty !== 'number') {
  throw new Error('Invalid quantity: must be a number');
}
```

### Additional Test Cases

**File:** `index.test.js`

```javascript
// Add these tests for BUG 3:

test('throws error when price is a string', () => {
  assert.throws(() => total({ price: "10" }, 2), /must have numeric price field/);
});

test('throws error when quantity is a string', () => {
  assert.throws(() => total({ price: 10 }, "2"), /must be a number/);
});

test('throws error when both are strings', () => {
  assert.throws(() => total({ price: "10" }, "2"), /must have numeric price field/);
});

test('throws error when price is a boolean', () => {
  assert.throws(() => total({ price: true }, 2), /must have numeric price field/);
});

test('throws error when price is an object', () => {
  assert.throws(() => total({ price: { value: 10 } }, 2), /must have numeric price field/);
});

test('throws error when price is an array', () => {
  assert.throws(() => total({ price: [10] }, 2), /must have numeric price field/);
});
```

### Implementation Steps

1. Verify BUG 1 fix includes `typeof` checks
2. Add test cases for string and other type inputs
3. Run tests to verify type coercion is prevented

### Success Criteria

- ✅ String inputs are rejected
- ✅ Non-numeric types (boolean, object, array) are rejected
- ✅ Only actual number types are accepted
- ✅ No accidental type coercion can occur

---

## Priority 4: BUG 4 - Add Business Rule Validation (MEDIUM)

**Target:** Enforce positive-only prices and quantities (if required by business rules)

### Recommended Code Changes

**File:** `index.js`

**Option A: Strict Positive-Only (Recommended if refunds handled separately)**
```javascript
function total(priceResponse, qty) {
  // ... existing validation from BUG 1 fix ...

  // Add business rule validation
  if (priceResponse.price < 0) {
    throw new Error('Invalid price: must be positive (negative prices not allowed)');
  }

  if (qty < 0) {
    throw new Error('Invalid quantity: must be positive (negative quantities not allowed)');
  }

  // Optional: reject zero values
  if (priceResponse.price === 0) {
    throw new Error('Invalid price: must be greater than zero');
  }

  if (qty === 0) {
    throw new Error('Invalid quantity: must be greater than zero');
  }

  return priceResponse.price * qty;
}
```

**Option B: Allow Zero, Reject Negative**
```javascript
function total(priceResponse, qty) {
  // ... existing validation ...

  if (priceResponse.price < 0) {
    throw new Error('Invalid price: must not be negative');
  }

  if (qty < 0) {
    throw new Error('Invalid quantity: must not be negative');
  }

  // Allow zero (could be valid for free items or zero quantity)
  return priceResponse.price * qty;
}
```

**Recommendation:** Clarify business requirements:
- Can prices be zero? (free items)
- Can quantities be zero? (items removed from cart)
- How are refunds/returns handled? (separate function or negative values allowed?)

Choose Option A if refunds are handled separately, Option B if zero is valid.

### Required Test Cases

**File:** `index.test.js`

```javascript
// Add these tests for BUG 4:

test('throws error for negative price', () => {
  assert.throws(() => total({ price: -10 }, 2), /must be positive|must not be negative/);
});

test('throws error for negative quantity', () => {
  assert.throws(() => total({ price: 10 }, -2), /must be positive|must not be negative/);
});

test('throws error for negative price and quantity', () => {
  assert.throws(() => total({ price: -10 }, -2), /must be positive|must not be negative/);
});

// Optional: if zero is invalid
test('throws error for zero price', () => {
  assert.throws(() => total({ price: 0 }, 2), /must be greater than zero/);
});

test('throws error for zero quantity', () => {
  assert.throws(() => total({ price: 10 }, 0), /must be greater than zero/);
});

// Or: if zero is valid
test('returns zero for zero price', () => {
  assert.strictEqual(total({ price: 0 }, 2), 0);
});

test('returns zero for zero quantity', () => {
  assert.strictEqual(total({ price: 10 }, 0), 0);
});
```

### Implementation Steps

1. **Clarify business requirements** - Are negative/zero values valid?
2. Add range validation after type validation
3. Add appropriate test cases
4. Update documentation to reflect business rules

### Success Criteria

- ✅ Business rules are enforced in code
- ✅ Invalid ranges are rejected
- ✅ Tests document expected behavior
- ✅ Requirements are clear and documented

---

## Priority 5: BUG 5 - Expand Test Coverage (MEDIUM)

**Target:** Achieve comprehensive test coverage

### Recommended Test Suite

**File:** `index.test.js`

**Complete test suite combining all fixes:**

```javascript
const { test } = require('node:test');
const assert = require('node:assert');
const { total } = require('./index');

// HAPPY PATH TESTS
test('calculates total correctly with valid inputs', () => {
  assert.strictEqual(total({ price: 100 }, 2), 200);
});

test('calculates total for single quantity', () => {
  assert.strictEqual(total({ price: 50 }, 1), 50);
});

test('calculates total for fractional price', () => {
  assert.strictEqual(total({ price: 9.99 }, 3), 29.97);
});

// NULL/UNDEFINED TESTS (BUG 1)
test('throws error when priceResponse is null', () => {
  assert.throws(() => total(null, 2), /Invalid priceResponse/);
});

test('throws error when priceResponse is undefined', () => {
  assert.throws(() => total(undefined, 2), /Invalid priceResponse/);
});

test('throws error when price field is missing', () => {
  assert.throws(() => total({}, 2), /Invalid priceResponse/);
});

test('throws error when quantity is null', () => {
  assert.throws(() => total({ price: 100 }, null), /Invalid quantity/);
});

test('throws error when quantity is undefined', () => {
  assert.throws(() => total({ price: 100 }, undefined), /Invalid quantity/);
});

// TYPE VALIDATION TESTS (BUG 3)
test('throws error when price is a string', () => {
  assert.throws(() => total({ price: "10" }, 2), /must have numeric price field/);
});

test('throws error when quantity is a string', () => {
  assert.throws(() => total({ price: 10 }, "2"), /must be a number/);
});

test('throws error when price is boolean', () => {
  assert.throws(() => total({ price: true }, 2), /must have numeric price field/);
});

test('throws error when price is array', () => {
  assert.throws(() => total({ price: [10] }, 2), /must have numeric price field/);
});

// EDGE CASE TESTS
test('throws error when price is NaN', () => {
  assert.throws(() => total({ price: NaN }, 2), /must be a finite number/);
});

test('throws error when price is Infinity', () => {
  assert.throws(() => total({ price: Infinity }, 2), /must be a finite number/);
});

test('throws error when quantity is NaN', () => {
  assert.throws(() => total({ price: 100 }, NaN), /must be a finite number/);
});

// BUSINESS RULE TESTS (BUG 4 - adjust based on requirements)
test('throws error for negative price', () => {
  assert.throws(() => total({ price: -10 }, 2), /must be positive/);
});

test('throws error for negative quantity', () => {
  assert.throws(() => total({ price: 10 }, -2), /must be positive/);
});

// CONTRACT VIOLATION TESTS
test('throws error when price field has wrong name', () => {
  assert.throws(() => total({ amount: 100 }, 2), /Invalid priceResponse/);
});

test('throws error when price is nested incorrectly', () => {
  assert.throws(() => total({ data: { price: 100 } }, 2), /Invalid priceResponse/);
});
```

### Coverage Goals

**Current Coverage:** ~5% (1 test)
**Target Coverage:** 95%+ (20+ tests)

**Coverage by Category:**
- ✅ Happy path: 3 tests
- ✅ Null/undefined: 5 tests
- ✅ Type validation: 4 tests
- ✅ Edge cases: 4 tests
- ✅ Business rules: 2 tests
- ✅ Contract violations: 2 tests

**Total:** 20 tests covering all major scenarios

### Implementation Steps

1. Add all recommended test cases to `index.test.js`
2. Run tests: `npm test`
3. Verify all tests pass (or fail appropriately before fixes)
4. Use tests to validate each bug fix
5. Achieve green test suite

### Success Criteria

- ✅ 20+ test cases implemented
- ✅ All major bug scenarios tested
- ✅ Test suite documents expected behavior
- ✅ Regression protection in place

---

## Implementation Order

**Phase 1: Critical Fixes (Immediate)**
1. Fix BUG 1 (Input Validation) - Add null/undefined/type checks
2. Fix BUG 2 (Error Handling) - Add logging and try-catch
3. Fix BUG 3 (Type Coercion) - Included in BUG 1 fix

**Phase 2: Quality Improvements (Same Sprint)**
4. Fix BUG 5 (Test Coverage) - Add comprehensive test suite
5. Verify all tests pass

**Phase 3: Business Rules (Next Sprint or as clarified)**
6. Clarify business requirements for negative/zero values
7. Fix BUG 4 (Negative Numbers) - Add business rule validation

---

## Rollback Plan

If any fix causes issues:

1. **Identify the commit** - Each bug fix should be a separate commit
2. **Revert the specific commit:** `git revert <commit-sha>`
3. **Test the rollback** - Verify service still works
4. **Re-fix properly** - Address the issue that caused the rollback

**Commit Strategy (Recommended):**
- Commit 1: BUG 1 fix + tests
- Commit 2: BUG 2 fix (logging)
- Commit 3: BUG 5 fix (remaining tests)
- Commit 4: BUG 4 fix + tests (once requirements clarified)

This allows individual rollback if any single fix causes issues.

---

## Testing Strategy

### Unit Testing
- Run `npm test` after each fix
- Verify new tests pass
- Verify existing tests still pass (regression check)

### Integration Testing (Recommended)
- Test with actual pricing service responses
- Test with malformed pricing service responses (simulate contract violation)
- Verify error logging works in real environment

### Load Testing (Optional)
- Verify validation doesn't significantly impact performance
- Target: <1ms overhead for validation logic

---

## Success Metrics

**Before Fixes:**
- 5 known bugs
- 1 test case (~5% coverage)
- 1 production incident (NaN issue)
- No input validation
- No error logging

**After Fixes:**
- 0 known bugs
- 20+ test cases (95%+ coverage)
- Input validation prevents NaN
- Error logging enables debugging
- Type safety enforced
- Business rules enforced

**Key Metric:** Zero `NaN` errors in production

---

## Estimated Effort

**Development Time:**
- BUG 1 fix: 1-2 hours (validation logic + tests)
- BUG 2 fix: 1 hour (logging)
- BUG 3 fix: Included in BUG 1
- BUG 4 fix: 1 hour (once requirements clear)
- BUG 5 fix: 2 hours (comprehensive test suite)

**Total: 5-6 hours development time**

**Testing Time:** 2 hours (unit + integration testing)

**Total Estimated Effort: 1 day**

---

## Dependencies

**Internal:**
- None - all fixes are self-contained in this repository

**External:**
- Need to understand current pricing service contract (from incident-pricing team)
- May need business team input on negative/zero value rules (BUG 4)

**Toolchain:**
- Node.js (for running tests)
- npm (for test command)

---

## Risk Assessment

**Low Risk Fixes:**
- BUG 2 (Logging) - Adding logging is safe, no behavior change
- BUG 5 (Tests) - Adding tests is safe

**Medium Risk Fixes:**
- BUG 1 (Validation) - Could reject currently-accepted invalid inputs (this is desired)
- BUG 3 (Type Checking) - Included in BUG 1, same risk

**High Risk Fixes:**
- BUG 4 (Business Rules) - Could break existing behavior if current system allows negatives

**Mitigation:**
- Deploy to staging first
- Monitor error logs after deployment
- Have rollback plan ready
- Deploy during low-traffic window

---

**Plan End**
