# Shop Assist: Voice-Powered Shopping List

[![Live Demo](https://img.shields.io/badge/Live_Demo-shop--assist--ten.vercel.app-blue?style=for-the-badge&logo=vercel)](https://shop-assist-ten.vercel.app/)

A highly resilient, minimalist, and mobile-first voice command shopping assistant built with **Next.js**, **Tailwind CSS**, and **Zustand**. 

Shop Assist allows users to intuitively manage their grocery shopping lists entirely via natural language voice commands. Whether you are adding multiple quantities of items, removing a specific product, or searching for budget-friendly tiered alternatives, the application processes conversational speech and intelligently manages your cart—all without requiring a database or user authentication.

## 🚀 Live Demo
Experience the application here: **[https://shop-assist-ten.vercel.app/](https://shop-assist-ten.vercel.app/)**

---

## 🛠️ System Architecture

The application is engineered to be serverless and heavily decoupled. The frontend handles state persistence locally while offloading natural language processing to a specialized Next.js API route. This ensures snappy UI rendering and graceful fallbacks.

```mermaid
graph TD
    A[User Voice Command] -->|Browser Web Speech API| B(Frontend Client - Next.js)
    B -->|Sends Transcript POST| C[API Route: /api/nlp]
    
    C -->|1. LLM Strategy| D[Google Gemini API]
    C -->|2. Fallback Strategy| E[RegEx Fallback Engine]
    
    D --> F[Sanitize & Intent Extraction]
    E --> F
    
    F -->|Returns Structured JSON| B
    B -->|Action Dispatched| G[(Zustand State Engine)]
    G -->|Auto-saves| H[Browser localStorage]
```

## ✨ Core Features

- **Advanced Voice Recognition:** Leverages the native browser Web Speech API for seamless transcription without relying on heavy third-party audio packages.
- **Hybrid NLP Engine:** The `/api/nlp` route utilizes **Google Gemini 1.5 Flash** to extract complex semantic intents (Add, Remove, Update, Search, Clear). If the API is rate-limited or the key is missing, it instantly falls back to a **Rigorous RegEx Parsing Engine**, guaranteeing zero downtime.
- **Multilingual Support:** Transcribes and successfully translates commands spoken in multiple languages (e.g., Hindi) before mapping them to the proper English categories in the store.
- **Smart Unit Normalization:** Automatically reconciles and merges mathematically complex unit equations (e.g. "add 1kg of apples" followed by "remove 500g of apples" resolves correctly).
- **Adversarial Content Filtering:** Equipped with zero-tolerance explicit and adversarial item blockers (covering multiple languages) that violently reject inappropriate requests and inject error toasts.
- **Tiered Variant Searching:** Capable of handling search requests mapped to price tiers (e.g., "suggest cheap milk" vs "find premium organic milk").
- **Stateless Persistence:** Eliminates the need for Postgres, Firebase, or Supabase. Zustand’s `persist` middleware securely retains all data in the user's local browser storage.

---

## 💻 Setup Instructions

To run this project locally, ensure you have Node.js installed, then follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/Varora-24/Shop-Assist.git
   cd Shop-Assist
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (Optional but recommended):
   Create a `.env.local` file in the root directory and add your Google Gemini API key to enable LLM capabilities.
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Note: If omitted, the app will gracefully fall back to the robust offline regex parser.*
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Development Approach & Philosophy

My core development approach prioritized absolute application resilience, smooth UX interactions, and a strict adherence to strict technical constraints. I chose **Next.js** for its App Router capability and streamlined API route handling, **Tailwind CSS** for rapid and consistent styling on mobile viewports, and **Zustand** for centralized, prop-drilling-free state management.

By completely separating the UI components from the NLP logic, the application maintains a clean architectural boundary. The addition of defensive programming tactics—like the secondary regex fallback parser and adaptive unit capacity ceilings—ensures that edge cases do not crash the user experience. The ultimate goal was to prove that a lightweight, database-free architecture could securely execute complex AI tasks without compromising speed or reliability.
