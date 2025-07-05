import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64Image, promptText } = req.body;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: promptText },
              { type: 'input_image', image_url: base64Image }
            ]
          }
        ],
        text: { format: { type: 'text' } },
        reasoning: {},
        tools: [
          {
            type: 'image_generation',
            size: '1024x1024',
            quality: 'high',
            output_format: 'png',
            background: 'transparent',
            moderation: 'low'
          }
        ],
        temperature: 1,
        max_output_tokens: 2048,
        top_p: 1,
        store: true
      })
    });
    const data = await openaiRes.json();
    res.status(openaiRes.status).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
} 