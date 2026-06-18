import { describe, it, expect } from "vitest";
import {
  applyBuild,
  canAfford,
  clampMeter,
  collectYield,
  costFor,
  getBuilding,
  passiveSprigsPerDay,
  START_METERS,
  villageHealth,
  villageLevel,
  type Building,
  type Meters,
} from "@/lib/village";

const solar = getBuilding("solar") as Building;
const forest = getBuilding("forest") as Building;

describe("costFor / canAfford", () => {
  it("scales geometrically by level", () => {
    expect(costFor(solar, 0)).toBe(120);
    expect(costFor(solar, 1)).toBe(204); // 120 * 1.7
    expect(costFor(solar, 2)).toBe(347); // 120 * 1.7^2
  });

  it("canAfford respects balance and max level", () => {
    expect(canAfford(120, solar, 0)).toBe(true);
    expect(canAfford(119, solar, 0)).toBe(false);
    expect(canAfford(99999, solar, solar.maxLevel)).toBe(false); // maxed
  });
});

describe("villageHealth", () => {
  it("derives an inverse weighted score from the meters", () => {
    expect(villageHealth(START_METERS)).toBe(42); // 100 - (34 + 15.6 + 8.8)
    expect(villageHealth({ pollution: 0, ozone: 0, disaster: 0 })).toBe(100);
    expect(villageHealth({ pollution: 100, ozone: 100, disaster: 100 })).toBe(0);
  });
});

describe("applyBuild", () => {
  it("deducts Sprigs, raises the level, and lowers the right meters", () => {
    const res = applyBuild({ sprigs: 150, buildings: {}, meters: { ...START_METERS } }, "forest");
    expect(res.ok).toBe(true);
    expect(res.sprigs).toBe(50); // 150 - 100
    expect(res.buildings.forest).toBe(1);
    expect(res.meters.pollution).toBe(64); // 68 - 4
    expect(res.meters.ozone).toBe(47); // 52 - 5
    expect(res.meters.disaster).toBe(44); // unchanged
  });

  it("refuses when unaffordable and leaves state untouched", () => {
    const state = { sprigs: 50, buildings: {}, meters: { ...START_METERS } };
    const res = applyBuild(state, "metro"); // costs 200
    expect(res.ok).toBe(false);
    expect(res.sprigs).toBe(50);
    expect(res.buildings.metro).toBeUndefined();
  });

  it("refuses past max level", () => {
    const res = applyBuild({ sprigs: 99999, buildings: { solar: solar.maxLevel }, meters: { ...START_METERS } }, "solar");
    expect(res.ok).toBe(false);
  });

  it("never drives a meter below zero", () => {
    const low: Meters = { pollution: 2, ozone: 2, disaster: 2 };
    const res = applyBuild({ sprigs: 9999, buildings: {}, meters: low }, "solar"); // -7 pollution
    expect(res.meters.pollution).toBe(0);
  });
});

describe("villageLevel", () => {
  it("maps total building levels to tiers", () => {
    expect(villageLevel({}).tier.title).toBe("Hamlet");
    expect(villageLevel({ solar: 3 }).tier.title).toBe("Village"); // 3 -> Village
    expect(villageLevel({ a: 7 }).tier.title).toBe("Town");
    expect(villageLevel({ a: 21 }).tier.title).toBe("Utopia");
    expect(villageLevel({ a: 21 }).next).toBeNull();
  });
});

describe("passive yield", () => {
  it("sums sprigsPerDay across owned levels", () => {
    expect(passiveSprigsPerDay({ solar: 2 })).toBe(16); // 8 * 2
    expect(passiveSprigsPerDay({ forest: 3 })).toBe(0); // forest has no income
  });

  it("accrues per day and caps the backlog", () => {
    const day = 86_400_000;
    const now = 10 * day;
    expect(collectYield({ solar: 1 }, now - 2 * day, now)).toBe(16); // 8 * 2
    expect(collectYield({ solar: 1 }, now - 9 * day, now)).toBe(24); // capped at 3 days
    expect(collectYield({ solar: 1 }, now - day / 2, now)).toBe(0); // < 1 day
    expect(collectYield({}, now - 5 * day, now)).toBe(0); // no income buildings
  });
});

describe("clampMeter", () => {
  it("rounds and bounds to 0..100", () => {
    expect(clampMeter(-5)).toBe(0);
    expect(clampMeter(105)).toBe(100);
    expect(clampMeter(63.6)).toBe(64);
  });
});
