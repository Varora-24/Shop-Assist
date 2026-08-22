import { NextResponse } from 'next/server';

const CATEGORY_MAP: Record<string, string[]> = {
  'Produce': ['apple', 'banana', 'mulberry', 'mulberries', 'blueberry', 'blueberries', 'strawberry', 'strawberries', 'chiku', 'chikus', 'orange', 'grape', 'carrot', 'onion', 'garlic', 'pineapple', 'pineapples', 'potato', 'tomato', 'fruit', 'veg', 'spinach', 'lettuce', 'melon'],
  'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'egg', 'cream', 'paneer', 'ghee'],
  'Bakery': ['bread', 'bagel', 'croissant', 'muffin', 'cake', 'bun', 'sourdough', 'pastry', 'pie'],
  'Pantry': ['rice', 'pasta', 'flour', 'sugar', 'salt', 'oil', 'cereal', 'bean', 'spice', 'sauce', 'vinegar', 'honey', 'lentil', 'oat'],
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
  let cleanName = name.toLowerCase();
  cleanName = cleanName.replace(/[.,!?]+$/, '').trim();
  cleanName = cleanName.replace(/^(raw|fresh|frozen|canned)\s+/, '').trim();
  return cleanName;
}

function fallbackRegexParser(text: string) {
  let lowerText = text.toLowerCase();
  
  const fillers = [
    "how about a little bit of ", "how about ", 
    "i would like to have some ", "i would like to have ", 
    "i would like some ", "i would like ", 
    "i want to buy some ", "i want to buy ", 
    "i want some ", "i want ", 
    "i need to buy some ", "i need to buy ", 
    "i need some ", "i need ", 
    "please add some ", "please add ", 
    "add some ", "add ", 
    "can you add some ", "can you add ", 
    "can you get some ", "can you get ", 
    "get some ", "get ", 
    "buy some ", "buy ", 
    "have some ", "have ", 
    "some "
  ];
  
  let hasActionVerb = false;
  const actionVerbs = ['add', 'need', 'buy', 'get', 'want', 'remove', 'delete'];
  if (actionVerbs.some(verb => lowerText.includes(verb))) {
     hasActionVerb = true;
  }

  for (const filler of fillers) {
    if (lowerText.startsWith(filler) || lowerText === filler.trim()) {
      lowerText = lowerText.substring(filler.length).trim();
      hasActionVerb = true; // if it had a filler, it implies intent
      break;
    }
  }

  let isRemove = false;
  if (lowerText.startsWith('remove ') || lowerText.startsWith('delete ')) {
    isRemove = true;
    lowerText = lowerText.replace(/^(remove|delete)\s+/, '').trim();
  }

  let splitText = lowerText
    .replace(/,\s*/g, '|')
    .replace(/\s+and\s+/g, '|')
    .replace(/\s+also\s+/g, '|')
    .replace(/\s+as well\s+/g, '|');
    
  splitText = splitText.replace(/\|\s*$/g, '');
  
  const rawItems = splitText.split('|').map(s => s.trim()).filter(Boolean);
  const results = [];
  
  const units = ['kg', 'grams', 'gram', 'g', 'ml', 'mill', 'l', 'liter', 'litre', 'lbs', 'lb', 'oz', 'dozen', 'packets', 'packet', 'bottles', 'bottle'];
  units.sort((a, b) => b.length - a.length);
  
  for (let rawItem of rawItems) {
    let numericQty = 1;
    const qtyMatch = rawItem.match(/^(a |an |one |two |three |four |five |six |seven |eight |nine |ten |\d+(\.\d+)?)/);
    if (qtyMatch) {
      const qtyStr = qtyMatch[0].trim();
      const wordToNum: Record<string, number> = {
        'a': 1, 'an': 1, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
        'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
      };
      numericQty = wordToNum[qtyStr] || parseFloat(qtyStr);
      if (isNaN(numericQty)) numericQty = 1;
      rawItem = rawItem.substring(qtyMatch[0].length).trim();
    }
    
    let foundUnit = '';
    for (const unit of units) {
       const unitRegex = new RegExp(`^${unit}(?:s)?\\b(?:\\s+of\\b)?\\s*`);
       const match = rawItem.match(unitRegex);
       if (match) {
         foundUnit = unit;
         rawItem = rawItem.substring(match[0].length).trim();
         break;
       }
    }
    
    rawItem = rawItem.replace(/^of\s+/, '').trim();
    let item = cleanItemName(rawItem.replace(/from my list$/g, '').replace(/to my list$/g, ''));
    if (!item) continue;

    const cat = inferCategory(item);

    // Garbage filter: single word, uncategorized, no action verb in original prompt -> discard
    const isSingleWord = !item.includes(' ');
    if (cat === 'Uncategorized' && isSingleWord && !hasActionVerb) {
       console.log(`Garbage filter triggered for "${item}", skipping.`);
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

    const prompt = `You are a shopping list assistant. Parse the following voice command: "${transcript}".
Return a JSON array strictly following this structure (no markdown, just raw JSON array). Split multi-item lists into separate objects:
[
  {
    "action": "add" or "remove",
    "quantity": "number or number+unit (e.g., 1, '5 kg', '500 ml', '2 packets')",
    "item": string (the name of the item WITHOUT the unit, cleanly formatted and lowercased),
    "category": string (e.g. "Produce", "Dairy", "Meat/Seafood", "Bakery", "Pantry", "Snacks", "Beverages", "Other")
  }
]
If the user says "I need", "buy", "get", treat it as "add". If no quantity is specified, use 1. If multiple items are mentioned, return an array of objects for each item. Extract units (kg, grams, ml, liters, packets, etc.) into the quantity field, NOT the item name. IMPORTANT: If the stated unit doesn't logically match the item (e.g., a weight unit like 'grams' or 'kg' for a liquid item like 'juice' or 'milk', or vice versa), correct it to the appropriate unit type for that item. If the transcript contains a random single word that is clearly not a food item and has no verb, you MUST ignore it and return an empty array [].`;

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
    
    for (const d of results) {
       d.item = cleanItemName(d.item);
       if (d.category === 'Uncategorized' || d.category === 'Other' || !d.category) {
         d.category = inferCategory(d.item);
       }
    }
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('NLP Error:', error);
    if (transcript) {
       console.log('Falling back to regex due to API error.');
       return NextResponse.json(fallbackRegexParser(transcript));
    }
    return NextResponse.json({ error: 'Failed to process command' }, { status: 500 });
  }
}
