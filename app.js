(function () {
  const STORE = 'onemoreonion';
  let state = JSON.parse(localStorage.getItem(STORE) || 'null') || OnionCore.newState();
  const $ = (id) => document.getElementById(id);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const fmt = (i) => `${Math.round(i.qty * 100) / 100} ${i.unit} ${i.name}`.replace('  ', ' ');

  function li(parent, text, cls, buttons) {
    const el = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = text;
    if (cls) span.className = cls;
    el.appendChild(span);
    (buttons || []).forEach(([label, fn]) => {
      const b = document.createElement('button');
      b.textContent = label; b.onclick = () => { fn(); save(); };
      el.append(' ', b);
    });
    parent.appendChild(el);
  }

  function render() {
    ['recipes', 'plan', 'shopping', 'inventory'].forEach((id) => ($(id).textContent = ''));
    state.recipes.forEach((r) => li($('recipes'), `${r.name} (${r.ingredients.length} ingredients)`, '', [
      ['Plan', () => state.plan.push({ id: uid(), recipeId: r.id, cooked: false })],
      ['Delete', () => { state.recipes = state.recipes.filter((x) => x !== r); state.plan = state.plan.filter((p) => p.recipeId !== r.id); }]]));
    state.plan.forEach((p) => {
      const r = state.recipes.find((x) => x.id === p.recipeId);
      li($('plan'), r ? r.name : '(deleted)', p.cooked ? 'cooked' : '', [
        ...(p.cooked ? [] : [['Cooked', () => OnionCore.cook(state, p.id)]]),
        ['Remove', () => { state.plan = state.plan.filter((x) => x !== p); }]]);
    });
    OnionCore.shoppingList(state).forEach((i) => li($('shopping'), fmt(i)));
    state.inventory.forEach((i) => li($('inventory'), fmt(i), '', [['Remove', () => { state.inventory = state.inventory.filter((x) => x !== i); }]]));
  }
  function save() { localStorage.setItem(STORE, JSON.stringify(state)); render(); }

  $('recipe-form').onsubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    state.recipes.push({ id: uid(), name: f.name.value, servings: 1, ingredients: OnionCore.parseIngredients(f.ingredients.value) });
    f.reset(); save();
  };
  $('inv-form').onsubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    OnionCore.addInventory(state, { name: f.name.value, qty: f.qty.value, unit: f.unit.value });
    f.reset(); save();
  };
  $('bought').onclick = () => { OnionCore.shoppingList(state).forEach((i) => OnionCore.addInventory(state, i)); save(); };
  $('export').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
    a.download = 'onemoreonion.json'; a.click();
  };
  $('import').onchange = async (e) => {
    try {
      const d = JSON.parse(await e.target.files[0].text());
      if (!Array.isArray(d.recipes) || !Array.isArray(d.plan) || !Array.isArray(d.inventory)) throw new Error();
      state = d; save();
    } catch { alert('Invalid data file'); }
  };
  render();
})();
