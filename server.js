require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Ajv = require('ajv');
const fs = require('fs');
const ajv = new Ajv({ allErrors: true, removeAdditional: true });
const explainSchema = JSON.parse(fs.readFileSync(path.join(__dirname,'schemas','explain.schema.json')));
const validateExplain = ajv.compile(explainSchema);

// Note: Node 18+ includes a global `fetch`. This server uses the global fetch.

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
const PORT = process.env.PORT || 3000;

// Serve static frontend
app.use(express.static(path.join(__dirname)));

app.post('/api/nli/explain', async (req, res) => {
  const { topic, level, style } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'Missing topic' });

  // If no key configured, return a mocked response
  if (!OPENAI_KEY) {
    console.warn('OPENAI_API_KEY not set — returning mock response');
    return res.json(mockExplain({ topic, level, style }));
  }

  try {
    const prompt = buildPrompt({ topic, level, style });
    const payload = {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 700,
      temperature: 0.4
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('OpenAI error', r.status, text);
      return res.status(502).json({ error: 'OpenAI request failed', detail: text });
    }

    const json = await r.json();
    const content = json.choices?.[0]?.message?.content || json.choices?.[0]?.text || '';

    // Some models return text; ask models to return strict JSON. Try to extract JSON safely.
    let parsed = null;
    try {
      // Strip out markdown fences if present
      const cleaned = content.replace(/```json|```/gi, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      // Attempt to find JSON substring between first '{' and last '}'
      try {
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          const sub = content.substring(start, end + 1);
          parsed = JSON.parse(sub);
        }
      } catch (e2) {
        parsed = null;
      }
    }

    const usage = json.usage || null;

    // If parsed JSON is present, validate and return
    if (parsed) {
      const valid = validateExplain(parsed);
      if (valid) return res.json({ ...parsed, _usage: usage });
      // If invalid, attempt up to 2 retries by asking the model to return strictly JSON
    }

    // Retry loop: ask model to return JSON only, up to 2 retries
    let attempts = 0; let final = null; let rawContent = content;
    while(attempts < 2 && !final){
      attempts++;
      const instruct = `${buildPrompt({topic, level, style})}\n\nIMPORTANT: Return ONLY valid JSON matching the schema without any explanatory text or markdown.`;
      const payload2 = { model:'gpt-4o-mini', messages:[{role:'user', content: instruct}], max_tokens:700, temperature:0.2 };
      const r2 = await fetch('https://api.openai.com/v1/chat/completions', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_KEY}`}, body:JSON.stringify(payload2) });
      if (!r2.ok) break;
      const j2 = await r2.json();
      const c2 = j2.choices?.[0]?.message?.content || j2.choices?.[0]?.text || '';
      rawContent += '\n\n----\n' + c2;
      try{
        const cleaned = c2.replace(/```json|```/gi,'').trim();
        const p2 = JSON.parse(cleaned);
        const ok = validateExplain(p2);
        if(ok){ final = p2; final._usage = j2.usage || null; break; }
      }catch(e){ }
    }

    if(final) return res.json(final);

    // Final fallback: wrap as basic explain object
    return res.json({ topic, level, style, definition: content.substring(0, 2000), analogy: '', simulation: {type:'text', hint:''}, commonMistakes: [], memoryTrick:'', pyq:{question:'',solution:''}, miniQuiz:[], recommendation:'', _usage: usage, _raw: rawContent });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mock solver endpoint: accepts image/text and returns a mocked OCR + solution
app.post('/api/solver/solve', express.json(), async (req, res) => {
  const { text } = req.body || {};
  // simple mock: echo back with a pseudo-solution
  const problem = text || 'Uploaded image (mock)';
  const solution = `Solution (mock): For the problem "${problem}", identify givens, apply formulas, and solve step-by-step.`;
  res.json({ problem, solution });
});

function buildPrompt({ topic='Topic', level='General', style='Conceptual' }){
  return `You are NOVA Mentor. Produce a JSON object with keys: topic, level, style, definition, analogy, simulation (with url/hint), commonMistakes (array of strings), memoryTrick, pyq (question and solution), miniQuiz (array of {id, stem, choices, answer, rationale}), recommendation. Keep answers concise and educational. Topic: ${topic}. Level: ${level}. Style: ${style}.`;
}

function mockExplain({ topic='Topic', level='General', style='Conceptual' }){
  return {
    topic,
    level,
    style,
    definition: `${topic}: A concise definition tailored for ${level}.`,
    analogy: `Imagine ${topic} like a flowing river... (analogy adapted to ${level})`,
    simulation: { type:'link', url:'#', hint:'Interactive simulation (drag charges to see forces)' },
    commonMistakes: ['Mixing vector directions', 'Forgetting sign conventions'],
    memoryTrick: 'Use the phrase "See Force Vectors"',
    pyq: { question: `A simple PYQ about ${topic}`, solution: 'Short worked solution.' },
    miniQuiz: [
      {id:1, stem:`Basic question on ${topic}`, choices:['A','B','C','D'], answer:1, rationale:'Because...'},
      {id:2, stem:`Apply concept of ${topic}`, choices:['1','2','3','4'], answer:0, rationale:'Check sign.'}
    ],
    recommendation: 'Next: Related Topic — try Projectile Motion (15-30 mins)'
  };
}

app.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}`));
