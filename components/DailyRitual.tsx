"use client";

import { daysSinceCare, useWorld } from "@/lib/store";
import { ActivityLogger } from "./ActivityLogger";

/**
 * The home screen's ONE job (Fogg high-ability): care for your companion today
 * by logging a real green action. Shows streak + today's status, then the logger.
 */
export function DailyRitual() {
  const name = useWorld((s) => s.creatureName) ?? "your companion";
  const streakDays = useWorld((s) => s.streakDays);
  const lastCaredDate = useWorld((s) => s.lastCaredDate);
  const caredToday = daysSinceCare(lastCaredDate) === 0;

  return (
    <section aria-labelledby="ritual-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="ritual-heading" className="font-display text-xl font-bold text-emerald-950">
          {caredToday ? `${name} is cared for today 💚` : `Care for ${name} today`}
        </h2>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-honey/15 px-3 py-1 text-sm font-bold text-amber-800">
          🔥 {streakDays}
          <span className="text-xs font-medium">day{streakDays === 1 ? "" : "s"}</span>
        </span>
      </div>

      <p className="text-sm text-stone-600">
        {caredToday ? "Streak alive — log another to grow faster." : `One photo-proven action keeps ${name} happy.`}
      </p>

      <ActivityLogger />
    </section>
  );
}
