import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const imagePromptMap = {
  village_scene: 'A peaceful medieval village surrounded by forest, with cobblestone roads and wooden houses',
  sci_fi_base: 'A futuristic military base on a distant desert planet, with landing pads and defense turrets',
  futuristic_city: 'A glowing futuristic city skyline at night with flying cars and neon signs',
  desert_ruins: 'Ancient ruins in a vast desert, with crumbling stone pillars and sand dunes',
};

const styleList = [
  'Studio Ghibli style',
  'Cyberpunk with neon lighting',
  'Watercolor painting',
  'Low-poly 3D style',
  'Fantasy RPG cover art',
  'Noir film style with dramatic shadows',
  'Steampunk aesthetic',
  '80s retro-futurism',
  'Photorealistic golden hour lighting',
];

export async function POST(req) {
  const { imageKey, customStyle } = await req.json();

  const basePrompt = imagePromptMap[imageKey];
  if (!basePrompt) {
    return NextResponse.json({ error: 'Invalid imageKey' }, { status: 400 });
  }

  const userPrompt = customStyle?.trim();
  const stylesToUse = styleList;

  const generatedImages = [];

  for (const style of stylesToUse) {
    const prompt = userPrompt
      ? `${basePrompt}, ${userPrompt}, stylized with ${style}`
      : `${basePrompt}, stylized with ${style}`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    });

    generatedImages.push({
      style,
      promptUsed: prompt,
      url: response.data[0].url,
    });
  }

  return NextResponse.json({ images: generatedImages });
}
