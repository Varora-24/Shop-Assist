const fs = require('fs');

// PAGE.TSX
let page = fs.readFileSync('src/app/page.tsx', 'utf8');
page = page.replace('bg-gray-50/50', 'bg-slate-50');
page = page.replace('bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg p-5 sticky top-0 z-30', 'bg-white border-b border-gray-200 text-gray-900 p-4 sticky top-0 z-30');
page = page.replace('<div className="max-w-md mx-auto flex items-center justify-center gap-2">', '<div className="max-w-2xl mx-auto flex items-center gap-3">');
page = page.replace('<ShoppingBag className="w-6 h-6" />', '<div className="bg-indigo-600 p-2 rounded-xl shadow-sm"><ShoppingBag className="w-5 h-5 text-white" /></div>');
page = page.replace('text-xl font-bold tracking-tight', 'text-xl font-extrabold tracking-tight');
fs.writeFileSync('src/app/page.tsx', page);

// SHOPPING LIST
let list = fs.readFileSync('src/components/ShoppingList.tsx', 'utf8');
list = list.replace('max-w-md', 'max-w-2xl');
list = list.replace('border-gray-100/80', 'border-gray-200');
list = list.replace('text-gray-900 text-lg', 'text-gray-800 text-base');
list = list.replace('text-md font-bold text-gray-800', 'text-sm font-bold text-gray-500');
list = list.replace('w-4 h-4 text-indigo-500', 'w-4 h-4 text-gray-400');
list = list.replace('shadow-sm hover:shadow-md', 'shadow-sm');
list = list.replace('rounded-2xl', 'rounded-xl');
fs.writeFileSync('src/components/ShoppingList.tsx', list);

// SEASONAL PANEL
let seasonal = fs.readFileSync('src/components/SeasonalPanel.tsx', 'utf8');
seasonal = seasonal.replace('max-w-md mx-auto p-4', 'max-w-2xl mx-auto px-4 pt-4');
seasonal = seasonal.replace('bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-100 mb-6', 'bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-2');
seasonal = seasonal.replace('text-emerald-900', 'text-gray-800');
seasonal = seasonal.replace('w-4 h-4 text-emerald-600', 'w-5 h-5 text-indigo-600');
seasonal = seasonal.replace(/className="text-sm bg-white text-green-700 px-3 py-1.5 rounded-full border border-green-200 shadow-sm font-medium"/g, 'className="text-sm bg-gray-50 text-gray-700 px-4 py-2 rounded-xl border border-gray-200 font-medium hover:bg-gray-100 transition-colors"');
fs.writeFileSync('src/components/SeasonalPanel.tsx', seasonal);

// VOICE BUTTON
let voice = fs.readFileSync('src/components/VoiceButton.tsx', 'utf8');
voice = voice.replace(/<div className="fixed bottom-0 left-0 right-0 p-6 flex flex-col items-center gap-4 z-50">/, '<div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center items-end gap-4 z-50 pointer-events-none">\n      <div className="pointer-events-auto flex flex-col items-center gap-4">');
voice = voice.replace('</select>', '</select>\n      </div>');
voice = voice.replace('w-16 h-16', 'w-20 h-20');
fs.writeFileSync('src/components/VoiceButton.tsx', voice);
