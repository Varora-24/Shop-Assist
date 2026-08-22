import { NextResponse } from 'next/server';

function fallbackRegexParser(text: string) {
  const lowerText = text.toLowerCase();
  
  // Basic Regex for add/remove/need/buy + quantity + item
  const removeMatch = lowerText.match(/(?:remove|delete) (?:(?:a |an |one )?(\d+) )?(.*)/);
  const addMatch = lowerText.match(/(?:add|need|buy|get) (?:(?:a |an |one )?(\d+) )?(.*)/);
  
  const parseQuantity = (val: string | undefined) => {
    if (!val) return 1;
    const num = parseInt(val, 10);
    return isNaN(num) ? 1 : num;
  };

  if (removeMatch) {
    return {
      action: 'remove',
      quantity: parseQuantity(removeMatch[1]),
      item: removeMatch[2].replace(/from my list/g, '').trim(),
      category: 'Uncategorized',
    };
  }
  
  if (addMatch) {
    return {
      action: 'add',
      quantity: parseQuantity(addMatch[1]),
      item: addMatch[2].replace(/to my list/g, '').trim(),
      category: 'Uncategorized',
    };
  }
  
  // Default to add 1 item if no verb matches but we have text
  return {
    action: 'add',
    quantity: 1,
    item: lowerText.trim(),
    category: 'Uncategorized'
  };
}

export async function POST(request: Request) {
  let transcript = '';
  try {
    const body = await request.json();
    transcript = body.transcript;
    
    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log('No GEMINI_API_KEY found, using fallback regex parser.');
      const result = fallbackRegexParser(transcript);
      return NextResponse.json(result);
    }

    const prompt = `You are a shopping list assistant. Parse the following voice command: "${transcript}".
Return a JSON object strictly following this structure (no markdown, just raw JSON):
{
  "action": "add" or "remove",
  "quantity": number,
  "item": string (the name of the item, capitalized nicely),
  "category": string (e.g. "Dairy", "Produce", "Meat", "Bakery", "Pantry", "Snacks", "Other")
}
If the user says "I need", "buy", "get", treat it as "add". If no quantity is specified, use 1.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Gemini');
    }

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResult) {
      throw new Error('Invalid response from Gemini');
    }

    const parsedData = JSON.parse(textResult);
    return NextResponse.json(parsedData);
    
  } catch (error) {
    console.error('NLP Error:', error);
    // On API failure, use fallback so app doesn't crash completely
    if (transcript) {
       console.log('Falling back to regex due to API error.');
       return NextResponse.json(fallbackRegexParser(transcript));
    }
    return NextResponse.json({ error: 'Failed to process command' }, { status: 500 });
  }
}
