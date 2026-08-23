const fs = require('fs');

let suggest = fs.readFileSync('src/components/SuggestionsPanel.tsx', 'utf8');
suggest = suggest.replace('max-w-md', 'max-w-2xl');
fs.writeFileSync('src/components/SuggestionsPanel.tsx', suggest);

let search = fs.readFileSync('src/components/SearchPanel.tsx', 'utf8');
search = search.replace('max-w-md', 'max-w-2xl');
fs.writeFileSync('src/components/SearchPanel.tsx', search);
