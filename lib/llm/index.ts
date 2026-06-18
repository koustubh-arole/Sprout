// lib/llm/index.ts
// Provider abstraction for the AI coach. Default: Gemini Flash. Swap to Groq via
// LLM_PROVIDER=groq. Both are called over REST with fetch (no SDK) so the bundle
// stays lean and the API key never leaves the server. Any failure -> fallback.

import { compareToAverageDay } from "../carbon/calc";
import { headlineEquivalent } from "../carbon/equivalents";
import { fallbackCoaching } from "./fallback";
import type { CoachInput, Coaching } from "./types";

export type { CoachInput, Coaching } from "./types";

const TIMEOUT_MS = 10_000;

export async function getCoaching(input: CoachInput): Promise<Coaching> {
  const provider = (process.env.LLM_PROVIDER ?? "gemini").toLowerCase();
  try {
    if (provider === "groq" && process.env.GROQ_API_KEY) {
      return await groqCoach(input);
    }
    if (provider !== "groq" && process.env.GEMINI_API_KEY) {
      return await geminiCoach(input);
    }
  } catch (err) {
    console.error("[coach] provider failed, using fallback:", (err as Error).message);
  }
  return fallbackCoaching(input);
}

export type ChatReply = { reply: string; source: "ai" | "fallback" };

/** Conversational "what-if" coaching. Numbers come pre-computed in `input`. */
export async function getChatAnswer(question: string, input: CoachInput): Promise<ChatReply> {
  const q = question.trim().slice(0, 500);
  const provider = (process.env.LLM_PROVIDER ?? "gemini").toLowerCase();
  try {
    if (provider === "groq" && process.env.GROQ_API_KEY) {
      return { reply: await groqText(buildChatPrompt(q, input)), source: "ai" };
    }
    if (provider !== "groq" && process.env.GEMINI_API_KEY) {
      return { reply: await geminiText(buildChatPrompt(q, input)), source: "ai" };
    }
  } catch (err) {
    console.error("[coach] chat failed, using fallback:", (err as Error).message);
  }
  return { reply: fallbackChat(q, input), source: "fallback" };
}

function buildChatPrompt(question: string, input: CoachInput): string {
  const cmp = compareToAverageDay(input.totalKg);
  const me = input.name?.trim() || "Sprout";
  return [
    `You are ${me}, the user's cute companion creature in the Sprout app — you grow when they live greener.`,
    `Speak in the FIRST PERSON as ${me}: warm, playful, a little cheeky, hopeful. Refer to yourself by name occasionally.`,
    "Answer the user's what-if question in 2-3 short sentences. Encouraging, concrete, non-judgmental — no guilt or doom.",
    "NEVER invent or compute precise numbers; speak qualitatively unless a number is given below.",
    "Plain text only (no JSON, no markdown).",
    "",
    `Context — footprint so far: ${input.totalKg} kg CO2e (${cmp.percentOfAverage}% of the average Indian day). Highest-impact category: ${input.topCategory ?? "none yet"}.`,
    `User question: "${question}"`,
  ].join("\n");
}

const CHAT_TIPS: Record<string, string> = {
  food: "shifting a few meals a week to plant-based is one of the highest-impact daily swaps",
  commute: "swapping solo car trips for the metro, bus, or a cycle ride adds up fast",
  energy: "nudging the AC to 26°C with a fan keeps comfort while roughly halving the load",
  travel: "choosing the train over a short flight can cut that trip's emissions ~90%",
};

function fallbackChat(question: string, input: CoachInput): string {
  const cmp = compareToAverageDay(input.totalKg);
  const tip = input.topCategory ? CHAT_TIPS[input.topCategory] ?? CHAT_TIPS.food : CHAT_TIPS.food;
  const where =
    input.choiceCount > 0
      ? `You're at ${input.totalKg} kg so far (${cmp.percentOfAverage}% of an average Indian day). `
      : "";
  return `${where}Great question — small, repeatable changes compound. For the biggest dent, ${tip}, and your world will heal with each one. 🌱`;
}

function buildPrompt(input: CoachInput): string {
  const headline = headlineEquivalent(input.totalKg);
  const cmp = compareToAverageDay(input.totalKg);
  const me = input.name?.trim() || "Sprout";
  return [
    `You are ${me}, the user's cute companion creature in the Sprout app, speaking in the first person — warm, hopeful, playful, for an Indian audience.`,
    "RULES:",
    "- NEVER invent, change, or compute numbers. Use ONLY the numbers provided below.",
    "- Be concise (one sentence per field), encouraging, and non-judgmental. No guilt or doom.",
    "- Target advice at the single highest-impact category provided (diet, transport, electricity, or flights) — never trivial actions like unplugging chargers.",
    'Respond ONLY with strict JSON: {"equivalent": string, "action": string, "encouragement": string}',
    "",
    `Footprint so far: ${input.totalKg} kg CO2e (${cmp.percentOfAverage}% of the average Indian's daily footprint).`,
    `Pre-computed relatable equivalent to rephrase (keep the number): "${headline.text}".`,
    `Highest-impact category: ${input.topCategory ?? "none yet"}.`,
    `Category breakdown (kg CO2e): ${JSON.stringify(input.byCategory)}.`,
    "",
    "equivalent: one vivid sentence translating the footprint using the pre-computed equivalent.",
    "action: one specific high-impact next step for the highest-impact category.",
    "encouragement: one hopeful sentence — the user's living world heals when they choose better.",
  ].join("\n");
}

async function geminiCoach(input: CoachInput): Promise<Coaching> {
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: buildPrompt(input) }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return toCoaching(text, input);
}

async function groqCoach(input: CoachInput): Promise<Coaching> {
  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
  const res = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: buildPrompt(input) }],
    }),
  });
  if (!res.ok) throw new Error(`groq ${res.status}`);
  const data = await res.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  return toCoaching(text, input);
}

/** Free-text Gemini call (for conversational coaching). */
async function geminiText(prompt: string): Promise<string> {
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("gemini empty");
  return text.trim();
}

/** Free-text Groq call (for conversational coaching). */
async function groqText(prompt: string): Promise<string> {
  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
  const res = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({ model, temperature: 0.7, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) throw new Error(`groq ${res.status}`);
  const data = await res.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("groq empty");
  return text.trim();
}

/** Parse model output into a validated Coaching object, else fall back. */
function toCoaching(text: string | undefined, input: CoachInput): Coaching {
  if (!text) return fallbackCoaching(input);
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    const ok =
      typeof parsed?.equivalent === "string" &&
      typeof parsed?.action === "string" &&
      typeof parsed?.encouragement === "string";
    if (!ok) return fallbackCoaching(input);
    return {
      equivalent: parsed.equivalent.trim(),
      action: parsed.action.trim(),
      encouragement: parsed.encouragement.trim(),
      source: "ai",
    };
  } catch {
    return fallbackCoaching(input);
  }
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
