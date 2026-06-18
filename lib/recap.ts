// lib/recap.ts
// Pure self-comparison: this week vs last week. Self-comparison to one's own past
// is a strong, evidence-backed motivator (often beating neighbour comparison).

import { round1 } from "./carbon/calc";

export type Recap = {
  thisWeekKg: number;
  lastWeekKg: number;
  thisWeekSprigs: number;
  deltaPct: number | null; // null when there's no last-week baseline
};

const WEEK = 7 * 86_400_000;

export function weeklyRecap(
  actions: { savedKg: number; points: number; at: number }[],
  now: number = Date.now(),
): Recap {
  let thisWeekKg = 0;
  let lastWeekKg = 0;
  let thisWeekSprigs = 0;
  for (const a of actions) {
    const age = now - a.at;
    if (age < WEEK) {
      thisWeekKg += a.savedKg;
      thisWeekSprigs += a.points;
    } else if (age < 2 * WEEK) {
      lastWeekKg += a.savedKg;
    }
  }
  const deltaPct = lastWeekKg > 0 ? Math.round(((thisWeekKg - lastWeekKg) / lastWeekKg) * 100) : null;
  return { thisWeekKg: round1(thisWeekKg), lastWeekKg: round1(lastWeekKg), thisWeekSprigs, deltaPct };
}
