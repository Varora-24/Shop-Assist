'use client';

import React from 'react';
import { Search, Plus } from 'lucide-react';
import { useShoppingStore } from '@/store/useShoppingStore';

export const MOCK_PRODUCTS = [
  { id: '1', name: 'Organic Apples', brand: 'FarmFresh', price: 4.99, category: 'Produce' },
  { id: '2', name: 'Apples', brand: 'StoreBrand', price: 2.99, category: 'Produce' },
  { id: '3', name: 'Whole Milk', brand: 'DairyPure', price: 3.49, category: 'Dairy' },
  { id: '4', name: 'Almond Milk', brand: 'Silk', price: 4.49, category: 'Dairy' },
  { id: '5', name: 'Whole Wheat Bread', brand: 'Nature', price: 3.99, category: 'Bakery' },
  { id: '6', name: 'White Bread', brand: 'StoreBrand', price: 1.99, category: 'Bakery' },
  { id: '7', name: 'Toothpaste', brand: 'Colgate', price: 3.99, category: 'Toiletries' },
  { id: '8', name: 'Toothpaste', brand: 'Crest', price: 4.50, category: 'Toiletries' },
  { id: '9', name: 'Toothpaste', brand: 'StoreBrand', price: 1.50, category: 'Toiletries' },
  { id: '10', name: 'Orange Juice', brand: 'Tropicana', price: 5.99, category: 'Beverages' },
  { id: '11', name: 'Orange Juice', brand: 'Florida', price: 4.99, category: 'Beverages' },
  { id: '12', name: 'Chicken Breast', brand: 'Tyson', price: 8.99, category: 'Meat/Seafood' },
  { id: '13', name: 'Chicken Thighs', brand: 'StoreBrand', price: 5.99, category: 'Meat/Seafood' },
  { id: '14', name: 'Cheddar Cheese', brand: 'Kraft', price: 4.99, category: 'Dairy' },
  { id: '15', name: 'Coffee Beans', brand: 'Starbucks', price: 12.99, category: 'Beverages' },
  { id: '16', name: 'Coffee Beans', brand: 'Folgers', price: 7.99, category: 'Beverages' },
  { id: '17', name: 'Potato Chips', brand: 'Lays', price: 3.99, category: 'Snacks' },
  { id: '18', name: 'Tortilla Chips', brand: 'Doritos', price: 4.50, category: 'Snacks' },
];

export default function SearchPanel() {
  const { searchResults, addItem, clearSearchResults } = useShoppingStore();

  if (searchResults.length === 0) return null;

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-2xl shadow-sm border border-blue-100 mb-6 overflow-hidden">
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
                addItem({ name: `${product.brand} ${product.name}`, category: product.category, quantity: 1 });
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
