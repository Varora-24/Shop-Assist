import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Item = {
  id: string;
  name: string;
  category: string;
  quantity: number | string;
};

type ShoppingState = {
  items: Item[];
  isListening: boolean;
  transcript: string;
  isLoading: boolean;
  suggestions: Item[];
  
  // Actions
  addItem: (item: Omit<Item, 'id'>) => void;
  removeItem: (id: string) => void;
  setIsListening: (isListening: boolean) => void;
  setTranscript: (transcript: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSuggestions: (suggestions: Item[]) => void;
  clearSuggestions: () => void;
  processVoiceCommand: (command: string) => Promise<void>;
};

const SUBSTITUTES: Record<string, string> = {
  'milk': 'Almond Milk',
  'bread': 'Whole Wheat Bread',
  'sugar': 'Stevia',
  'butter': 'Margarine',
  'eggs': 'Vegan Egg Substitute'
};

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set, get) => ({
      items: [], // Empty initial state for production
      isListening: false,
      transcript: '',
      isLoading: false,
      suggestions: [],

      addItem: (item) => {
        const lowerName = item.name.toLowerCase().trim();
        let newSuggestions: Item[] = [];
        
        for (const [key, substitute] of Object.entries(SUBSTITUTES)) {
          if (lowerName.includes(key)) {
            newSuggestions.push({
              id: Date.now().toString() + '-sub',
              name: substitute,
              category: item.category,
              quantity: 1
            });
          }
        }

        set((state) => {
          const existingIndex = state.items.findIndex(i => i.name.toLowerCase().trim() === lowerName);
          
          if (existingIndex !== -1) {
             const updatedItems = [...state.items];
             const existingItem = updatedItems[existingIndex];
             
             let currentQty = typeof existingItem.quantity === 'number' ? existingItem.quantity : parseFloat(existingItem.quantity.toString()) || 1;
             let addQty = typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity.toString()) || 1;
             
             const unitMatch = item.quantity.toString().match(/[a-zA-Z]+/);
             const oldUnitMatch = existingItem.quantity.toString().match(/[a-zA-Z]+/);
             let newUnit = unitMatch ? unitMatch[0].toLowerCase() : '';
             let oldUnit = oldUnitMatch ? oldUnitMatch[0].toLowerCase() : '';

             // Normalize to base units (grams or ml)
             const isWeight = ['kg', 'g', 'gram', 'grams', 'lbs', 'lb', 'oz'].includes(oldUnit) || ['kg', 'g', 'gram', 'grams', 'lbs', 'lb', 'oz'].includes(newUnit);
             const isVolume = ['l', 'liter', 'litre', 'ml', 'mill'].includes(oldUnit) || ['l', 'liter', 'litre', 'ml', 'mill'].includes(newUnit);

             if (oldUnit === 'kg' || oldUnit === 'l' || oldUnit === 'liter' || oldUnit === 'litre') currentQty *= 1000;
             if (newUnit === 'kg' || newUnit === 'l' || newUnit === 'liter' || newUnit === 'litre') addQty *= 1000;
             
             let totalQty = currentQty + addQty;
             let finalUnit = '';

             // Convert back to sensible unit
             if (isWeight) {
               if (totalQty >= 1000) {
                 totalQty = totalQty / 1000;
                 finalUnit = 'kg';
               } else {
                 finalUnit = 'g';
               }
             } else if (isVolume) {
               if (totalQty >= 1000) {
                 totalQty = totalQty / 1000;
                 finalUnit = 'l';
               } else {
                 finalUnit = 'ml';
               }
             } else {
               finalUnit = newUnit || oldUnit;
             }

             updatedItems[existingIndex] = {
                ...existingItem,
                quantity: finalUnit ? `${totalQty} ${finalUnit}` : totalQty
             };
             
             return {
                items: updatedItems,
                suggestions: newSuggestions.length > 0 ? newSuggestions : state.suggestions
             };
          }

          return {
            items: [...state.items, { ...item, id: Date.now().toString() + '-' + Math.floor(Math.random() * 1000) }],
            suggestions: newSuggestions.length > 0 ? newSuggestions : state.suggestions
          };
        });
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      setIsListening: (isListening) => set({ isListening }),
      
      setTranscript: (transcript) => set({ transcript }),
      
      setIsLoading: (isLoading) => set({ isLoading }),
      
      setSuggestions: (suggestions) => set({ suggestions }),
      
      clearSuggestions: () => set({ suggestions: [] }),

      processVoiceCommand: async (command) => {
        const { setTranscript, setIsLoading, addItem, removeItem } = get();
        setTranscript(command);
        setIsLoading(true);
        
        try {
          const res = await fetch('/api/nlp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript: command })
          });
          
          if (!res.ok) throw new Error('API Error');
          const data = await res.json();
          
          const results = Array.isArray(data) ? data : [data];
          
          for (const actionData of results) {
            if (actionData.action === 'add') {
              addItem({
                name: actionData.item,
                category: actionData.category || 'Uncategorized',
                quantity: actionData.quantity || 1
              });
            } else if (actionData.action === 'remove') {
              const currentItems = get().items;
              const itemToRemove = currentItems.find(i => i.name.toLowerCase().includes(actionData.item.toLowerCase()));
              if (itemToRemove) {
                removeItem(itemToRemove.id);
              } else {
                console.warn('Item not found to remove:', actionData.item);
              }
            }
          }
        } catch (error) {
          console.error('Failed to process command', error);
        } finally {
          setIsLoading(false);
          setTimeout(() => setTranscript(''), 2000); 
        }
      },
    }),
    {
      name: 'shopping-list-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
