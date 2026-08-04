// chat.js — Level 1: terminal-only AI support agent (Gemini version)
// Run with: node chat.js
// Requires: a Gemini API key set as an environment variable GEMINI_API_KEY
// Get one free at: aistudio.google.com/apikey

const fs = require('fs');
const readline = require('readline');

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('\n❌ Missing API key.');
  console.error('Set it first by running:');
  console.error('   set GEMINI_API_KEY=your-key-here   (Windows)');
  console.error('   export GEMINI_API_KEY=your-key-here   (Mac)\n');
  process.exit(1);
}

// Load the knowledge base from file
const knowledgeBase = fs.readFileSync('./knowledge.txt', 'utf-8');

const systemPrompt = `You are a customer support assistant for a proprietary trading firm.
Answer customer questions using ONLY the information in the knowledge base below.
If the answer isn't in the knowledge base, say: "I'm not sure about that — let me connect you with a human agent."
Keep answers short, friendly, and clear — like a real support chat, not an essay.

--- KNOWLEDGE BASE ---
${knowledgeBase}`;

// Gemini model — fast and free-tier friendly
const MODEL = 'gemini-3.6-flash';

async function askGemini(question) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: question }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error (${response.status}): ${errText}`);
  }

  const data = await response.json();

  // Pull the text out of Gemini's response shape
  const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return answer || '(No answer returned — try rephrasing the question.)';
}

// Simple terminal chat loop
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log('\n🤖 Support AI (Gemini) is ready. Type a question (or "exit" to quit).\n');

function promptLoop() {
  rl.question('You: ', async (question) => {
    if (question.trim().toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    try {
      const answer = await askGemini(question);
      console.log(`\nAI: ${answer}\n`);
    } catch (err) {
      console.error(`\n⚠️  Something went wrong: ${err.message}\n`);
    }

    promptLoop();
  });
}

promptLoop();
