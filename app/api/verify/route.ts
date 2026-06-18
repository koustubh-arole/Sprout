// app/api/verify/route.ts
// Server-only photo verification. The image is sent to Gemini vision (key stays
// on the server) which judges whether it matches the claimed action.

import { NextResponse } from "next/server";
import { getAction } from "@/lib/carbon/actions";
import { verifyImage, type VerifyResult } from "@/lib/llm/vision";

export const runtime = "nodejs";

// ~7 MB of base64 (~5 MB image) ceiling to keep requests sane.
const MAX_IMAGE_CHARS = 7_000_000;

export async function POST(req: Request) {
  let body: { actionId?: unknown; image?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const action = typeof body.actionId === "string" ? getAction(body.actionId) : undefined;
  const image = typeof body.image === "string" ? body.image : "";

  if (!action) {
    return NextResponse.json(
      { ok: false, verdict: "Unknown action.", confidence: 0, source: "unverified" } satisfies VerifyResult,
      { status: 400 },
    );
  }
  if (!image) {
    return NextResponse.json(
      { ok: false, verdict: "Please add a photo first.", confidence: 0, source: "unverified" } satisfies VerifyResult,
      { status: 400 },
    );
  }
  if (image.length > MAX_IMAGE_CHARS) {
    return NextResponse.json(
      { ok: false, verdict: "That photo is too large — try a smaller one.", confidence: 0, source: "unverified" } satisfies VerifyResult,
      { status: 413 },
    );
  }

  const result = await verifyImage(action.label, action.proofHint, image);
  return NextResponse.json(result);
}
