import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Leaderboard } from "@/components/Leaderboard";

export const metadata: Metadata = { title: "Grove — Sprout" };

export default function LeaderboardPage() {
  return (
    <AppShell>
      <Leaderboard />
    </AppShell>
  );
}
