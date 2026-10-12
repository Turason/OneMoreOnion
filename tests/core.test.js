const test = require('node:test');
const assert = require('node:assert');
const C = require('../core.js');

test('shopping list subtracts inventory', () => {
  const s = C.newState();
  s.plan.push({ id: 'a', recipeId: 'default-omelette' }, { id: 'b', recipeId: 'default-rice' });
  C.addInventory(s, { name: 'onion', qty: 1, unit: '' });
  const list = C.shoppingList(s);
  assert.strictEqual(list.find((i) => i.name === 'Onion').qty, 1);
  assert.strictEqual(list.find((i) => i.name === 'Egg').qty, 5);
});

test('cooking deducts inventory and clears the need', () => {
  const s = C.newState();
  s.plan.push({ id: 'a', recipeId: 'default-omelette' });
  C.addInventory(s, { name: 'Egg', qty: 4, unit: '' });
  assert.ok(C.cook(s, 'a'));
  assert.strictEqual(s.inventory.find((i) => i.name === 'Egg').qty, 1);
  assert.strictEqual(C.cook(s, 'a'), false);
  assert.deepStrictEqual(C.shoppingList(s), []);
});

test('parseIngredients', () => {
  assert.deepStrictEqual(C.parseIngredients('200 g Rice\n2 Egg'),
    [{ qty: 200, unit: 'g', name: 'Rice' }, { qty: 2, unit: '', name: 'Egg' }]);
});
