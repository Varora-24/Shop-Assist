'use client';

import React from 'react';
import { useShoppingStore } from '@/store/useShoppingStore';

export default function VisualFeedback() {
  const { isListening, transcript, isLoading } = useShoppingStore();

  if (!isListening && !transcript && !isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-blue-50 border-b border-blue-100 p-4 shadow-sm z-40 transition-all duration-300">
      <div className="max-w-md mx-auto text-center">
        {isListening && <p className="text-sm font-medium text-blue-800 animate-pulse">Listening...</p>}
        {isLoading && <p className="text-sm font-medium text-blue-800 animate-pulse">Processing...</p>}
        {transcript && <p className="text-lg text-blue-900 mt-1 italic">&quot;{transcript}&quot;</p>}
      </div>
    </div>
  );
}
