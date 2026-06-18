// lib/llm/types.ts
// Shared contract between the coach route, the providers, and the fallback.

export type CoachInput = {
  totalKg: number;
  byCategory: Record<string, number>;
  topCategory: string | null;
  choiceCount: number;
  /** The user's companion creature name — the coach speaks AS this creature. */
  name?: string;
};

export type Coaching = {
  equivalent: string; // a relatable translation of the footprint
  action: string; // ONE specific high-impact next step
  encouragement: string; // hope-framed, non-judgmental
  source: "ai" | "fallback"; // transparency: was this live AI or offline guidance?
};
