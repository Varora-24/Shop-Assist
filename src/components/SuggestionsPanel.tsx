'use client';

import React from 'react';
import { useShoppingStore } from '@/store/useShoppingStore';

export default function SuggestionsPanel() {
  const { suggestions, addItem, clearSuggestions } = useShoppingStore();

  if (suggestions.length === 0) return null;

  return (
    <div className="max-w-md mx-auto p-4 bg-yellow-50 border-b border-yellow-100 shadow-inner">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-yellow-800">Suggested Substitutes</h3>
        <button onClick={clearSuggestions} className="text-xs text-yellow-600 hover:text-yellow-800">Dismiss</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              addItem({ name: item.name, category: item.category, quantity: 1 });
              clearSuggestions();
            }}
            className="text-sm bg-white border border-yellow-200 text-yellow-800 px-3 py-1 rounded-full hover:bg-yellow-100 transition-colors"
          >
            + Add {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
