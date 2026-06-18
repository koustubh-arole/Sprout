import { describe, expect, it } from "vitest";
import { equivalents, headlineEquivalent } from "@/lib/carbon/equivalents";

describe("equivalents", () => {
  it("returns five framings", () => {
    expect(equivalents(1)).toHaveLength(5);
  });

  it("leads with the driving-distance equivalent", () => {
    const eqs = equivalents(1.7);
    expect(eqs[0].icon).toBe("🚗");
    // 1.7 kg / 0.17 kg-per-km = 10 km
    expect(eqs[0].text).toContain("10 km");
  });

  it("formats zero gracefully", () => {
    for (const e of equivalents(0)) {
      expect(e.text).toContain("0");
    }
  });

  it("clamps negative / non-finite inputs to 0 rather than NaN", () => {
    for (const e of equivalents(-5)) {
      expect(e.text).not.toContain("NaN");
    }
  });
});

describe("headlineEquivalent", () => {
  it("matches the first full equivalent", () => {
    expect(headlineEquivalent(3.4)).toEqual(equivalents(3.4)[0]);
  });
});
