// lib/llm/vision.ts
// Genuine photo verification via Gemini vision. Given the user's claimed action
// and their photo, the model decides whether the image actually shows it — so an
// unrelated picture is rejected. No key / error -> an honest "unverified" result
// (we never silently pretend a random image passed real scanning).

export type VerifyResult = {
  ok: boolean;
  verdict: string;
  confidence: number; // 0..1
  source: "ai" | "unverified";
};

const TIMEOUT_MS = 15_000;

/** Split a data URL ("data:image/png;base64,AAAA") into mime + base64. */
function parseDataUrl(dataUrl: string): { mime: string; data: string } | null {
  const m = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUrl);
  if (!m) return null;
  return { mime: m[1], data: m[2] };
}

export async function verifyImage(
  actionLabel: string,
  proofHint: string,
  imageDataUrl: string,
): Promise<VerifyResult> {
  const key = process.env.GEMINI_API_KEY;
  const parsed = parseDataUrl(imageDataUrl);

  if (!key || !parsed) {
    return {
      ok: true,
      verdict: key
        ? "Couldn't read that image — logged as unverified."
        : "Logged, but unverified — add a GEMINI_API_KEY to switch on real photo scanning.",
      confidence: 0,
      source: "unverified",
    };
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const prompt = [
    "You verify photo proof for a climate-action app. Be fair but firm.",
    `The user claims this photo proves: "${actionLabel}". A valid photo would show: ${proofHint}.`,
    "Decide if the image plausibly supports that claim. Accept genuine, relevant photos (be lenient on quality/angle).",
    "REJECT clearly unrelated images (random selfies, memes, screenshots, blank/black images, or a different activity).",
    'Respond with ONLY strict JSON: {"ok": boolean, "verdict": string, "confidence": number}',
    "verdict: one short, friendly sentence explaining the decision. confidence: 0..1.",
  ].join("\n");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }, { inline_data: { mime_type: parsed.mime, data: parsed.data } }],
          },
        ],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
    });
    if (!res.ok) throw new Error(`gemini ${res.status}`);
    const json = await res.json();
    const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("empty");
    const parsedOut = JSON.parse(text.replace(/```json/gi, "").replace(/```/g, "").trim());
    return {
      ok: Boolean(parsedOut.ok),
      verdict: typeof parsedOut.verdict === "string" ? parsedOut.verdict : "Reviewed.",
      confidence: typeof parsedOut.confidence === "number" ? parsedOut.confidence : 0.5,
      source: "ai",
    };
  } catch (err) {
    console.error("[verify] vision failed:", (err as Error).message);
    return { ok: true, verdict: "Scan unavailable right now — logged as unverified.", confidence: 0, source: "unverified" };
  } finally {
    clearTimeout(timer);
  }
}
