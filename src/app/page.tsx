import ShoppingList from '@/components/ShoppingList';
import VoiceButton from '@/components/VoiceButton';
import VisualFeedback from '@/components/VisualFeedback';
import SuggestionsPanel from '@/components/SuggestionsPanel';
import SeasonalPanel from '@/components/SeasonalPanel';
import SearchPanel from '@/components/SearchPanel';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-30">
        <h1 className="text-xl font-bold text-center text-gray-900">Voice Shopping Assistant</h1>
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
