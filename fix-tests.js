const fs = require('fs');

let route = fs.readFileSync('src/app/api/nlp/route.ts', 'utf8');

// 1. Fix translateText punctuation (keep comma)
route = route.replace("translated.replace(/[।.,!?]/g, ' ');", "translated.replace(/[।.!?]/g, ' ');");

// 2. Add 'lemon juice' to LIQUID_ITEMS
route = route.replace("const LIQUID_ITEMS = ['juice', 'milk', 'water', 'oil', 'soda', 'coke', 'pepsi', 'tea', 'coffee', 'syrup', 'vinegar', 'sauce'];", "const LIQUID_ITEMS = ['juice', 'lemon juice', 'milk', 'water', 'oil', 'soda', 'coke', 'pepsi', 'tea', 'coffee', 'syrup', 'vinegar', 'sauce'];");

// 3. Update DICTIONARY for Spanish
route = route.replace("'manzana': 'apple'", "'manzana': 'apple', 'manzanas': 'apple'");
route = route.replace("'uno': 'one'", "'uno': 'one', 'un': 'one'");

fs.writeFileSync('src/app/api/nlp/route.ts', route);
