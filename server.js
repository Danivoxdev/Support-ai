// server.js — Level 2: web version of the support AI
// Run with: node server.js
// Then open: http://localhost:3000

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serves index.html

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3.6-flash';

// Load the knowledge base once when the server starts
const knowledgeBase = fs.readFileSync('./knowledge.txt', 'utf-8');

const systemPrompt = `You are a customer support assistant for Safari Funded, a proprietary trading firm.
Answer customer questions using ONLY the information in the knowledge base below.
If the answer isn't in the knowledge base, say: "I'm not sure about that — let me connect you with a human agent."
Keep answers short, friendly, and clear — like a real support chat, not an essay.

--- KNOWLEDGE BASE ---
${knowledgeBase}`;

// This is the endpoint the chat widget calls whenever a customer sends a message
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!API_KEY) {
    return res.status(500).json({ error: 'Server is missing GEMINI_API_KEY.' });
  }
  if (!message) {
    return res.status(400).json({ error: 'No message provided.' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }

    const data = await response.json();
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm not sure about that — let me connect you with a human agent.";

    res.json({ answer });
  } catch (err) {
    console.error('AI error:', err.message);
    res.status(500).json({ error: 'The AI service had a problem. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ Support AI running at http://localhost:${PORT}\n`);
});
