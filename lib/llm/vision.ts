// lib/llm/vision.ts
// Genuine photo verification. Given the user's claimed action and their photo,
// a vision model decides whether the image actually shows it — so an unrelated
// picture is rejected. Provider follows LLM_PROVIDER (groq | gemini); any
// failure / missing key returns an honest "unverified" result (we never pretend
// a random image passed real scanning).

export type VerifyResult = {
  ok: boolean;
  verdict: string;
  confidence: number; // 0..1
  source: "ai" | "unverified";
};

const TIMEOUT_MS = 20_000;

function buildPrompt(actionLabel: string, proofHint: string): string {
  return [
    "You verify photo proof for a climate-action app. Be fair but firm.",
    `The user claims this photo proves: "${actionLabel}". A valid photo would show: ${proofHint}.`,
    "Decide if the image plausibly supports that claim. Accept genuine, relevant photos (be lenient on quality/angle).",
    "REJECT clearly unrelated images (random selfies, memes, screenshots, blank/black images, or a different activity).",
    'Respond with ONLY strict JSON: {"ok": boolean, "verdict": string, "confidence": number}',
    "verdict: one short, friendly sentence explaining the decision. confidence: 0..1.",
  ].join("\n");
}

function unverified(verdict: string): VerifyResult {
  return { ok: true, verdict, confidence: 0, source: "unverified" };
}

export async function verifyImage(
  actionLabel: string,
  proofHint: string,
  imageDataUrl: string,
): Promise<VerifyResult> {
  const provider = (process.env.LLM_PROVIDER ?? "gemini").toLowerCase();
  const prompt = buildPrompt(actionLabel, proofHint);
  try {
    if (provider === "groq") {
      if (!process.env.GROQ_API_KEY) return unverified("Logged, but unverified — add a GROQ_API_KEY for real photo scanning.");
      return await groqVision(prompt, imageDataUrl);
    }
    if (!process.env.GEMINI_API_KEY) return unverified("Logged, but unverified — add a GEMINI_API_KEY for real photo scanning.");
    return await geminiVision(prompt, imageDataUrl);
  } catch (err) {
    console.error("[verify] vision failed:", (err as Error).message);
    return unverified("Scan unavailable right now — logged as unverified.");
  }
}

/** Parse model JSON output into a validated result. */
function toResult(text: string | undefined): VerifyResult {
  if (!text) throw new Error("empty response");
  const parsed = JSON.parse(text.replace(/```json/gi, "").replace(/```/g, "").trim());
  return {
    ok: Boolean(parsed.ok),
    verdict: typeof parsed.verdict === "string" ? parsed.verdict : "Reviewed.",
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
    source: "ai",
  };
}

/** Groq (OpenAI-compatible) vision — the app sends a base64 data URL directly. */
async function groqVision(prompt: string, imageDataUrl: string): Promise<VerifyResult> {
  const model = process.env.GROQ_VISION_MODEL ?? "meta-llama/llama-4-scout-17b-16e-instruct";
  const res = await withTimeout((signal) =>
    fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
    }),
  );
  if (!res.ok) throw new Error(`groq ${res.status}`);
  const data = await res.json();
  return toResult(data?.choices?.[0]?.message?.content);
}

/** Gemini vision — needs the data URL split into mime + base64. */
async function geminiVision(prompt: string, imageDataUrl: string): Promise<VerifyResult> {
  const m = /^data:([^;]+);base64,([\s\S]+)$/.exec(imageDataUrl);
  if (!m) return unverified("Couldn't read that image — logged as unverified.");
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const res = await withTimeout((signal) =>
    fetch(url, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: m[1], data: m[2] } }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
    }),
  );
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = await res.json();
  return toResult(data?.candidates?.[0]?.content?.parts?.[0]?.text);
}

async function withTimeout(fn: (signal: AbortSignal) => Promise<Response>): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}
