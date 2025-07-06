export default async function handler(req, res) {
  console.log('Serverless function called with method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64Image, promptText } = req.body || {};
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!base64Image || !promptText) {
    console.log('Missing required fields:', { base64Image: !!base64Image, promptText: !!promptText });
    return res.status(400).json({ error: 'Missing base64Image or promptText' });
  }
  if (!apiKey) {
    console.log('Missing OPENAI_API_KEY in environment variables');
    return res.status(500).json({ error: 'OpenAI API key not configured on server.' });
  }

  try {
    console.log('Making OpenAI API request...');
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: promptText },
              { type: 'image_url', image_url: { url: base64Image } }
            ]
          }
        ],
        temperature: 1,
        max_tokens: 2048,
        top_p: 1
      })
    });
    
    console.log('OpenAI response status:', openaiRes.status, openaiRes.statusText);
    
    const data = await openaiRes.json();
    console.log('OpenAI response data:', data);
    
    if (!openaiRes.ok) {
      console.error('OpenAI API error:', data);
      return res.status(openaiRes.status).json({ error: data });
    }
    
    let base64 = null;
    if (data.choices && data.choices[0]) {
      const msg = data.choices[0].message;
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        for (const call of msg.tool_calls) {
          if (call.type === 'image_generation' && call.image) {
            base64 = call.image;
            break;
          }
        }
      }
      if (!base64 && msg.content && Array.isArray(msg.content)) {
        for (const part of msg.content) {
          if (part.type === 'image_url' && part.image_url) {
            base64 = part.image_url;
            break;
          }
        }
      }
    }
    
    data.generated_image = base64;
    console.log('Sending successful response to client');
    res.status(openaiRes.status).json(data);
  } catch (err) {
    console.error('Serverless function error:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
} 