# Voice Command Shopping Assistant

A minimalist, mobile-first voice command shopping assistant built with Next.js, Tailwind CSS, and Zustand.

## Live Demo
[Working Application URL] (Add deployment URL here)

## Setup Instructions

1. Clone the repository
2. Run `npm install` to install dependencies
3. (Optional) Create a `.env.local` file and add `GEMINI_API_KEY=your_key` to enable advanced NLP parsing. If omitted, the app will fall back to a robust regex parser ensuring zero external dependency risk.
4. Run `npm run dev` to start the development server
5. Open `http://localhost:3000`

## Approach (Write-up)
My approach prioritized core functionality, stability, and mobile-first UX. I chose **Next.js** combined with **Tailwind CSS** for rapid, production-ready UI development and **Zustand** for lightweight state management without prop drilling. 

To handle voice commands, I integrated the native **Web Speech API** (`SpeechRecognition`), removing the need for heavy third-party audio packages. The speech transcript is sent to a single Next.js API route (`/api/nlp`). This route utilizes the Google Gemini API to intelligently extract intent (add/remove), quantity, and item name. Crucially, I implemented a regex-based fallback parser within the route; if the API key is missing or the network fails, the app still functions flawlessly, adhering to the requirement for resilient code. 

State is persisted locally using Zustand's `persist` middleware with `localStorage`, satisfying data storage needs without the overhead of a database.

**Known Limitations (Future Scope):**
- **Multilingual Support**: Currently English-only. Future iterations will include i18n scaffolding.
- **Advanced Suggestions**: Seasonal, shopping-history-based, and price/brand filtering are omitted in this MVP to focus on the core voice-add loop. Currently features static substitute suggestions (e.g., milk -> almond milk).
