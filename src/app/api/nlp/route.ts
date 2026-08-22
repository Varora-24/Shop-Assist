import { NextResponse } from 'next/server';

const CATEGORY_MAP: Record<string, string[]> = {
  Produce: ['apple', 'banana', 'mulberry', 'blueberry', 'orange', 'grape', 'carrot', 'onion', 'garlic'],
  Dairy: ['milk', 'cheese', 'yogurt', 'butter', 'egg'],
  Bakery: ['bread', 'bagel', 'croissant', 'muffin'],
  Pantry: ['rice', 'pasta', 'flour', 'sugar', 'salt'],
  Snacks: ['chip', 'cookie', 'cracker', 'popcorn'],
};

function inferCategory(itemName: string): string {
  const lowerName = itemName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(kw => lowerName.includes(kw))) {
      return category;
    }
  }
  return 'Uncategorized';
}

function cleanItemName(name: string): string {
  // Lowercase normalize
  let cleanName = name.toLowerCase();
  // Strip trailing punctuation
  cleanName = cleanName.replace(/[.,!?]+$/, '').trim();
  return cleanName;
}

function fallbackRegexParser(text: string) {
  let lowerText = text.toLowerCase();
  
  // Strip filler phrases
  const fillers = [
    "i would like to have some",
    "i would like to have",
    "i would like some",
    "i would like",
    "i want to buy some",
    "i want to buy",
    "i want some",
    "i want",
    "i need to buy some",
    "i need to buy",
    "i need some",
    "i need",
    "please add some",
    "please add",
    "add some",
    "add",
    "can you add some",
    "can you add",
    "can you get some",
    "can you get",
    "get some",
    "get",
    "buy some",
    "buy",
    "have some",
    "have",
    "some"
  ];
  
  // Try to remove a filler from the beginning
  for (const filler of fillers) {
    if (lowerText.startsWith(filler + ' ') || lowerText === filler) {
      lowerText = lowerText.substring(filler.length).trim();
      break;
    }
  }

  // Basic check for remove
  let isRemove = false;
  if (lowerText.startsWith('remove ') || lowerText.startsWith('delete ')) {
    isRemove = true;
    lowerText = lowerText.replace(/^(remove|delete)\s+/, '').trim();
  }

  // Look for quantity
  let quantity = 1;
  const qtyMatch = lowerText.match(/^(a |an |one |two |three |four |five |six |seven |eight |nine |ten |\d+\s+)/);
  if (qtyMatch) {
    const qtyStr = qtyMatch[1].trim();
    const wordToNum: Record<string, number> = {
      'a': 1, 'an': 1, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
      'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    };
    quantity = wordToNum[qtyStr] || parseInt(qtyStr, 10);
    if (isNaN(quantity)) quantity = 1;
    lowerText = lowerText.substring(qtyMatch[0].length).trim();
  }

  // Clean remaining text as the item name
  let item = cleanItemName(lowerText.replace(/from my list$/g, '').replace(/to my list$/g, ''));

  // If item is empty after all this, we failed to parse anything meaningful, fallback to original text
  if (!item) {
    item = cleanItemName(text);
  }

  return {
    action: isRemove ? 'remove' : 'add',
    quantity,
    item,
    category: inferCategory(item),
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
      console.log('No GEMINI_API_KEY found. Bypassing LLM, using fallback regex parser.');
      const result = fallbackRegexParser(transcript);
      return NextResponse.json(result);
    }

    const prompt = `You are a shopping list assistant. Parse the following voice command: "${transcript}".
Return a JSON object strictly following this structure (no markdown, just raw JSON):
{
  "action": "add" or "remove",
  "quantity": number,
  "item": string (the name of the item, cleanly formatted and lowercased),
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
      const errText = await response.text();
      console.error('Gemini API Error Response:', response.status, errText);
      throw new Error('Failed to fetch from Gemini');
    }

    const data = await response.json();
    console.log('Gemini API Raw Output:', JSON.stringify(data));

    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResult) {
      throw new Error('Invalid response from Gemini');
    }

    const parsedData = JSON.parse(textResult);
    parsedData.item = cleanItemName(parsedData.item);
    if (parsedData.category === 'Uncategorized' || !parsedData.category) {
      parsedData.category = inferCategory(parsedData.item);
    }
    
    return NextResponse.json(parsedData);
    
  } catch (error) {
    console.error('NLP Error:', error);
    if (transcript) {
       console.log('Falling back to regex due to API error.');
       return NextResponse.json(fallbackRegexParser(transcript));
    }
    return NextResponse.json({ error: 'Failed to process command' }, { status: 500 });
  }
}
