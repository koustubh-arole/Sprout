import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Pact } from "@/components/Pact";
import { Challenges } from "@/components/Challenges";

export const metadata: Metadata = { title: "Pacts & Challenges — Sprout" };

export default function ChallengesPage() {
  return (
    <AppShell>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <Pact />
        <Challenges />
      </div>
    </AppShell>
  );
}
