import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { message, selectedAssets } = await req.json();


  const systemPrompt = `
  You are an AI storyteller.
  
  User's project idea: "${message}"
  
  The following assets have been selected:
  ${selectedAssets}
  
  Write a short 2-3 sentence recommendation summary that explains the theme and why these assets fit.
  Make it engaging, cohesive, and professional.
  `;
  

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    temperature: 0.6,
  });

  const reply = completion.choices[0].message.content;

  return NextResponse.json({ reply });
}
