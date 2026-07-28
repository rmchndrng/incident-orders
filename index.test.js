const { test } = require('node:test');
const assert = require('node:assert');
const { total } = require('./index');

test('orders totals a pricing response correctly (expects the .price contract)', () => {
  assert.strictEqual(total({ price: 100 }, 2), 200);
});

test('orders handles cents unit by converting to major units', () => {
  // 100 cents = $1.00, multiplied by qty 2 = $2.00
  assert.strictEqual(total({ price: 100, unit: 'cents' }, 2), 2);
});

test('orders maintains backward compatibility when unit is absent', () => {
  // No unit field means legacy dollar behaviour
  assert.strictEqual(total({ price: 1.5 }, 3), 4.5);
});
