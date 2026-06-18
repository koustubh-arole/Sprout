// lib/carbon/calc.ts
// Pure footprint math over logged choices. No side effects — easy to unit-test.

import { ANCHORS, type Category } from "./factors";

export type LoggedChoice = {
  decisionId: string;
  category: Category;
  choiceId: string;
  label: string;
  kg: number;
  at: number; // epoch ms
};

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function totalKg(choices: LoggedChoice[]): number {
  return round1(choices.reduce((sum, c) => sum + c.kg, 0));
}

export function kgByCategory(choices: LoggedChoice[]): Record<Category, number> {
  const out = { food: 0, commute: 0, energy: 0, travel: 0 } as Record<Category, number>;
  for (const c of choices) out[c.category] += c.kg;
  (Object.keys(out) as Category[]).forEach((k) => (out[k] = round1(out[k])));
  return out;
}

/** The category contributing the most CO2 — what the coach should target. */
export function topCategory(choices: LoggedChoice[]): Category | null {
  if (choices.length === 0) return null;
  const by = kgByCategory(choices);
  return (Object.entries(by) as [Category, number][]).sort((a, b) => b[1] - a[1])[0][0];
}

export function kgSince(choices: LoggedChoice[], sinceMs: number): number {
  return round1(choices.filter((c) => c.at >= sinceMs).reduce((s, c) => s + c.kg, 0));
}

export type Comparison = {
  averageKg: number;
  ratio: number; // user / average
  percentOfAverage: number;
  verdict: "below" | "around" | "above";
};

/** Compare a footprint against the average Indian's per-day footprint (descriptive norm). */
export function compareToAverageDay(kg: number): Comparison {
  const averageKg = round1(ANCHORS.avgIndianPerDay);
  const ratio = averageKg > 0 ? kg / averageKg : 0;
  const verdict = ratio < 0.85 ? "below" : ratio > 1.15 ? "above" : "around";
  return { averageKg, ratio, percentOfAverage: Math.round(ratio * 100), verdict };
}
