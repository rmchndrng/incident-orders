const { test } = require('node:test');
const assert = require('node:assert');
const { total } = require('./index');

test('orders totals a pricing response correctly (expects the .price contract)', () => {
  assert.strictEqual(total({ price: 100 }, 2), 200);
});

test('orders converts cents to dollars when unit is "cents"', () => {
  assert.strictEqual(total({ price: 100, unit: "cents" }, 2), 2.00);
});

test('orders maintains legacy behavior when unit is absent', () => {
  assert.strictEqual(total({ price: 2.00 }, 2), 4.00);
});
