const fs = require('fs');
let code = fs.readFileSync('src/app/api/nlp/route.ts', 'utf8');

const dictCode = `
const DICTIONARY: Record<string, string> = {
  // Hindi
  'एक': 'one', 'दो': 'two', 'तीन': 'three', 'चार': 'four', 'पांच': 'five', 'छह': 'six', 'सात': 'seven', 'आठ': 'eight', 'नौ': 'nine', 'दस': 'ten',
  'किलो': 'kg', 'ग्राम': 'grams', 'लीटर': 'liter', 'मिलीलीटर': 'ml', 'दर्जन': 'dozen',
  'सेब': 'apple', 'आलू': 'potato', 'बैगन': 'eggplant', 'दूध': 'milk', 'पानी': 'water', 'रोटी': 'bread', 'चीनी': 'sugar', 'चिकन': 'chicken', 'अंडा': 'egg', 'अंडे': 'egg', 'प्याज': 'onion', 'टमाटर': 'tomato', 'केला': 'banana', 'और': 'and', 'भी': 'also',
  
  // Spanish
  'uno': 'one', 'dos': 'two', 'tres': 'three', 'cuatro': 'four', 'cinco': 'five', 'seis': 'seis', 'siete': 'seven', 'ocho': 'eight', 'nueve': 'nine', 'diez': 'ten',
  'kilo': 'kg', 'gramos': 'grams', 'litro': 'liter', 'litros': 'liter', 'docena': 'dozen',
  'manzana': 'apple', 'papa': 'potato', 'patata': 'potato', 'berenjena': 'eggplant', 'leche': 'milk', 'agua': 'water', 'pan': 'bread', 'azúcar': 'sugar', 'pollo': 'chicken', 'huevo': 'egg', 'cebolla': 'onion', 'tomate': 'tomato', 'plátano': 'banana', 'y': 'and', 'también': 'also'
};

function translateText(text: string) {
  let translated = text;
  // Replace punctuation
  translated = translated.replace(/[।.,!?]/g, ' ');
  for (const [word, trans] of Object.entries(DICTIONARY)) {
    translated = translated.replace(new RegExp(\`(?:\\\\b|^|\\\\s)\${word}(?:\\\\b|$|\\\\s)\`, 'gi'), \` \${trans} \`);
  }
  return translated.replace(/\\s+/g, ' ').trim();
}
`;

code = code.replace(
  "function fallbackRegexParser(text: string) {",
  dictCode + "\nfunction fallbackRegexParser(text: string) {\n  text = translateText(text);"
);

fs.writeFileSync('src/app/api/nlp/route.ts', code);
