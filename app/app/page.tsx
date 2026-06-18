import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Dashboard } from "@/components/Dashboard";

export const metadata: Metadata = { title: "Your world — Sprout" };

export default function AppPage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
