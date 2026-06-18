import { describe, expect, it } from "vitest";
import { ACTIONS, getAction, pointsFor, totalSavedKg } from "@/lib/carbon/actions";

describe("pointsFor", () => {
  it("scales with savings", () => {
    expect(pointsFor(1.7)).toBe(17);
  });

  it("never drops below the showing-up floor of 5", () => {
    expect(pointsFor(0.1)).toBe(5);
    expect(pointsFor(0)).toBe(5);
  });
});

describe("ACTIONS catalog", () => {
  it("only contains genuine savings (positive savedKg)", () => {
    for (const a of ACTIONS) {
      expect(a.savedKg).toBeGreaterThan(0);
      expect(a.points).toBeGreaterThanOrEqual(5);
    }
  });

  it("ranks skipping a flight as the highest-saving action", () => {
    const top = [...ACTIONS].sort((x, y) => y.savedKg - x.savedKg)[0];
    expect(top.id).toBe("train");
  });

  it("computes the cycle saving from the car factor (1.7 kg / 10 km)", () => {
    expect(getAction("cycle")?.savedKg).toBe(1.7);
  });

  it("derives points from each action's savings", () => {
    for (const a of ACTIONS) {
      expect(a.points).toBe(pointsFor(a.savedKg));
    }
  });
});

describe("totalSavedKg", () => {
  it("sums and rounds to 1 dp", () => {
    expect(totalSavedKg([1.7, 1.5, 0.05])).toBe(3.3);
  });

  it("is 0 for an empty log", () => {
    expect(totalSavedKg([])).toBe(0);
  });
});
