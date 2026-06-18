// lib/llm/fallback.ts
// Deterministic coaching used whenever the LLM is unavailable (no key, quota,
// timeout, or error). This guarantees the app stays useful and the deployed
// link never breaks on the critical path.

import { compareToAverageDay } from "../carbon/calc";
import { headlineEquivalent } from "../carbon/equivalents";
import type { CoachInput, Coaching } from "./types";

const ACTIONS: Record<string, string> = {
  food: "Swap one red-meat meal for a veg thali this week — it can save more CO₂ than a month of recycling.",
  commute: "Take the metro or share a ride on your next commute instead of driving solo.",
  energy: "Set your AC to 26°C with a fan tonight — similar comfort, roughly half the grid load.",
  travel: "For your next short trip, an AC train cuts emissions ~95% versus flying.",
};

export function fallbackCoaching(input: CoachInput): Coaching {
  const { totalKg, topCategory, choiceCount } = input;

  if (choiceCount === 0) {
    return {
      equivalent: "Make a choice above and watch your world respond.",
      action: "Start with today's meal — it's often the easiest high-impact win.",
      encouragement: "Every good choice heals your world a little. 🌱",
      source: "fallback",
    };
  }

  const headline = headlineEquivalent(totalKg);
  const cmp = compareToAverageDay(totalKg);

  const encouragement =
    cmp.verdict === "below"
      ? "You're below the average Indian's daily footprint — keep your world thriving. 🌱"
      : cmp.verdict === "around"
        ? "You're right around the average — a couple of better choices will tip your world toward thriving."
        : "Today ran high, but your world is fully redeemable — one better choice starts healing it.";

  return {
    equivalent: `Your ${totalKg} kg CO₂e so far is ${headline.text}.`,
    action: topCategory ? ACTIONS[topCategory] ?? ACTIONS.food : ACTIONS.food,
    encouragement,
    source: "fallback",
  };
}
