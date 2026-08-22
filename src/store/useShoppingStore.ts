import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Item = {
  id: string;
  name: string;
  category: string;
  quantity: number;
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
        // Check for substitutes
        const lowerName = item.name.toLowerCase();
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

        set((state) => ({
          items: [...state.items, { ...item, id: Date.now().toString() }],
          suggestions: newSuggestions.length > 0 ? newSuggestions : state.suggestions
        }));
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
        const { setTranscript, setIsLoading, addItem, removeItem, items } = get();
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
          
          if (data.action === 'add') {
            addItem({
              name: data.item,
              category: data.category || 'Uncategorized',
              quantity: data.quantity || 1
            });
          } else if (data.action === 'remove') {
            const itemToRemove = items.find(i => i.name.toLowerCase().includes(data.item.toLowerCase()));
            if (itemToRemove) {
              removeItem(itemToRemove.id);
            } else {
              console.warn('Item not found to remove:', data.item);
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
