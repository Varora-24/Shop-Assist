'use client';

import React from 'react';
import { Search, Plus } from 'lucide-react';
import { useShoppingStore } from '@/store/useShoppingStore';

export const MOCK_PRODUCTS = [
  { id: 'm1', name: 'Milk - Basic', brand: 'ValueBrand', price: 1.99, category: 'Dairy', tier: 'basic' },
  { id: 'm2', name: 'Milk - Standard', brand: 'DairyPure', price: 3.49, category: 'Dairy', tier: 'standard' },
  { id: 'm3', name: 'Milk - Premium Organic', brand: 'Horizon', price: 5.99, category: 'Dairy', tier: 'premium' },
  
  { id: 'b1', name: 'Bread - Basic', brand: 'ValueBrand', price: 1.49, category: 'Bakery', tier: 'basic' },
  { id: 'b2', name: 'Bread - Standard', brand: 'Nature', price: 3.99, category: 'Bakery', tier: 'standard' },
  { id: 'b3', name: 'Bread - Premium Artisan', brand: 'LaBrea', price: 6.99, category: 'Bakery', tier: 'premium' },
  
  { id: 't1', name: 'Toothpaste - Basic', brand: 'ValueBrand', price: 1.50, category: 'Toiletries', tier: 'basic' },
  { id: 't2', name: 'Toothpaste - Standard', brand: 'Colgate', price: 3.99, category: 'Toiletries', tier: 'standard' },
  { id: 't3', name: 'Toothpaste - Premium Whitening', brand: 'Crest', price: 6.50, category: 'Toiletries', tier: 'premium' },
  
  { id: 'c1', name: 'Chicken - Basic', brand: 'ValueBrand', price: 5.99, category: 'Meat/Seafood', tier: 'basic' },
  { id: 'c2', name: 'Chicken - Standard', brand: 'Tyson', price: 8.99, category: 'Meat/Seafood', tier: 'standard' },
  { id: 'c3', name: 'Chicken - Premium Free Range', brand: 'Bell&Evans', price: 14.99, category: 'Meat/Seafood', tier: 'premium' },

  { id: 'r1', name: 'Rice - Basic', brand: 'ValueBrand', price: 2.99, category: 'Pantry', tier: 'basic' },
  { id: 'r2', name: 'Rice - Standard', brand: 'UncleBens', price: 4.99, category: 'Pantry', tier: 'standard' },
  { id: 'r3', name: 'Rice - Premium Jasmine', brand: 'Mahatma', price: 8.99, category: 'Pantry', tier: 'premium' },
];

export default function SearchPanel() {
  const { searchResults, addItem, clearSearchResults } = useShoppingStore();

  if (searchResults.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-2xl shadow-sm border border-blue-100 mb-6 overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2"><Search className="w-4 h-4 text-blue-600"/><h3 className="text-sm font-bold text-gray-800">Search Results</h3></div>
        <button onClick={clearSearchResults} className="text-xs text-gray-400 hover:text-gray-600 bg-gray-50 px-3 py-1 rounded-full font-medium transition-colors">Close</button>
      </div>
      <div className="flex flex-col gap-2">
        {searchResults.map((product: any) => (
          <div key={product.id} className="flex justify-between items-center p-3 hover:bg-blue-50/50 rounded-xl transition-colors border border-gray-100">
            <div>
              <p className="text-sm font-medium">{product.brand} {product.name}</p>
              <p className="text-xs text-gray-500">${product.price.toFixed(2)} - {product.category}</p>
            </div>
            <button
              onClick={() => {
                const baseName = product.name.split(' - ')[0];
                addItem({ name: baseName, category: product.category, quantity: 1 });
                // Optional: clear on add? Spec says "move it into the list if desired", doesn't explicitly require clearing.
              }}
              className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
              <Plus className="w-3 h-3 inline mr-1"/>Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
