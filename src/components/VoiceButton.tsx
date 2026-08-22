'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useShoppingStore } from '@/store/useShoppingStore';

// Add TypeScript types for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceButton() {
  const { isListening, setIsListening, setTranscript, processVoiceCommand, language, setLanguage } = useShoppingStore();
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language;

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          const transcript = useShoppingStore.getState().transcript;
          if (transcript) {
            processVoiceCommand(transcript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setError('Microphone error or denied.');
          setIsListening(false);
          setTranscript('');
        };
      } else {
        setError('Speech Recognition API not supported in this browser.');
      }
    }
  }, [setIsListening, setTranscript, processVoiceCommand, language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setError(null);
      setTranscript('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
      <div className="bg-white rounded-full px-3 py-1 shadow-md border border-gray-200">
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="text-xs bg-transparent outline-none cursor-pointer text-gray-700"
        >
          <option value="en-US">English</option>
          <option value="hi-IN">Hindi</option>
          <option value="es-ES">Spanish</option>
        </select>
      </div>
      {error && <div className="mb-2 text-xs text-red-500 bg-red-50 p-1 rounded border border-red-100">{error}</div>}
      <button
        onClick={toggleListening}
        className={`flex items-center justify-center w-16 h-16 rounded-full shadow-xl transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {isListening ? <MicOff size={28} /> : <Mic size={28} />}
      </button>
    </div>
  );
}
