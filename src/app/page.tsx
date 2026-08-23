import { ShoppingBag } from 'lucide-react';
import ShoppingList from '@/components/ShoppingList';
import VoiceButton from '@/components/VoiceButton';
import VisualFeedback from '@/components/VisualFeedback';
import SuggestionsPanel from '@/components/SuggestionsPanel';
import SeasonalPanel from '@/components/SeasonalPanel';
import SearchPanel from '@/components/SearchPanel';
import Toasts from '@/components/Toasts';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-24">
      <Toasts />
      <header className="bg-white border-b border-gray-200 text-gray-900 p-4 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-sm"><ShoppingBag className="w-5 h-5 text-white" /></div>
          <h1 className="text-xl font-extrabold tracking-tight">ShopAssist</h1>
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
