"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Village } from "./Village";
import { villageHealth } from "@/lib/village";

const PREVIEW_BUILDINGS = { solar: 2, forest: 1, metro: 1, wetland: 1, wind: 1 };
const PREVIEW_METERS = { pollution: 28, ozone: 24, disaster: 20 };

const STEPS = [
  { emoji: "📸", title: "Act & prove it", body: "Do something low-carbon, snap a photo. AI vision checks it actually matches — no fakes." },
  { emoji: "🌿", title: "Earn Sprigs", body: "Every verified action pays Sprigs, our in-game currency, scaled by the real CO₂ you saved." },
  { emoji: "🏗️", title: "Build & heal", body: "Spend Sprigs on solar, transit, forests and more — and watch pollution, ozone & disaster risk fall." },
];

const FEATURES = [
  { emoji: "🏙️", title: "A living village", body: "Your world visibly flourishes or clouds over with your choices — Clash-of-Clans for the climate." },
  { emoji: "🔍", title: "Genuine verification", body: "Real AI vision inspects your proof photos, so progress is earned, not gamed." },
  { emoji: "📊", title: "Honest, sourced numbers", body: "India-localized emission factors with a fully disclosed methodology — no greenwashing." },
  { emoji: "💬", title: "An AI coach", body: "A friendly guide turns kilograms into next steps — and never invents the numbers." },
  { emoji: "🔥", title: "Streaks & rewards", body: "Daily care, collectibles and level-ups keep the habit alive past the novelty window." },
  { emoji: "🤝", title: "Compete together", body: "Groves and pacts bring hostel floors and office teams into friendly competition." },
];

export function Landing() {
  const reduce = useReducedMotion();
  const fade = reduce
    ? {}
    : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.5 } };

  return (
    <div className="flex flex-1 flex-col">
      {/* nav */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-paper/80 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <span className="font-display text-xl font-extrabold text-pine">
            <span aria-hidden>🌱</span> Sprout
          </span>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost text-sm">
              Log in
            </Link>
            <Link href="/signup" className="btn btn-primary text-sm">
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main id="main">
        {/* hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:py-20">
          <motion.div {...(reduce ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } })}>
            <span className="pill bg-leaf/15 text-pine">🌍 Create behaviour, not just awareness</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.08] text-canopy sm:text-5xl">
              Rebuild a living village by living a little greener.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-ink-2">
              Sprout turns your real low-carbon choices into a world you grow. Earn Sprigs, build solar
              farms and forests, and watch pollution, ozone damage and disaster risk fall — verified,
              sourced, and hopeful.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className="btn btn-primary px-6 py-3 text-base">
                Start your village 🌱
              </Link>
              <Link href="/login" className="btn btn-soft px-6 py-3 text-base">
                I already have an account
              </Link>
            </div>
            <p className="mt-3 text-sm text-ink-3">Free · no credit card · works in your browser.</p>
          </motion.div>

          <motion.div {...(reduce ? {} : { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.6, delay: 0.1 } })}>
            <Village meters={PREVIEW_METERS} buildings={PREVIEW_BUILDINGS} health={villageHealth(PREVIEW_METERS)} villageName="Greenhaven" />
          </motion.div>
        </section>

        {/* how it works */}
        <section className="bg-white/60 py-16">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <motion.h2 {...fade} className="text-center font-display text-3xl font-extrabold text-canopy">
              How it works
            </motion.h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <motion.div key={s.title} {...(reduce ? {} : { ...fade, transition: { duration: 0.5, delay: i * 0.1 } })} className="clay p-6 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mist text-3xl" aria-hidden>
                    {s.emoji}
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-canopy">{s.title}</h3>
                  <p className="mt-2 text-ink-2">{s.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* features */}
        <section className="py-16">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <motion.h2 {...fade} className="text-center font-display text-3xl font-extrabold text-canopy">
              Why Sprout is different
            </motion.h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f, i) => (
                <motion.div key={f.title} {...(reduce ? {} : { ...fade, transition: { duration: 0.5, delay: (i % 3) * 0.08 } })} className="clay p-5">
                  <div className="text-3xl" aria-hidden>
                    {f.emoji}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold text-canopy">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-2">{f.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="px-5 pb-20 sm:px-8">
          <motion.div {...fade} className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-canopy via-moss to-pine p-10 text-center text-white sm:p-14">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Your village is waiting.</h2>
            <p className="mx-auto mt-3 max-w-xl text-emerald-50/90">
              Start in under a minute. Every good choice plants something real in the world you build.
            </p>
            <Link href="/signup" className="btn mt-7 bg-white px-7 py-3 text-base font-bold text-pine hover:brightness-105">
              Start your village — free
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-black/5 py-8 text-center text-sm text-ink-3">
        <span className="font-display font-bold text-pine">🌱 Sprout</span> · Built for behaviour and hope, not guilt ·{" "}
        <Link href="/methodology" className="font-medium text-pine hover:underline">
          Methodology
        </Link>
      </footer>
    </div>
  );
}
