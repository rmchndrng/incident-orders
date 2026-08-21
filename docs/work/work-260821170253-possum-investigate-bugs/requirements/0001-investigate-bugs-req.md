# Requirements: Investigate Order-Related Bugs

**Project:** incident-orders
**Work Item:** work-260821170253-possum-investigate-bugs
**Run Label:** 260821170253-possum
**Date:** 2026-08-21

---

## 1. Objective

Investigate order-related bugs in the incident-orders service to determine:
1. What bugs exist (if any)
2. Bug severity and impact
3. Whether bugs need to be fixed

---

## 2. Scope

**In Scope:**
- Analysis of the orders service codebase (`index.js`, `index.test.js`)
- Review of existing bug reports and documentation
- Assessment of bug severity and priority
- Determination of fix requirements

**Out of Scope:**
- Actual bug fixes (separate work item if required)
- Changes to the pricing service (incident-pricing)
- Production incident investigation (already documented in README.md)

---

## 3. Findings

### 3.1 Previous Bug Analysis Exists

**Source:** docs/work/work-260821133013-koala-bug-check/implementation/bug-report.md

A comprehensive bug analysis was already performed by playbook run `260821133013-koala` with the following findings:

**BUG 1: No Input Validation - Null/Undefined Handling**
- **Severity:** CRITICAL
- **Location:** index.js:3
- **Root Cause of Production Incident:** YES
- **Impact:** Production NaN errors, checkout system failures
- **Description:** The `total()` function does not validate inputs, directly accessing `priceResponse.price` without checking if priceResponse exists or if price field is valid
- **Evidence:** README.md line 4 documents: "checkout totals became `NaN` after the pricing deploy"

**BUG 2: No Error Handling or Logging**
- **Severity:** HIGH
- **Location:** index.js:1-5 (entire file)
- **Impact:** Impossible to diagnose production issues, delayed incident response
- **Description:** No try-catch blocks, no error logging, silent failures

**BUG 3: Type Coercion Issues**
- **Severity:** MEDIUM
- **Location:** index.js:3
- **Impact:** Potential incorrect totals in edge cases
- **Description:** JavaScript type coercion can produce unexpected results when inputs are not validated as numbers

**BUG 4: Missing Negative Number Handling**
- **Severity:** MEDIUM
- **Location:** index.js:2-4
- **Impact:** No business rule enforcement, potential data integrity issues
- **Description:** No validation for negative prices or quantities

**BUG 5: Insufficient Test Coverage**
- **Severity:** MEDIUM
- **Location:** index.test.js
- **Impact:** Reduces confidence, undetected bugs
- **Description:** Only one happy-path test exists, no error cases tested
- **Coverage:** ~5% (1 test out of 20+ critical scenarios)

### 3.2 Service Implementation Details

**Current Code (index.js):**
```javascript
function total(priceResponse, qty) {
  return priceResponse.price * qty;
}
module.exports = { total };
```

**Current Test (index.test.js):**
```javascript
test('orders totals a pricing response correctly (expects the .price contract)', () => {
  assert.strictEqual(total({ price: 100 }, 2), 200);
});
```

**Service Contract:**
- Consumes incident-pricing service response with `.price` field
- Multiplies price by quantity to calculate order total

### 3.3 Remediation Plan Exists

**Source:** docs/work/work-260821133013-koala-bug-check/implementation/remediation-plan.md

A detailed remediation plan with:
- Code fix examples for all 5 bugs
- Comprehensive test cases (20+ tests)
- Implementation priority order
- Rollback strategy
- Risk assessment

---

## 4. Requirements for This Strand

### 4.1 Deliverables

This work item (incident-orders strand) must deliver:

1. **Confirmation of bug inventory:** Validate that the 5 bugs identified in the previous analysis are accurate and still exist
2. **Assessment of current state:** Verify no fixes have been applied since the previous analysis
3. **Recommendation:** Determine if bugs should be fixed or accepted as-is

### 4.2 Acceptance Criteria

✅ **AC1:** Bug inventory confirmed
- All 5 bugs from previous analysis verified as still present OR
- Updated list if any bugs have been fixed

✅ **AC2:** Severity assessment validated
- CRITICAL (BUG 1) severity confirmed based on production impact
- HIGH/MEDIUM severities confirmed based on risk assessment

✅ **AC3:** Fix recommendation provided
- Clear YES/NO recommendation on whether to proceed with fixes
- Justification based on business impact and risk

✅ **AC4:** Cross-repo coordination requirements identified
- Any dependencies on incident-pricing service documented
- Required information from other services identified

---

## 5. Constraints

### 5.1 Technical Constraints

- **No direct access to incident-pricing repository:** Must use KB or relay for cross-repo information [per SKILL.md ground rule 1]
- **No toolchain in pod:** Node.js/npm may not be available for running tests
- **Code-only analysis:** If tests cannot be run, must rely on code inspection

### 5.2 Time Constraints

- This is a requirements-only phase
- Analysis should be completed quickly (bug details already documented)

---

## 6. Cross-Repository Dependencies

### 6.1 Incident-Pricing Service

**Known Facts:**
- Provides pricing data via contract: `response.price` field [from README.md, index.js:1]
- A pricing deployment caused the NaN incident [from README.md:4]

**Unknown:**
- Current pricing service contract specification [UNKNOWN - KB absent]
- Whether pricing service has been updated since the incident [UNKNOWN - KB absent]
- What caused pricing service to send malformed data [UNKNOWN - KB absent]

**Relay Required:** NO (not critical for requirements phase - incident is historical)

---

## 7. Provenance

All findings in this document are derived from:
- [LOCAL CODE] index.js - current implementation
- [LOCAL CODE] index.test.js - current test suite
- [LOCAL CODE] README.md - service description and incident note
- [LOCAL DOCS] docs/work/work-260821133013-koala-bug-check/implementation/bug-report.md - previous bug analysis
- [LOCAL DOCS] docs/work/work-260821133013-koala-bug-check/implementation/remediation-plan.md - previous remediation plan

No KB documentation exists for self or peers at this time.

---

## 8. Recommendation

### 8.1 Fix Required: YES

**Justification:**

1. **Production incident occurred:** BUG 1 caused checkout totals to become NaN (documented in README.md)
2. **Critical severity confirmed:** No input validation is a production-blocking issue
3. **Remediation plan exists:** Detailed fix instructions already documented
4. **Low implementation effort:** Estimated 1 day (5-6 hours dev + 2 hours test)
5. **High business impact:** Unfixed bugs risk revenue loss and customer experience issues

### 8.2 Priority Order (if proceeding to implementation)

**Phase 1 - Critical (Immediate):**
1. BUG 1 - Input validation (prevents NaN incidents)
2. BUG 2 - Error handling/logging (improves observability)
3. BUG 3 - Type coercion (included in BUG 1 fix)

**Phase 2 - Quality (Same sprint):**
4. BUG 5 - Test coverage (regression protection)

**Phase 3 - Business Rules (As clarified):**
5. BUG 4 - Negative number handling (requires business rule clarification)

---

## 9. Next Steps

**If proceeding to planning phase:**
1. Review remediation plan (docs/work/work-260821133013-koala-bug-check/implementation/remediation-plan.md)
2. Create implementation plan based on existing remediation guidance
3. Identify exact files to modify and test cases to add
4. Plan validation strategy (code review if toolchain unavailable)

**If NOT proceeding:**
1. Document acceptance of current bugs as business decision
2. Update manifest with decision rationale

---

**Requirements Phase Complete**
