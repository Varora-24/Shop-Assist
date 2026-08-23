const fs = require('fs');
let code = fs.readFileSync('src/app/api/nlp/route.ts', 'utf8');

code = code.replace(
  "let splitText = lowerText.replace(/,\\s*/g, '|').replace(/\\s+and\\s+/g, '|');",
  "let splitText = lowerText.replace(/,\\s*/g, '|').replace(/\\s+and\\s+/g, '|').replace(/\\s+also\\s+/g, '|').replace(/\\s+plus\\s+/g, '|');\n    // Split on numbers that aren't part of a word (e.g. '2 apples 3 bananas' -> '2 apples | 3 bananas')\n    splitText = splitText.replace(/\\s+(?=(?:\\d+|one|two|three|four|five|six|seven|eight|nine|ten)\\b)/g, '|');"
);

fs.writeFileSync('src/app/api/nlp/route.ts', code);
