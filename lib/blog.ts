// lib/blog.ts
// Community awareness blog. Seed posts ship in-app; user-written posts live in
// the store (and would sync via Supabase in Phase B).

export type BlogPost = {
  id: string;
  title: string;
  author: string;
  body: string;
  at: number;
  tag: string;
  seed?: boolean;
};

export const SEED_POSTS: BlogPost[] = [
  {
    id: "seed-plate",
    title: "Your plate beats your food miles",
    author: "Team Sprout",
    tag: "Food",
    at: Date.parse("2026-05-02"),
    seed: true,
    body:
      "Worried about how far your food travelled? It barely moves the needle. For most foods, farming and land use are over 80% of the footprint — transport is a sliver.\n\nThe real lever is what's on the plate. Shifting a few meals a week toward plants does more than buying everything local ever could.",
  },
  {
    id: "seed-ac",
    title: "The 26°C rule for Indian summers",
    author: "Team Sprout",
    tag: "Energy",
    at: Date.parse("2026-05-18"),
    seed: true,
    body:
      "On a coal-heavy grid, cooling is the biggest swing in a household's footprint. Setting the AC to 26°C and adding a fan keeps you just as comfortable for roughly half the energy.\n\nSmall thermostat nudges, repeated nightly, add up faster than almost anything else you can do at home.",
  },
  {
    id: "seed-systemic",
    title: "Individual action vs systems: it's both",
    author: "Team Sprout",
    tag: "Mindset",
    at: Date.parse("2026-06-01"),
    seed: true,
    body:
      "You'll hear that personal choices don't matter — only policy does. That's a false choice. People who change their own habits are far more likely to vote, talk, and push for bigger change.\n\nSprout is built for that loop: small wins that build identity, and an honest reminder that systems matter too.",
  },
];

export function readingMinutes(body: string): number {
  return Math.max(1, Math.round(body.split(/\s+/).length / 200));
}
