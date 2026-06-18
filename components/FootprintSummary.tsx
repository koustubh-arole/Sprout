"use client";

import { useState } from "react";
import type { Category } from "@/lib/carbon/factors";
import type { Comparison } from "@/lib/carbon/calc";
import { equivalents } from "@/lib/carbon/equivalents";
import { worldStage } from "@/lib/world";

const CATEGORY_META: Record<Category, { label: string; emoji: string }> = {
  food: { label: "Food", emoji: "🍽️" },
  commute: { label: "Commute", emoji: "🛺" },
  energy: { label: "Energy", emoji: "❄️" },
  travel: { label: "Travel", emoji: "✈️" },
};

export type FootprintSummaryProps = {
  totalKg: number;
  byCategory: Record<Category, number>;
  comparison: Comparison;
  health: number;
  choiceCount: number;
  onReset: () => void;
  savedKg?: number;
  streak?: number;
};

export function FootprintSummary({
  totalKg,
  byCategory,
  comparison,
  health,
  choiceCount,
  onReset,
  savedKg = 0,
  streak = 0,
}: FootprintSummaryProps) {
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const eqs = equivalents(totalKg);
  const maxCat = Math.max(0.1, ...Object.values(byCategory));
  const stage = worldStage(health);

  const verdictText =
    comparison.verdict === "below"
      ? `That's ${comparison.percentOfAverage}% of the average Indian's daily footprint — nicely below.`
      : comparison.verdict === "around"
        ? `That's about average for an Indian day (${comparison.percentOfAverage}%).`
        : `That's ${comparison.percentOfAverage}% of the average Indian's day — room to bring it down.`;

  async function handleShare() {
    const cardUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/og?health=${Math.round(health)}&saved=${savedKg}&streak=${streak}&stage=${encodeURIComponent(stage.label)}`
        : "";
    const text =
      `🌱 My Sprout world is ${stage.label} (${Math.round(health)}/100).\n` +
      `${savedKg} kg CO₂ saved · ${streak}-day streak.\n` +
      `Create behavior, not just awareness.`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Sprout", text, url: cardUrl });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${cardUrl}`);
        setShareMsg("World card link copied to clipboard!");
      } else {
        setShareMsg("Sharing isn't available here.");
      }
    } catch {
      setShareMsg("Sharing was cancelled.");
    }
    setTimeout(() => setShareMsg(null), 2500);
  }

  return (
    <section className="clay rounded-2xl p-4 sm:p-5" aria-labelledby="footprint-heading">
      <div className="flex items-baseline justify-between">
        <h2 id="footprint-heading" className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Your footprint so far
        </h2>
        {choiceCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-md px-2 py-1 text-xs font-medium text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            Reset
          </button>
        )}
      </div>

      <p className="mt-1">
        <span className="font-data text-4xl font-bold text-canopy">{totalKg}</span>
        <span className="ml-1 text-sm font-medium text-ink-3">kg CO₂e from {choiceCount} {choiceCount === 1 ? "choice" : "choices"}</span>
      </p>

      {/* headline equivalent + expandable list */}
      <p className="mt-1 text-sm text-stone-700">
        <span aria-hidden>{eqs[0].icon} </span>
        {eqs[0].text}.
      </p>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-emerald-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
          More ways to picture it
        </summary>
        <ul className="mt-2 space-y-1 text-stone-700">
          {eqs.slice(1).map((e, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden>{e.icon}</span>
              <span>{e.text}</span>
            </li>
          ))}
        </ul>
      </details>

      {/* normative comparison — descriptive social norm */}
      <div className="mt-4 rounded-xl bg-stone-50 p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">vs the average Indian</h3>
        <NormBar label="You" value={totalKg} max={Math.max(totalKg, comparison.averageKg)} accent="bg-leaf" />
        <NormBar label="Avg / day" value={comparison.averageKg} max={Math.max(totalKg, comparison.averageKg)} accent="bg-stone-400" />
        <p className="mt-2 text-xs text-stone-600">{verdictText}</p>
      </div>

      {/* category breakdown */}
      {choiceCount > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Where it comes from</h3>
          <ul className="mt-2 space-y-1.5">
            {(Object.keys(CATEGORY_META) as Category[]).map((cat) => (
              <li key={cat} className="flex items-center gap-2 text-sm">
                <span className="w-20 shrink-0 text-stone-600" aria-hidden>
                  {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-mist" aria-hidden>
                  <span
                    className="block h-full rounded-full bg-leaf transition-[width] duration-500 motion-reduce:transition-none"
                    style={{ width: `${(byCategory[cat] / maxCat) * 100}%` }}
                  />
                </span>
                <span className="font-data w-14 shrink-0 text-right text-ink-2">
                  {byCategory[cat]} kg
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button type="button" onClick={handleShare} className="btn btn-ghost text-sm">
          <span aria-hidden>↗</span> Share my world
        </button>
        <span role="status" aria-live="polite" className="text-xs text-stone-600">
          {shareMsg}
        </span>
      </div>
    </section>
  );
}

function NormBar({ label, value, max, accent }: { label: string; value: number; max: number; accent: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="mt-2 flex items-center gap-2 text-xs">
      <span className="w-16 shrink-0 text-stone-600">{label}</span>
      <span className="h-3 flex-1 overflow-hidden rounded-full bg-stone-200" aria-hidden>
        <span
          className={`block h-full rounded-full ${accent} transition-[width] duration-500 motion-reduce:transition-none`}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="font-data w-16 shrink-0 text-right text-ink-2">{value} kg</span>
    </div>
  );
}
