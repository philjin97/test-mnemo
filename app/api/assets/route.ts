import { NextRequest, NextResponse } from 'next/server';
import { visualAssets, musicAssets } from '../../../data/assets';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const systemPrompt = `
You are an AI assistant selecting assets.

Available Visual Assets:
${visualAssets.map(asset => `- ${asset.name} (${asset.creatorStudio}): ${asset.description}`).join('\n')}

Available Music Assets:
${musicAssets.map(asset => `- ${asset.name} (${asset.creatorStudio}): ${asset.description}`).join('\n')}

Given the user's prompt: "${message}"

Recommend 2-3 visual assets and 1-2 music assets. Respond only with asset names.
  `;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    temperature: 0.5,
  });

  const reply = completion.choices[0].message.content;

  return NextResponse.json({ reply });
}
