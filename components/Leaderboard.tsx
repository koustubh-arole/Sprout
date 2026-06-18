"use client";

import { useEffect, useState } from "react";
import { data, type LeaderboardEntry, type LeaderboardScope } from "@/lib/data";
import { useHydrateWorld, useWorld } from "@/lib/store";
import { DemoChip } from "./DemoChip";

const SCOPES: { id: LeaderboardScope; label: string }[] = [
  { id: "global", label: "Global" },
  { id: "friends", label: "Friends" },
  { id: "company", label: "Company" },
];

const MEDAL = ["🥇", "🥈", "🥉"];

export function Leaderboard() {
  useHydrateWorld();
  const savedKgTotal = useWorld((s) => s.savedKgTotal);
  const points = useWorld((s) => s.points);
  const streakDays = useWorld((s) => s.streakDays);

  const [scope, setScope] = useState<LeaderboardScope>("global");
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    const you: LeaderboardEntry = {
      id: "you",
      name: "You",
      avatar: "🌱",
      savedKg: savedKgTotal,
      points,
      streak: streakDays,
      isYou: true,
    };
    data.getLeaderboard(scope, scope === "company" ? undefined : you).then((r) => {
      if (live) {
        setRows(r);
        setLoading(false);
      }
    });
    return () => {
      live = false;
    };
  }, [scope, savedKgTotal, points, streakDays]);

  return (
    <section aria-labelledby="lb-heading">
      <div className="flex flex-wrap items-center gap-3">
        <h1 id="lb-heading" className="font-display text-3xl font-extrabold text-canopy">
          Leaderboard
        </h1>
        <DemoChip label="Demo grove" title="Other players are simulated until accounts land (Phase B). Your own row is real." />
      </div>
      <p className="mt-1 text-ink-2">
        Ranked by CO₂ saved. Compete with friends and your company — the planet wins either way.
      </p>

      <div className="mt-4 inline-flex rounded-full border border-stone-200 bg-white p-1" role="tablist" aria-label="Leaderboard scope">
        {SCOPES.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={scope === s.id}
            onClick={() => setScope(s.id)}
            className={[
              "rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf",
              scope === s.id ? "bg-pine text-white" : "text-ink-2 hover:text-pine",
            ].join(" ")}
          >
            {s.label}
          </button>
        ))}
      </div>

      <ol className="mt-5 space-y-2" aria-busy={loading}>
        {rows.map((r, i) => (
          <li
            key={r.id}
            className={[
              "clay flex items-center gap-3 rounded-2xl p-3",
              r.isYou ? "ring-2 ring-leaf" : "",
            ].join(" ")}
          >
            <span className="font-data w-8 shrink-0 text-center text-lg font-bold text-ink-3">
              {i < 3 ? <span aria-hidden>{MEDAL[i]}</span> : i + 1}
              <span className="sr-only">rank {i + 1}</span>
            </span>
            <span className="text-2xl" aria-hidden>
              {r.avatar}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-stone-900">
                {r.name}
                {r.isYou && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700">you</span>}
              </span>
              <span className="text-xs text-stone-500">🔥 {r.streak}-day streak</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="font-data block font-bold text-pine">{r.savedKg} kg</span>
              <span className="font-data block text-[11px] text-ink-3">{r.points.toLocaleString("en-IN")} pts</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
