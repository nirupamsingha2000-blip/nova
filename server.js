require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Ajv = require('ajv');
const fs = require('fs');
const ajv = new Ajv({ allErrors: true, removeAdditional: true });
const explainSchema = JSON.parse(fs.readFileSync(path.join(__dirname,'schemas','explain.schema.json')));
const validateExplain = ajv.compile(explainSchema);
// ensure logs directory exists
const logsDir = path.join(__dirname,'logs');
if(!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive:true });

function logAjvErrors({topic, level, style, errors, raw}){
  try{
    const out = {
      time: new Date().toISOString(), topic, level, style,
      errors: errors || null,
      rawPreview: raw ? String(raw).slice(0,2000) : null
    };
    fs.appendFileSync(path.join(logsDir,'ajv-errors.log'), JSON.stringify(out, null, 2) + '\n---\n');
  }catch(e){ console.error('Failed to write AJV log', e); }
}

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
  const { text, image } = req.body || {};
  const problemText = text?.trim() || (image ? 'Problem described from uploaded image' : 'No problem text provided');
  const solution = problemText
    ? `Mock solution: Review the provided values, identify the concepts involved, and write a step-by-step answer based on the topic.`
    : 'Mock solution: No problem details were provided. Please enter the question text or upload a clear image of the problem.';
  const reasoning = image
    ? 'This assistant detected an image upload. If possible, also include the problem statement in text for the most accurate walkthrough.'
    : 'Break the question into givens, apply the core formula, and then check units and sign conventions.';
  const advice = 'Focus on one step at a time and re-read the question to confirm which quantity is being asked.';
  res.json({ problem: problemText, solution, reasoning, advice });
});

app.post('/api/learner/readiness', express.json(), async (req, res) => {
  const { quizzesTaken = 0, correct = 0, recentHours = 0 } = req.body || {};
  const accuracy = quizzesTaken > 0 ? Math.min(1, correct / quizzesTaken) : 0.6;
  const timeFactor = Math.min(1, recentHours / 5);
  const score = Math.max(45, Math.min(100, Math.round(55 + accuracy * 25 + timeFactor * 20)));
  const recommendation = score >= 80
    ? 'You are on a strong path. Keep reviewing weak areas and try one more mixed practice set.'
    : score >= 65
      ? 'Good progress. Focus on conceptual clarity and solve 2-3 more PYQs this week.'
      : 'Spend time revising fundamentals, ask NOVA Mentor for concept explanations, and practice more quizzes.';
  res.json({ score, accuracy, recentHours, quizzesTaken, recommendation, message: `Your readiness is currently ${score}%.` });
});

function buildPrompt({ topic='Topic', level='General', style='Conceptual' }){
  // Few-shot example and strict JSON instruction to improve model compliance
  return `You are NOVA Mentor. Return ONLY a single VALID JSON object (no markdown, no explanation) matching this exact shape:\n{\n  "topic": "...",\n  "level": "...",\n  "style": "...",\n  "definition": "...",\n  "analogy": "...",\n  "simulation": {"type":"link","url":"...","hint":"..."},\n  "commonMistakes": ["..."],\n  "memoryTrick": "...",\n  "pyq": {"question":"...","solution":"..."},\n  "miniQuiz": [{"id":"...","stem":"...","choices":["..."],"answer":0,"rationale":"..."}],\n  "recommendation": "..."\n}\n\nExample:\n{\n  "topic":"Mirror Formula",\n  "level":"Class 12",\n  "style":"Conceptual",\n  "definition":"Mirror formula relates object and image distances: 1/f = 1/v + 1/u.",\n  "analogy":"Think of focusing light like using a magnifying glass to concentrate rays.",\n  "simulation":{"type":"link","url":"#","hint":"Try moving object distance"},\n  "commonMistakes":["Sign convention","Using focal length incorrectly"],\n  "memoryTrick":"Use 'F=V+U' mnemonic for 1/f = 1/v + 1/u",\n  "pyq":{"question":"A 10 cm focal length mirror produces...","solution":"Work shown."},\n  "miniQuiz":[{"id":"q1","stem":"Formula sign?","choices":["+","-"],"answer":0,"rationale":"Depends on mirror type."}],\n  "recommendation":"Try related topic: Lens maker's equation."\n}\n\nProduce concise, student-friendly content appropriate for Level: ${level} and Style: ${style}. Topic: ${topic}. Limit strings to ~600 characters where possible. Output ONLY valid JSON.`;
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
