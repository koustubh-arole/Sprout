"use client";

import { METER_META, type Meters as MetersT, type MeterKey } from "@/lib/village";

/** Colour per planetary meter (severity tone — higher value = worse). */
const METER_TONE: Record<MeterKey, { from: string; to: string; text: string }> = {
  pollution: { from: "#f0a93a", to: "#e26d4f", text: "#9a3a22" },
  ozone: { from: "#8b6cf0", to: "#5f7bf0", text: "#3b3a8a" },
  disaster: { from: "#46c0e2", to: "#2f86c9", text: "#1f4f7a" },
};

export function Meters({ meters, health }: { meters: MetersT; health: number }) {
  return (
    <section aria-labelledby="meters-heading" className="space-y-3">
      <h2 id="meters-heading" className="sr-only">
        Planetary health meters
      </h2>

      {/* Headline: Village Health (positive, growth-coloured) */}
      <div className="clay relative overflow-hidden p-4">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: "radial-gradient(120% 120% at 10% 0%, #e3f3dc, transparent 60%)" }}
        />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">Village Health</p>
            <p className="font-data text-3xl font-bold text-pine">
              {Math.round(health)}
              <span className="text-base text-ink-3">/100</span>
            </p>
          </div>
          <span className="text-4xl" aria-hidden>
            {health >= 75 ? "🌳" : health >= 45 ? "🌿" : "🍂"}
          </span>
        </div>
        <div className="growth-track relative mt-2" role="progressbar" aria-valuenow={Math.round(health)} aria-valuemin={0} aria-valuemax={100} aria-label="Village health">
          <div className="growth-fill motion-reduce:transition-none" style={{ width: `${Math.round(health)}%` }} />
        </div>
      </div>

      {/* The three threats — lower is better */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(Object.keys(METER_META) as MeterKey[]).map((key) => (
          <MeterCard key={key} k={key} value={meters[key]} />
        ))}
      </div>
    </section>
  );
}

function MeterCard({ k, value }: { k: MeterKey; value: number }) {
  const meta = METER_META[k];
  const tone = METER_TONE[k];
  const v = Math.round(value);
  const status = v <= 25 ? meta.good : v <= 55 ? "Improving" : "Critical";
  return (
    <div className="clay p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-canopy">
          <span aria-hidden>{meta.emoji}</span> {meta.label}
        </span>
        <span className="font-data text-sm font-bold" style={{ color: tone.text }}>
          {v}
        </span>
      </div>
      <div
        className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-mist"
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${meta.label} (lower is better)`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${v}%`, background: `linear-gradient(90deg, ${tone.from}, ${tone.to})` }}
        />
      </div>
      <p className="mt-1 text-[11px] font-medium text-ink-3">
        {status} <span className="text-ink-3/70">· lower is better</span>
      </p>
    </div>
  );
}
