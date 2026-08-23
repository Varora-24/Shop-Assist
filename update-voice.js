const fs = require('fs');
let code = fs.readFileSync('src/components/VoiceButton.tsx', 'utf8');

code = code.replace(
  "className={`flex items-center justify-center w-16 h-16 rounded-full shadow-xl transition-all duration-300 ${",
  "className={`flex items-center justify-center w-16 h-16 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 ${"
);

code = code.replace(
  /isListening\s*\?\s*'bg-red-500 hover:bg-red-600 animate-pulse'\s*:\s*'bg-blue-600 hover:bg-blue-700'/g,
  "isListening ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-[0_0_40px_rgba(239,68,68,0.6)] animate-[pulse_1.5s_ease-in-out_infinite]' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 hover:shadow-[0_8px_30px_rgb(79,70,229,0.3)]'"
);

fs.writeFileSync('src/components/VoiceButton.tsx', code);
