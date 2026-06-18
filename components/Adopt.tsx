"use client";

import { useState } from "react";
import { VARIANTS } from "@/lib/creature";
import { useWorld } from "@/lib/store";
import { Creature } from "./Creature";

export function Adopt() {
  const adopt = useWorld((s) => s.adopt);
  const [variantId, setVariantId] = useState(VARIANTS[0].id as string);
  const [name, setName] = useState("");
  const [village, setVillage] = useState("");

  const variant = VARIANTS.find((v) => v.id === variantId) ?? VARIANTS[0];

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-10 text-center">
      <p className="font-display text-sm font-semibold uppercase tracking-wide text-pine">Welcome to Sprout</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold text-canopy">Found your village</h1>
      <p className="mt-2 text-ink-2">
        Build a village that heals as you live greener. Pick a guide to cheer you on — and name your new world.
      </p>

      <div className="mt-6 flex h-56 items-center justify-center">
        <Creature mood="content" tint={variant.tint} name={name || "Your companion"} size={210} />
      </div>

      {/* variant picker */}
      <div className="mt-4 flex justify-center gap-3" role="radiogroup" aria-label="Choose a companion">
        {VARIANTS.map((v) => (
          <button
            key={v.id}
            role="radio"
            aria-checked={variantId === v.id}
            onClick={() => setVariantId(v.id)}
            className={[
              "flex h-16 w-16 items-center justify-center rounded-2xl text-2xl transition",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600",
              variantId === v.id ? "clay scale-105" : "clay-sunk opacity-70 hover:opacity-100",
            ].join(" ")}
            style={{ color: v.tint }}
            title={v.name}
          >
            <span aria-hidden>{v.emoji}</span>
            <span className="sr-only">{v.name}</span>
          </button>
        ))}
      </div>

      <label className="mt-6 block w-full text-left">
        <span className="text-sm font-medium text-ink-2">Name your guide</span>
        <input
          type="text"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mango, Pixel, Bumble…"
          className="mt-1 w-full rounded-2xl border border-line bg-white px-4 py-3 text-center text-lg focus:border-leaf focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
        />
      </label>

      <label className="mt-3 block w-full text-left">
        <span className="text-sm font-medium text-ink-2">Name your village</span>
        <input
          type="text"
          value={village}
          maxLength={24}
          onChange={(e) => setVillage(e.target.value)}
          placeholder="e.g. Greenhaven, Aravali, Sunnydale…"
          className="mt-1 w-full rounded-2xl border border-line bg-white px-4 py-3 text-center text-lg focus:border-leaf focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
        />
      </label>

      <button
        type="button"
        onClick={() => adopt(name, variantId, village)}
        disabled={!name.trim()}
        className="clay-btn mt-6 w-full px-6 py-4 text-lg font-bold disabled:cursor-not-allowed disabled:opacity-50"
      >
        Start {village.trim() || "my village"} 🌱
      </button>
    </div>
  );
}
