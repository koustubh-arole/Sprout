"use client";

import { useEffect, useState } from "react";
import { data, type Challenge } from "@/lib/data";
import { DemoChip } from "./DemoChip";

export function Challenges() {
  const [items, setItems] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    data.getChallenges().then((c) => {
      if (live) {
        setItems(c);
        setLoading(false);
      }
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <section aria-labelledby="ch-heading">
      <div className="flex flex-wrap items-center gap-3">
        <h1 id="ch-heading" className="font-display text-3xl font-extrabold text-canopy">
          Community challenges
        </h1>
        <DemoChip label="Demo challenges" title="Sample sponsor challenges — real campaigns arrive with the backend (Phase B)." />
      </div>
      <p className="mt-1 text-ink-2">Brands fund a goal; the community fills it with real actions.</p>

      <ul className="mt-5 space-y-4" aria-busy={loading}>
        {items.map((c) => {
          const pct = Math.min(100, Math.round((c.progressKg / c.goalKg) * 100));
          return (
            <li key={c.id} className="clay rounded-3xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold text-stone-900">
                    <span aria-hidden className="mr-1">
                      {c.sponsorEmoji}
                    </span>
                    {c.title}
                  </h2>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                    Sponsored by {c.sponsor}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-honey/15 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  ends in {c.endsInDays}d
                </span>
              </div>

              <p className="mt-2 text-sm text-stone-700">{c.blurb}</p>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs font-medium text-ink-3">
                  <span><span className="font-data">{c.progressKg}</span> kg saved together</span>
                  <span>goal <span className="font-data">{c.goalKg}</span> kg</span>
                </div>
                <div className="growth-track mt-1 h-3" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${c.title} progress`}>
                  <div className="growth-fill motion-reduce:transition-none" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-stone-500">👥 {c.participants.toLocaleString("en-IN")} taking part</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-800">🎁 {c.prize}</span>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 rounded-2xl border border-stone-200 bg-white/60 p-3 text-xs text-stone-500">
        Prizes are an occasional thank-you, not the point — your streak and the shared goal come first.
      </p>
    </section>
  );
}
