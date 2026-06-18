// lib/data/mock.ts
// Seeded, believable mock data so the full social experience is demoable with
// zero backend. Everything here is replaced 1:1 by lib/data/supabase.ts later.

import { getAction } from "../carbon/actions";
import type {
  Challenge,
  Friend,
  LeaderboardEntry,
  LeaderboardScope,
  ProfileSummary,
  SproutData,
  VerificationResult,
} from "./index";

const GLOBAL: LeaderboardEntry[] = [
  { id: "u1", name: "Aarav from Pune", avatar: "🦊", savedKg: 312.4, points: 3124, streak: 41 },
  { id: "u2", name: "Meera S.", avatar: "🦉", savedKg: 271.0, points: 2710, streak: 33 },
  { id: "u3", name: "Dev & the plants", avatar: "🌵", savedKg: 244.8, points: 2448, streak: 28 },
  { id: "u4", name: "Kavya R.", avatar: "🐢", savedKg: 198.2, points: 1982, streak: 19 },
  { id: "u5", name: "Ishaan", avatar: "🦜", savedKg: 165.5, points: 1655, streak: 22 },
  { id: "u6", name: "Riya M.", avatar: "🐝", savedKg: 142.1, points: 1421, streak: 14 },
  { id: "u7", name: "Tara", avatar: "🦔", savedKg: 121.7, points: 1217, streak: 9 },
  { id: "u8", name: "Neel", avatar: "🐿️", savedKg: 98.3, points: 983, streak: 7 },
];

const FRIENDS_BOARD: LeaderboardEntry[] = [
  { id: "f1", name: "Priya", avatar: "🦋", savedKg: 88.6, points: 886, streak: 12 },
  { id: "f2", name: "Arjun", avatar: "🐼", savedKg: 64.2, points: 642, streak: 6 },
  { id: "f3", name: "Sana", avatar: "🦩", savedKg: 51.9, points: 519, streak: 8 },
];

const COMPANY_BOARD: LeaderboardEntry[] = [
  { id: "c1", name: "Team Verdant (you)", avatar: "🌳", savedKg: 1820.5, points: 18205, streak: 0, isYou: true },
  { id: "c2", name: "Team Solaris", avatar: "☀️", savedKg: 1644.0, points: 16440, streak: 0 },
  { id: "c3", name: "Team Tidal", avatar: "🌊", savedKg: 1490.3, points: 14903, streak: 0 },
];

const FRIENDS: Friend[] = [
  { id: "f1", name: "Priya", avatar: "🦋", streak: 12 },
  { id: "f2", name: "Arjun", avatar: "🐼", streak: 6 },
  { id: "f3", name: "Sana", avatar: "🦩", streak: 8 },
];

const CHALLENGES: Challenge[] = [
  {
    id: "ch1",
    title: "Metro Month",
    sponsor: "Indigo Mobility",
    sponsorEmoji: "🚇",
    blurb: "Log 20 metro/bus rides this month. The whole community's savings stack into one big number.",
    prize: "Top 10 win a transit-pass voucher",
    goalKg: 50,
    progressKg: 31.5,
    participants: 2841,
    endsInDays: 12,
  },
  {
    id: "ch2",
    title: "Meatless Mondays",
    sponsor: "Harvest Foods",
    sponsorEmoji: "🥗",
    blurb: "Four plant-based meals, four photos. Small swaps, real savings.",
    prize: "Weekly draw: a veg recipe box",
    goalKg: 8,
    progressKg: 5.4,
    participants: 1620,
    endsInDays: 4,
  },
  {
    id: "ch3",
    title: "Pedal Power",
    sponsor: "Cycle Co.",
    sponsorEmoji: "🚲",
    blurb: "Cycle instead of driving and watch your world bloom. Community goal in sight.",
    prize: "Grand prize: a city bike",
    goalKg: 120,
    progressKg: 47.8,
    participants: 980,
    endsInDays: 21,
  },
];

function rankIn(board: LeaderboardEntry[], you?: LeaderboardEntry): LeaderboardEntry[] {
  const list = you ? [...board, { ...you, isYou: true }] : [...board];
  return list.sort((a, b) => b.savedKg - a.savedKg);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockData: SproutData = {
  async getLeaderboard(scope: LeaderboardScope, you?: LeaderboardEntry) {
    await delay(120);
    if (scope === "friends") return rankIn(FRIENDS_BOARD, you);
    if (scope === "company") return COMPANY_BOARD;
    return rankIn(GLOBAL, you);
  },

  async getChallenges() {
    await delay(120);
    return CHALLENGES;
  },

  async getFriends() {
    await delay(80);
    return FRIENDS;
  },

  async getProfile(): Promise<ProfileSummary> {
    await delay(80);
    return { name: "You", avatar: "🌱", rankGlobal: 0 };
  },

  async verifyActivity(actionId: string, hasPhoto: boolean): Promise<VerificationResult> {
    // Simulates the Phase-C Gemini-vision check. A photo is required, mirroring
    // the real anti-gaming rule (live capture, not a blank submission).
    await delay(900);
    const action = getAction(actionId);
    if (!hasPhoto) {
      return { ok: false, verdict: "Add a photo so we can verify this action.", confidence: 0, mock: true };
    }
    const label = action ? action.label.toLowerCase() : "your action";
    return { ok: true, verdict: `Looks like ${label} ✓`, confidence: 0.92, mock: true };
  },
};
