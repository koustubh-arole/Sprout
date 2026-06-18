"use client";

import { BUILDINGS, costFor, type Building, type BuildingCategory, type PerLevelEffect } from "@/lib/village";
import { useWorld } from "@/lib/store";

const CATEGORY_TINT: Record<BuildingCategory, string> = {
  energy: "bg-sun/15 text-amber-900",
  transport: "bg-sky-100 text-sky-800",
  nature: "bg-leaf/15 text-pine",
  waste: "bg-emerald-100 text-emerald-800",
  water: "bg-cyan-100 text-cyan-800",
};

function effectLine(p: PerLevelEffect): string {
  const parts: string[] = [];
  if (p.pollution) parts.push(`🏭 −${p.pollution}`);
  if (p.ozone) parts.push(`🛡️ −${p.ozone}`);
  if (p.disaster) parts.push(`🌊 −${p.disaster}`);
  if (p.sprigsPerDay) parts.push(`🌿 +${p.sprigsPerDay}/day`);
  return parts.join("  ");
}

export function BuildMenu() {
  const sprigs = useWorld((s) => s.sprigs);
  const buildings = useWorld((s) => s.buildings);
  const build = useWorld((s) => s.build);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-canopy">Build your village</h3>
        <span className="pill bg-leaf/15 text-pine">
          <span aria-hidden>🌿</span> <span className="font-data font-bold">{sprigs.toLocaleString("en-IN")}</span> Sprigs
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BUILDINGS.map((b) => (
          <BuildCard key={b.id} b={b} level={buildings[b.id] ?? 0} sprigs={sprigs} onBuild={() => build(b.id)} />
        ))}
      </ul>
    </div>
  );
}

function BuildCard({ b, level, sprigs, onBuild }: { b: Building; level: number; sprigs: number; onBuild: () => void }) {
  const maxed = level >= b.maxLevel;
  const cost = maxed ? 0 : costFor(b, level);
  const afford = !maxed && sprigs >= cost;
  const shortfall = cost - sprigs;

  return (
    <li className="clay flex flex-col gap-2 p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mist text-2xl" aria-hidden>
          {b.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-canopy">{b.name}</h4>
            <span className={`pill text-[10px] uppercase tracking-wide ${CATEGORY_TINT[b.category]}`}>{b.category}</span>
          </div>
          <p className="text-xs text-ink-2">{b.blurb}</p>
        </div>
      </div>

      <p className="font-data text-xs text-ink-2">{effectLine(b.perLevel)} <span className="text-ink-3">/ level</span></p>

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        {/* level pips */}
        <span className="flex items-center gap-1" aria-label={`Level ${level} of ${b.maxLevel}`}>
          {Array.from({ length: b.maxLevel }).map((_, i) => (
            <span key={i} className={`h-2 w-5 rounded-full ${i < level ? "bg-leaf" : "bg-mist"}`} aria-hidden />
          ))}
        </span>

        <button
          type="button"
          onClick={onBuild}
          disabled={!afford}
          aria-label={
            maxed
              ? `${b.name} fully upgraded`
              : afford
                ? `${level === 0 ? "Build" : "Upgrade"} ${b.name} for ${cost} Sprigs`
                : `Need ${shortfall} more Sprigs to ${level === 0 ? "build" : "upgrade"} ${b.name}`
          }
          className={`btn text-sm ${afford ? "btn-primary" : "btn-soft"}`}
        >
          {maxed ? (
            "✓ Maxed"
          ) : afford ? (
            <>
              {level === 0 ? "Build" : "Upgrade"} · <span className="font-data">🌿{cost}</span>
            </>
          ) : (
            <span className="font-data text-xs">Need 🌿{shortfall}</span>
          )}
        </button>
      </div>
    </li>
  );
}
