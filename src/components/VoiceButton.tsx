'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, MessageSquare } from 'lucide-react';
import { useShoppingStore } from '@/store/useShoppingStore';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceButton() {
  const { isListening, setIsListening, setTranscript, processVoiceCommand, language, setLanguage, isLoading } = useShoppingStore();
  const [error, setError] = useState<string | null>(null);
  const [showText, setShowText] = useState(false);
  const [textInput, setTextInput] = useState('');
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

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isLoading) return;
    processVoiceCommand(textInput.trim());
    setTextInput('');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 flex flex-col justify-end items-center z-50 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-center gap-4 w-full max-w-md">
        
        {error && <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 shadow-sm">{error}</div>}
        
        {showText && (
          <form onSubmit={handleTextSubmit} className="w-full bg-white p-2 rounded-2xl shadow-xl border border-gray-200 flex items-center gap-2 animate-[slideIn_0.2s_ease-out]">
            <input 
              type="text" 
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type a command (e.g. 'add milk')"
              className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-gray-800 placeholder-gray-400"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!textInput.trim() || isLoading}
              className="bg-indigo-600 text-white p-2 rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
        )}

        <div className="flex items-center gap-4">
          <div className="bg-white rounded-full px-4 py-2 shadow-lg border border-gray-100">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm bg-transparent outline-none cursor-pointer text-gray-700 font-medium"
            >
              <option value="en-US">English</option>
              <option value="hi-IN">Hindi</option>
              <option value="es-ES">Spanish</option>
              <option value="te-IN">Telugu</option>
              <option value="ta-IN">Tamil</option>
            </select>
          </div>

          <button
            onClick={toggleListening}
            className={`flex items-center justify-center w-20 h-20 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 ${
              isListening ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-[0_0_40px_rgba(239,68,68,0.6)] animate-[pulse_1.5s_ease-in-out_infinite]' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 hover:shadow-[0_8px_30px_rgb(79,70,229,0.3)]'
            } text-white`}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          </button>

          <button 
            onClick={() => setShowText(!showText)}
            className={`bg-white rounded-full p-3 shadow-lg border border-gray-100 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors ${showText ? 'bg-indigo-50 text-indigo-600' : ''}`}
            title="Type a command"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
