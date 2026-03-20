export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET request — health check
  if (req.method === 'GET') {
    const hasKey = !!process.env.GEMINI_API_KEY;
    return res.status(200).json({ 
      status: 'ok', 
      gemini_key_set: hasKey,
      key_preview: hasKey ? process.env.GEMINI_API_KEY.slice(0, 8) + '...' : 'MISSING'
    });
  }

  try {
    const { messages, system } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not set in environment variables' });
    }

    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system || '' }] },
          contents,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.8,
          }
        })
      }
    );

    const data = await geminiRes.json();

    if (data.error) {
      console.error('Gemini error:', JSON.stringify(data.error));
      return res.status(500).json({ error: data.error.message || 'Gemini API error' });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({ text });

  } catch (err) {
    console.error('Handler error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
