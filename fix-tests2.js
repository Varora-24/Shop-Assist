const fs = require('fs');
let route = fs.readFileSync('src/app/api/nlp/route.ts', 'utf8');

route = route.replace(
  "else if (['ml','mill','l','liter','litre','bottle','bottles'].includes(foundUnit || '') && (cat === 'Meat/Seafood' || cat === 'Produce' || cat === 'Bakery')) {",
  "else if (['ml','mill','l','liter','litre','bottle','bottles'].includes(foundUnit || '') && (cat === 'Meat/Seafood' || cat === 'Produce' || cat === 'Bakery') && !LIQUID_ITEMS.some(liq => cleaned.includes(liq))) {"
);

route = route.replace("'un': 'one'", "'un': 'one', 'de': ' '");
fs.writeFileSync('src/app/api/nlp/route.ts', route);
