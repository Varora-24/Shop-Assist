import { NextResponse } from 'next/server';

const CATEGORY_MAP: Record<string, string[]> = {
  'Produce': ['apple', 'banana', 'mulberry', 'blueberries', 'strawberry', 'strawberries', 'orange', 'grape', 'carrot', 'onion', 'garlic', 'pineapple', 'potato', 'tomato', 'fruit', 'veg', 'spinach', 'lettuce', 'melon', 'lemon', 'chiku', 'mango', 'berry', 'eggplant', 'pepper', 'cabbage', 'broccoli', 'cauliflower', 'mushroom', 'peas', 'corn', 'cucumber'],
  'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'egg', 'cream', 'paneer', 'ghee', 'curd', 'buttermilk'],
  'Bakery': ['bread', 'bagel', 'croissant', 'muffin', 'cake', 'bun', 'sourdough', 'pastry', 'pie', 'cookie', 'biscuit'],
  'Pantry': ['rice', 'pasta', 'flour', 'sugar', 'salt', 'oil', 'cereal', 'bean', 'spice', 'sauce', 'vinegar', 'honey', 'lentil', 'oat', 'wheat', 'jam', 'peanut butter', 'mayo', 'ketchup', 'mustard', 'broth', 'soup', 'noodle', 'dal'],
  'Snacks': ['chip', 'cookie', 'cracker', 'popcorn', 'nut', 'chocolate', 'candy', 'bar', 'pretzel'],
  'Meat/Seafood': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'meat', 'bacon', 'sausage', 'lamb', 'crab', 'turkey', 'prawn', 'tofu', 'paneer', 'tempeh'],
  'Beverages': ['water', 'juice', 'soda', 'coffee', 'tea', 'coke', 'pepsi', 'drink', 'beer', 'wine', 'liquor'],
  'Toiletries': ['toothpaste', 'toothbrush', 'soap', 'shampoo', 'conditioner', 'lotion', 'deodorant', 'razor', 'shave', 'floss', 'mouthwash', 'body wash', 'tissue', 'toilet paper', 'paper towel', 'napkin', 'pad', 'tampon']
};

const LIQUID_ITEMS = ['juice', 'lemon juice', 'milk', 'water', 'oil', 'soda', 'coke', 'pepsi', 'tea', 'coffee', 'syrup', 'vinegar', 'sauce'];

function inferCategory(itemName: string): string {
  const lowerName = itemName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(kw => lowerName.includes(kw) || kw.includes(lowerName))) {
      return category;
    }
  }
  return 'Uncategorized';
}


const DICTIONARY: Record<string, string> = {
  // Hindi
  'एक': 'one', 'दो': 'two', 'तीन': 'three', 'चार': 'four', 'पांच': 'five', 'छह': 'six', 'सात': 'seven', 'आठ': 'eight', 'नौ': 'nine', 'दस': 'ten',
  'किलो': 'kg', 'ग्राम': 'grams', 'लीटर': 'liter', 'मिलीलीटर': 'ml', 'दर्जन': 'dozen',
  'सेब': 'apple', 'आलू': 'potato', 'बैगन': 'eggplant', 'दूध': 'milk', 'पानी': 'water', 'रोटी': 'bread', 'चीनी': 'sugar', 'चिकन': 'chicken', 'अंडा': 'egg', 'अंडे': 'egg', 'प्याज': 'onion', 'टमाटर': 'tomato', 'केला': 'banana', 'और': 'and', 'भी': 'also',
  
  // Spanish
  'uno': 'one', 'un': 'one', 'de': ' ', 'dos': 'two', 'tres': 'three', 'cuatro': 'four', 'cinco': 'five', 'seis': 'seis', 'siete': 'seven', 'ocho': 'eight', 'nueve': 'nine', 'diez': 'ten',
  'kilo': 'kg', 'gramos': 'grams', 'litro': 'liter', 'litros': 'liter', 'docena': 'dozen',
  'manzana': 'apple', 'manzanas': 'apple', 'papa': 'potato', 'patata': 'potato', 'berenjena': 'eggplant', 'leche': 'milk', 'agua': 'water', 'pan': 'bread', 'azúcar': 'sugar', 'pollo': 'chicken', 'huevo': 'egg', 'cebolla': 'onion', 'tomate': 'tomato', 'plátano': 'banana', 'y': 'and', 'también': 'also'
};

function translateText(text: string) {
  let translated = text;
  // Replace punctuation
  translated = translated.replace(/[।.!?]/g, ' ');
  for (const [word, trans] of Object.entries(DICTIONARY)) {
    translated = translated.replace(new RegExp(`(?:\\b|^|\\s)${word}(?:\\b|$|\\s)`, 'gi'), ` ${trans} `);
  }
  return translated.replace(/\s+/g, ' ').trim();
}

export function fallbackRegexParser(text: string) {
  text = translateText(text);
  let lowerText = text.toLowerCase();
  const metaPatterns = [/^suggest\b/, /^what should\b/, /^help\b/, /\bhelp me\b/];
  const isPureQuestion = lowerText.includes('?') && !lowerText.includes('add') && !lowerText.includes('buy');
  
  if (metaPatterns.some(pattern => pattern.test(lowerText)) || isPureQuestion) {
    return { intent: "none", items: [] };
  }
  
  let intent = 'add';
  if (lowerText.includes('find') || lowerText.includes('search') || lowerText.includes('look for')) intent = 'search';
  if (lowerText.startsWith('remove ') || lowerText.startsWith('delete ') || lowerText.startsWith('take off ')) intent = 'remove';
    if (lowerText.includes('clear list') || lowerText.includes('empty list') || lowerText === 'clear') return { intent: 'clear', items: [] };
    if (lowerText.startsWith('update ') || lowerText.startsWith('change ') || lowerText.includes(' quantity')) intent = 'update';

  let splitText = lowerText.replace(/,\s*/g, '|').replace(/\s+and\s+/g, '|').replace(/\s+also\s+/g, '|').replace(/\s+plus\s+/g, '|');
    // Split on numbers that aren't part of a word (e.g. '2 apples 3 bananas' -> '2 apples | 3 bananas')
    splitText = splitText.replace(/\s+(?=(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b)/g, '|');
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
    const fillers = ['at', 'of', 'another', 'some', 'more', 'a bit of', 'as well', 'also', 'please', 'extra', 'additional', 'add', 'need', 'buy', 'get', 'want', 'a', 'an', 'the', 'find', 'search', 'look for', 'show me', 'from', 'my', 'list', 'cart', 'remove', 'delete', 'take off', 'get rid of'];
    fillers.forEach(f => { cleaned = cleaned.replace(new RegExp(`\\b${f}\\b`, 'gi'), ' '); });
    
    cleaned = cleaned.replace(/^(raw|fresh|frozen|canned)\s+/, ' ');
    cleaned = cleaned.replace(/[.,!?]+$/, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    if (!cleaned) continue;

    const cat = inferCategory(cleaned);
    
    if (['kg','grams','gram','g','lbs','lb','oz'].includes(foundUnit || '') && (LIQUID_ITEMS.some(liq => cleaned.includes(liq)) || cat === 'Beverages')) {
       foundUnit = (foundUnit === 'kg' || foundUnit === 'lbs') ? 'l' : 'ml';
    } else if (['ml','mill','l','liter','litre','bottle','bottles'].includes(foundUnit || '') && (cat === 'Meat/Seafood' || cat === 'Produce' || cat === 'Bakery') && !LIQUID_ITEMS.some(liq => cleaned.includes(liq))) {
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
    const language = body.language || 'en-US';
    
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
  "intent": "add" | "remove" | "search" | "update" | "clear" | "none",
  "items": [
    {
      "item": string,      // core product name ONLY. Strip ALL numbers, units (kg, g, gram, grams, ml, l, liter, litre, dozen, packet, bottle, count words), and filler/polite words (at, of, another, some, more, a bit of, as well, also, please, extra, additional, i need, i want, can you, kindly) regardless of where they appear in the sentence.
      "quantity": number,  // numeric value only, default 1 if unspecified
      "unit": string|null, // normalized unit if present (kg, g, ml, l, count), null if not applicable
      "category": string,  // one of: Produce, Dairy, Meat/Seafood, Bakery, Pantry, Beverages, Snacks, Toiletries, Uncategorized
      "maxPrice": number|null, // for search intent: price ceiling if mentioned, else null
      "brand": string|null // for search intent: brand name if mentioned, else null
    }
  ]
}

Rules:
- The following transcript may be in ${language}. Extract the item name translated into English for consistent categorization, but preserve the original spoken quantity/unit logic.
- If the transcript contains search language ("find", "search for", "show me", "look for"), set intent to "search".
  - If the transcript asks to clear or empty the entire list, return intent: "clear" and items: [].
  - If the transcript asks to change or update the quantity of an existing item, set intent to "update".
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
