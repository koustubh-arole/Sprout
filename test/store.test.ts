import { describe, it, expect, beforeEach } from "vitest";
import { useWorld } from "@/lib/store";
import { getAction } from "@/lib/carbon/actions";

beforeEach(() => {
  useWorld.getState().reset();
});

describe("store — village economy", () => {
  it("logAction credits Sprigs (+ first-care bonus) and clears pollution", () => {
    const action = getAction("cycle")!;
    const before = useWorld.getState();
    useWorld.getState().logAction(action, undefined, "ok");
    const after = useWorld.getState();
    expect(after.sprigs).toBe(before.sprigs + action.points + 25); // first care of day bonus
    expect(after.meters.pollution).toBeLessThan(before.meters.pollution);
    expect(after.actions.length).toBe(1);
    expect(after.streakDays).toBe(1);
  });

  it("build deducts Sprigs, raises the level, and lowers the right meter", () => {
    useWorld.setState({ sprigs: 500 });
    const beforePollution = useWorld.getState().meters.pollution;
    const ok = useWorld.getState().build("solar");
    expect(ok).toBe(true);
    expect(useWorld.getState().buildings.solar).toBe(1);
    expect(useWorld.getState().sprigs).toBe(380); // 500 - 120
    expect(useWorld.getState().meters.pollution).toBe(beforePollution - 7);
  });

  it("build fails when unaffordable", () => {
    useWorld.setState({ sprigs: 10 });
    expect(useWorld.getState().build("metro")).toBe(false);
    expect(useWorld.getState().buildings.metro).toBeUndefined();
  });

  it("collectYield pays accrued passive Sprigs then resets the clock", () => {
    useWorld.setState({ sprigs: 0, buildings: { solar: 1 }, lastYieldAt: Date.now() - 2 * 86_400_000 });
    const got = useWorld.getState().collectYield();
    expect(got).toBe(16); // 8/day * 2 days
    expect(useWorld.getState().sprigs).toBe(16);
    expect(useWorld.getState().collectYield()).toBe(0); // clock reset
  });
});
