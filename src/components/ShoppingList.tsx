'use client';

import React, { useEffect, useState } from 'react';
import { Trash2, ShoppingCart, Tag } from 'lucide-react';
import { useShoppingStore, Item } from '@/store/useShoppingStore';

export default function ShoppingList() {
  const { items, removeItem } = useShoppingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6 pb-24">
      {Object.keys(groupedItems).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="w-12 h-12 text-indigo-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Your list is empty</h3>
          <p className="text-gray-500 max-w-sm">Tap the microphone below and say "Add milk" or type a command to get started.</p>
        </div>
      ) : (
        Object.entries(groupedItems).map(([category, catItems]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2 mb-3"><Tag className="w-4 h-4 text-gray-400" /><h2 className="text-sm font-bold text-gray-500 tracking-wide uppercase">{category}</h2></div>
            <ul className="space-y-2">
              {catItems.map((item) => {
                const displayName = item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase();
                return (
                  <li key={item.id} className="group flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 transition-all">
                    <div className="flex flex-col"><span className="font-semibold text-gray-800 text-base">{displayName}</span></div>
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">x {item.quantity}</span>
                      <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors" aria-label="Remove item"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
