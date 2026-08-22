import { NextResponse } from 'next/server';

const CATEGORY_MAP: Record<string, string[]> = {
  'Produce': ['apple', 'banana', 'mulberry', 'blueberries', 'strawberry', 'orange', 'grape', 'carrot', 'onion', 'garlic', 'pineapple', 'potato', 'tomato', 'fruit', 'veg', 'spinach', 'lettuce', 'melon', 'lemon', 'chiku'],
  'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'egg', 'cream', 'paneer', 'ghee'],
  'Bakery': ['bread', 'bagel', 'croissant', 'muffin', 'cake', 'bun', 'sourdough', 'pastry', 'pie'],
  'Pantry': ['rice', 'pasta', 'flour', 'sugar', 'salt', 'oil', 'cereal', 'bean', 'spice', 'sauce', 'vinegar', 'honey', 'lentil', 'oat', 'wheat'],
  'Snacks': ['chip', 'cookie', 'cracker', 'popcorn', 'nut', 'chocolate', 'candy'],
  'Meat/Seafood': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'meat', 'bacon', 'sausage', 'lamb', 'crab'],
  'Beverages': ['water', 'juice', 'soda', 'coffee', 'tea', 'coke', 'pepsi', 'drink'],
};

const LIQUID_ITEMS = ['juice', 'milk', 'water', 'oil', 'soda', 'coke', 'pepsi', 'tea', 'coffee', 'syrup', 'vinegar', 'sauce'];

function inferCategory(itemName: string): string {
  const lowerName = itemName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(kw => lowerName.includes(kw) || kw.includes(lowerName))) {
      return category;
    }
  }
  return 'Uncategorized';
}

function fallbackRegexParser(text: string) {
  let lowerText = text.toLowerCase();
  const metaPatterns = [/^suggest\b/, /^what should\b/, /^help\b/, /\bhelp me\b/];
  const isPureQuestion = lowerText.includes('?') && !lowerText.includes('add') && !lowerText.includes('buy');
  
  if (metaPatterns.some(pattern => pattern.test(lowerText)) || isPureQuestion) {
    return { intent: "none", items: [] };
  }
  
  let intent = 'add';
  if (lowerText.includes('find') || lowerText.includes('search') || lowerText.includes('look for')) intent = 'search';
  if (lowerText.startsWith('remove ') || lowerText.startsWith('delete ')) intent = 'remove';

  let splitText = lowerText.replace(/,\s*/g, '|').replace(/\s+and\s+/g, '|');
  const rawItems = splitText.split('|').map(s => s.trim()).filter(Boolean);
  const items = [];
  
  const units = ['kg', 'grams', 'gram', 'g', 'ml', 'mill', 'l', 'liter', 'litre', 'lbs', 'lb', 'oz', 'dozen', 'packets', 'packet', 'bottles', 'bottle', 'loaves', 'loaf', 'pieces', 'piece', 'packs', 'pack', 'bunches', 'bunch'];
  units.sort((a, b) => b.length - a.length);
  
  for (let rawItem of rawItems) {
    let numericQty = 1;
    const qtyMatch = rawItem.match(/\b(\d+(\.\d+)?)\b/);
    if (qtyMatch) {
      numericQty = parseFloat(qtyMatch[1]);
    } else {
      const wordToNum: Record<string, number> = {'half': 0.5, 'a half': 0.5, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10};
      for (const [w, n] of Object.entries(wordToNum)) {
        if (new RegExp(`\\b${w}\\b`, 'i').test(rawItem)) {
          numericQty = n;
          break;
        }
      }
    }
    
    let foundUnit = null;
    for (const unit of units) {
       if (new RegExp(`\\b${unit}s?\\b`, 'i').test(rawItem)) {
         foundUnit = unit;
         break;
       }
    }
    
    // Clean name
    let cleaned = rawItem;

    let maxPrice = null;
    const priceMatch = rawItem.match(/under \$?(\d+)/);
    if (priceMatch) {
       maxPrice = parseFloat(priceMatch[1]);
       cleaned = cleaned.replace(priceMatch[0], ' ');
    }

    // VERY STRICT strip!
    cleaned = cleaned.replace(/\b\d+(\.\d+)?\b/g, ' '); // numbers
    const wordNumbers = ['a half', 'half', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    wordNumbers.forEach(w => { cleaned = cleaned.replace(new RegExp(`\\b${w}\\b`, 'gi'), ' '); });
    
    units.forEach(u => { cleaned = cleaned.replace(new RegExp(`\\b${u}s?\\b`, 'gi'), ' '); });
    const fillers = ['at', 'of', 'another', 'some', 'more', 'a bit of', 'as well', 'also', 'please', 'extra', 'additional', 'add', 'need', 'buy', 'get', 'want', 'a', 'an', 'the'];
    fillers.forEach(f => { cleaned = cleaned.replace(new RegExp(`\\b${f}\\b`, 'gi'), ' '); });
    
    cleaned = cleaned.replace(/^(raw|fresh|frozen|canned)\s+/, ' ');
    cleaned = cleaned.replace(/[.,!?]+$/, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    if (!cleaned) continue;

    const cat = inferCategory(cleaned);
    
    if (['kg','grams','gram','g','lbs','lb','oz'].includes(foundUnit || '') && (LIQUID_ITEMS.some(liq => cleaned.includes(liq)) || cat === 'Beverages')) {
       foundUnit = (foundUnit === 'kg' || foundUnit === 'lbs') ? 'l' : 'ml';
    } else if (['ml','mill','l','liter','litre','bottle','bottles'].includes(foundUnit || '') && (cat === 'Meat/Seafood' || cat === 'Produce' || cat === 'Bakery')) {
       foundUnit = (foundUnit === 'l' || foundUnit === 'liter') ? 'kg' : 'grams';
    }
    
    items.push({
      item: cleaned,
      quantity: numericQty,
      unit: foundUnit,
      category: cat,
      brand: null,
      maxPrice: maxPrice
    });
  }

  return { intent: items.length > 0 ? intent : "none", items };
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

    const prompt = `You are a shopping list voice command parser. From the transcript, extract and return ONLY valid JSON with this exact shape:

{
  "intent": "add" | "remove" | "search" | "none",
  "items": [
    {
      "item": string,      // core product name ONLY. Strip ALL numbers, units (kg, g, gram, grams, ml, l, liter, litre, dozen, packet, bottle, count words), and filler/polite words (at, of, another, some, more, a bit of, as well, also, please, extra, additional, i need, i want, can you, kindly) regardless of where they appear in the sentence.
      "quantity": number,  // numeric value only, default 1 if unspecified
      "unit": string|null, // normalized unit if present (kg, g, ml, l, count), null if not applicable
      "category": string,  // one of: Produce, Dairy, Meat/Seafood, Bakery, Pantry, Beverages, Snacks, Uncategorized
      "maxPrice": number|null, // for search intent: price ceiling if mentioned, else null
      "brand": string|null // for search intent: brand name if mentioned, else null
    }
  ]
}

Rules:
- If the transcript contains search language ("find", "search for", "show me", "look for"), set intent to "search".
- If the transcript mentions multiple items (via commas, "and", "also", "as well"), return each as a SEPARATE object in the items array.
- If the transcript is conversational/meta speech and not a genuine list command (e.g. "suggest something", "can you help me", isolated filler sounds), return intent: "none" and items: [].
- Always return valid JSON, even for noisy or ambiguous input. Never omit a field.
- Never include units, numbers, or filler words in the "item" field under any circumstance.

Transcript: "${transcript}"`;

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
    if (!textResult) throw new Error('Invalid response from Gemini');

    const parsedData = JSON.parse(textResult);
    
    // Ensure shape
    if (parsedData.intent === 'none' || !parsedData.items) {
      return NextResponse.json({ intent: 'none', items: [] });
    }
    
    // Categorize fallback if LLM missed it
    parsedData.items.forEach((item: any) => {
       if (item.category === 'Uncategorized' || item.category === 'Other' || !item.category) {
         item.category = inferCategory(item.item);
       }
    });

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
