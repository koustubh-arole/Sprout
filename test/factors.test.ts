import { describe, expect, it } from "vitest";
import { DECISIONS, getDecision, healthDelta, tierOf } from "@/lib/carbon/factors";

describe("DECISIONS authoring invariants", () => {
  it("has the four high-impact categories", () => {
    expect(DECISIONS.map((d) => d.category).sort()).toEqual(
      ["commute", "energy", "food", "travel"],
    );
  });

  it("authors every decision's options low -> high (choice-architecture nudge)", () => {
    for (const d of DECISIONS) {
      const kgs = d.options.map((o) => o.kg);
      const sorted = [...kgs].sort((a, b) => a - b);
      expect(kgs).toEqual(sorted);
    }
  });
});

describe("healthDelta", () => {
  const lunch = getDecision("lunch")!;

  it("heals by +5 for the best (lowest) option", () => {
    expect(healthDelta(lunch, "veg")).toBe(5);
  });

  it("wilts by -12 for the worst (highest) option", () => {
    expect(healthDelta(lunch, "beef")).toBe(-12);
  });

  it("returns a value between -12 and +5 for a middle option", () => {
    const d = healthDelta(lunch, "chicken");
    expect(d).toBeLessThan(5);
    expect(d).toBeGreaterThan(-12);
  });

  it("returns 0 for an unknown choice id", () => {
    expect(healthDelta(lunch, "nope")).toBe(0);
  });
});

describe("tierOf", () => {
  const lunch = getDecision("lunch")!;

  it("marks the lowest option low and the highest high", () => {
    expect(tierOf(lunch, "veg")).toBe("low");
    expect(tierOf(lunch, "beef")).toBe("high");
  });
});
