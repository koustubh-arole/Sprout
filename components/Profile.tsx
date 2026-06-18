"use client";

import { useState } from "react";
import { creatureMood, getVariant, levelFor } from "@/lib/creature";
import { COLLECTIBLES } from "@/lib/rewards";
import { villageLevel } from "@/lib/village";
import { daysSinceCare, earnedBadges, useHydrateWorld, useWorld } from "@/lib/store";
import { Creature } from "./Creature";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="clay rounded-2xl p-4 text-center">
      <p className="font-data text-3xl font-bold text-pine">{value}</p>
      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-ink-3">{label}</p>
      {sub && <p className="text-[11px] text-ink-3">{sub}</p>}
    </div>
  );
}

export function Profile() {
  useHydrateWorld();
  const hasHydrated = useWorld((s) => s.hasHydrated);
  const creatureName = useWorld((s) => s.creatureName);
  const variant = useWorld((s) => s.variant);
  const health = useWorld((s) => s.health);
  const points = useWorld((s) => s.points);
  const savedKgTotal = useWorld((s) => s.savedKgTotal);
  const streakDays = useWorld((s) => s.streakDays);
  const lastCaredDate = useWorld((s) => s.lastCaredDate);
  const collectibles = useWorld((s) => s.collectibles);
  const actions = useWorld((s) => s.actions);
  const sprigs = useWorld((s) => s.sprigs);
  const buildings = useWorld((s) => s.buildings);
  const villageName = useWorld((s) => s.villageName);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  if (!hasHydrated) return <div className="py-24 text-center text-4xl animate-pulse" aria-hidden>🌱</div>;
  if (!creatureName) return <p className="py-24 text-center text-stone-500">Adopt a companion on the World tab first. 🌱</p>;

  const ds = daysSinceCare(lastCaredDate);
  const mood = creatureMood({ health, caredToday: ds === 0, daysSinceCare: ds });
  const tint = getVariant(variant).tint;
  const lvl = levelFor(points);
  const badges = earnedBadges({ savedKgTotal, streakDays, actionCount: actions.length });
  const owned = new Set(collectibles);

  async function share() {
    const url = `${window.location.origin}/og?name=${encodeURIComponent(creatureName!)}&title=${encodeURIComponent(lvl.level.title)}&saved=${savedKgTotal}&streak=${streakDays}&health=${Math.round(health)}`;
    const text = `🌱 Meet ${creatureName}, my Sprout companion — a ${lvl.level.title} with ${savedKgTotal} kg CO₂ saved and a ${streakDays}-day streak!`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Sprout", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareMsg("Card link copied!");
    } catch {
      setShareMsg("Sharing was cancelled.");
    }
    setTimeout(() => setShareMsg(null), 2500);
  }

  return (
    <section aria-labelledby="pf-heading" className="space-y-6">
      <h1 id="pf-heading" className="sr-only">
        Your companion
      </h1>

      {/* hero */}
      <div className="clay flex flex-col items-center p-5">
        <Creature mood={mood} tint={tint} name={creatureName} reactionStamp={0} size={200} />
        <p className="mt-2 font-display text-2xl font-extrabold text-emerald-950">{creatureName}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{lvl.level.title}</p>
        {villageName && (
          <p className="mt-1 text-sm text-ink-2">
            Guardian of <span className="font-semibold text-canopy">{villageName}</span> · {villageLevel(buildings).tier.title}
          </p>
        )}
        <button type="button" onClick={share} className="clay-btn mt-4 px-5 py-2.5 text-sm font-bold">
          Share {creatureName} ✨
        </button>
        <span role="status" aria-live="polite" className="mt-2 h-4 text-xs text-stone-500">
          {shareMsg}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Sprigs" value={sprigs.toLocaleString("en-IN")} sub="🌿 balance" />
        <Stat label="CO₂ saved" value={`${savedKgTotal}`} sub="kg" />
        <Stat label="Points" value={points.toLocaleString("en-IN")} />
        <Stat label="Streak" value={`${streakDays}`} sub="days 🔥" />
      </div>

      {/* badges */}
      <div className="clay rounded-2xl p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Badges</h2>
        {badges.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Care for {creatureName} to earn your first badge. 🌱</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {badges.map((b) => (
              <li key={b.id} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
                <span aria-hidden>{b.emoji}</span>
                {b.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* collection */}
      <div className="clay rounded-2xl p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Collection · {owned.size}/{COLLECTIBLES.length}
        </h2>
        <ul className="mt-3 grid grid-cols-5 gap-2">
          {COLLECTIBLES.map((c) => {
            const have = owned.has(c.id);
            return (
              <li
                key={c.id}
                title={have ? c.name : "Locked — open more seed packs"}
                className={`flex aspect-square items-center justify-center rounded-xl text-2xl ${have ? "clay-sunk" : "bg-stone-100 opacity-40 grayscale"}`}
              >
                <span aria-hidden>{have ? c.emoji : "❔"}</span>
                <span className="sr-only">{have ? c.name : `${c.name}, locked`}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* history */}
      <div>
        <h2 className="font-display text-xl font-semibold text-emerald-900">Care history</h2>
        {actions.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Nothing yet — log a green action on the World tab.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {actions.map((a, i) => (
              <li key={`${a.at}-${i}`} className="clay flex items-center gap-3 p-3">
                {a.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.photo} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-stone-200 object-cover" />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-2xl" aria-hidden>
                    {a.emoji}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-stone-900">{a.label}</span>
                  <span className="text-xs text-emerald-700">{a.verdict}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="font-data block font-bold text-pine">−{a.savedKg} kg</span>
                  <span className="font-data block text-[11px] text-ink-3">+{a.points} pts</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
