const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 5001;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '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';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/sketch-ai', async (req, res) => {
  const { base64Image, promptText } = req.body;
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`OpenAI proxy server running on http://localhost:${PORT}`);
}); 