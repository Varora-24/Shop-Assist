'use client';

import React, { useEffect, useState } from 'react';
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
    <div className="w-full max-w-md mx-auto p-4 space-y-6 pb-24">
      {Object.keys(groupedItems).length === 0 ? (
        <p className="text-center text-gray-500 mt-10">Your list is empty. Tap the mic to add items.</p>
      ) : (
        Object.entries(groupedItems).map(([category, catItems]) => (
          <div key={category} className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-1">{category}</h2>
            <ul className="space-y-2">
              {catItems.map((item) => {
                const displayName = item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase();
                return (
                  <li key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <span className="font-medium text-gray-800">{displayName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-sm">Qty: {item.quantity}</span>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 px-2 py-1 bg-red-50 rounded-md text-sm"
                      >
                        Remove
                      </button>
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
