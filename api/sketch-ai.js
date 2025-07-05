export default async function handler(req, res) {
  console.log('Serverless function called with method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64Image, promptText, apiKey } = req.body || {};
  
  console.log('Request body received:', {
    hasBase64Image: !!base64Image,
    base64ImageLength: base64Image && base64Image.length,
    hasPromptText: !!promptText,
    promptText,
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey && apiKey.length
  });

  if (!base64Image || !promptText || !apiKey) {
    console.log('Missing required fields:', { base64Image: !!base64Image, promptText: !!promptText, apiKey: !!apiKey });
    return res.status(400).json({ error: 'Missing base64Image, promptText, or apiKey' });
  }

  try {
    console.log('Making OpenAI API request...');
    
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
    
    console.log('OpenAI response status:', openaiRes.status, openaiRes.statusText);
    
    const data = await openaiRes.json();
    console.log('OpenAI response data:', data);
    
    if (!openaiRes.ok) {
      console.error('OpenAI API error:', data);
      return res.status(openaiRes.status).json({ error: data });
    }
    
    console.log('Sending successful response to client');
    res.status(openaiRes.status).json(data);
  } catch (err) {
    console.error('Serverless function error:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
} 