const fs = require('fs');
let code = fs.readFileSync('src/app/api/nlp/route.ts', 'utf8');

code = code.replace(
  "let intent = 'add';",
  "let intent = 'add';\n  if (lowerText.includes('find') || lowerText.includes('search') || lowerText.includes('look for')) intent = 'search';"
);

code = code.replace(
  "category: cat,",
  "category: cat,\n      brand: null,\n      maxPrice: null"
);

const priceExtraction = `
    let maxPrice = null;
    const priceMatch = rawItem.match(/under \\$?(\\d+)/);
    if (priceMatch) {
       maxPrice = parseFloat(priceMatch[1]);
       cleaned = cleaned.replace(priceMatch[0], ' ');
    }
`;

code = code.replace(
  "let cleaned = rawItem;",
  "let cleaned = rawItem;\n" + priceExtraction
);

code = code.replace(
  "maxPrice: null",
  "maxPrice: maxPrice"
);

fs.writeFileSync('src/app/api/nlp/route.ts', code);
