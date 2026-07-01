# Project NOVA Platform — Architecture Overview

Goal: evolve the landing app into a modular education platform (NOVA Ecosystem). This doc lists high-level modules, responsibilities, and API contracts to guide implementation and integration.

## NOVA Ecosystem - Modules

- AI Mentor
  - Purpose: Explain concepts, generate step-by-step solutions, provide analogies, memory tricks, quizzes.
  - Sub-APIs: `/api/nli/explain`, `/api/nli/visualize`, `/api/nli/practice`, `/api/nli/solve`

- AI Homework Solver
  - Purpose: accept image/text problems, OCR, parse math, produce worked solutions and steps.
  - API: `/api/solver/solve` (POST: {image/base64 or text, level, hints})

- PYQ Generator
  - Purpose: produce past-year-style questions, difficulty-scaled problem sets, and answer keys.
  - API: `/api/pyq/generate` (POST: {topic, level, count, style})

- Revision Coach
  - Purpose: spaced-repetition flashcards, short micro-explanations, quiz scheduling.
  - API: `/api/revision/next` (GET/POST)

- Concept Visualizer
  - Purpose: generate or parameterize interactive simulations (Three.js/canvas) and share state.
  - API: `/api/visualize/config` (POST) returns JSON describing scene and controls.

- Performance Analyst
  - Purpose: ingest student activity + quiz results, compute weak-spot analysis and personalized pathways.
  - API: `/api/analytics/report` (POST)

- Study Planner & Career Guide
  - Purpose: plan courses, set milestones, map careers based on strengths.
  - API: `/api/planner/suggest` (POST)

## Integration Patterns

- Frontend-first: lightweight REST endpoints that return JSON schemas. Keep UI agnostic about model internals.
- Use Strict JSON Schemas: require AI endpoints to return validated JSON (or a wrapper with `status` + `payload`).
- Authentication: JWT-backed sessions for students/teachers; public explain endpoints can be rate-limited and require API keys for production.
- Telemetry: log prompt/response usage and tokens for cost accounting. Include `_usage` in responses.

## Prompting & Schema

- Each AI endpoint should accept `{topic, level, style, examples?, maxTokens?, temperature?}` and return a validated `explain` object shape:

```
{ topic, level, style,
  definition, analogy, simulation:{type,url,hint}, commonMistakes:[], memoryTrick, pyq:{question,solution}, miniQuiz:[{id,stem,choices,answer,rationale}], recommendation }
```

- Include `_usage` and `_raw` fields for debugging when model fails to adhere precisely.

## Data Flow

Frontend -> Backend API -> (Optional) Model service (OpenAI) -> Backend post-processing -> Frontend

## Storage

- Student data, progress, and quiz history stored in a relational DB (Postgres). Use Redis for caching and ephemeral simulation state.

## Next steps (practical)

1. Define JSON schema files for each endpoint (e.g., `schemas/explain.schema.json`).
2. Implement server-side validation (AJV) and a small retry loop to coerce outputs into JSON.
3. Build lightweight mock server endpoints for offline dev (already present in `server.js`).
4. Start migrating hardcoded demo data into `assets/data/demo.json` and wire dynamic loading.

---

This document is a living artifact; I can expand any section into detailed API docs and example responses next.