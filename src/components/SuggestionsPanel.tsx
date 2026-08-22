'use client';

import React from 'react';
import { useShoppingStore } from '@/store/useShoppingStore';

export default function SuggestionsPanel() {
  const { suggestions, addItem, replaceItem, clearSuggestions } = useShoppingStore();

  if (suggestions.length === 0) return null;

  return (
    <div className="max-w-md mx-auto p-4 bg-yellow-50 border-b border-yellow-100 shadow-inner">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-yellow-800">Suggested Substitutes</h3>
        <button onClick={clearSuggestions} className="text-xs text-yellow-600 hover:text-yellow-800">Dismiss</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <div key={item.id} className="flex gap-1 items-center bg-white border border-yellow-200 rounded-full pr-1">
            <button
              onClick={() => {
                addItem({ name: item.name, category: item.category, quantity: 1 });
                clearSuggestions();
              }}
              className="text-sm text-yellow-800 px-3 py-1 rounded-l-full hover:bg-yellow-100 transition-colors border-r border-yellow-200"
            >
              + Add {item.name}
            </button>
            {item.originalItemId && (
              <button
                onClick={() => {
                  replaceItem({ name: item.name, category: item.category, quantity: 1 }, item.originalItemId!);
                }}
                className="text-sm text-yellow-700 px-3 py-1 rounded-r-full hover:bg-yellow-100 transition-colors font-medium"
              >
                Replace
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
