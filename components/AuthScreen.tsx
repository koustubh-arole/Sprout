"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth, useHydrateAuth } from "@/lib/authStore";

const FLOATERS = ["☀️", "🌳", "🚇", "♻️", "🪷", "🌬️", "💧", "🔌"];

export function AuthScreen({ mode }: { mode: "login" | "signup" }) {
  useHydrateAuth();
  const router = useRouter();
  const reduce = useReducedMotion();
  const hasHydrated = useAuth((s) => s.hasHydrated);
  const sessionEmail = useAuth((s) => s.sessionEmail);
  const isGuest = useAuth((s) => s.isGuest);
  const signUp = useAuth((s) => s.signUp);
  const logIn = useAuth((s) => s.logIn);
  const continueAsGuest = useAuth((s) => s.continueAsGuest);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already signed in → straight to the app.
  useEffect(() => {
    if (hasHydrated && (sessionEmail || isGuest)) router.replace("/app");
  }, [hasHydrated, sessionEmail, isGuest, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = mode === "signup" ? await signUp(name, email, password) : await logIn(email, password);
    setBusy(false);
    if (res.ok) router.replace("/app");
    else setError(res.error ?? "Something went wrong.");
  }

  function onGuest() {
    continueAsGuest();
    router.replace("/app");
  }

  return (
    <main id="main" className="grid min-h-dvh lg:grid-cols-2">
      {/* brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-canopy via-moss to-pine p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="font-display text-2xl font-extrabold">
          <span aria-hidden>🌱</span> Sprout
        </Link>
        <div className="relative">
          <h1 className="font-display text-4xl font-extrabold leading-tight">
            Build a world that heals as you live greener.
          </h1>
          <p className="mt-4 max-w-md text-emerald-50/90">
            Turn real low-carbon choices into Sprigs, rebuild a living village, and watch pollution,
            ozone, and disaster risk fall — together.
          </p>
        </div>
        <p className="relative text-sm text-emerald-100/70">Create behaviour, not just awareness.</p>

        {/* floating eco icons */}
        {!reduce &&
          FLOATERS.map((f, i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute text-3xl/none opacity-30"
              style={{ left: `${(i * 23) % 90}%`, top: `${(i * 37) % 80}%` }}
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
              aria-hidden
            >
              {f}
            </motion.span>
          ))}
      </div>

      {/* form panel */}
      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <Link href="/" className="mb-8 inline-flex items-center gap-2 font-display text-xl font-extrabold text-pine lg:hidden">
            <span aria-hidden>🌱</span> Sprout
          </Link>
          <h2 className="font-display text-2xl font-extrabold text-canopy">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-1 text-sm text-ink-2">
            {mode === "signup" ? "Start your village in under a minute." : "Log in to tend your village."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            {mode === "signup" && (
              <Field label="Name" value={name} onChange={setName} type="text" placeholder="Your name" autoComplete="name" />
            )}
            <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="you@example.com" autoComplete="email" />
            <Field
              label="Password"
              value={password}
              onChange={setPassword}
              type="password"
              placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />

            {error && (
              <p role="alert" className="rounded-lg bg-ember/10 px-3 py-2 text-sm font-medium text-[#9a3a22]">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn btn-primary w-full">
              {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-ink-3">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>

          <button type="button" onClick={onGuest} className="btn btn-soft w-full">
            Continue as guest
          </button>

          <p className="mt-6 text-center text-sm text-ink-2">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-pine hover:underline">
                  Log in
                </Link>
              </>
            ) : (
              <>
                New to Sprout?{" "}
                <Link href="/signup" className="font-semibold text-pine hover:underline">
                  Create an account
                </Link>
              </>
            )}
          </p>

          <p className="mt-4 text-center text-[11px] text-ink-3">
            Accounts are stored privately on this device — no server, no tracking.
          </p>
        </motion.div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block text-left">
      <span className="text-sm font-medium text-ink-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-canopy focus:border-leaf focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
      />
    </label>
  );
}
