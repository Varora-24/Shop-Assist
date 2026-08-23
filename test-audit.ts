import { fallbackRegexParser } from './src/app/api/nlp/route';

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
