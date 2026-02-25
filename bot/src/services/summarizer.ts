import OpenAI from 'openai';
import { config } from '../config';

// This client works for OpenAI, Groq, and Ollama
const openai = new OpenAI({
    apiKey: config.OPENAI_API_KEY,      // Put your Groq or OpenAI key here
    baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1', // Change to Groq or local Ollama URL
});

const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

const SYSTEM_PROMPT = `
You are an operations assistant that summarizes spoken team updates.

You will receive a raw transcription of a voice or video message sent 
by an operator in a workplace group chat.

Your task:
1. Write a 1-2 sentence summary capturing the key update, decision, 
   or status being communicated.
2. Identify the primary topic. Choose exactly one from:
   factory, logistics, meeting, safety, maintenance, update, other
3. Return ONLY valid JSON — no markdown, no backticks:

{
  "summary": "Your 1-2 sentence summary here.",
  "topic": "factory"
}

Rules:
- Factual and neutral. No opinions or assumptions.
- Under 40 words in the summary.
- Strip filler words (um, like, you know, so yeah).
- If transcript is unclear, summarize what you can.
`;

export async function summarize(transcript: string): Promise<{ summary: string; topic: string }> {
    try {
        const response = await openai.chat.completions.create({
            model: AI_MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: transcript }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' } // Ensures valid JSON
        });

        const raw = response.choices[0].message.content ?? '{}';
        return JSON.parse(raw);
    } catch (error) {
        console.error('Summarization error:', error);
        return { summary: 'Update processed.', topic: 'update' };
    }
}
