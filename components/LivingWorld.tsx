"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion, type Transition } from "framer-motion";
import { worldStage } from "@/lib/world";
import type { LastImpact } from "@/lib/store";

// Fixed positions (no Math.random) so SSR and client markup match.
const FLOWER_SPOTS = [
  { x: 70, y: 300 },
  { x: 120, y: 312 },
  { x: 285, y: 312 },
  { x: 335, y: 300 },
  { x: 180, y: 322 },
  { x: 235, y: 320 },
];
const FIREFLIES = [
  { x: 90, y: 150, d: 5 },
  { x: 150, y: 110, d: 7 },
  { x: 250, y: 130, d: 6 },
  { x: 310, y: 100, d: 8 },
  { x: 200, y: 90, d: 6.5 },
];
const BURST = [
  { dx: -40, dy: -50 },
  { dx: 40, dy: -55 },
  { dx: -55, dy: -20 },
  { dx: 55, dy: -25 },
  { dx: 0, dy: -65 },
  { dx: -20, dy: -40 },
  { dx: 20, dy: -45 },
];

export function LivingWorld({ health, lastImpact }: { health: number; lastImpact: LastImpact }) {
  const reduce = useReducedMotion();
  const v = clamp01(health / 100);
  const stage = worldStage(health);
  const t: Transition = reduce ? { duration: 0 } : { type: "spring", stiffness: 55, damping: 16 };

  const [soundOn, setSoundOn] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [burstGood, setBurstGood] = useState(true);
  const controls = useAnimationControls();
  const audioRef = useRef<AudioContext | null>(null);
  const lastAtRef = useRef<number>(0);

  // React to each new choice: bloom-burst on a good one, wilt-shudder on a bad one.
  useEffect(() => {
    if (!lastImpact) return;
    const stamp = lastImpact.kg + lastImpact.delta; // changes per impact
    if (stamp === lastAtRef.current) return;
    lastAtRef.current = stamp;

    const good = lastImpact.delta >= 0;
    setBurstGood(good);
    setBurstKey((k) => k + 1);

    if (!reduce) {
      if (good) controls.start({ scale: [1, 1.015, 1], transition: { duration: 0.5 } });
      else controls.start({ x: [0, -7, 7, -5, 5, 0], transition: { duration: 0.4 } });
    }
    if (soundOn) chime(audioRef, good);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastImpact]);

  const skyTop = lerpHex("#9aa7ad", "#7ec8ff", v);
  const skyBottom = lerpHex("#cdd0c7", "#dff1ff", v);
  const ground = lerpHex("#bb9c69", "#6fbf5a", v);
  const hillBack = lerpHex("#a99366", "#5aa84a", v);
  const canopy = lerpHex("#b06a2e", "#3f9d34", v);
  const sun = lerpHex("#ded7b6", "#ffe27a", v);
  const leafOpacity = 0.32 + v * 0.68;
  const mainR = 40 + v * 26;
  const sideR = 28 + v * 18;
  const flowerCount = v > 0.45 ? Math.round(((v - 0.45) / 0.55) * 6) : 0;
  const fireflyOpacity = v > 0.6 ? (v - 0.6) / 0.4 : 0;
  const smog = (1 - v) * 0.5; // brown haze thickens as the world wilts
  const birdsOpacity = v > 0.7 ? 1 : 0;

  const liveText =
    `Your world is ${stage.label.toLowerCase()}. Health ${Math.round(health)} out of 100.` +
    (lastImpact
      ? ` Your last choice, ${lastImpact.label}, ${lastImpact.delta >= 0 ? "healed" : "wilted"} it by ${Math.abs(lastImpact.delta)} ${Math.abs(lastImpact.delta) === 1 ? "point" : "points"}.`
      : "");

  return (
    <figure className="m-0">
      <div className="relative overflow-hidden rounded-3xl border border-black/5 shadow-sm">
        <motion.svg viewBox="0 0 400 340" role="img" aria-label={liveText} className="w-full" animate={controls}>
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <motion.stop offset="0%" animate={{ stopColor: skyTop }} transition={t} />
              <motion.stop offset="100%" animate={{ stopColor: skyBottom }} transition={t} />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="400" height="340" fill="url(#sky)" />
          <motion.circle cx="332" cy="66" r="32" animate={{ fill: sun, opacity: 0.4 + v * 0.6 }} transition={t} />

          {/* drifting clouds */}
          {!reduce && (
            <motion.g
              fill="#ffffff"
              opacity={0.5 + v * 0.4}
              animate={{ x: [0, 30, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            >
              <ellipse cx="90" cy="60" rx="34" ry="14" />
              <ellipse cx="120" cy="52" rx="24" ry="12" />
            </motion.g>
          )}

          {/* back hill + ground */}
          <motion.path d="M0 250 Q120 210 240 240 T400 232 L400 340 L0 340 Z" animate={{ fill: hillBack }} transition={t} />
          <motion.path d="M0 282 Q200 250 400 282 L400 340 L0 340 Z" animate={{ fill: ground }} transition={t} />

          {/* tree */}
          <rect x="189" y="196" width="22" height="96" rx="6" fill="#6b4f2a" />
          <motion.circle cx="200" cy="168" animate={{ r: mainR, fill: canopy, opacity: leafOpacity }} transition={t} />
          <motion.circle cx="160" cy="196" animate={{ r: sideR, fill: canopy, opacity: leafOpacity }} transition={t} />
          <motion.circle cx="240" cy="196" animate={{ r: sideR, fill: canopy, opacity: leafOpacity }} transition={t} />

          {/* flowers bloom as the world recovers */}
          {FLOWER_SPOTS.map((s, i) => (
            <motion.circle key={i} cx={s.x} cy={s.y} r="5" fill="#ff8fb3" animate={{ opacity: i < flowerCount ? 1 : 0 }} transition={t} />
          ))}

          {/* fireflies — float when the world is healthy */}
          {!reduce &&
            FIREFLIES.map((f, i) => (
              <motion.circle
                key={i}
                cx={f.x}
                r="2.5"
                fill="#fff7c2"
                animate={{ cy: [f.y, f.y - 14, f.y], opacity: [0, fireflyOpacity, 0] }}
                transition={{ duration: f.d, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}

          {/* birds — only when thriving */}
          <motion.g animate={{ opacity: birdsOpacity }} transition={t} stroke="#3a3a3a" strokeWidth="2" fill="none">
            <path d="M58 78 q8 -8 16 0 q8 -8 16 0" />
            <path d="M104 58 q6 -6 12 0 q6 -6 12 0" />
          </motion.g>

          {/* smog haze overlay — grows as health falls */}
          <motion.rect x="0" y="0" width="400" height="340" animate={{ opacity: smog }} transition={t} fill="#6b5a3e" />

          {/* burst particles on each choice */}
          <AnimatePresence>
            {burstKey > 0 && (
              <g key={burstKey}>
                {BURST.map((b, i) => (
                  <motion.circle
                    key={i}
                    cx={200}
                    cy={180}
                    r={burstGood ? 4 : 3}
                    fill={burstGood ? "#ff8fb3" : "#8a7a55"}
                    initial={{ opacity: 0.9, x: 0, y: 0 }}
                    animate={{ opacity: 0, x: b.dx, y: burstGood ? b.dy : Math.abs(b.dy) }}
                    transition={{ duration: reduce ? 0 : 0.9, ease: "easeOut" }}
                  />
                ))}
              </g>
            )}
          </AnimatePresence>
        </motion.svg>

        {/* sound toggle */}
        <button
          type="button"
          onClick={() => setSoundOn((s) => !s)}
          aria-pressed={soundOn}
          aria-label={soundOn ? "Turn world sound off" : "Turn world sound on"}
          className="absolute right-2 top-2 rounded-full bg-white/80 px-2 py-1 text-sm shadow-sm backdrop-blur transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <span aria-hidden>{soundOn ? "🔊" : "🔈"}</span>
        </button>
      </div>

      <figcaption className="mt-3 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-lg font-semibold text-emerald-900 font-display">
          <span aria-hidden>{stage.emoji}</span>
          {stage.label}
        </span>
        <span className="text-sm text-stone-600">{stage.blurb}</span>
      </figcaption>

      {/* visible, non-color health readout */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs font-medium text-stone-600">
          <span>World health</span>
          <span>{Math.round(health)} / 100</span>
        </div>
        <div
          className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-stone-200"
          role="progressbar"
          aria-valuenow={Math.round(health)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="World health"
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${Math.round(health)}%` }}
          />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {liveText}
      </p>
    </figure>
  );
}

/** A short WebAudio tone — no audio assets needed. */
function chime(ref: React.MutableRefObject<AudioContext | null>, good: boolean) {
  try {
    type WithWebkit = typeof window & { webkitAudioContext?: typeof AudioContext };
    const Ctx = window.AudioContext ?? (window as WithWebkit).webkitAudioContext;
    if (!Ctx) return;
    const ctx = ref.current ?? (ref.current = new Ctx());
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = good ? 660 : 220;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    /* sound is best-effort */
  }
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function lerpHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * clamp01(t));
  return `rgb(${m(ca.r, cb.r)}, ${m(ca.g, cb.g)}, ${m(ca.b, cb.b)})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
