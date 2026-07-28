const { test } = require('node:test');
const assert = require('node:assert');
const { total } = require('./index');

test('orders totals a pricing response correctly (expects the .amount contract)', () => {
  assert.strictEqual(total({ amount: 100 }, 2), 200);
});
