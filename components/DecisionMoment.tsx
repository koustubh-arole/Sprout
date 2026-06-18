"use client";

import { tierOf, type Decision, type Tier } from "@/lib/carbon/factors";

// Colour signals magnitude, not "good vs bad"; always paired with an icon + label.
const TIER_BADGE: Record<Tier, { label: string; icon: string; cls: string }> = {
  low: { label: "Low impact", icon: "🍃", cls: "border-leaf/40 bg-leaf/10 text-pine" },
  medium: { label: "Moderate", icon: "≈", cls: "border-sun/50 bg-sun/15 text-amber-900" },
  high: { label: "High impact", icon: "▲", cls: "border-ember/50 bg-ember/15 text-[#9a3a22]" },
};

export type DecisionMomentProps = {
  decisions: Decision[];
  onChoose: (decision: Decision, choiceId: string) => void;
  /** decisionId -> the choiceId most recently picked, for the "Chosen" state */
  selected: Record<string, string>;
};

export function DecisionMoment({ decisions, onChoose, selected }: DecisionMomentProps) {
  return (
    <div className="space-y-5">
      {decisions.map((decision) => (
        <article key={decision.id} className="clay rounded-2xl p-4 sm:p-5">
          <header className="mb-3">
            <h3 className="flex items-center gap-2 text-base font-semibold text-stone-900 sm:text-lg">
              <span aria-hidden className="text-xl">
                {decision.emoji}
              </span>
              {decision.prompt}
              <span className="ml-auto rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
                {decision.unit}
              </span>
            </h3>
            <p className="mt-1 text-sm text-stone-600">{decision.context}</p>
          </header>

          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {decision.options.map((opt) => {
              const tier = tierOf(decision, opt.id);
              const badge = TIER_BADGE[tier];
              const isChosen = selected[decision.id] === opt.id;
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => onChoose(decision, opt.id)}
                    aria-pressed={isChosen}
                    aria-label={`Choose ${opt.label}, ${opt.detail}: ${opt.kg} kilograms CO2 equivalent, ${badge.label}`}
                    className={[
                      "group flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf focus-visible:ring-offset-1",
                      isChosen
                        ? "border-leaf bg-leaf/10 ring-1 ring-leaf shadow-[0_0_24px_rgba(31,174,110,0.22)]"
                        : "border-line bg-surface hover:border-leaf/60 hover:bg-leaf/5",
                    ].join(" ")}
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 font-medium text-stone-900">
                        {opt.label}
                        {isChosen && (
                          <span className="text-emerald-700" aria-hidden>
                            ✓
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-xs text-stone-500">{opt.detail}</span>
                      <span
                        className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}
                      >
                        <span aria-hidden>{badge.icon}</span>
                        {badge.label}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="font-data block text-lg font-bold text-canopy">{opt.kg}</span>
                      <span className="block text-[10px] font-medium uppercase tracking-wide text-ink-3">
                        kg CO₂e
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </article>
      ))}
    </div>
  );
}
