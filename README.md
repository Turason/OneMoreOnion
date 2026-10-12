# OneMoreOnion
Pantry and Recipe tracking app.

Static web app (no server, no build): open `index.html` in a browser.

- Recipes: a few defaults are included; add your own (one ingredient per line, e.g. `200 g Spaghetti`).
- Meal plan: add recipes to your plan; the shopping list shows what you still need after subtracting inventory.
- Dead reckoning: press **Cooked** on a planned meal to deduct its ingredients from inventory.
- Your data lives in your browser's local storage; **Export/Import** a JSON file to keep it in your own cloud storage.

Tests: `npm test`
