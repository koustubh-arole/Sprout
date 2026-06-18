import { describe, it, expect } from "vitest";
import { weeklyRecap } from "@/lib/recap";

const day = 86_400_000;
const now = 30 * day;

describe("weeklyRecap", () => {
  it("splits actions into this-week and last-week buckets", () => {
    const actions = [
      { savedKg: 2, points: 20, at: now - 1 * day },
      { savedKg: 3, points: 30, at: now - 2 * day },
      { savedKg: 5, points: 50, at: now - 9 * day },
      { savedKg: 9, points: 90, at: now - 20 * day }, // older than 2 weeks → ignored
    ];
    const r = weeklyRecap(actions, now);
    expect(r.thisWeekKg).toBe(5);
    expect(r.lastWeekKg).toBe(5);
    expect(r.thisWeekSprigs).toBe(50);
    expect(r.deltaPct).toBe(0);
  });

  it("returns null delta with no last-week baseline", () => {
    const r = weeklyRecap([{ savedKg: 4, points: 40, at: now - 1 * day }], now);
    expect(r.deltaPct).toBeNull();
    expect(r.thisWeekKg).toBe(4);
  });
});
