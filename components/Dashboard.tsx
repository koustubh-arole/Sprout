"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { daysSinceCare, useHydrateWorld, useWorld } from "@/lib/store";
import { passiveSprigsPerDay, villageHealth, villageLevel } from "@/lib/village";
import { creatureMood, getVariant, MOOD_COPY } from "@/lib/creature";
import { SEED_POSTS, readingMinutes, type BlogPost } from "@/lib/blog";
import { DECISIONS } from "@/lib/carbon/factors";
import { compareToAverageDay, kgByCategory, topCategory, totalKg } from "@/lib/carbon/calc";
import { Adopt } from "./Adopt";
import { Creature } from "./Creature";
import { Village } from "./Village";
import { Meters } from "./Meters";
import { BuildMenu } from "./BuildMenu";
import { DailyRitual } from "./DailyRitual";
import { DecisionMoment } from "./DecisionMoment";
import { FootprintSummary } from "./FootprintSummary";
import { Coach } from "./Coach";
import { Walkthrough } from "./Walkthrough";

export function Dashboard() {
  useHydrateWorld();
  const hasHydrated = useWorld((s) => s.hasHydrated);
  const creatureName = useWorld((s) => s.creatureName);
  const villageName = useWorld((s) => s.villageName);
  const tourDone = useWorld((s) => s.tourDone);
  const variant = useWorld((s) => s.variant);
  const health = useWorld((s) => s.health);
  const sprigs = useWorld((s) => s.sprigs);
  const meters = useWorld((s) => s.meters);
  const buildings = useWorld((s) => s.buildings);
  const streakDays = useWorld((s) => s.streakDays);
  const lastCaredDate = useWorld((s) => s.lastCaredDate);
  const actions = useWorld((s) => s.actions);
  const userPosts = useWorld((s) => s.userPosts);
  const collectYield = useWorld((s) => s.collectYield);
  const choices = useWorld((s) => s.choices);
  const savedKgTotal = useWorld((s) => s.savedKgTotal);
  const log = useWorld((s) => s.log);
  const reset = useWorld((s) => s.reset);

  const [yieldMsg, setYieldMsg] = useState<string | null>(null);
  const [showBuild, setShowBuild] = useState(false);
  const collectedRef = useRef(false);

  // Clash-style "welcome back": collect Sprigs that accrued while away (once).
  useEffect(() => {
    if (!hasHydrated || collectedRef.current) return;
    collectedRef.current = true;
    const got = collectYield();
    if (got > 0) {
      setYieldMsg(`Your village produced 🌿${got} Sprigs while you were away!`);
      const t = setTimeout(() => setYieldMsg(null), 6000);
      return () => clearTimeout(t);
    }
  }, [hasHydrated, collectYield]);

  const vHealth = useMemo(() => villageHealth(meters), [meters]);
  const lvl = useMemo(() => villageLevel(buildings), [buildings]);
  const perDay = useMemo(() => passiveSprigsPerDay(buildings), [buildings]);
  const monthSprigs = useMemo(() => {
    const now = new Date();
    return actions
      .filter((a) => {
        const d = new Date(a.at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, a) => s + a.points, 0);
  }, [actions]);

  const posts = useMemo(
    () => [...userPosts, ...SEED_POSTS].sort((a, b) => b.at - a.at).slice(0, 3),
    [userPosts],
  );

  // Point-of-decision sandbox (the nudge lever)
  const selected = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of choices) m[c.decisionId] = c.choiceId;
    return m;
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
  const tip = villageTip(meters);

  return (
    <div className="space-y-6">
      {!tourDone && <Walkthrough villageName={villageName ?? "your village"} guideName={creatureName} />}

      {/* welcome-back yield */}
      {yieldMsg && (
        <div role="status" className="clay flex items-center gap-3 border-l-4 border-leaf p-3 text-sm font-medium text-pine">
          <span className="text-xl" aria-hidden>🎁</span> {yieldMsg}
        </div>
      )}

      {/* stat bar */}
      <section aria-label="Your village at a glance" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat emoji="🌿" label="Sprigs" value={sprigs.toLocaleString("en-IN")} sub={perDay > 0 ? `+${perDay}/day` : "earn by acting"} tone="from-leaf/20 to-sprout/10" />
        <Stat emoji="📅" label="This month" value={monthSprigs.toLocaleString("en-IN")} sub="Sprigs earned" tone="from-sun/20 to-honey/10" />
        <Stat emoji="💚" label="Village Health" value={`${vHealth}`} sub={lvl.tier.title} tone="from-emerald-200/50 to-leaf/10" />
        <Stat emoji="🔥" label="Streak" value={`${streakDays}`} sub={streakDays === 1 ? "day" : "days"} tone="from-orange-200/50 to-sun/10" />
      </section>

      {/* planetary meters */}
      <Meters meters={meters} health={vHealth} />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* hero: the living village */}
        <section aria-labelledby="village-heading" className="space-y-3 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 id="village-heading" className="font-display text-xl font-bold text-canopy">
              Your world
            </h2>
            <button
              type="button"
              onClick={() => setShowBuild((b) => !b)}
              className="btn btn-primary text-sm"
              aria-expanded={showBuild}
            >
              <span aria-hidden>🏗️</span> {showBuild ? "Close builder" : "Visit & build"}
            </button>
          </div>

          <Village meters={meters} buildings={buildings} health={health} villageName={villageName ?? "Your village"} />

          {showBuild ? (
            <div className="clay p-4">
              <BuildMenu />
            </div>
          ) : (
            <div className="clay flex items-center gap-3 p-4">
              <span className="text-2xl" aria-hidden>💡</span>
              <p className="text-sm text-ink-2">{tip}</p>
            </div>
          )}
        </section>

        {/* right rail: act + guide + read */}
        <div className="space-y-6">
          <DailyRitual />

          {/* mascot guide */}
          <section className="clay flex items-center gap-4 p-4" aria-label="Your guide">
            <div className="shrink-0">
              <Creature mood={mood} tint={tint} name={creatureName} reactionStamp={actions.length} size={92} />
            </div>
            <div>
              <p className="font-display font-bold text-canopy">{creatureName}</p>
              <p className="text-sm text-ink-2">{MOOD_COPY[mood]}</p>
            </div>
          </section>

          {/* blog teaser */}
          <section aria-labelledby="read-heading" className="clay p-4">
            <div className="flex items-center justify-between">
              <h2 id="read-heading" className="font-display text-lg font-bold text-canopy">
                From the blog
              </h2>
              <Link href="/blog" className="text-xs font-medium text-pine underline-offset-2 hover:underline">
                See all →
              </Link>
            </div>
            <ul className="mt-3 space-y-2">
              {posts.map((p) => (
                <BlogTeaser key={p.id} post={p} />
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* point-of-decision sandbox — the nudge lever */}
      <details className="clay p-5">
        <summary className="cursor-pointer font-display text-lg font-semibold text-canopy focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf">
          Curious? Simulate a choice
        </summary>
        <p className="mt-1 text-sm text-ink-2">See the carbon cost before you choose — then watch it ripple into your village.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-start">
          <DecisionMoment decisions={DECISIONS} onChoose={log} selected={selected} />
          <div className="space-y-4">
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
            <Coach totalKg={total} byCategory={byCategory} topCategory={top} choiceCount={choices.length} name={creatureName} />
          </div>
        </div>
      </details>

      <footer className="border-t border-black/5 pt-5 text-center text-xs text-ink-3">
        Built for behaviour and hope, not guilt.{" "}
        <Link href="/methodology" className="font-medium text-pine underline-offset-2 hover:underline">
          How the numbers &amp; meters work →
        </Link>
      </footer>
    </div>
  );
}

function Stat({ emoji, label, value, sub, tone }: { emoji: string; label: string; value: string; sub?: string; tone: string }) {
  return (
    <div className={`clay relative overflow-hidden p-3`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tone}`} />
      <div className="relative">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3">
          <span aria-hidden>{emoji}</span> {label}
        </p>
        <p className="font-data text-2xl font-bold text-canopy">{value}</p>
        {sub && <p className="text-[11px] text-ink-3">{sub}</p>}
      </div>
    </div>
  );
}

function BlogTeaser({ post }: { post: BlogPost }) {
  return (
    <li>
      <Link
        href="/blog"
        className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 transition hover:border-leaf/60 hover:bg-leaf/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
      >
        <span className="min-w-0">
          <span className="block truncate font-medium text-canopy">{post.title}</span>
          <span className="text-xs text-ink-3">
            {post.tag} · {readingMinutes(post.body)} min read
          </span>
        </span>
        <span aria-hidden className="text-pine">→</span>
      </Link>
    </li>
  );
}

/** A contextual hint pointing at the worst meter. */
function villageTip(meters: { pollution: number; ozone: number; disaster: number }): string {
  const keys: Array<"pollution" | "ozone" | "disaster"> = ["pollution", "ozone", "disaster"];
  const worst = keys.sort((a, b) => meters[b] - meters[a])[0];
  if (worst === "pollution") return "Smog is high — a Solar Farm or Metro Line will clear the air and earn passive Sprigs.";
  if (worst === "ozone") return "Ozone is strained — plant an Urban Forest or raise Wind Turbines to heal it.";
  return "Disaster risk is high — restore a Wetland or Water Reclaim to make your village resilient.";
}
