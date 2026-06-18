# 🌱 Sprout

A personal carbon coach that turns four everyday decisions into a **living world** that heals or wilts in real time. Built to create *behaviour, not just awareness* — and to be honest about the limits of individual action.

> Make a choice — what you eat, how you commute, how you cool your home, the trips you take — and watch your world respond.

## Why these four decisions

The most-cited review of individual climate action ([Wynes & Nicholas 2017](https://iopscience.iop.org/article/10.1088/1748-9326/aa7541)) found four lifestyle choices dwarf all others: a plant-based diet, living car-free, avoiding flights, and having one fewer child. Sprout tracks the first three as **Food**, **Commute**, and **Travel**, and deliberately swaps the fourth for **Cooling (AC)** — because family size isn't a daily, actionable nudge, while AC is the single biggest household electricity lever in India on a coal-heavy grid (~0.71 kg CO₂/kWh).

Every number in the app is India-localized, single-vintage, and sourced on the in-app **/methodology** page. The AI coach is qualitative only — it never invents or computes numbers.

## Stack

- **Next.js 16** (App Router) + **React 19** + **Tailwind CSS v4**
- **Zustand** for hydration-safe persisted state ([lib/store.ts](lib/store.ts))
- Pure, unit-tested carbon engine ([lib/carbon/](lib/carbon/))
- Server-only AI coach with provider abstraction + deterministic fallback ([app/api/coach/route.ts](app/api/coach/route.ts), [lib/llm/](lib/llm/))
- **Vitest** for the engine tests

## Architecture

```
app/page.tsx ──renders──> components/Experience.tsx (client orchestrator)
                                 │  hydrates + reads lib/store.ts
                                 │  derives view-model via lib/carbon/calc.ts
                                 ├─> LivingWorld        (animated, accessible SVG)
                                 ├─> DecisionMoment     (the nudge → store.log)
                                 ├─> FootprintSummary   (totals, norms, share)
                                 └─> Coach ──POST──> /api/coach ──> lib/llm (Gemini|Groq|fallback)
```

The coach route runs on the Node runtime; the LLM API key lives in server env and never reaches the browser — the client only ever sends footprint numbers.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — the app works without any key
npm run dev                  # http://localhost:3000
```

### Environment (all optional — fallback coaching works with none)

| Var | Default | Notes |
|-----|---------|-------|
| `LLM_PROVIDER` | `gemini` | `gemini` or `groq` |
| `GEMINI_API_KEY` | — | enables live Gemini coaching |
| `GEMINI_MODEL` | `gemini-2.0-flash` | |
| `GROQ_API_KEY` | — | enables live Groq coaching |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | |

With no key set, the coach returns deterministic, sourced guidance tagged `offline guide`, so the deployed link never breaks.

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run test       # vitest (watch)
npm run test:run   # vitest (once, for CI)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## An honest note

Individual choices matter — and they are **not** a substitute for systemic change. Most emissions are decided by energy grids, industry, and policy, not personal willpower. (The "carbon footprint" framing was itself popularised by a [2004–06 BP campaign](https://theconversation.com/how-oil-companies-put-the-responsibility-for-climate-change-on-consumers-214132) that shifted attention to consumers.) As [Hannah Ritchie argues](https://hannahritchie.substack.com/p/the-false-dichotomy-of-systemic-and), systemic and individual action reinforce each other — it's both/and, never either/or. Sprout is built for hope and habit, not guilt.
