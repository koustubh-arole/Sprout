import { describe, expect, it } from "vitest";
import { creatureMood, getVariant, growthStage, levelFor, LEVELS } from "@/lib/creature";

describe("creatureMood", () => {
  it("is happy when cared for today and healthy", () => {
    expect(creatureMood({ health: 82, caredToday: true, daysSinceCare: 0 })).toBe("happy");
  });

  it("is content when cared for but low health", () => {
    expect(creatureMood({ health: 40, caredToday: true, daysSinceCare: 0 })).toBe("content");
  });

  it("waits when not yet cared for today", () => {
    expect(creatureMood({ health: 80, caredToday: false, daysSinceCare: 1 })).toBe("waiting");
  });

  it("gets sleepy after two days, droopy after three", () => {
    expect(creatureMood({ health: 80, caredToday: false, daysSinceCare: 2 })).toBe("sleepy");
    expect(creatureMood({ health: 80, caredToday: false, daysSinceCare: 5 })).toBe("droopy");
  });
});

describe("levelFor", () => {
  it("starts at Seedling with progress toward Sprout", () => {
    const p = levelFor(0);
    expect(p.level.title).toBe("Seedling");
    expect(p.next?.title).toBe("Sprout");
    expect(p.progress).toBe(0);
    expect(p.pointsToNext).toBe(100);
  });

  it("promotes at a threshold", () => {
    expect(levelFor(100).level.title).toBe("Sprout");
    expect(levelFor(50).progress).toBeCloseTo(0.5, 5);
  });

  it("caps at the top level", () => {
    const p = levelFor(99999);
    expect(p.level.title).toBe("Guardian");
    expect(p.next).toBeNull();
    expect(p.progress).toBe(1);
  });
});

describe("growthStage", () => {
  it("tracks the identity level index", () => {
    expect(growthStage(0)).toBe(0);
    expect(growthStage(300)).toBe(2);
    expect(growthStage(99999)).toBe(LEVELS.length - 1);
  });
});

describe("getVariant", () => {
  it("falls back to the first variant for unknown ids", () => {
    expect(getVariant("nope").id).toBe("leafling");
    expect(getVariant("dewdrop").id).toBe("dewdrop");
  });
});
