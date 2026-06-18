"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { healthDelta, round1, type Category, type Decision } from "./carbon/factors";
import type { GreenAction } from "./carbon/actions";
import type { LoggedChoice } from "./carbon/calc";
import type { BlogPost } from "./blog";
import { rollCollectible } from "./rewards";
import {
  applyBuild,
  clampMeter,
  collectYield as calcYield,
  START_METERS,
  START_SPRIGS,
  type Meters,
} from "./village";

const START_HEALTH = 64; // headroom to both heal and wilt during a demo
const MIN_HEALTH = 0;
const MAX_HEALTH = 100;

const clamp = (n: number) => Math.min(MAX_HEALTH, Math.max(MIN_HEALTH, n));

/** A verified, photo-backed green action heals the creature (more saved → more heal). */
const healFor = (savedKg: number) => Math.min(10, Math.max(3, Math.round(savedKg)));

/** Local calendar day key (not UTC) so "cared today" matches the user's day. */
function dateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function wasYesterday(prev: string | null, nowTs: number): boolean {
  if (!prev) return false;
  const y = new Date(nowTs);
  y.setDate(y.getDate() - 1);
  return prev === dateKey(y.getTime());
}

/** Whole calendar days since the creature was last cared for (Infinity if never). */
export function daysSinceCare(lastCaredDate: string | null, nowTs: number = Date.now()): number {
  if (!lastCaredDate) return Infinity;
  const [y, m, d] = lastCaredDate.split("-").map(Number);
  const prev = new Date(y, m - 1, d);
  const now = new Date(nowTs);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((today.getTime() - prev.getTime()) / 86_400_000));
}

export type Pact = {
  id: string;
  text: string;
  target: number;
  progress: number;
  friend: string | null;
  createdAt: number;
};

export type LastImpact = { label: string; kg: number; delta: number } | null;

export type LoggedAction = {
  actionId: string;
  label: string;
  emoji: string;
  category: Category;
  savedKg: number;
  points: number;
  photo?: string; // data URL (mock; real upload in Phase B)
  verdict: string;
  at: number;
};

export type Badge = { id: string; emoji: string; label: string };

/** Pure: which badges the current totals have earned. */
export function earnedBadges(args: {
  savedKgTotal: number;
  streakDays: number;
  actionCount: number;
}): Badge[] {
  const out: Badge[] = [];
  if (args.actionCount >= 1) out.push({ id: "first", emoji: "🌱", label: "First Sprout" });
  if (args.streakDays >= 3) out.push({ id: "streak3", emoji: "🔥", label: "3-day streak" });
  if (args.streakDays >= 7) out.push({ id: "streak7", emoji: "⚡", label: "Week warrior" });
  if (args.savedKgTotal >= 10) out.push({ id: "save10", emoji: "🍃", label: "10 kg saved" });
  if (args.savedKgTotal >= 50) out.push({ id: "save50", emoji: "🌳", label: "50 kg saved" });
  if (args.savedKgTotal >= 100) out.push({ id: "save100", emoji: "🏆", label: "100 kg saved" });
  return out;
}

type WorldState = {
  choices: LoggedChoice[];
  health: number;
  lastImpact: LastImpact;
  hasHydrated: boolean;
  // creature identity
  creatureName: string | null;
  variant: string;
  adoptedAt: number | null;
  // gamification
  actions: LoggedAction[];
  points: number;
  savedKgTotal: number;
  streakDays: number;
  lastActionAt: number | null;
  lastCaredDate: string | null;
  collectibles: string[];
  pendingReward: string | null; // transient: the just-opened seed-pack item id
  pact: Pact | null;
  userPosts: BlogPost[];
  // village economy
  sprigs: number;
  buildings: Record<string, number>; // buildingId -> level
  meters: Meters;
  villageName: string | null;
  lastYieldAt: number | null;
  tourDone: boolean;
  log: (decision: Decision, choiceId: string) => void;
  logAction: (action: GreenAction, photo: string | undefined, verdict: string) => void;
  adopt: (name: string, variant: string, villageName?: string) => void;
  build: (id: string) => boolean;
  collectYield: () => number;
  setVillageName: (name: string) => void;
  finishTour: () => void;
  claimReward: () => void;
  setPact: (text: string, target: number, friend: string | null) => void;
  clearPact: () => void;
  addPost: (title: string, author: string, body: string, tag: string) => void;
  reset: () => void;
  setHasHydrated: (b: boolean) => void;
};

export const useWorld = create<WorldState>()(
  persist(
    (set) => ({
      choices: [],
      health: START_HEALTH,
      lastImpact: null,
      hasHydrated: false,
      creatureName: null,
      variant: "leafling",
      adoptedAt: null,
      actions: [],
      points: 0,
      savedKgTotal: 0,
      streakDays: 0,
      lastActionAt: null,
      lastCaredDate: null,
      collectibles: [],
      pendingReward: null,
      pact: null,
      userPosts: [],
      sprigs: START_SPRIGS,
      buildings: {},
      meters: { ...START_METERS },
      villageName: null,
      lastYieldAt: null,
      tourDone: false,
      log: (decision, choiceId) =>
        set((s) => {
          const opt = decision.options.find((o) => o.id === choiceId);
          if (!opt) return s;
          const delta = healthDelta(decision, choiceId);
          const choice: LoggedChoice = {
            decisionId: decision.id,
            category: decision.category,
            choiceId,
            label: opt.label,
            kg: opt.kg,
            at: Date.now(),
          };
          // A choice nudges the village: a good one clears a little smog and
          // earns a few Sprigs; a high-carbon one adds a little pollution.
          const good = delta >= 0;
          return {
            choices: [...s.choices, choice],
            health: clamp(s.health + delta),
            lastImpact: { label: opt.label, kg: opt.kg, delta },
            sprigs: s.sprigs + (good ? 5 : 2),
            meters: { ...s.meters, pollution: clampMeter(s.meters.pollution + (good ? -1 : 1.5)) },
          };
        }),
      logAction: (action, photo, verdict) =>
        set((s) => {
          const now = Date.now();
          const today = dateKey(now);
          const firstCareToday = s.lastCaredDate !== today;
          const heal = healFor(action.savedKg);

          // Streak: +1 if caring on consecutive days, fresh start (1) after a gap.
          let streakDays = s.streakDays;
          if (firstCareToday) {
            streakDays = wasYesterday(s.lastCaredDate, now) ? s.streakDays + 1 : 1;
          }

          // Variable reward: first care each day opens a seed pack.
          let collectibles = s.collectibles;
          let pendingReward = s.pendingReward;
          if (firstCareToday) {
            const reward = rollCollectible();
            collectibles = [...s.collectibles, reward.id];
            pendingReward = reward.id;
          }

          // Commitment pact progress.
          const pact = s.pact
            ? { ...s.pact, progress: Math.min(s.pact.target, s.pact.progress + 1) }
            : null;

          const logged: LoggedAction = {
            actionId: action.id,
            label: action.label,
            emoji: action.emoji,
            category: action.category,
            savedKg: action.savedKg,
            points: action.points,
            photo,
            verdict,
            at: now,
          };
          // A verified action earns Sprigs (currency) and clears real smog.
          const firstDayBonus = firstCareToday ? 25 : 0;
          return {
            actions: [logged, ...s.actions],
            points: s.points + action.points,
            sprigs: s.sprigs + action.points + firstDayBonus,
            meters: {
              ...s.meters,
              pollution: clampMeter(s.meters.pollution - Math.min(4, action.savedKg * 0.5)),
            },
            savedKgTotal: round1(s.savedKgTotal + action.savedKg),
            streakDays,
            lastActionAt: now,
            lastCaredDate: today,
            collectibles,
            pendingReward,
            pact,
            health: clamp(s.health + heal),
            lastImpact: { label: action.label, kg: action.savedKg, delta: heal },
          };
        }),
      adopt: (name, variant, villageName) =>
        set({
          creatureName: name.trim() || "Sprout",
          variant,
          adoptedAt: Date.now(),
          villageName: (villageName ?? "").trim() || "Greenhaven",
          lastYieldAt: Date.now(),
        }),
      build: (id) => {
        let ok = false;
        set((s) => {
          const res = applyBuild({ sprigs: s.sprigs, buildings: s.buildings, meters: s.meters }, id);
          if (!res.ok) return s;
          ok = true;
          return {
            sprigs: res.sprigs,
            buildings: res.buildings,
            meters: res.meters,
            lastYieldAt: s.lastYieldAt ?? Date.now(),
          };
        });
        return ok;
      },
      collectYield: () => {
        let amount = 0;
        set((s) => {
          amount = calcYield(s.buildings, s.lastYieldAt);
          if (amount <= 0) return s;
          return { sprigs: s.sprigs + amount, lastYieldAt: Date.now() };
        });
        return amount;
      },
      setVillageName: (name) => set({ villageName: name.trim() || "Greenhaven" }),
      finishTour: () => set({ tourDone: true }),
      claimReward: () => set({ pendingReward: null }),
      setPact: (text, target, friend) =>
        set({
          pact: { id: `pact-${Date.now()}`, text, target, progress: 0, friend, createdAt: Date.now() },
        }),
      clearPact: () => set({ pact: null }),
      addPost: (title, author, body, tag) =>
        set((s) => ({
          userPosts: [
            {
              id: `post-${Date.now()}`,
              title: title.trim(),
              author: author.trim() || "Anonymous Sprout",
              body: body.trim(),
              tag: tag || "Tips",
              at: Date.now(),
            },
            ...s.userPosts,
          ],
        })),
      reset: () =>
        // Resets progress but keeps the adopted creature + village name.
        set({
          choices: [],
          health: START_HEALTH,
          lastImpact: null,
          actions: [],
          points: 0,
          savedKgTotal: 0,
          streakDays: 0,
          lastActionAt: null,
          lastCaredDate: null,
          collectibles: [],
          pendingReward: null,
          pact: null,
          sprigs: START_SPRIGS,
          buildings: {},
          meters: { ...START_METERS },
          lastYieldAt: Date.now(),
        }),
      setHasHydrated: (b) => set({ hasHydrated: b }),
    }),
    {
      name: "sprout-world-v3",
      // Skip synchronous hydration so server and first client render match;
      // we rehydrate from localStorage in an effect after mount.
      skipHydration: true,
      // Note: pendingReward is intentionally NOT persisted (transient reveal).
      partialize: (s) => ({
        choices: s.choices,
        health: s.health,
        lastImpact: s.lastImpact,
        creatureName: s.creatureName,
        variant: s.variant,
        adoptedAt: s.adoptedAt,
        actions: s.actions,
        points: s.points,
        savedKgTotal: s.savedKgTotal,
        streakDays: s.streakDays,
        lastActionAt: s.lastActionAt,
        lastCaredDate: s.lastCaredDate,
        collectibles: s.collectibles,
        pact: s.pact,
        userPosts: s.userPosts,
        sprigs: s.sprigs,
        buildings: s.buildings,
        meters: s.meters,
        villageName: s.villageName,
        lastYieldAt: s.lastYieldAt,
        tourDone: s.tourDone,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);

/** Call once near the top of the client experience to load saved state. */
export function useHydrateWorld() {
  useEffect(() => {
    void useWorld.persist.rehydrate();
  }, []);
}

export const WORLD_START_HEALTH = START_HEALTH;
