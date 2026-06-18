import { describe, expect, it } from "vitest";
import {
  compareToAverageDay,
  kgByCategory,
  kgSince,
  topCategory,
  totalKg,
  type LoggedChoice,
} from "@/lib/carbon/calc";

const choice = (over: Partial<LoggedChoice>): LoggedChoice => ({
  decisionId: "lunch",
  category: "food",
  choiceId: "veg",
  label: "Veg thali",
  kg: 0.7,
  at: 1000,
  ...over,
});

describe("totalKg", () => {
  it("sums and rounds to 1 dp", () => {
    const out = totalKg([choice({ kg: 0.7 }), choice({ kg: 1.8 }), choice({ kg: 0.05 })]);
    expect(out).toBe(2.6);
  });

  it("is 0 for no choices", () => {
    expect(totalKg([])).toBe(0);
  });
});

describe("kgByCategory", () => {
  it("aggregates per category and zero-fills the rest", () => {
    const out = kgByCategory([
      choice({ category: "food", kg: 0.7 }),
      choice({ category: "commute", kg: 1.7 }),
      choice({ category: "commute", kg: 0.2 }),
    ]);
    expect(out).toEqual({ food: 0.7, commute: 1.9, energy: 0, travel: 0 });
  });
});

describe("topCategory", () => {
  it("returns null with no choices", () => {
    expect(topCategory([])).toBeNull();
  });

  it("returns the highest-emitting category", () => {
    const out = topCategory([
      choice({ category: "food", kg: 0.7 }),
      choice({ category: "travel", kg: 172.5 }),
    ]);
    expect(out).toBe("travel");
  });
});

describe("kgSince", () => {
  it("only counts choices at or after the cutoff", () => {
    const out = kgSince(
      [choice({ kg: 1, at: 100 }), choice({ kg: 2, at: 500 }), choice({ kg: 4, at: 900 })],
      500,
    );
    expect(out).toBe(6);
  });
});

describe("compareToAverageDay", () => {
  it("flags a low day as below", () => {
    expect(compareToAverageDay(1).verdict).toBe("below");
  });

  it("flags an average day as around", () => {
    const cmp = compareToAverageDay(5.5);
    expect(cmp.verdict).toBe("around");
    expect(cmp.percentOfAverage).toBe(100);
  });

  it("flags a heavy day as above", () => {
    expect(compareToAverageDay(20).verdict).toBe("above");
  });
});
