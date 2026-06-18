// lib/creature.ts
// Pure logic for the companion creature: its mood, its growth, and the player's
// identity level. No React, no side effects — fully unit-testable.

export type Mood = "happy" | "content" | "waiting" | "sleepy" | "droopy";

/**
 * The creature's mood. It must visibly NEED you (waiting → sleepy → droopy as
 * neglect grows) but stay redeemable. Caring today + decent health = happy.
 */
export function creatureMood(args: {
  health: number;
  caredToday: boolean;
  daysSinceCare: number; // 0 if cared today, large/Infinity if never
}): Mood {
  if (args.daysSinceCare >= 3) return "droopy";
  if (args.daysSinceCare === 2) return "sleepy";
  if (!args.caredToday) return "waiting";
  return args.health >= 70 ? "happy" : "content";
}

export const MOOD_COPY: Record<Mood, string> = {
  happy: "is beaming — your care is paying off!",
  content: "is doing okay. A little care goes a long way.",
  waiting: "is waiting for you today.",
  sleepy: "is getting sleepy — it misses you.",
  droopy: "has drooped a little. One kind action will perk it right back up.",
};

export type IdentityLevel = {
  index: number;
  title: string;
  min: number; // points required to reach
};

// Identity-based progression — titles, not just numbers ("you're becoming…").
export const LEVELS: IdentityLevel[] = [
  { index: 0, title: "Seedling", min: 0 },
  { index: 1, title: "Sprout", min: 100 },
  { index: 2, title: "Sapling", min: 300 },
  { index: 3, title: "Grove-keeper", min: 700 },
  { index: 4, title: "Guardian", min: 1500 },
];

export type LevelProgress = {
  level: IdentityLevel;
  next: IdentityLevel | null;
  /** 0..1 toward the next level (1 if maxed). */
  progress: number;
  pointsToNext: number;
};

export function levelFor(points: number): LevelProgress {
  let level = LEVELS[0];
  for (const l of LEVELS) if (points >= l.min) level = l;
  const next = LEVELS[level.index + 1] ?? null;
  if (!next) return { level, next: null, progress: 1, pointsToNext: 0 };
  const span = next.min - level.min;
  const into = points - level.min;
  return {
    level,
    next,
    progress: Math.max(0, Math.min(1, into / span)),
    pointsToNext: Math.max(0, next.min - points),
  };
}

/** Visual growth stage 0..4, tracking the identity level. */
export function growthStage(points: number): number {
  return levelFor(points).level.index;
}

export const VARIANTS = [
  { id: "leafling", name: "Leafling", emoji: "🌱", tint: "#6cc46f" },
  { id: "sunbud", name: "Sunbud", emoji: "🌻", tint: "#f3c84a" },
  { id: "dewdrop", name: "Dewdrop", emoji: "💧", tint: "#5fb6d6" },
] as const;

export type VariantId = (typeof VARIANTS)[number]["id"];

export function getVariant(id: string) {
  return VARIANTS.find((v) => v.id === id) ?? VARIANTS[0];
}
