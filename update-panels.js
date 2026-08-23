const fs = require('fs');

// Search Panel
let searchCode = fs.readFileSync('src/components/SearchPanel.tsx', 'utf8');
searchCode = searchCode.replace("import React from 'react';", "import React from 'react';\nimport { Search, Plus } from 'lucide-react';");
searchCode = searchCode.replace('bg-blue-50 border-b border-blue-100 shadow-inner', 'bg-white rounded-2xl shadow-sm border border-blue-100 mb-6 overflow-hidden');
searchCode = searchCode.replace('<h3 className="text-sm font-semibold text-blue-800">Search Results</h3>', '<div className="flex items-center gap-2"><Search className="w-4 h-4 text-blue-600"/><h3 className="text-sm font-bold text-gray-800">Search Results</h3></div>');
searchCode = searchCode.replace(/<button\s+onClick=\{clearSearchResults\}.*?<\/button>/, '<button onClick={clearSearchResults} className="text-xs text-gray-400 hover:text-gray-600 bg-gray-50 px-3 py-1 rounded-full font-medium transition-colors">Close</button>');
searchCode = searchCode.replace(/className="flex justify-between items-center bg-white p-2 border border-blue-200 rounded"/g, 'className="flex justify-between items-center p-3 hover:bg-blue-50/50 rounded-xl transition-colors border border-gray-100"');
searchCode = searchCode.replace('+ Add to list', '<Plus className="w-3 h-3 inline mr-1"/>Add');
searchCode = searchCode.replace(/className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 transition-colors"/g, 'className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 transition-colors shadow-sm font-medium"');
fs.writeFileSync('src/components/SearchPanel.tsx', searchCode);

// Seasonal Panel
let seasonalCode = fs.readFileSync('src/components/SeasonalPanel.tsx', 'utf8');
seasonalCode = seasonalCode.replace("import React, { useMemo } from 'react';", "import React from 'react';\nimport { Sparkles, Plus } from 'lucide-react';");
seasonalCode = seasonalCode.replace("import React from 'react';", "import React from 'react';\nimport { Sparkles, Plus } from 'lucide-react';");
seasonalCode = seasonalCode.replace('bg-green-50 border-b border-green-100 shadow-inner', 'bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-100 mb-6');
seasonalCode = seasonalCode.replace('<h3 className="text-sm font-semibold text-green-800 mb-2">In Season This Month</h3>', '<div className="flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-emerald-600"/><h3 className="text-sm font-bold text-emerald-900">In Season This Month</h3></div>');
seasonalCode = seasonalCode.replace('+ {item.name}', '<Plus className="w-3 h-3 inline mr-1"/>{item.name}');
fs.writeFileSync('src/components/SeasonalPanel.tsx', seasonalCode);

// Suggestions Panel
let suggestCode = fs.readFileSync('src/components/SuggestionsPanel.tsx', 'utf8');
suggestCode = suggestCode.replace("import React, { useEffect } from 'react';", "import React, { useEffect } from 'react';\nimport { Lightbulb, Plus, RefreshCw } from 'lucide-react';");
suggestCode = suggestCode.replace('bg-yellow-50 border-b border-yellow-100 shadow-inner flex flex-col gap-3', 'bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-100 flex flex-col gap-3 mb-6');
suggestCode = suggestCode.replace('<h3 className="text-sm font-semibold text-yellow-800">', '<div className="flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-600"/><h3 className="text-sm font-bold text-amber-900">');
suggestCode = suggestCode.replace('</h3>', '</h3></div>');
suggestCode = suggestCode.replace(/<button onClick=\{\(\) => dismissSuggestion.*?>Dismiss<\/button>/g, '<button onClick={() => dismissSuggestion(item.id, item.name)} className="text-xs text-amber-700 bg-amber-100/50 hover:bg-amber-100 px-3 py-1 rounded-full font-medium transition-colors">Dismiss</button>');
suggestCode = suggestCode.replace('+ Add {item.name}', '<Plus className="w-3 h-3 inline mr-1"/>{item.name}');
suggestCode = suggestCode.replace('Replace', '<RefreshCw className="w-3 h-3 inline mr-1"/>Replace');
fs.writeFileSync('src/components/SuggestionsPanel.tsx', suggestCode);
