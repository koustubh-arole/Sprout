"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import type { Mood } from "@/lib/creature";

type CreatureProps = {
  mood: Mood;
  tint: string;
  name: string;
  /** Bump this number to play a happy "squish" reaction (e.g. on a logged action). */
  reactionStamp?: number;
  size?: number;
};

/**
 * A soft-clay companion rendered entirely from layered SVG + gradients (no 3D
 * engine, no art assets). Its face and posture change with mood; it bobs idly,
 * blinks, and squishes with delight when you care for it.
 */
export function Creature({ mood, tint, name, reactionStamp = 0, size = 240 }: CreatureProps) {
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (reduce) return;
    controls.start({
      scale: [1, 1.14, 0.93, 1.04, 1],
      rotate: [0, -3, 3, 0],
      transition: { duration: 0.7, ease: "easeOut" },
    });
  }, [reactionStamp, reduce, controls]);

  const droop = mood === "droopy";
  const sleepy = mood === "sleepy";
  const happy = mood === "happy";
  const dark = shade(tint, -28);
  const light = shade(tint, 34);

  // Idle motion: a gentle bob, slower & lower when the creature is down.
  const bob = reduce ? {} : { y: droop ? [0, -1.5, 0] : sleepy ? [0, -2, 0] : [0, -7, 0] };
  const bobT = { duration: droop ? 5 : sleepy ? 4.5 : 3, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <motion.svg
      viewBox="0 0 200 210"
      width={size}
      height={size}
      role="img"
      aria-label={`${name} looks ${mood}`}
      animate={controls}
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id="body" cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor={light} />
          <stop offset="65%" stopColor={tint} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
        <radialGradient id="cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff9bb0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ff9bb0" stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor={dark} floodOpacity="0.35" />
        </filter>
      </defs>

      {/* shadow on the ground */}
      <ellipse cx="100" cy="196" rx={droop ? 52 : 46} ry="9" fill="#2b3a2e" opacity="0.16" />

      <motion.g animate={bob} transition={bobT} style={{ transformOrigin: "100px 150px" }}>
        {/* sprout on top — wilts when droopy */}
        <g transform={`translate(100 46) rotate(${droop ? 16 : 0})`}>
          <rect x="-3" y="-2" width="6" height="26" rx="3" fill={dark} />
          <ellipse cx="-13" cy="2" rx="14" ry="8" fill={tint} transform={`rotate(${droop ? 25 : -25} -13 2)`} />
          <ellipse cx="13" cy="-2" rx="14" ry="8" fill={light} transform={`rotate(${droop ? -10 : 25} 13 -2)`} />
        </g>

        {/* body blob */}
        <path
          d="M100 64 C146 64 168 96 168 134 C168 174 140 196 100 196 C60 196 32 174 32 134 C32 96 54 64 100 64 Z"
          fill="url(#body)"
          filter="url(#soft)"
        />
        {/* belly highlight */}
        <ellipse cx="100" cy="150" rx="34" ry="28" fill={light} opacity="0.35" />

        {/* cheeks */}
        {(happy || mood === "content") && (
          <>
            <ellipse cx="68" cy="142" rx="13" ry="9" fill="url(#cheek)" />
            <ellipse cx="132" cy="142" rx="13" ry="9" fill="url(#cheek)" />
          </>
        )}

        {/* eyes */}
        <Eyes mood={mood} />

        {/* mouth */}
        <Mouth mood={mood} />
      </motion.g>

      {/* mood decorations */}
      {happy && !reduce && (
        <g>
          {[
            { x: 40, y: 70 },
            { x: 162, y: 78 },
            { x: 150, y: 50 },
          ].map((s, i) => (
            <motion.text
              key={i}
              x={s.x}
              y={s.y}
              fontSize="16"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0], scale: [0.6, 1, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.4 }}
            >
              ✨
            </motion.text>
          ))}
        </g>
      )}
      {sleepy && (
        <text x="150" y="70" fontSize="18" fill={dark} opacity="0.7">
          z
        </text>
      )}
      {mood === "waiting" && (
        <text x="150" y="72" fontSize="20" fill={dark} opacity="0.7">
          ?
        </text>
      )}
    </motion.svg>
  );
}

function Eyes({ mood }: { mood: Mood }) {
  if (mood === "happy") {
    return (
      <g stroke="#2b3a2e" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M74 124 q8 -9 16 0" />
        <path d="M110 124 q8 -9 16 0" />
      </g>
    );
  }
  if (mood === "sleepy") {
    return (
      <g stroke="#2b3a2e" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M74 126 q8 6 16 0" />
        <path d="M110 126 q8 6 16 0" />
      </g>
    );
  }
  if (mood === "droopy") {
    return (
      <g fill="#2b3a2e">
        <circle cx="82" cy="128" r="4.5" />
        <circle cx="118" cy="128" r="4.5" />
        {/* sad brows */}
        <g stroke="#2b3a2e" strokeWidth="3" strokeLinecap="round">
          <path d="M74 118 l12 5" />
          <path d="M126 118 l-12 5" />
        </g>
      </g>
    );
  }
  // content / waiting — round eyes with a highlight
  return (
    <g>
      <circle cx="82" cy="126" r="7" fill="#2b3a2e" />
      <circle cx="118" cy="126" r="7" fill="#2b3a2e" />
      <circle cx="84.5" cy="123.5" r="2.2" fill="#fff" />
      <circle cx="120.5" cy="123.5" r="2.2" fill="#fff" />
    </g>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  const stroke = "#2b3a2e";
  if (mood === "happy") return <path d="M86 146 q14 16 28 0" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />;
  if (mood === "content") return <path d="M90 148 q10 8 20 0" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />;
  if (mood === "droopy") return <path d="M88 152 q12 -8 24 0" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />;
  if (mood === "sleepy") return <ellipse cx="100" cy="150" rx="5" ry="6" fill={stroke} />;
  return <path d="M92 150 h16" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />; // waiting: flat
}

/** Lighten/darken a hex color by amount (-255..255). */
function shade(hex: string, amt: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  const clamp = (x: number) => Math.max(0, Math.min(255, x));
  const r = clamp((n >> 16) + amt);
  const g = clamp(((n >> 8) & 0xff) + amt);
  const b = clamp((n & 0xff) + amt);
  return `rgb(${r}, ${g}, ${b})`;
}
