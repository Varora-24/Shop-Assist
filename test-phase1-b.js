const fs = require('fs');
const content = fs.readFileSync('src/app/api/nlp/route.ts', 'utf8');

const vars = content.substring(content.indexOf('const CATEGORY_MAP'), content.indexOf('function inferCategory'));
const inferCat = content.substring(content.indexOf('function inferCategory'), content.indexOf('function fallbackRegexParser'));
const fallbackStr = content.substring(content.indexOf('function fallbackRegexParser'), content.indexOf('export async function POST'));

eval(vars + inferCat + fallbackStr + `
console.log(JSON.stringify(fallbackRegexParser("half leechies"), null, 2));
`);
