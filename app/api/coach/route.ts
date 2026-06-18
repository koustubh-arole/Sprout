// app/api/coach/route.ts
// Server-only route for the AI coach. The provider API key lives in env and
// never reaches the browser. Always returns valid coaching (AI or fallback).

import { NextResponse } from "next/server";
import { getChatAnswer, getCoaching, type CoachInput } from "@/lib/llm";

export const runtime = "nodejs";

type CoachBody = Partial<CoachInput> & { question?: unknown };

export async function POST(req: Request) {
  let body: CoachBody = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const input: CoachInput = {
    totalKg: Number(body.totalKg) || 0,
    byCategory:
      body.byCategory && typeof body.byCategory === "object"
        ? (body.byCategory as Record<string, number>)
        : {},
    topCategory: typeof body.topCategory === "string" ? body.topCategory : null,
    choiceCount: Number(body.choiceCount) || 0,
    name: typeof body.name === "string" ? body.name.slice(0, 30) : undefined,
  };

  // What-if chat mode when a question is supplied.
  if (typeof body.question === "string" && body.question.trim()) {
    const reply = await getChatAnswer(body.question, input);
    return NextResponse.json(reply);
  }

  const coaching = await getCoaching(input);
  return NextResponse.json(coaching);
}
