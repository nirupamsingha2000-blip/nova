# NOVA Learning Intelligence (NLI) — Product Specification

Status: Draft

## 1. Purpose & Vision
NLI is a personal science mentor built into Project NOVA that solves problems, scaffolds learning, and guides students through a multi-step learning flow instead of returning a single block of text. NLI's identity: pedagogical, proactive, contextual, and interactive.

## 2. Philosophy
- Teach by asking: first determine student level (Class 11, Class 12, JEE, NEET, CUET).
- Offer explanation modes: Visual, Mathematical, Conceptual, PYQ-oriented, Revision.
- Provide learning flows that continue beyond the answer (analogy, animation, common mistakes, memory tricks, practice + quiz, confidence, next topic recommendation).
- Always personalize: adapt language, depth, and examples to the student's level and recent performance.

## 3. High-level Modules
Module 1 — Explain
- Input: free text question or topic
- Flow: level prompt → explanation options → chosen style → multi-step learning flow output (definition, analogy, errors, memory trick, PYQ, micro-quiz)
- Output: structured JSON with sections and media references

Module 2 — Visualize
- Interactive simulations (canvas / Three.js) for mechanics, electrostatics, optics etc.
- Inputs: topic + parameters (mass, angle, charge, distance)
- Output: embeddable interactive widget + shareable snapshot

Module 3 — Practice
- Question generation (MCQ, short answer, numeric)
- Instant auto-evaluation with per-question rationale
- Weakness analysis and targeted follow-ups

Module 4 — Solve
- Image upload (photo of written problem) → OCR → parse problem → step-by-step solver
- Validate steps, provide alternate methods and error checks

Module 5 — Revise
- One-page revision sheet, formula sheet, flashcards, memory tricks
- Exportable (PDF, print)

Module 6 — Predict
- Ingest last N tests → analyze strengths/weaknesses → expected score → focused study plan

## 4. Student Interaction Flow (Example)
1. Student: "Explain Newton's laws"
2. NLI: "Which class are you in? (Class11 / Class12 / JEE / NEET / CUET)"
3. Student: "Class 12"
4. NLI: "Which explanation style? (Visual / Mathematical / Conceptual / PYQ-oriented / Revision)"
5. Student: "Visual"
6. NLI: returns: short definition + interactive simulation link + short conceptual bullets + 3 PYQs + mini-quiz (3 Qs)
7. After quiz: immediate feedback → confidence score → suggest next topic

## 5. Learning Flow Template (the 10-step signature)
For each Explanation request, NLI should produce the following ordered blocks (when applicable):
1. Short definition
2. Real-life analogy
3. Interactive animation / simulation (or link)
4. Common mistakes / misconceptions
5. Memory trick / mnemonic
6. One PYQ with solution
7. 3 similar practice questions
8. Mini-quiz (2–5 Qs) with instant grading
9. Confidence score (computed from correctness + self-report)
10. Recommended next topic + micro-plan (15–90 minutes)

## 6. UX & UI primitives
- Drill-down dialogs: initial level + style selection
- Module cards in Dashboard: Explain | Visualize | Practice | Solve | Revise | Predict
- AI workspace panel: left: input + mode; middle: structured content; right: interactive widget / hints
- Experiment canvas area for Visualize module (Three.js + 2D canvas controls)
- Inline micro-interactions: instant hints, step reveal, scaffolded steps

## 7. Data Model (minimum)
StudentProfile {
  id, name, level, enrolledPrograms, recentTopics[], masteryScores{topic:score}, spacedRepetitionState
}
SessionRecord {
  id, studentId, timestamp, module, input, choices, outcomes, timeSpent, correctness
}
QuestionItem { id, stem, choices, correctIndex, rationale, topicTags }

## 8. API Surface (frontend ↔ backend)
- POST /api/nli/explain { studentId, level, topic, style, context }
  - returns structured blocks + media refs
- POST /api/nli/visualize { topic, params }
  - returns widget config or precomputed sim
- POST /api/nli/practice/generate { topic, level, type, count }
  - returns questions
- POST /api/nli/practice/grade { answers }
  - returns results + weakness analysis
- POST /api/nli/solve/upload (multipart) -> /solve/process
  - returns steps, final answer, hints
- GET /api/nli/predict?studentId=... returns expected scores and study plan

Security & Privacy: student data stored encrypted; store minimal PII; allow opt-out for analytics.

## 9. AI Integration & Prompting
- Use tiered prompt templates:
  - System prompt: pedagogical persona ("You are NOVA Learning Intelligence — a friendly, rigorous science mentor for {level} students.")
  - Few-shot examples per topic + style
  - Output schema enforced via JSON schema or tool responses
- Model orchestration:
  - LLM for explanation, question generation, evaluation
  - Specialized modules for OCR (Vision API), symbolic math (SymPy / CAS), simulation engine (client-side)
  - Retrieval: vector DB for curriculum snippets, past answers, PYQs

## 10. Metrics & Success Criteria
- Engagement: time per session, return rate
- Learning: pre/post accuracy uplift, topic mastery
- Retention: spaced repetition clicks, revisits
- Satisfaction: student-rated helpfulness

## 11. Roadmap & Milestones (iterative)
Phase 0 — Spec & UX (this doc + wireframes) — 1 week
Phase 1 — MVP: Module Explain + Practice (stubs for Visualize & Solve) — 3–4 weeks
Phase 2 — Visualize interactive widgets (Three.js simulations) — 3–5 weeks
Phase 3 — Solve (OCR + solver), Predict, Memory Engine — 4–6 weeks
Phase 4 — polish, testing with students, performance improvements

## 12. Example prompt templates
System:
"You are NOVA Learning Intelligence. Ask clarifying questions, adapt to the student's level, and produce structured JSON output with {sections}."

User-level clarifier:
"What class are you in? Provide options: Class11|Class12|JEE|NEET|CUET"

Explain template (visual):
"Explain {topic} for a {level} student in Visual mode. Output JSON: {definition, analogy, simulationHint, steps, commonMistakes, memoryTrick, pyq, miniQuiz}"

Practice generation:
"Generate {n} MCQs for {topic} at {level} difficulty. Provide options, correctIndex and rationale."

## 13. Implementation notes
- Frontend-first prototype: implement UI shells that call mocked API endpoints returning JSON.
- Keep all AI outputs schema-validated — fail gracefully if model returns unstructured content.
- Interactive Visualize: prefer client-side physics for responsiveness; precompute server-side for heavy simulations.

## 14. Next immediate tasks (concrete)
1. Write wireframes for dashboard and module panels.
2. Implement a minimal Explain prototype: frontend panel + mocked /api/nli/explain returning JSON blocks.
3. Implement question-generation stub and grading endpoint.
4. Gather 20 topics and create few-shot examples for each style.

---

*Author: NLI spec generator (draft)*
