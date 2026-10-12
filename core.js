(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OnionCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const key = (i) => i.name.trim().toLowerCase() + '|' + (i.unit || '').trim().toLowerCase();

  const DEFAULT_RECIPES = [
    { id: 'default-pasta', name: 'Tomato Pasta', servings: 2, ingredients: [
      { name: 'Spaghetti', qty: 200, unit: 'g' }, { name: 'Tomato', qty: 4, unit: '' },
      { name: 'Onion', qty: 1, unit: '' }, { name: 'Olive oil', qty: 2, unit: 'tbsp' }] },
    { id: 'default-omelette', name: 'Onion Omelette', servings: 1, ingredients: [
      { name: 'Egg', qty: 3, unit: '' }, { name: 'Onion', qty: 1, unit: '' }, { name: 'Butter', qty: 10, unit: 'g' }] },
    { id: 'default-rice', name: 'Fried Rice', servings: 2, ingredients: [
      { name: 'Rice', qty: 200, unit: 'g' }, { name: 'Egg', qty: 2, unit: '' },
      { name: 'Onion', qty: 1, unit: '' }, { name: 'Soy sauce', qty: 2, unit: 'tbsp' }] },
  ];

  function newState() {
    return { recipes: DEFAULT_RECIPES.map((r) => JSON.parse(JSON.stringify(r))), plan: [], inventory: [] };
  }

  // Sum ingredient quantities across planned (uncooked) meals.
  function required(state) {
    const need = new Map();
    for (const entry of state.plan) {
      if (entry.cooked) continue;
      const recipe = state.recipes.find((r) => r.id === entry.recipeId);
      if (!recipe) continue;
      for (const ing of recipe.ingredients) {
        const k = key(ing);
        const cur = need.get(k) || { name: ing.name.trim(), unit: ing.unit || '', qty: 0 };
        cur.qty += Number(ing.qty) || 0;
        need.set(k, cur);
      }
    }
    return [...need.values()];
  }

  function stockOf(state, item) {
    return state.inventory.filter((i) => key(i) === key(item)).reduce((s, i) => s + i.qty, 0);
  }

  // What must be bought: required minus inventory on hand.
  function shoppingList(state) {
    return required(state)
      .map((n) => ({ ...n, qty: n.qty - stockOf(state, n) }))
      .filter((n) => n.qty > 0);
  }

  function addInventory(state, item) {
    const found = state.inventory.find((i) => key(i) === key(item));
    if (found) found.qty += Number(item.qty) || 0;
    else state.inventory.push({ name: item.name.trim(), unit: item.unit || '', qty: Number(item.qty) || 0 });
  }

  // Dead reckoning: deduct a planned recipe's ingredients from inventory (never below 0).
  function cook(state, planId) {
    const entry = state.plan.find((p) => p.id === planId);
    if (!entry || entry.cooked) return false;
    const recipe = state.recipes.find((r) => r.id === entry.recipeId);
    if (!recipe) return false;
    for (const ing of recipe.ingredients) {
      const inv = state.inventory.find((i) => key(i) === key(ing));
      if (inv) inv.qty = Math.max(0, inv.qty - (Number(ing.qty) || 0));
    }
    state.inventory = state.inventory.filter((i) => i.qty > 0);
    entry.cooked = true;
    return true;
  }

  // Accepts "200 g Spaghetti" / "4 Tomato" per line.
  function parseIngredients(text) {
    return text.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
      const m = line.match(/^([\d.]+)\s+(?:(g|kg|ml|l|tbsp|tsp|cup|cups|oz|lb)\s+)?(.+)$/i);
      return m ? { qty: parseFloat(m[1]), unit: (m[2] || '').toLowerCase(), name: m[3] }
               : { qty: 1, unit: '', name: line };
    });
  }

  return { newState, required, shoppingList, addInventory, cook, parseIngredients, DEFAULT_RECIPES };
});
