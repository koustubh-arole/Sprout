"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/carbon/factors";
import type { Coaching } from "@/lib/llm/types";

type CoachProps = {
  totalKg: number;
  byCategory: Record<Category, number>;
  topCategory: Category | null;
  choiceCount: number;
  name?: string;
};

const DEBOUNCE_MS = 600;

/**
 * Renders Sprout's coaching. Whenever the footprint changes it POSTs to
 * /api/coach (debounced). The route always returns valid coaching — live AI or
 * the deterministic fallback — so this component never has to invent advice.
 */
export function Coach({ totalKg, byCategory, topCategory, choiceCount, name }: CoachProps) {
  const [coaching, setCoaching] = useState<Coaching | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Nothing logged yet — the component renders null, so no need to fetch or clear.
    if (choiceCount === 0) return;

    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);

      fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalKg, byCategory, topCategory, choiceCount, name }),
        signal: controller.signal,
      })
        .then((res) => res.json() as Promise<Coaching>)
        .then((data) => setCoaching(data))
        .catch((err) => {
          if ((err as Error).name !== "AbortError") {
            // Network failed entirely; keep the last good advice rather than blanking.
            console.error("[coach] request failed:", (err as Error).message);
          }
        })
        .finally(() => {
          if (abortRef.current === controller) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [totalKg, byCategory, topCategory, choiceCount, name]);

  useEffect(() => () => abortRef.current?.abort(), []);

  if (choiceCount === 0 || !coaching) return null;

  return (
    <section
      aria-labelledby="coach-heading"
      aria-busy={loading}
      className="clay p-4 sm:p-5"
    >
      <div className="flex items-center justify-between">
        <h2 id="coach-heading" className="font-data flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-pine">
          <span aria-hidden>💬</span> {name ?? "Sprout"} says
        </h2>
        <span
          className="pill border border-leaf/30 bg-surface text-[10px] uppercase tracking-wide text-pine"
          title={coaching.source === "ai" ? "Generated live by the AI coach" : "Offline guidance (no live AI right now)"}
        >
          {coaching.source === "ai" ? "AI coach" : "offline guide"}
        </span>
      </div>

      <p className="mt-2 text-sm text-stone-800">{coaching.equivalent}</p>

      <p className="mt-3 text-sm font-semibold text-pine">
        <span aria-hidden>👉 </span>
        {coaching.action}
      </p>

      <p className="mt-2 text-sm text-stone-700">{coaching.encouragement}</p>

      {/* The coach never invents numbers; all figures originate in the carbon engine. */}
      <p className="mt-3 text-[11px] text-stone-500">
        Advice is qualitative — every number you see comes from the{" "}
        <a href="/methodology" className="underline underline-offset-2 hover:text-emerald-700">
          disclosed methodology
        </a>
        .
      </p>
    </section>
  );
}
