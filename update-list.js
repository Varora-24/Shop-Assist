const fs = require('fs');
let code = fs.readFileSync('src/components/ShoppingList.tsx', 'utf8');

code = code.replace(
  "import React, { useEffect, useState } from 'react';",
  "import React, { useEffect, useState } from 'react';\nimport { Trash2, ShoppingCart, Tag } from 'lucide-react';"
);

code = code.replace(
  '<h2 className="text-lg font-semibold text-gray-700 border-b pb-1">{category}</h2>',
  '<div className="flex items-center gap-2 mb-3"><Tag className="w-4 h-4 text-indigo-500" /><h2 className="text-md font-bold text-gray-800 tracking-wide uppercase">{category}</h2></div>'
);

code = code.replace(
  '<li key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">',
  '<li key={item.id} className="group flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100/80 transition-all">'
);

code = code.replace(
  '<span className="font-medium text-gray-800">{displayName}</span>',
  '<div className="flex flex-col"><span className="font-semibold text-gray-900 text-lg">{displayName}</span></div>'
);

code = code.replace(
  '<span className="text-gray-500 text-sm">Qty: {item.quantity}</span>',
  '<span className="text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">x {item.quantity}</span>'
);

code = code.replace(
  /<button[\s\S]*?Remove\s*<\/button>/,
  '<button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors" aria-label="Remove item"><Trash2 className="w-5 h-5" /></button>'
);

fs.writeFileSync('src/components/ShoppingList.tsx', code);
