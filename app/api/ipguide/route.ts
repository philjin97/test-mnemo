import { NextRequest, NextResponse } from 'next/server';
import { ipGuide } from '../../../data/ipGuide';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  // Create a system prompt to select relevant IP Guide sections
  const systemPrompt = `
You are an AI assistant helping to select the most relevant IP Guide documents for a user's request.

Available IP Guide sections:
${ipGuide.map(doc => `- ${doc.title}: ${doc.content.slice(0, 100)}...`).join('\n')}

Given the user's prompt: "${message}"

Recommend 1-2 sections that would be most helpful.
Respond with their titles only.
  `;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    temperature: 0.4,
  });

  const reply = completion.choices[0].message.content;

  return NextResponse.json({ reply });
}
