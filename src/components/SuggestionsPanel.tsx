'use client';

import React, { useEffect } from 'react';
import { Lightbulb, Plus, RefreshCw } from 'lucide-react';
import { useShoppingStore } from '@/store/useShoppingStore';

export default function SuggestionsPanel() {
  const { suggestions, addItem, replaceItem, dismissSuggestion, checkHistorySuggestions } = useShoppingStore();

  useEffect(() => {
    checkHistorySuggestions();
  }, [checkHistorySuggestions]);

  if (suggestions.length === 0) return null;

  return (
    <div className="max-w-md mx-auto p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-100 flex flex-col gap-3 mb-6">
      {suggestions.map((item) => (
        <div key={item.id} className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-600"/><h3 className="text-sm font-bold text-amber-900">
              {item.type === 'history' ? `You might be running low on ${item.name}` : `Suggested Substitute for ${item.category} item`}
            </h3></div>
            <button onClick={() => dismissSuggestion(item.id, item.name)} className="text-xs text-amber-700 bg-amber-100/50 hover:bg-amber-100 px-3 py-1 rounded-full font-medium transition-colors">Dismiss</button>
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
                <Plus className="w-3 h-3 inline mr-1"/>{item.name}
              </button>
              {item.type === 'substitute' && item.originalItemId && (
                <button
                  onClick={() => {
                    replaceItem({ name: item.name, category: item.category, quantity: item.quantity }, item.originalItemId!);
                    dismissSuggestion(item.id, item.name);
                  }}
                  className="text-sm text-yellow-700 px-3 py-1 rounded-r-full hover:bg-yellow-100 transition-colors font-medium"
                >
                  <RefreshCw className="w-3 h-3 inline mr-1"/>Replace
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
