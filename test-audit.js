const fs = require('fs');

const content = fs.readFileSync('src/app/api/nlp/route.ts', 'utf8');

const vars = content.substring(content.indexOf('const CATEGORY_MAP'), content.indexOf('function translateText'));
const transStr = content.substring(content.indexOf('function translateText'), content.indexOf('function inferCategory'));
const inferCat = content.substring(content.indexOf('function inferCategory'), content.indexOf('function fallbackRegexParser'));
const fallbackStr = content.substring(content.indexOf('function fallbackRegexParser'), content.indexOf('export async function POST'));

eval(vars + transStr + inferCat + fallbackStr + `
const tests = [
  "add beef",
  "at 3 kg of beef",
  "add another 2 kg of beef",
  "tofu as well",
  "300 ml of lemon juice",
  "suggest something to add",
  "blueberries, chikus and strawberries also",
  "find toothpaste under $5",
  "एक किलो सेब",
  "un kilo de manzanas"
];

tests.forEach(t => {
  console.log("Input:", t);
  console.log(JSON.stringify(fallbackRegexParser(t), null, 2));
  console.log("----");
});
`);
