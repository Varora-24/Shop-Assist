'use client';

import React, { useEffect } from 'react';
import { useShoppingStore } from '@/store/useShoppingStore';

export default function SuggestionsPanel() {
  const { suggestions, addItem, replaceItem, dismissSuggestion, checkHistorySuggestions } = useShoppingStore();

  useEffect(() => {
    checkHistorySuggestions();
  }, [checkHistorySuggestions]);

  if (suggestions.length === 0) return null;

  return (
    <div className="max-w-md mx-auto p-4 bg-yellow-50 border-b border-yellow-100 shadow-inner flex flex-col gap-3">
      {suggestions.map((item) => (
        <div key={item.id} className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-yellow-800">
              {item.type === 'history' ? `You might be running low on ${item.name}` : `Suggested Substitute for ${item.category} item`}
            </h3>
            <button onClick={() => dismissSuggestion(item.id, item.name)} className="text-xs text-yellow-600 hover:text-yellow-800">Dismiss</button>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1 items-center bg-white border border-yellow-200 rounded-full pr-1">
              <button
                onClick={() => {
                  addItem({ name: item.name, category: item.category, quantity: item.quantity });
                  dismissSuggestion(item.id, item.name);
                }}
                className={`text-sm text-yellow-800 px-3 py-1 ${item.type === 'substitute' ? 'rounded-l-full border-r border-yellow-200' : 'rounded-full'} hover:bg-yellow-100 transition-colors`}
              >
                + Add {item.name}
              </button>
              {item.type === 'substitute' && item.originalItemId && (
                <button
                  onClick={() => {
                    replaceItem({ name: item.name, category: item.category, quantity: item.quantity }, item.originalItemId!);
                    dismissSuggestion(item.id, item.name);
                  }}
                  className="text-sm text-yellow-700 px-3 py-1 rounded-r-full hover:bg-yellow-100 transition-colors font-medium"
                >
                  Replace
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
