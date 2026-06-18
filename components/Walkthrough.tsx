"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useWorld } from "@/lib/store";

export function Walkthrough({ villageName, guideName }: { villageName: string; guideName: string }) {
  const finishTour = useWorld((s) => s.finishTour);
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  const STEPS = [
    { emoji: "🏘️", title: `Welcome to ${villageName}!`, body: `This is your living world. It flourishes — or clouds over — based on the choices you make in real life.` },
    { emoji: "📊", title: "Watch your meters", body: "Air pollution, ozone damage and disaster risk show your world's health. Lower is better — every good move brings them down." },
    { emoji: "📸", title: "Act for real", body: `Log a real low-carbon action with a photo. ${guideName}'s AI vision checks it actually matches — then you earn Sprigs 🌿.` },
    { emoji: "🏗️", title: "Build it up", body: "Spend Sprigs to raise solar farms, forests, metros and more. Each structure visibly heals your village." },
  ];

  const last = step === STEPS.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finishTour();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finishTour]);

  const s = STEPS[step];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center bg-canopy/40 p-4 backdrop-blur-sm"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
      >
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-md rounded-3xl bg-surface p-7 text-center shadow-2xl"
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-leaf/15 text-4xl" aria-hidden>
            {s.emoji}
          </div>
          <h2 id="tour-title" className="mt-4 font-display text-2xl font-extrabold text-canopy">
            {s.title}
          </h2>
          <p className="mt-2 text-ink-2">{s.body}</p>

          {/* progress dots */}
          <div className="mt-5 flex justify-center gap-1.5" aria-hidden>
            {STEPS.map((_, i) => (
              <span key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-pine" : "w-2 bg-mist"}`} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button type="button" onClick={finishTour} className="text-sm font-medium text-ink-3 hover:text-ink-2">
              Skip
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <button type="button" onClick={() => setStep((n) => n - 1)} className="btn btn-soft text-sm">
                  Back
                </button>
              )}
              <button
                type="button"
                autoFocus
                onClick={() => (last ? finishTour() : setStep((n) => n + 1))}
                className="btn btn-primary text-sm"
              >
                {last ? "Start building 🌱" : "Next"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
