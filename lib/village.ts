// lib/village.ts
// The "living village" game model. Pure + deterministic (no React, no I/O) so
// every rule is unit-testable. Sprigs 🌿 are earned from real low-carbon actions
// (see lib/carbon/actions.ts) and spent here to build structures that measurably
// improve the planetary meters and grow the village.

export type MeterKey = "pollution" | "ozone" | "disaster";
export type Meters = Record<MeterKey, number>;

export type BuildingCategory = "energy" | "transport" | "nature" | "waste" | "water";

/** Per-level improvement. Meter fields are REDUCTIONS (a positive number lowers
 *  that meter); sprigsPerDay is passive Sprigs income per owned level. */
export type PerLevelEffect = {
  pollution?: number;
  ozone?: number;
  disaster?: number;
  sprigsPerDay?: number;
};

export type Building = {
  id: string;
  name: string;
  emoji: string;
  category: BuildingCategory;
  blurb: string;
  baseCost: number;
  costGrowth: number;
  maxLevel: number;
  perLevel: PerLevelEffect;
  slot: { col: number; row: number }; // position on the iso grid (4 cols × 3 rows)
};

/** Meters run 0–100 where HIGHER IS WORSE. The world starts in trouble. */
export const START_METERS: Meters = { pollution: 68, ozone: 52, disaster: 44 };

/** Starter Sprigs so a first build is possible in the first session. */
export const START_SPRIGS = 150;

/** How many days of idle passive yield we let accrue (anti-hoard cap). */
export const YIELD_CAP_DAYS = 3;

export const BUILDINGS: Building[] = [
  { id: "solar", name: "Solar Farm", emoji: "☀️", category: "energy", blurb: "Clean power cuts grid pollution and pays a steady Sprig yield.", baseCost: 120, costGrowth: 1.7, maxLevel: 3, perLevel: { pollution: 7, sprigsPerDay: 8 }, slot: { col: 1, row: 1 } },
  { id: "wind", name: "Wind Turbines", emoji: "🌬️", category: "energy", blurb: "Breezy, zero-emission energy that also eases the ozone load.", baseCost: 150, costGrowth: 1.7, maxLevel: 3, perLevel: { pollution: 5, ozone: 2, sprigsPerDay: 6 }, slot: { col: 3, row: 0 } },
  { id: "forest", name: "Urban Forest", emoji: "🌳", category: "nature", blurb: "Trees scrub the air and shade the streets.", baseCost: 100, costGrowth: 1.7, maxLevel: 3, perLevel: { pollution: 4, ozone: 5 }, slot: { col: 0, row: 2 } },
  { id: "metro", name: "Metro Line", emoji: "🚇", category: "transport", blurb: "Mass transit replaces thousands of solo car trips.", baseCost: 200, costGrowth: 1.7, maxLevel: 3, perLevel: { pollution: 6, sprigsPerDay: 5 }, slot: { col: 2, row: 2 } },
  { id: "ev", name: "EV Charging Hub", emoji: "🔌", category: "transport", blurb: "Electrifies the roads, clearing tailpipe smog.", baseCost: 160, costGrowth: 1.7, maxLevel: 3, perLevel: { pollution: 4 }, slot: { col: 3, row: 2 } },
  { id: "recycle", name: "Recycling Plant", emoji: "♻️", category: "waste", blurb: "Closes the loop — less landfill, less methane.", baseCost: 140, costGrowth: 1.7, maxLevel: 3, perLevel: { pollution: 5, disaster: 2, sprigsPerDay: 4 }, slot: { col: 0, row: 1 } },
  { id: "wetland", name: "Wetland Restore", emoji: "🪷", category: "nature", blurb: "Natural buffers blunt floods and storms.", baseCost: 130, costGrowth: 1.7, maxLevel: 3, perLevel: { disaster: 7, ozone: 2 }, slot: { col: 2, row: 0 } },
  { id: "water", name: "Water Reclaim", emoji: "💧", category: "water", blurb: "Resilient water supply for a warming climate.", baseCost: 120, costGrowth: 1.7, maxLevel: 3, perLevel: { disaster: 4 }, slot: { col: 0, row: 0 } },
];

/** The full iso grid; unused slots render as empty "build here" plots. */
export const GRID_COLS = 4;
export const GRID_ROWS = 3;

export function getBuilding(id: string): Building | undefined {
  return BUILDINGS.find((b) => b.id === id);
}

export function clampMeter(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Cost to take a building from `currentLevel` to the next level. */
export function costFor(b: Building, currentLevel: number): number {
  return Math.round(b.baseCost * Math.pow(b.costGrowth, currentLevel));
}

export function canAfford(sprigs: number, b: Building, currentLevel: number): boolean {
  return currentLevel < b.maxLevel && sprigs >= costFor(b, currentLevel);
}

export function totalLevels(buildings: Record<string, number>): number {
  return Object.values(buildings).reduce((s, lv) => s + lv, 0);
}

/** Village Health: inverse of the weighted meters (higher = healthier). */
export function villageHealth(meters: Meters): number {
  const bad = 0.5 * meters.pollution + 0.3 * meters.ozone + 0.2 * meters.disaster;
  return Math.min(100, Math.max(0, Math.round(100 - bad)));
}

export type VillageTier = { index: number; title: string; min: number };

export const VILLAGE_TIERS: VillageTier[] = [
  { index: 0, title: "Hamlet", min: 0 },
  { index: 1, title: "Village", min: 3 },
  { index: 2, title: "Town", min: 7 },
  { index: 3, title: "Eco-City", min: 13 },
  { index: 4, title: "Utopia", min: 21 },
];

export type VillageProgress = {
  tier: VillageTier;
  next: VillageTier | null;
  progress: number; // 0..1 to next
  levelsToNext: number;
};

export function villageLevel(buildings: Record<string, number>): VillageProgress {
  const total = totalLevels(buildings);
  let tier = VILLAGE_TIERS[0];
  for (const t of VILLAGE_TIERS) if (total >= t.min) tier = t;
  const next = VILLAGE_TIERS[tier.index + 1] ?? null;
  if (!next) return { tier, next: null, progress: 1, levelsToNext: 0 };
  const span = next.min - tier.min;
  return {
    tier,
    next,
    progress: Math.max(0, Math.min(1, (total - tier.min) / span)),
    levelsToNext: Math.max(0, next.min - total),
  };
}

/** Passive Sprigs per day from all owned building levels. */
export function passiveSprigsPerDay(buildings: Record<string, number>): number {
  let perDay = 0;
  for (const b of BUILDINGS) {
    const level = buildings[b.id] ?? 0;
    if (level > 0 && b.perLevel.sprigsPerDay) perDay += b.perLevel.sprigsPerDay * level;
  }
  return perDay;
}

/** Sprigs accrued since `lastYieldAt`, capped at YIELD_CAP_DAYS. */
export function collectYield(
  buildings: Record<string, number>,
  lastYieldAt: number | null,
  now: number = Date.now(),
): number {
  const perDay = passiveSprigsPerDay(buildings);
  if (perDay <= 0 || !lastYieldAt) return 0;
  const days = Math.floor((now - lastYieldAt) / 86_400_000);
  if (days <= 0) return 0;
  return perDay * Math.min(days, YIELD_CAP_DAYS);
}

export type BuildState = { sprigs: number; buildings: Record<string, number>; meters: Meters };
export type BuildResult = BuildState & { ok: boolean };

/**
 * Attempt to build/upgrade `id`. Pure: returns the next state (or ok:false +
 * unchanged state if maxed/unaffordable). The store calls this directly.
 */
export function applyBuild(state: BuildState, id: string): BuildResult {
  const b = getBuilding(id);
  const level = state.buildings[id] ?? 0;
  if (!b || level >= b.maxLevel) return { ...state, ok: false };
  const cost = costFor(b, level);
  if (state.sprigs < cost) return { ...state, ok: false };
  const meters: Meters = {
    pollution: clampMeter(state.meters.pollution - (b.perLevel.pollution ?? 0)),
    ozone: clampMeter(state.meters.ozone - (b.perLevel.ozone ?? 0)),
    disaster: clampMeter(state.meters.disaster - (b.perLevel.disaster ?? 0)),
  };
  return {
    ok: true,
    sprigs: state.sprigs - cost,
    buildings: { ...state.buildings, [id]: level + 1 },
    meters,
  };
}

export const METER_META: Record<MeterKey, { label: string; emoji: string; good: string }> = {
  pollution: { label: "Air Pollution", emoji: "🏭", good: "Clean air" },
  ozone: { label: "Ozone Damage", emoji: "🛡️", good: "Ozone healing" },
  disaster: { label: "Disaster Risk", emoji: "🌊", good: "Resilient" },
};
