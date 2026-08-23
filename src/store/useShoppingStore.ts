import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_PRODUCTS } from '../components/SearchPanel';

export type Item = {
  id: string;
  name: string;
  category: string;
  quantity: number | string;
};

export type Suggestion = Item & { originalItemId?: string, type?: 'substitute' | 'history' };

export type HistoryItem = {
  name: string;
  removedAt: number;
};

export type ToastMessage = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

type ShoppingState = {
  items: Item[];
  history: HistoryItem[];
  isListening: boolean;
  transcript: string;
  isLoading: boolean;
  suggestions: Suggestion[];
  dismissedSuggestions: string[]; // item names dismissed
  searchResults: any[];
  language: string;
  toasts: ToastMessage[];
  
  // Actions
  addItem: (item: Omit<Item, 'id'>) => void;
  removeItem: (id: string) => void;
  replaceItem: (newItem: Omit<Item, 'id'>, oldItemId: string) => void;
  setIsListening: (isListening: boolean) => void;
  setTranscript: (transcript: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSuggestions: (suggestions: Suggestion[]) => void;
  clearSuggestions: () => void;
  dismissSuggestion: (suggestionId: string, suggestionName: string) => void;
  setSearchResults: (results: any[]) => void;
  clearSearchResults: () => void;
  clearItems: () => void;
  setLanguage: (lang: string) => void;
  processVoiceCommand: (command: string) => Promise<void>;
  checkHistorySuggestions: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
};

const SUBSTITUTES: Record<string, string> = {
  'milk': 'Almond Milk',
  'bread': 'Gluten-Free Bread',
  'sugar': 'Honey',
  'chicken': 'Tofu',
  'butter': 'Olive Oil',
  'beef': 'Paneer'
};

export function matchExistingItem(spokenName: string, list: Item[]): Item | null {
  const target = spokenName.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const targetSingular = target.endsWith('es') ? target.slice(0, -2) : (target.endsWith('s') ? target.slice(0, -1) : target);

  return list.find(i => {
    const iName = i.name.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const iNameSingular = iName.endsWith('es') ? iName.slice(0, -2) : (iName.endsWith('s') ? iName.slice(0, -1) : iName);
    
    if (iName === target || iNameSingular === targetSingular) return true;
    if (iName.includes(target) || target.includes(iName)) return true;
    if (iNameSingular && target.includes(iNameSingular)) return true;
    if (targetSingular && iName.includes(targetSingular)) return true;
    return false;
  }) || null;
}

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set, get) => ({
      items: [],
      history: [],
      isListening: false,
      transcript: '',
      isLoading: false,
      suggestions: [],
      dismissedSuggestions: [],
      searchResults: [],
      language: 'en-US',
      toasts: [],

      addToast: (message, type = 'success') => {
        const id = Date.now().toString();
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => {
          get().removeToast(id);
        }, 3000);
      },

      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),

      setSearchResults: (results) => set({ searchResults: results }),
      clearSearchResults: () => set({ searchResults: [] }),
      clearItems: () => {
        set((state) => {
          const history = [...state.history];
          state.items.forEach(item => history.push({ name: item.name, removedAt: Date.now() }));
          return { items: [], history };
        });
      },
      setLanguage: (lang) => set({ language: lang }),

      replaceItem: (newItem, oldItemId) => {
        set((state) => {
           const newItems = state.items.filter(i => i.id !== oldItemId);
           const id = Date.now().toString() + '-' + Math.floor(Math.random() * 1000);
           return {
             items: [...newItems, { ...newItem, id }],
             suggestions: state.suggestions.filter(s => s.originalItemId !== oldItemId)
           };
        });
      },

      addItem: (item) => {
        const lowerName = item.name.toLowerCase().trim();
        let newSuggestions: Suggestion[] = [];
        
        const newItemId = Date.now().toString() + '-' + Math.floor(Math.random() * 1000);
        
        for (const [key, substitute] of Object.entries(SUBSTITUTES)) {
          if (lowerName.includes(key) && !get().dismissedSuggestions.includes(substitute)) {
            if (!get().items.some(i => i.name.toLowerCase().includes(substitute.toLowerCase()))) {
                newSuggestions.push({
                  id: Date.now().toString() + '-sub-' + Math.random(),
                  name: substitute,
                  category: item.category,
                  quantity: 1,
                  originalItemId: newItemId,
                  type: 'substitute'
                });
            }
          }
        }

        set((state) => {
          const existingItem = matchExistingItem(item.name, state.items);
          
          if (existingItem) {
             const updatedItems = [...state.items];
             const existingIndex = state.items.findIndex(i => i.id === existingItem.id);
             
             let currentQty = typeof existingItem.quantity === 'number' ? existingItem.quantity : parseFloat(existingItem.quantity.toString()) || 1;
             let addQty = typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity.toString()) || 1;
             
             const unitMatch = item.quantity.toString().match(/[a-zA-Z]+/);
             const oldUnitMatch = existingItem.quantity.toString().match(/[a-zA-Z]+/);
             let newUnit = unitMatch ? unitMatch[0].toLowerCase() : '';
             let oldUnit = oldUnitMatch ? oldUnitMatch[0].toLowerCase() : '';

             const isWeight = ['kg', 'g', 'gram', 'grams', 'lbs', 'lb', 'oz'].includes(oldUnit) || ['kg', 'g', 'gram', 'grams', 'lbs', 'lb', 'oz'].includes(newUnit);
             const isVolume = ['l', 'liter', 'litre', 'ml', 'mill'].includes(oldUnit) || ['l', 'liter', 'litre', 'ml', 'mill'].includes(newUnit);

             if (oldUnit === 'kg' || oldUnit === 'l' || oldUnit === 'liter' || oldUnit === 'litre') currentQty *= 1000;
             if (newUnit === 'kg' || newUnit === 'l' || newUnit === 'liter' || newUnit === 'litre') addQty *= 1000;
             
             let totalQty = currentQty + addQty;
             let finalUnit = '';

             if (isWeight) {
               if (totalQty >= 1000) { totalQty = totalQty / 1000; finalUnit = 'kg'; }
               else { finalUnit = 'g'; }
             } else if (isVolume) {
               if (totalQty >= 1000) { totalQty = totalQty / 1000; finalUnit = 'l'; }
               else { finalUnit = 'ml'; }
             } else {
               finalUnit = newUnit || oldUnit;
             }

             totalQty = parseFloat(totalQty.toFixed(3));

             updatedItems[existingIndex] = {
                ...existingItem,
                quantity: finalUnit ? `${totalQty} ${finalUnit}` : totalQty
             };
             
             return {
                items: updatedItems,
                suggestions: [...state.suggestions, ...newSuggestions]
             };
          }

          const newHistory = state.history.filter(h => h.name.toLowerCase() !== lowerName);

          return {
            items: [...state.items, { ...item, id: newItemId }],
            history: newHistory,
            suggestions: [...state.suggestions, ...newSuggestions]
          };
        });
      },

      removeItem: (id) =>
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          const history = [...state.history];
          if (item) {
             history.push({ name: item.name, removedAt: Date.now() });
          }
          return {
            items: state.items.filter((item) => item.id !== id),
            history
          };
        }),

      setIsListening: (isListening) => set({ isListening }),
      setTranscript: (transcript) => set({ transcript }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setSuggestions: (suggestions) => set({ suggestions }),
      clearSuggestions: () => set({ suggestions: [] }),
      
      dismissSuggestion: (suggestionId, suggestionName) => set((state) => ({
        suggestions: state.suggestions.filter(s => s.id !== suggestionId),
        dismissedSuggestions: [...state.dismissedSuggestions, suggestionName]
      })),

      checkHistorySuggestions: () => {
         const { history, items, dismissedSuggestions, suggestions } = get();
         const now = Date.now();
         const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
         
         const newSuggestions: Suggestion[] = [];
         
         for (const h of history) {
            if (now - h.removedAt >= SEVEN_DAYS) {
               const alreadyInList = items.some(i => i.name.toLowerCase() === h.name.toLowerCase());
               const alreadyDismissed = dismissedSuggestions.includes(h.name);
               const alreadySuggested = suggestions.some(s => s.name === h.name);
               
               if (!alreadyInList && !alreadyDismissed && !alreadySuggested) {
                  newSuggestions.push({
                     id: Date.now().toString() + '-hist-' + Math.random(),
                     name: h.name,
                     category: 'Uncategorized',
                     quantity: 1,
                     type: 'history'
                  });
               }
            }
         }
         
         if (newSuggestions.length > 0) {
            set((state) => ({ suggestions: [...state.suggestions, ...newSuggestions] }));
         }
      },

      processVoiceCommand: async (command) => {
        const { setTranscript, setIsLoading, addItem, removeItem, setSearchResults, language, addToast, clearItems } = get();
        setTranscript(command);
        setIsLoading(true);
        
        try {
          const res = await fetch('/api/nlp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript: command, language })
          });
          
          if (!res.ok) throw new Error('API Error');
          const data = await res.json();
          
          if (data.intent === 'none') {
            // do nothing
          } else if (data.intent === 'search') {
            const itemData = data.items && data.items[0];
            if (itemData) {
               const searchName = itemData.item.toLowerCase();
               const searchBrand = itemData.brand ? itemData.brand.toLowerCase() : null;
               const maxPrice = itemData.maxPrice;
               
               const filtered = MOCK_PRODUCTS.filter(p => {
                  let match = true;
                  if (searchName && !p.name.toLowerCase().includes(searchName)) match = false;
                  if (searchBrand && !p.brand.toLowerCase().includes(searchBrand)) match = false;
                  if (maxPrice && p.price > maxPrice) match = false;
                  return match;
               });
               setSearchResults(filtered);
            }
          } else if (data.intent === 'add') {
            for (const itemData of data.items || []) {
              const qtyStr = itemData.unit ? `${itemData.quantity} ${itemData.unit}` : itemData.quantity;
              addItem({
                name: itemData.item,
                category: itemData.category || 'Uncategorized',
                quantity: qtyStr
              });
              addToast(`Added ${qtyStr} ${itemData.item}`, 'success');
            }
          } else if (data.intent === 'clear') {
            clearItems();
            addToast('List cleared', 'success');
          } else if (data.intent === 'update') {
            const currentItems = get().items;
            for (const itemData of data.items || []) {
              const itemToUpdate = matchExistingItem(itemData.item, currentItems);
              if (itemToUpdate) {
                const qtyStr = itemData.unit ? `${itemData.quantity} ${itemData.unit}` : itemData.quantity;
                set((state) => ({ items: state.items.map(i => i.id === itemToUpdate.id ? { ...i, quantity: qtyStr } : i) }));
                addToast(`Updated ${itemToUpdate.name} to ${qtyStr}`, 'success');
              } else {
                addToast(`Couldn't find ${itemData.item} in your list`, 'error');
              }
            }
          } else if (data.intent === 'remove') {
            const currentItems = get().items;
            for (const itemData of data.items || []) {
              const itemToRemove = matchExistingItem(itemData.item, currentItems);
              if (itemToRemove) {
                if (itemData.quantity === null) {
                  removeItem(itemToRemove.id);
                  addToast(`Removed ${itemToRemove.name}`, 'success');
                } else {
                  // Partial removal
                  let currentQty = typeof itemToRemove.quantity === 'number' ? itemToRemove.quantity : parseFloat(itemToRemove.quantity.toString()) || 1;
                  let removeQty = typeof itemData.quantity === 'number' ? itemData.quantity : parseFloat(itemData.quantity?.toString()) || 1;
                  
                  const oldUnitMatch = itemToRemove.quantity.toString().match(/[a-zA-Z]+/);
                  const newUnitMatch = (itemData.unit || '').match(/[a-zA-Z]+/);
                  let oldUnit = oldUnitMatch ? oldUnitMatch[0].toLowerCase() : '';
                  let newUnit = newUnitMatch ? newUnitMatch[0].toLowerCase() : (oldUnit || '');

                  const isWeight = ['kg', 'g', 'gram', 'grams', 'lbs', 'lb', 'oz'].includes(oldUnit) || ['kg', 'g', 'gram', 'grams', 'lbs', 'lb', 'oz'].includes(newUnit);
                  const isVolume = ['l', 'liter', 'litre', 'ml', 'mill'].includes(oldUnit) || ['l', 'liter', 'litre', 'ml', 'mill'].includes(newUnit);

                  if (oldUnit === 'kg' || oldUnit === 'l' || oldUnit === 'liter' || oldUnit === 'litre') currentQty *= 1000;
                  if (newUnit === 'kg' || newUnit === 'l' || newUnit === 'liter' || newUnit === 'litre') removeQty *= 1000;
                  
                  let totalQty = currentQty - removeQty;
                  let finalUnit = '';

                  if (isWeight) {
                    if (totalQty >= 1000) { totalQty = totalQty / 1000; finalUnit = 'kg'; }
                    else { finalUnit = 'g'; }
                  } else if (isVolume) {
                    if (totalQty >= 1000) { totalQty = totalQty / 1000; finalUnit = 'l'; }
                    else { finalUnit = 'ml'; }
                  } else {
                    finalUnit = newUnit || oldUnit;
                  }

                  totalQty = parseFloat(totalQty.toFixed(3));

                  if (totalQty > 0) {
                    const qtyStr = finalUnit ? `${totalQty} ${finalUnit}` : totalQty;
                    set((state) => ({ items: state.items.map(i => i.id === itemToRemove.id ? { ...i, quantity: qtyStr } : i) }));
                    addToast(`Decreased ${itemToRemove.name} to ${qtyStr}`, 'success');
                  } else {
                    removeItem(itemToRemove.id);
                    addToast(`Removed ${itemToRemove.name}`, 'success');
                  }
                }
              } else {
                addToast(`Couldn't find ${itemData.item} in your list`, 'error');
              }
            }
          }
        } catch (error) {
          console.error('Failed to process command', error);
          addToast('Failed to process command', 'error');
        } finally {
          setIsLoading(false);
          setTimeout(() => setTranscript(''), 2000); 
        }
      },
    }),
    {
      name: 'shopping-list-storage',
      partialize: (state) => ({ items: state.items, history: state.history }),
    }
  )
);
