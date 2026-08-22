function normalizeItemName(text) {
  let cleaned = text.toLowerCase();
  
  // Strip numbers
  cleaned = cleaned.replace(/\d+(\.\d+)?/g, ' ');
  
  // Strip units
  const units = ['kg', 'g', 'gram', 'grams', 'ml', 'l', 'liter', 'litre', 'dozen', 'packet', 'bottle', 'loaves', 'loaf', 'pieces', 'piece', 'packs', 'pack', 'bunches', 'bunch'];
  units.forEach(u => {
    const reg = new RegExp(`\\b${u}s?\\b`, 'gi');
    cleaned = cleaned.replace(reg, ' ');
  });
  
  // Strip filler words
  const fillers = ['at', 'of', 'another', 'some', 'more', 'a bit of', 'as well', 'also', 'please', 'extra', 'additional', 'add', 'need', 'buy', 'get', 'want', 'a', 'an', 'the'];
  fillers.forEach(f => {
    const reg = new RegExp(`\\b${f}\\b`, 'gi');
    cleaned = cleaned.replace(reg, ' ');
  });
  
  return cleaned.replace(/\s+/g, ' ').trim();
}

function parseVoiceCommand(text) {
  const metaPatterns = [
    /^suggest\b/, /^what should\b/, /^help\b/, /\bhelp me\b/
  ];
  const isPureQuestion = text.includes('?') && !text.includes('add') && !text.includes('buy') && !text.includes('need') && !text.includes('get');
  const isEmptyHowAbout = (text === 'how about' || text === 'what about');
  
  if (metaPatterns.some(pattern => pattern.test(text)) || isPureQuestion || isEmptyHowAbout) {
    return [];
  }

  let numericQty = 1;
  const qtyMatch = text.match(/\b(\d+(\.\d+)?)\b/);
  if (qtyMatch) {
    numericQty = parseFloat(qtyMatch[1]);
  } else {
    // word numbers
    const wordToNum = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10 };
    for (const [w, n] of Object.entries(wordToNum)) {
      if (new RegExp(`\\b${w}\\b`, 'i').test(text)) {
        numericQty = n;
        break;
      }
    }
  }
  
  let foundUnit = '';
  const units = ['kg', 'grams', 'gram', 'g', 'ml', 'mill', 'l', 'liter', 'litre', 'lbs', 'lb', 'oz', 'dozen', 'packets', 'packet', 'bottles', 'bottle'];
  for (const u of units) {
    if (new RegExp(`\\b${u}s?\\b`, 'i').test(text)) {
      foundUnit = u.toLowerCase();
      break;
    }
  }

  const cleanedName = normalizeItemName(text);
  if (!cleanedName) return [];

  return [{
    action: 'add',
    item: cleanedName,
    rawQuantity: numericQty,
    unit: foundUnit
  }];
}

let items = [];

function getBaseGrams(qty, unit) {
  if (unit === 'kg' || unit === 'l' || unit === 'liter' || unit === 'litre') return qty * 1000;
  if (unit === 'lbs' || unit === 'lb') return qty * 453.592;
  if (unit === 'oz') return qty * 28.3495;
  if (unit === 'g' || unit === 'gram' || unit === 'grams' || unit === 'ml' || unit === 'mill') return qty;
  // If no unit or count-based unit, assume it's just a count (we'll treat count as base unit 1)
  return qty;
}

function formatFromGrams(grams, isLiquid) {
  if (isLiquid) {
    if (grams >= 1000) return (grams / 1000) + ' l';
    return grams + ' ml';
  } else {
    if (grams >= 1000) return (grams / 1000) + ' kg';
    return grams + ' g';
  }
}

function processCommand(text) {
  console.log('\\n> "' + text + '"');
  const parsed = parseVoiceCommand(text.toLowerCase());
  
  if (parsed.length === 0) {
    console.log("State:", items);
    return;
  }

  parsed.forEach(p => {
    const newBaseQty = getBaseGrams(p.rawQuantity, p.unit);
    const isLiquid = ['ml', 'mill', 'l', 'liter', 'litre'].includes(p.unit) || ['juice', 'milk', 'water', 'oil', 'soda'].some(l => p.item.includes(l));
    
    const existingIndex = items.findIndex(i => i.name === p.item || i.name.includes(p.item) || p.item.includes(i.name));
    
    if (existingIndex !== -1) {
      const existing = items[existingIndex];
      const sumBase = existing.baseQty + newBaseQty;
      items[existingIndex] = {
        ...existing,
        baseQty: sumBase,
        displayQty: formatFromGrams(sumBase, isLiquid)
      };
    } else {
      items.push({
        name: p.item,
        baseQty: newBaseQty,
        displayQty: p.unit ? formatFromGrams(newBaseQty, isLiquid) : p.rawQuantity.toString()
      });
    }
  });

  console.log("State:", items);
}

processCommand("add beef");
processCommand("at 3 kg of beef");
processCommand("add another 2 kg of beef");
processCommand("tofu as well");
processCommand("300 ml of lemon juice");
processCommand("suggest something to add");
