'use client';

import React from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { useShoppingStore } from '@/store/useShoppingStore';

const SEASONAL_DATA: Record<number, { name: string, category: string }[]> = {
  0: [{ name: 'Grapefruit', category: 'Produce' }, { name: 'Kale', category: 'Produce' }, { name: 'Leeks', category: 'Produce' }, { name: 'Brussels Sprouts', category: 'Produce' }],
  1: [{ name: 'Oranges', category: 'Produce' }, { name: 'Cauliflower', category: 'Produce' }, { name: 'Cabbage', category: 'Produce' }, { name: 'Turnips', category: 'Produce' }],
  2: [{ name: 'Artichokes', category: 'Produce' }, { name: 'Asparagus', category: 'Produce' }, { name: 'Radishes', category: 'Produce' }, { name: 'Spinach', category: 'Produce' }],
  3: [{ name: 'Peas', category: 'Produce' }, { name: 'Rhubarb', category: 'Produce' }, { name: 'Strawberries', category: 'Produce' }, { name: 'Broccoli', category: 'Produce' }],
  4: [{ name: 'Cherries', category: 'Produce' }, { name: 'Apricots', category: 'Produce' }, { name: 'Zucchini', category: 'Produce' }, { name: 'Pineapple', category: 'Produce' }],
  5: [{ name: 'Watermelon', category: 'Produce' }, { name: 'Peaches', category: 'Produce' }, { name: 'Tomatoes', category: 'Produce' }, { name: 'Cantaloupe', category: 'Produce' }],
  6: [{ name: 'Blueberries', category: 'Produce' }, { name: 'Cucumbers', category: 'Produce' }, { name: 'Plums', category: 'Produce' }, { name: 'Corn', category: 'Produce' }],
  7: [{ name: 'Mangoes', category: 'Produce' }, { name: 'Berries', category: 'Produce' }, { name: 'Eggplant', category: 'Produce' }, { name: 'Peppers', category: 'Produce' }],
  8: [{ name: 'Apples', category: 'Produce' }, { name: 'Pumpkins', category: 'Produce' }, { name: 'Grapes', category: 'Produce' }, { name: 'Sweet Potatoes', category: 'Produce' }],
  9: [{ name: 'Cranberries', category: 'Produce' }, { name: 'Pears', category: 'Produce' }, { name: 'Squash', category: 'Produce' }, { name: 'Pomegranate', category: 'Produce' }],
  10: [{ name: 'Brussels Sprouts', category: 'Produce' }, { name: 'Mushrooms', category: 'Produce' }, { name: 'Onions', category: 'Produce' }, { name: 'Parsnips', category: 'Produce' }],
  11: [{ name: 'Citrus', category: 'Produce' }, { name: 'Root Vegetables', category: 'Produce' }, { name: 'Pomegranate', category: 'Produce' }, { name: 'Celery', category: 'Produce' }]
};

export default function SeasonalPanel() {
  const { addItem, items } = useShoppingStore();
  
  const currentMonth = new Date().getMonth();
  const seasonalItems = SEASONAL_DATA[currentMonth] || [];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-2">
      <div className="flex items-center gap-2 mb-3"><Sparkles className="w-5 h-5 text-indigo-600"/><h3 className="text-sm font-bold text-gray-800">In Season This Month</h3></div>
      <div className="flex flex-wrap gap-2">
        {seasonalItems.map((item, idx) => {
          const alreadyAdded = items.some(i => i.name.toLowerCase() === item.name.toLowerCase());
          return (
            <button
              key={idx}
              disabled={alreadyAdded}
              onClick={() => {
                addItem({ name: item.name, category: item.category, quantity: 1 });
              }}
              className={`text-sm px-3 py-1 rounded-full transition-colors border ${
                alreadyAdded 
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                  : 'bg-white text-green-800 border-green-200 hover:bg-green-100'
              }`}
            >
              <Plus className="w-3 h-3 inline mr-1"/>{item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
