export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64Image, promptText, apiKey } = req.body || {};

  if (!base64Image || !promptText || !apiKey) {
    return res.status(400).json({ error: 'Missing base64Image, promptText, or apiKey' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
    if (!openaiRes.ok) {
      console.error('OpenAI API error:', data);
      return res.status(openaiRes.status).json({ error: data });
    }
    res.status(openaiRes.status).json(data);
  } catch (err) {
    console.error('Serverless function error:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
} 