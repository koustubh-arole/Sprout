"use client";

import { useMemo } from "react";
import { DECISIONS } from "@/lib/carbon/factors";
import { compareToAverageDay, kgByCategory, topCategory, totalKg } from "@/lib/carbon/calc";
import { creatureMood, getVariant, levelFor, MOOD_COPY } from "@/lib/creature";
import { getCollectible } from "@/lib/rewards";
import { daysSinceCare, useHydrateWorld, useWorld } from "@/lib/store";
import { Adopt } from "./Adopt";
import { Creature } from "./Creature";
import { DailyRitual } from "./DailyRitual";
import { Coach } from "./Coach";
import { CoachChat } from "./CoachChat";
import { SeedPack } from "./SeedPack";
import { DecisionMoment } from "./DecisionMoment";
import { FootprintSummary } from "./FootprintSummary";

export function Experience() {
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
  const choices = useWorld((s) => s.choices);
  const log = useWorld((s) => s.log);
  const reset = useWorld((s) => s.reset);

  const selected = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of choices) map[c.decisionId] = c.choiceId;
    return map;
  }, [choices]);

  const byCategory = useMemo(() => kgByCategory(choices), [choices]);
  const total = useMemo(() => totalKg(choices), [choices]);
  const top = useMemo(() => topCategory(choices), [choices]);
  const comparison = useMemo(() => compareToAverageDay(total), [total]);

  if (!hasHydrated) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-5xl animate-pulse" aria-hidden>
        🌱
      </div>
    );
  }

  if (!creatureName) return <Adopt />;

  const ds = daysSinceCare(lastCaredDate);
  const mood = creatureMood({ health, caredToday: ds === 0, daysSinceCare: ds });
  const tint = getVariant(variant).tint;
  const lvl = levelFor(points);

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* Left: the companion is the hero */}
        <div className="space-y-5 lg:sticky lg:top-24">
          <div className="clay relative overflow-hidden p-6">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(120% 90% at 50% 0%, #e3f3dc 0%, #eef6ff 55%, transparent 100%)" }}
            />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="font-display text-3xl font-bold text-emerald-950">{creatureName}</p>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">{lvl.level.title}</p>
              </div>
              <span className="pill bg-honey/20 text-amber-800">
                <span aria-hidden>🔥</span> <span className="font-data">{streakDays}</span>
              </span>
            </div>

            <div className="relative flex justify-center py-3">
              <Creature mood={mood} tint={tint} name={creatureName} reactionStamp={actions.length} size={280} />
            </div>

            <p className="relative text-center text-sm text-stone-600">
              {creatureName} {MOOD_COPY[mood]}
            </p>

            {collectibles.length > 0 && (
              <div className="relative mt-4 flex flex-wrap justify-center gap-1.5">
                {collectibles.slice(-14).map((id, i) => {
                  const c = getCollectible(id);
                  return (
                    <span key={`${id}-${i}`} className="text-xl" title={c?.name} aria-hidden>
                      {c?.emoji ?? "🌱"}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="clay-sunk rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
              <span>{lvl.level.title}</span>
              <span>{lvl.next ? `${lvl.pointsToNext} pts → ${lvl.next.title}` : "Max — Guardian"}</span>
            </div>
            <div className="growth-track mt-2" style={{ background: "#fff" }}>
              <div className="growth-fill motion-reduce:transition-none" style={{ width: `${Math.round(lvl.progress * 100)}%` }} />
            </div>
            <p className="mt-2 text-xs text-stone-500">
              <span aria-hidden>🍃</span> <span className="font-data">{savedKgTotal}</span> kg saved · <span className="font-data">{points.toLocaleString("en-IN")}</span> pts
            </p>
          </div>
        </div>

        {/* Right: the one daily action + companion voice */}
        <div className="space-y-6">
          <DailyRitual />
          <Coach totalKg={total} byCategory={byCategory} topCategory={top} choiceCount={choices.length} name={creatureName} />
          <CoachChat totalKg={total} byCategory={byCategory} topCategory={top} choiceCount={choices.length} name={creatureName} />
        </div>
      </div>

      {/* analytical sandbox — full width, tucked away */}
      <details className="clay mt-8 p-5">
        <summary className="cursor-pointer font-display text-lg font-semibold text-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
          Curious? Simulate a choice
        </summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-start">
          <DecisionMoment decisions={DECISIONS} onChoose={log} selected={selected} />
          <FootprintSummary
            totalKg={total}
            byCategory={byCategory}
            comparison={comparison}
            health={health}
            choiceCount={choices.length}
            onReset={reset}
            savedKg={savedKgTotal}
            streak={streakDays}
          />
        </div>
      </details>

      <SeedPack />
    </>
  );
}
