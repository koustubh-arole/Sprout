// lib/data/index.ts
// The data seam. Components depend ONLY on this interface, never on a concrete
// backend. Today it resolves to an in-memory/localStorage mock; Phase B will add
// lib/data/supabase.ts and select it here — components won't change.

export type LeaderboardScope = "global" | "friends" | "company";

export type LeaderboardEntry = {
  id: string;
  name: string;
  avatar: string; // emoji stand-in for an avatar image
  savedKg: number;
  points: number;
  streak: number;
  isYou?: boolean;
};

export type Challenge = {
  id: string;
  title: string;
  sponsor: string;
  sponsorEmoji: string;
  blurb: string;
  prize: string;
  goalKg: number;
  progressKg: number;
  participants: number;
  endsInDays: number;
};

export type Friend = { id: string; name: string; avatar: string; streak: number };

export type VerificationResult = {
  ok: boolean;
  verdict: string; // human-readable, e.g. "Looks like a metro ride"
  confidence: number; // 0..1
  mock: boolean; // transparency: real AI vision arrives in Phase C
};

export type ProfileSummary = {
  name: string;
  avatar: string;
  rankGlobal: number;
};

export interface SproutData {
  getLeaderboard(scope: LeaderboardScope, you?: LeaderboardEntry): Promise<LeaderboardEntry[]>;
  getChallenges(): Promise<Challenge[]>;
  getFriends(): Promise<Friend[]>;
  getProfile(): Promise<ProfileSummary>;
  /** Mock plausibility check; swapped for Gemini-vision in Phase C. */
  verifyActivity(actionId: string, hasPhoto: boolean): Promise<VerificationResult>;
}

export type { GreenAction } from "../carbon/actions";

// --- active source selection -------------------------------------------------
import { mockData } from "./mock";

// When Supabase lands: `export const data = process.env.NEXT_PUBLIC_USE_SUPABASE ? supabaseData : mockData;`
export const data: SproutData = mockData;
