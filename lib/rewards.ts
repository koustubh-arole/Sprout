// lib/rewards.ts
// Variable-reward collectibles (the Hook-model dopamine beat). The FIRST care
// each day opens a "seed pack" that reveals a random collectible for the
// creature's habitat. Pure + deterministic given an rng, so it's testable.

export type Rarity = "common" | "rare" | "legendary";

export type Collectible = {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
};

export const COLLECTIBLES: Collectible[] = [
  { id: "clover", name: "Lucky Clover", emoji: "🍀", rarity: "common" },
  { id: "tulip", name: "Tulip", emoji: "🌷", rarity: "common" },
  { id: "mushroom", name: "Toadstool", emoji: "🍄", rarity: "common" },
  { id: "blossom", name: "Cherry Blossom", emoji: "🌸", rarity: "common" },
  { id: "cactus", name: "Tiny Cactus", emoji: "🌵", rarity: "rare" },
  { id: "butterfly", name: "Butterfly", emoji: "🦋", rarity: "rare" },
  { id: "bee", name: "Honeybee", emoji: "🐝", rarity: "rare" },
  { id: "rainbow", name: "Rainbow", emoji: "🌈", rarity: "legendary" },
  { id: "unicorn", name: "Unicorn Bloom", emoji: "🦄", rarity: "legendary" },
];

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 0.65,
  rare: 0.28,
  legendary: 0.07,
};

export const RARITY_RING: Record<Rarity, string> = {
  common: "ring-stone-300",
  rare: "ring-sky-400",
  legendary: "ring-amber-400",
};

/**
 * Roll a collectible. `r` is a uniform [0,1) value (defaults to Math.random),
 * so tests can pin the outcome. Picks a rarity by weight, then an item within it.
 */
export function rollCollectible(r: number = Math.random()): Collectible {
  const x = Math.min(0.999999, Math.max(0, r));
  let rarity: Rarity;
  if (x < RARITY_WEIGHTS.common) rarity = "common";
  else if (x < RARITY_WEIGHTS.common + RARITY_WEIGHTS.rare) rarity = "rare";
  else rarity = "legendary";

  const pool = COLLECTIBLES.filter((c) => c.rarity === rarity);
  // Spread the leftover fractional part across the pool for variety.
  const idx = Math.floor((x * 997) % pool.length);
  return pool[idx];
}

export function getCollectible(id: string): Collectible | undefined {
  return COLLECTIBLES.find((c) => c.id === id);
}
