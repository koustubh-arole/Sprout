"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BUILDINGS, villageLevel, type Meters } from "@/lib/village";

const TILE_W = 92;
const TILE_H = 48;
const ORIGIN_X = 240;
const ORIGIN_Y = 92;
const COLS = 4;
const ROWS = 3;

function iso(col: number, row: number) {
  return {
    x: ORIGIN_X + (col - row) * (TILE_W / 2),
    y: ORIGIN_Y + (col + row) * (TILE_H / 2),
  };
}

function diamond(cx: number, cy: number, scale = 1) {
  const hw = (TILE_W / 2) * scale;
  const hh = (TILE_H / 2) * scale;
  return `M${cx} ${cy - hh} L${cx + hw} ${cy} L${cx} ${cy + hh} L${cx - hw} ${cy} Z`;
}

export function Village({
  meters,
  buildings,
  health,
  villageName,
}: {
  meters: Meters;
  buildings: Record<string, number>;
  health: number;
  villageName: string;
}) {
  const reduce = useReducedMotion();
  const pollution = meters.pollution / 100;
  const lvl = villageLevel(buildings);
  const builtCount = Object.values(buildings).filter((l) => l > 0).length;

  const skyTop = lerpHex("#8fd0ff", "#b3a78d", pollution);
  const skyBottom = lerpHex("#dff1ff", "#cdbfa6", pollution);
  const grass = lerpHex("#8d9a5b", "#6cc06a", health / 100);
  const grassEdge = lerpHex("#76823f", "#4f9e3a", health / 100);
  const smog = pollution * 0.4;

  const placed = new Map<string, { id: string; emoji: string; level: number }>();
  for (const b of BUILDINGS) {
    const level = buildings[b.id] ?? 0;
    if (level > 0) placed.set(`${b.slot.col},${b.slot.row}`, { id: b.id, emoji: b.emoji, level });
  }

  // back-to-front draw order
  const tiles: { col: number; row: number }[] = [];
  for (let row = 0; row < ROWS; row++) for (let col = 0; col < COLS; col++) tiles.push({ col, row });
  tiles.sort((a, b) => a.col + a.row - (b.col + b.row));

  const summary = `${villageName}: a ${lvl.tier.title}. Village health ${Math.round(health)} of 100. ${builtCount} of ${BUILDINGS.length} structures built. Air pollution ${Math.round(meters.pollution)}, ozone damage ${Math.round(meters.ozone)}, disaster risk ${Math.round(meters.disaster)} out of 100.`;

  return (
    <figure className="m-0">
      <div className="relative overflow-hidden rounded-3xl border border-black/5 shadow-sm">
        <svg viewBox="0 0 480 340" role="img" aria-label={summary} className="w-full">
          <defs>
            <linearGradient id="vsky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={skyTop} />
              <stop offset="100%" stopColor={skyBottom} />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="480" height="340" fill="url(#vsky)" />

          {/* sun */}
          <circle cx="410" cy="60" r="30" fill={lerpHex("#ffe27a", "#d9cdae", pollution)} opacity={0.9 - pollution * 0.4} />

          {/* drifting clouds */}
          {!reduce && (
            <motion.g fill="#ffffff" opacity={0.55} animate={{ x: [0, 26, 0] }} transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}>
              <ellipse cx="90" cy="56" rx="32" ry="13" />
              <ellipse cx="118" cy="48" rx="22" ry="11" />
            </motion.g>
          )}

          {/* ground platform */}
          {tiles.map(({ col, row }) => {
            const { x, y } = iso(col, row);
            const here = placed.get(`${col},${row}`);
            return (
              <g key={`tile-${col}-${row}`}>
                {/* soil depth */}
                <path d={diamond(x, y + 8)} fill={grassEdge} opacity={0.9} />
                <path d={diamond(x, y)} fill={grass} stroke={grassEdge} strokeWidth={1} />
                {!here && <path d={diamond(x, y, 0.82)} fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeDasharray="3 4" />}
              </g>
            );
          })}

          {/* buildings, back-to-front */}
          {tiles.map(({ col, row }) => {
            const here = placed.get(`${col},${row}`);
            if (!here) return null;
            const { x, y } = iso(col, row);
            const size = 26 + here.level * 6;
            return (
              <motion.g
                key={`b-${here.id}-${here.level}`}
                initial={reduce ? false : { opacity: 0, y: y - 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
              >
                <ellipse cx={x} cy={y + 4} rx={22} ry={9} fill="#000000" opacity={0.12} />
                <text x={x} y={y - 2} textAnchor="middle" fontSize={size} role="presentation">
                  {here.emoji}
                </text>
                {/* level pips */}
                {Array.from({ length: here.level }).map((_, i) => (
                  <circle key={i} cx={x - 8 + i * 8} cy={y + 14} r={2.6} fill="#0b6e45" stroke="#fff" strokeWidth={0.8} />
                ))}
              </motion.g>
            );
          })}

          {/* smog overlay grows with pollution */}
          <rect x="0" y="0" width="480" height="340" fill="#6b5a3e" opacity={smog} />
        </svg>

        {/* corner badge */}
        <div className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-pine shadow-sm backdrop-blur">
          {lvl.tier.title}
        </div>
      </div>

      <figcaption className="mt-3 flex items-center justify-between gap-3">
        <span className="font-display text-lg font-bold text-canopy">{villageName}</span>
        <span className="text-xs text-ink-3">
          <span className="font-data">{builtCount}</span>/{BUILDINGS.length} built
          {lvl.next && <> · <span className="font-data">{lvl.levelsToNext}</span> to {lvl.next.title}</>}
        </span>
      </figcaption>

      <p className="sr-only" aria-live="polite">
        {summary}
      </p>
    </figure>
  );
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}
function lerpHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * clamp01(t));
  return `rgb(${m(ca.r, cb.r)}, ${m(ca.g, cb.g)}, ${m(ca.b, cb.b)})`;
}
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}
