'use client';

import React from 'react';
import { useShoppingStore } from '@/store/useShoppingStore';

export const MOCK_PRODUCTS = [
  { id: '1', name: 'Organic Apples', brand: 'FarmFresh', price: 4.99, category: 'Produce' },
  { id: '2', name: 'Apples', brand: 'StoreBrand', price: 2.99, category: 'Produce' },
  { id: '3', name: 'Whole Milk', brand: 'DairyPure', price: 3.49, category: 'Dairy' },
  { id: '4', name: 'Almond Milk', brand: 'Silk', price: 4.49, category: 'Dairy' },
  { id: '5', name: 'Whole Wheat Bread', brand: 'Nature', price: 3.99, category: 'Bakery' },
  { id: '6', name: 'White Bread', brand: 'StoreBrand', price: 1.99, category: 'Bakery' },
  { id: '7', name: 'Toothpaste', brand: 'Colgate', price: 3.99, category: 'Uncategorized' },
  { id: '8', name: 'Toothpaste', brand: 'Crest', price: 4.50, category: 'Uncategorized' },
  { id: '9', name: 'Toothpaste', brand: 'StoreBrand', price: 1.50, category: 'Uncategorized' },
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
    <div className="max-w-md mx-auto p-4 bg-blue-50 border-b border-blue-100 shadow-inner">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-blue-800">Search Results</h3>
        <button onClick={clearSearchResults} className="text-xs text-blue-600 hover:text-blue-800">Close</button>
      </div>
      <div className="flex flex-col gap-2">
        {searchResults.map((product: any) => (
          <div key={product.id} className="flex justify-between items-center bg-white p-2 border border-blue-200 rounded">
            <div>
              <p className="text-sm font-medium">{product.brand} {product.name}</p>
              <p className="text-xs text-gray-500">${product.price.toFixed(2)} - {product.category}</p>
            </div>
            <button
              onClick={() => {
                addItem({ name: `${product.brand} ${product.name}`, category: product.category, quantity: 1 });
                // Optional: clear on add? Spec says "move it into the list if desired", doesn't explicitly require clearing.
              }}
              className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
            >
              + Add to list
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
