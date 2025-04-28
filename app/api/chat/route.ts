import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 👇 Import your real datasets here
import { visualAssets, musicAssets } from '../../../data/assets';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    // 🔥 Dynamically create asset list summaries
    const visualAssetList = visualAssets.map(asset => 
      `- ${asset.name} (${asset.creatorStudio}): ${asset.description}`
    ).join('\n');

    const musicAssetList = musicAssets.map(asset =>
      `- ${asset.name} (${asset.creatorStudio}): ${asset.description}`
    ).join('\n');

    // 🔥 Build the system prompt dynamically
    const systemPrompt = `
You are an AI assistant helping to recommend creative assets for a project.

Available Visual Assets:
${visualAssetList}

Available Music Assets:
${musicAssetList}

Given a user prompt, recommend the most fitting visual and music assets.
Explain briefly why you selected them.

Respond with the list of asset names and a short explanation.

User prompt: "${userMessage}"
    `;

    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',  // or 'gpt-4-turbo'
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
    });

    const reply = chatCompletion.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json({ error: 'OpenAI API Error' }, { status: 500 });
  }
}
