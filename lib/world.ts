// lib/world.ts
// Pure mapping from world health (0-100) to a described, redeemable stage.
// Always framed with hope — even the worst state is recoverable.

export type Stage = {
  key: "thriving" | "healthy" | "struggling" | "wilting" | "barren";
  label: string;
  emoji: string;
  blurb: string;
};

export function worldStage(health: number): Stage {
  if (health >= 80)
    return { key: "thriving", label: "Thriving", emoji: "🌳", blurb: "Lush, green, and full of life." };
  if (health >= 60)
    return { key: "healthy", label: "Healthy", emoji: "🌿", blurb: "Green and steady — keep it up." };
  if (health >= 40)
    return { key: "struggling", label: "Struggling", emoji: "🍂", blurb: "Browning at the edges — a good choice will help." };
  if (health >= 20)
    return { key: "wilting", label: "Wilting", emoji: "🥀", blurb: "Thirsty — better choices will revive it." };
  return { key: "barren", label: "Barren, but recoverable", emoji: "🪵", blurb: "Down to bare branches — every good choice heals it back." };
}
