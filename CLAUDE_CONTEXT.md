# Voice Shopping Assistant - Project Context & Status

## Overview
The Voice Shopping Assistant is a Next.js web application that allows users to add, remove, and search for shopping list items using voice commands. It leverages the Web Speech API for voice recognition and the Google Gemini 1.5 Flash API for natural language processing (NLP) to categorize items and extract quantities.

## Current Status
**Phase 1-6 are 100% COMPLETE according to the assignment requirements.**
The app is fully functional and deployed on Vercel.

### Completed Features:
- **Phase 1 (Core Parsing)**: Successfully extracts item names, quantities, units, and categories. Handles complex voice logic and merges duplicate items seamlessly. Features a robust regex-based fallback parser if the Gemini API key is missing or errors out.
- **Phase 2 (Smart Suggestions)**: 
  - *Substitutes*: Detects items like "milk" and suggests substitutes like "almond milk" with Add/Replace logic.
  - *Seasonal*: Displays a static mock "In Season This Month" panel.
  - *History*: Tracks removed items and prompts users to re-add items if they were removed over 7 days ago.
- **Phase 3 (Search/Filter)**: Recognizes search intents ("find toothpaste") and filters a mock product database, displaying results in a dedicated panel with "+ Add" buttons.
- **Phase 4 (Multilingual)**: Supports English, Hindi (`hi-IN`), and Spanish (`es-ES`) voice inputs. (The LLM handles translation and extraction automatically; the rule-based fallback has also been patched with a basic local dictionary for these languages).
- **Phase 5 (UI Polish)**: Completely overhauled with a premium e-commerce look using Tailwind CSS and `lucide-react` icons. Forced light-mode to prevent dark-mode muddying, expanded max-width, improved badge/pill styling, and made fully mobile-responsive.
- **Phase 6 (Compliance)**: `.gitignore` configured correctly, no API keys committed, README updated with requirements.

## Tech Stack
- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **State Management**: Zustand (with `persist` middleware for `localStorage`)
- **Voice**: Native Web Speech API
- **AI/NLP**: Google Gemini 1.5 Flash API (via `@google/genai` or standard fetch)
- **Icons**: `lucide-react`

## Code Structure
- `src/app/page.tsx`: Main dashboard layout integrating all panels.
- `src/app/api/nlp/route.ts`: Core NLP engine. Routes transcript to Gemini, or falls back to a complex rule-based regex parser if offline/no-key.
- `src/store/useShoppingStore.ts`: Zustand store managing items, suggestions, history, search results, and voice state.
- `src/components/VoiceButton.tsx`: Floating Action Button that triggers `SpeechRecognition`.
- `src/components/ShoppingList.tsx`: Renders the categorized shopping cart.
- `src/components/SuggestionsPanel.tsx`: Handles substitute and history suggestions.
- `src/components/SeasonalPanel.tsx`: Renders current seasonal produce.
- `src/components/SearchPanel.tsx`: Renders search results from mock data.

## Known Limitations / Future Work
- Complex edge cases with heavy noise or nested fractions might occasionally confuse the Web Speech API before hitting the NLP layer.
- The rule-based fallback parser relies on a static translation dictionary for non-English languages, which is naturally limited compared to the Gemini LLM.

## Notes for Claude
- If you need to make changes to the fallback parser, look at `fallbackRegexParser` in `route.ts`. 
- State is entirely local to the browser via Zustand's `localStorage` persist. There is no backend database.
- UI styling uses Tailwind utility classes directly in the components. Ensure any new components match the modern, light-themed aesthetic (`bg-white`, `rounded-xl`, `shadow-sm`, border colors, etc.).
