import { describe, expect, it } from "vitest";
import { fallbackCoaching } from "@/lib/llm/fallback";
import type { CoachInput } from "@/lib/llm/types";

const base: CoachInput = { totalKg: 0, byCategory: {}, topCategory: null, choiceCount: 0 };

describe("fallbackCoaching", () => {
  it("always tags itself as the offline source", () => {
    expect(fallbackCoaching(base).source).toBe("fallback");
  });

  it("gives a starter prompt before any choice", () => {
    const c = fallbackCoaching(base);
    expect(c.action.toLowerCase()).toContain("meal");
    expect(c.equivalent.toLowerCase()).toContain("choice");
  });

  it("targets advice at the highest-impact category", () => {
    const cases: { cat: CoachInput["topCategory"]; needle: string }[] = [
      { cat: "food", needle: "thali" },
      { cat: "commute", needle: "metro" },
      { cat: "energy", needle: "AC" },
      { cat: "travel", needle: "train" },
    ];
    for (const { cat, needle } of cases) {
      const c = fallbackCoaching({ totalKg: 5, byCategory: {}, topCategory: cat, choiceCount: 2 });
      expect(c.action).toContain(needle);
      expect(c.source).toBe("fallback");
    }
  });

  it("stays redemptive when the day runs high", () => {
    const c = fallbackCoaching({ totalKg: 50, byCategory: {}, topCategory: "travel", choiceCount: 3 });
    expect(c.encouragement.toLowerCase()).toContain("redeemable");
  });
});
