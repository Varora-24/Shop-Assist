const transcripts = [
  "add beef",
  "at 3 kg of beef",
  "add another 2 kg of beef",
  "tofu as well",
  "300 ml of lemon juice",
  "suggest something to add"
];

async function run() {
  for (const t of transcripts) {
    console.log(`\nTesting: "${t}"`);
    try {
      const res = await fetch('http://localhost:3000/api/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: t })
      });
      const data = await res.json();
      console.log(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
    }
  }
}

run();
