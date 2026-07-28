// CROSS-SERVICE integration test — the E2E acceptance criterion.
//
// Unlike index.test.js (a pure unit test on `total`), this exercises the real wire:
// orders → pricing over HTTP against the LIVE deployed pair. It is the check the E2E
// core runs after each in-pod `ps_app_redeploy` hot-swap, and it is what makes the
// incident observable end to end: while pricing serves { amount }, orders computes
// NaN and this fails; once the contract field is restored it passes.
//
// Env:
//   ORDERS_URL  (default http://127.0.0.1:3002) — the orders service under test
// Run: node --test integration.test.js

const { test } = require('node:test');
const assert = require('node:assert');

const ordersUrl = (process.env.ORDERS_URL || 'http://127.0.0.1:3002').replace(/\/$/, '');

test('orders totals against the LIVE pricing service (contract: response.amount)', async () => {
  const res = await fetch(`${ordersUrl}/total?qty=2`);
  assert.strictEqual(res.status, 200, `orders /total returned HTTP ${res.status}`);

  const body = await res.json();
  assert.ok(
    Number.isFinite(body.total),
    `orders computed a non-numeric total (${body.total}) — pricing served ` +
      `${JSON.stringify(body.pricing)}; it must expose the .amount contract field`,
  );
  assert.strictEqual(body.total, 200, 'expected 100 * 2 = 200 from the live pair');
});
