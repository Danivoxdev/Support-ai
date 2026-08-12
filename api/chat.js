// api/chat.js — Vercel serverless function version of our chat endpoint
// Vercel automatically turns any file in /api into a working endpoint at /api/chat

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3.6-flash';

// Load the knowledge base from the project root
const knowledgeBase = fs.readFileSync(path.join(process.cwd(), 'knowledge.txt'), 'utf-8');

const systemPrompt = `You are a customer support assistant for Safari Funded, a proprietary trading firm.
Answer using ONLY the information in the knowledge base below.

For general process/how-it-works questions (e.g. "how do I get started", "how does this work"), answer helpfully and directly from what's in the knowledge base — don't be overly cautious about these.

For SPECIFIC facts you don't have (exact drawdown percentages, exact pricing, exact payout timing, etc.), do NOT guess or make up numbers. Instead say something like: "I don't have that exact detail, but let me connect you with a human agent who can confirm it."

Keep answers short and conversational, like a real support chat — 2-4 sentences when possible.
Use **bold** only for a single key term if truly helpful, and bullet points only when listing 3+ distinct items. Avoid heavy formatting for simple answers.

--- KNOWLEDGE BASE ---
${knowledgeBase}`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed.' });
  }

  const { message } = req.body || {};

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

    res.status(200).json({ answer });
  } catch (err) {
    console.error('AI error:', err.message);
    res.status(500).json({ error: 'The AI service had a problem. Please try again.' });
  }
};
