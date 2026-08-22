import { ShoppingBag } from 'lucide-react';
import ShoppingList from '@/components/ShoppingList';
import VoiceButton from '@/components/VoiceButton';
import VisualFeedback from '@/components/VisualFeedback';
import SuggestionsPanel from '@/components/SuggestionsPanel';
import SeasonalPanel from '@/components/SeasonalPanel';
import SearchPanel from '@/components/SearchPanel';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50/50 font-sans pb-24">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg p-5 sticky top-0 z-30">
        <div className="max-w-md mx-auto flex items-center justify-center gap-2">
          <ShoppingBag className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight">ShopAssist</h1>
        </div>
      </header>
      
      <VisualFeedback />
      
      <div className="pt-24">
        <SearchPanel />
        <SeasonalPanel />
        <SuggestionsPanel />
        <ShoppingList />
      </div>
      
      <VoiceButton />
    </main>
  );
}
