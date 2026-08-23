const fs = require('fs');
const content = fs.readFileSync('src/app/api/nlp/route.ts', 'utf8');

// I need CATEGORY_MAP and LIQUID_ITEMS too
const vars = content.substring(content.indexOf('const CATEGORY_MAP'), content.indexOf('function inferCategory'));
const inferCat = content.substring(content.indexOf('function inferCategory'), content.indexOf('function fallbackRegexParser'));
const fallbackStr = content.substring(content.indexOf('function fallbackRegexParser'), content.indexOf('export async function POST'));

eval(vars + inferCat + fallbackStr + `
const phrases = [
  "add beef",
  "at 3 kg of beef",
  "add another 2 kg of beef",
  "tofu as well",
  "300 ml of lemon juice",
  "suggest something to add",
  "blueberries, chikus and strawberries also"
];
for (const p of phrases) {
  console.log("----");
  console.log("Input:", p);
  console.log(JSON.stringify(fallbackRegexParser(p), null, 2));
}
`);
