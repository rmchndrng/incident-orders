const { test } = require('node:test');
const assert = require('node:assert');
const { total } = require('./index');

test('orders totals a pricing response correctly (expects the .price contract)', () => {
  assert.strictEqual(total({ price: 100 }, 2), 200);
});

test('rejects null pricing response', () => {
  assert.throws(() => total(null, 2), /Invalid pricing response: expected object/);
});

test('rejects undefined pricing response', () => {
  assert.throws(() => total(undefined, 2), /Invalid pricing response: expected object/);
});

test('rejects pricing response without price field', () => {
  assert.throws(() => total({}, 2), /Invalid pricing response: missing or invalid price field/);
});

test('rejects pricing response with non-numeric price', () => {
  assert.throws(() => total({ price: '100' }, 2), /Invalid pricing response: missing or invalid price field/);
});

test('rejects negative price', () => {
  assert.throws(() => total({ price: -50 }, 2), /Invalid pricing response: missing or invalid price field/);
});

test('rejects invalid quantity', () => {
  assert.throws(() => total({ price: 100 }, -1), /Invalid quantity: expected non-negative number/);
});
