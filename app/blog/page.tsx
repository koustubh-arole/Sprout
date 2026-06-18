import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Blog } from "@/components/Blog";

export const metadata: Metadata = { title: "Blog — Sprout" };

export default function BlogPage() {
  return (
    <AppShell>
      <Blog />
    </AppShell>
  );
}
