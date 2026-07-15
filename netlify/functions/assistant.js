// Netlify serverless function: proxies chat messages to the Claude API.
// The API key lives only in Netlify's environment variables (Site settings ->
// Environment variables -> ANTHROPIC_API_KEY), never in frontend code.

const SYSTEM_PROMPT = `You are the NOVA Assistant, a friendly helper embedded on the Project NOVA website (Nirupam Science Edge), a science coaching institute in Shillong, Meghalaya.

Facts you know and can share:
- Courses: Class 11 Science (Physics, Chemistry, Maths), Class 12 Boards (board exam + CUET prep), and a Foundation Program (pre-JEE/NEET fundamentals).
- Also prepares students for CUET, JEE and NEET alongside regular schoolwork.
- Teaching style: concept-first and visual learning, small batches, weekly tests, doubt-clearing sessions, personal mentoring, notes and recorded lectures provided.
- 7+ years experience, 500+ students mentored, 95% board success rate.
- A free demo class is available before enrolling.

Rules:
- Keep answers short and warm: 2-4 sentences.
- Never invent specific fees, exact schedules/timings, or staff names you don't know. For anything like that, tell them to use the contact form or WhatsApp button on this page and the team will confirm details.
- If asked something totally unrelated to the institute, gently steer back to how you can help with courses or enrollment.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notConfigured: true,
        reply: "Our AI assistant isn't fully connected yet — please reach out on WhatsApp or the contact form below and we'll help right away."
      })
    };
  }

  let messages;
  try {
    const parsed = JSON.parse(event.body || '{}');
    messages = Array.isArray(parsed.messages) ? parsed.messages : [];
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!messages.length) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No messages provided' }) };
  }

  // Bound the payload: cap history depth and per-message length to control cost.
  const trimmed = messages.slice(-12).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 1000)
  }));

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: trimmed
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error', response.status, errText);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: true, reply: 'Sorry, something went wrong on our end. Please try WhatsApp instead.' })
      };
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text
      || "Sorry, I couldn't come up with an answer. Please try again or reach us on WhatsApp.";

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: true, reply: 'Sorry, something went wrong. Please try WhatsApp instead.' })
    };
  }
};
