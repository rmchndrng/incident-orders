const { test } = require('node:test');
const assert = require('node:assert');
const { total } = require('./index');

test('orders totals a pricing response correctly (expects the .price contract)', () => {
  assert.strictEqual(total({ price: 100 }, 2), 200);
});

test('orders handles cents unit from pricing service', () => {
  // When pricing returns cents, convert to dollars before multiplying
  assert.strictEqual(total({ price: 100, unit: "cents" }, 2), 2.00);
  assert.strictEqual(total({ price: 500, unit: "cents" }, 3), 15.00);
});

test('orders maintains legacy dollar behavior when unit is absent', () => {
  // Backward compatibility: no unit field means dollars
  assert.strictEqual(total({ price: 100 }, 2), 200);
  assert.strictEqual(total({ price: 50 }, 3), 150);
});
