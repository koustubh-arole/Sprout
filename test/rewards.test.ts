import { describe, expect, it } from "vitest";
import { COLLECTIBLES, getCollectible, RARITY_WEIGHTS, rollCollectible } from "@/lib/rewards";

describe("RARITY_WEIGHTS", () => {
  it("sum to 1", () => {
    const sum = RARITY_WEIGHTS.common + RARITY_WEIGHTS.rare + RARITY_WEIGHTS.legendary;
    expect(sum).toBeCloseTo(1, 5);
  });
});

describe("rollCollectible", () => {
  it("returns a common at the low end of the range", () => {
    expect(rollCollectible(0).rarity).toBe("common");
    expect(rollCollectible(0.5).rarity).toBe("common");
  });

  it("returns a rare in the middle band", () => {
    expect(rollCollectible(0.8).rarity).toBe("rare");
  });

  it("returns a legendary at the top", () => {
    expect(rollCollectible(0.98).rarity).toBe("legendary");
  });

  it("always returns a real catalogue item", () => {
    for (let i = 0; i < 50; i++) {
      const c = rollCollectible(i / 50);
      expect(COLLECTIBLES.some((x) => x.id === c.id)).toBe(true);
    }
  });
});

describe("getCollectible", () => {
  it("finds by id", () => {
    expect(getCollectible("rainbow")?.emoji).toBe("🌈");
    expect(getCollectible("nope")).toBeUndefined();
  });
});
