import { NextResponse } from 'next/server';

const CATEGORY_MAP: Record<string, string[]> = {
  'Produce': ['apple', 'banana', 'mulberry', 'mulberries', 'blueberry', 'blueberries', 'strawberry', 'strawberries', 'chiku', 'chikus', 'orange', 'grape', 'carrot', 'onion', 'garlic', 'pineapple', 'pineapples', 'potato', 'tomato', 'fruit', 'veg', 'spinach', 'lettuce', 'melon', 'lemon', 'lemons'],
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

function cleanItemName(name: string): string {
  let cleaned = name.toLowerCase();
  
  // Strip numbers
  cleaned = cleaned.replace(/\\d+(\\.\\d+)?/g, ' ');
  
  // Strip units
  const units = ['kg', 'grams', 'gram', 'g', 'ml', 'mill', 'l', 'liter', 'litre', 'lbs', 'lb', 'oz', 'dozen', 'packets', 'packet', 'bottles', 'bottle', 'loaves', 'loaf', 'pieces', 'piece', 'packs', 'pack', 'bunches', 'bunch'];
  units.forEach(u => {
    const reg = new RegExp(`\\\\b${u}s?\\\\b`, 'gi');
    cleaned = cleaned.replace(reg, ' ');
  });
  
  // Strip filler words
  const fillers = ['at', 'of', 'another', 'some', 'more', 'a bit of', 'as well', 'also', 'please', 'extra', 'additional', 'add', 'need', 'buy', 'get', 'want', 'a', 'an', 'the', 'how about', 'can you', 'from my list', 'to my list'];
  fillers.forEach(f => {
    const reg = new RegExp(`\\\\b${f}\\\\b`, 'gi');
    cleaned = cleaned.replace(reg, ' ');
  });
  
  cleaned = cleaned.replace(/^(raw|fresh|frozen|canned)\\s+/, ' ');
  cleaned = cleaned.replace(/[.,!?]+$/, ' ');
  return cleaned.replace(/\\s+/g, ' ').trim();
}

function fallbackRegexParser(text: string) {
  let lowerText = text.toLowerCase();
  
  // Meta-speech filter: reject conversational questions or suggestions
  const metaPatterns = [
    /^suggest\\b/, /^what should\\b/, /^help\\b/, /\\bhelp me\\b/
  ];
  
  const isPureQuestion = lowerText.includes('?') && !lowerText.includes('add') && !lowerText.includes('buy') && !lowerText.includes('need') && !lowerText.includes('get');
  const isEmptyHowAbout = (lowerText === 'how about' || lowerText === 'what about');
  
  if (metaPatterns.some(pattern => pattern.test(lowerText)) || isPureQuestion || isEmptyHowAbout) {
    console.log(`Meta-speech detected "\${text}", discarding.`);
    return [];
  }
  
  let isRemove = false;
  if (lowerText.startsWith('remove ') || lowerText.startsWith('delete ')) {
    isRemove = true;
  }
  
  let hasActionVerb = false;
  const actionVerbs = ['add', 'need', 'buy', 'get', 'want', 'remove', 'delete'];
  if (actionVerbs.some(verb => lowerText.includes(verb))) {
     hasActionVerb = true;
  }

  let splitText = lowerText
    .replace(/,\\s*/g, '|')
    .replace(/\\s+and\\s+/g, '|');
    
  splitText = splitText.replace(/\\|\\s*$/g, '');
  const rawItems = splitText.split('|').map(s => s.trim()).filter(Boolean);
  const results = [];
  
  const units = ['kg', 'grams', 'gram', 'g', 'ml', 'mill', 'l', 'liter', 'litre', 'lbs', 'lb', 'oz', 'dozen', 'packets', 'packet', 'bottles', 'bottle', 'loaves', 'loaf', 'pieces', 'piece', 'packs', 'pack', 'bunches', 'bunch'];
  units.sort((a, b) => b.length - a.length);
  
  for (let rawItem of rawItems) {
    let numericQty = 1;
    const qtyMatch = rawItem.match(/\\b(\\d+(\\.\\d+)?)\\b/);
    if (qtyMatch) {
      numericQty = parseFloat(qtyMatch[1]);
    } else {
      const wordToNum: Record<string, number> = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
      };
      for (const [w, n] of Object.entries(wordToNum)) {
        if (new RegExp(`\\\\b${w}\\\\b`, 'i').test(rawItem)) {
          numericQty = n;
          break;
        }
      }
    }
    
    let foundUnit = '';
    for (const unit of units) {
       if (new RegExp(`\\\\b${unit}s?\\\\b`, 'i').test(rawItem)) {
         foundUnit = unit;
         break;
       }
    }
    
    let item = cleanItemName(rawItem);
    if (!item) continue;

    const cat = inferCategory(item);
    
    // Explicit noise filter (instead of blocking all unknown single words)
    const noiseWords = ['um', 'uh', 'boom', 'ah', 'like', 'mother', 'showed', 'test', 'testing', 'hello'];
    const isNoise = noiseWords.includes(item) && !hasActionVerb;
    
    if (isNoise || item.length < 2) {
       console.log(`Garbage filter triggered for noise "${item}", skipping.`);
       continue;
    }

    // Semantic validation check
    const isLiquid = LIQUID_ITEMS.some(liq => item.includes(liq)) || cat === 'Beverages';
    const isSolid = cat === 'Meat/Seafood' || cat === 'Produce' || cat === 'Bakery';

    if (isLiquid && ['kg', 'grams', 'gram', 'g', 'lbs', 'lb', 'oz'].includes(foundUnit)) {
       foundUnit = (foundUnit === 'kg' || foundUnit === 'lbs' || foundUnit === 'lb') ? 'l' : 'ml';
    } else if (isSolid && ['ml', 'mill', 'l', 'liter', 'litre', 'bottle', 'bottles'].includes(foundUnit)) {
       foundUnit = (foundUnit === 'l' || foundUnit === 'liter' || foundUnit === 'litre') ? 'kg' : 'grams';
    }
    
    const quantity = foundUnit ? `${numericQty} ${foundUnit}` : numericQty;
    
    results.push({
      action: isRemove ? 'remove' : 'add',
      quantity,
      item,
      category: cat,
    });
  }

  // If nothing survived the filter, we return an empty array to ignore it.
  return results;
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
      if (result.length === 0) return NextResponse.json([]); // Return empty to ignore garbage
      return NextResponse.json(result);
    }

    const prompt = `You are a shopping list parser. From the user's spoken transcript: "${transcript}", extract:
- item: the core product name only, with NO filler words, prepositions, quantities, units, or polite phrases (strip words like 'at', 'as well', 'another', 'some', 'please', 'a bit of', etc. regardless of position in the sentence).
- quantity: numeric value if mentioned, default 1
- unit: unit of measurement if mentioned (kg, g, ml, l, count), or null
- category: one of [Produce, Dairy, Meat/Seafood, Bakery, Pantry, Beverages, Snacks, Uncategorized]
- action: 'add', 'remove', or 'none' (use 'none' for conversational/meta speech that isn't a genuine list command)

Return a JSON array of objects strictly following this structure (no markdown, just raw JSON array). Split multi-item lists into separate objects:
[
  {
    "action": string,
    "quantity": "number or number+unit (e.g., 1, '5 kg', '500 ml', '2 packets')",
    "item": string,
    "category": string
  }
]

Always return valid JSON even for imperfect or noisy input. Never include filler words in the item field under any circumstances. IMPORTANT: If the stated unit doesn't logically match the item (e.g., a weight unit like 'grams' or 'kg' for a liquid item like 'juice' or 'milk', or vice versa), correct it to the appropriate unit type for that item.`;

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
    const results = Array.isArray(parsedData) ? parsedData : [parsedData];
    const finalResults = [];
    
    for (const d of results) {
       if (d.action === 'none') continue;
       d.item = cleanItemName(d.item);
       if (d.category === 'Uncategorized' || d.category === 'Other' || !d.category) {
         d.category = inferCategory(d.item);
       }
       finalResults.push(d);
    }
    
    return NextResponse.json(finalResults);
    
  } catch (error) {
    console.error('NLP Error:', error);
    if (transcript) {
       console.log('Falling back to regex due to API error.');
       return NextResponse.json(fallbackRegexParser(transcript));
    }
    return NextResponse.json({ error: 'Failed to process command' }, { status: 500 });
  }
}
