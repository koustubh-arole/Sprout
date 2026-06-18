"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useCurrentUser, useHydrateAuth } from "@/lib/authStore";
import { useHydrateWorld, useWorld } from "@/lib/store";

const NAV = [
  { href: "/app", label: "World", icon: "🏘️" },
  { href: "/leaderboard", label: "Grove", icon: "🏆" },
  { href: "/challenges", label: "Pacts", icon: "🤝" },
  { href: "/blog", label: "Blog", icon: "📖" },
  { href: "/profile", label: "You", icon: "🙂" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  useHydrateAuth();
  useHydrateWorld();
  const router = useRouter();
  const pathname = usePathname();
  const authHydrated = useAuth((s) => s.hasHydrated);
  const sessionEmail = useAuth((s) => s.sessionEmail);
  const isGuest = useAuth((s) => s.isGuest);
  const logOut = useAuth((s) => s.logOut);
  const user = useCurrentUser();
  const sprigs = useWorld((s) => s.sprigs);
  const streak = useWorld((s) => s.streakDays);

  const authed = Boolean(sessionEmail) || isGuest;

  // Gate: once hydrated, bounce unauthenticated visitors to login.
  useEffect(() => {
    if (authHydrated && !authed) router.replace("/login");
  }, [authHydrated, authed, router]);

  if (!authHydrated || !authed) {
    return (
      <div className="grid min-h-dvh place-items-center text-5xl animate-pulse" aria-hidden>
        🌱
      </div>
    );
  }

  function signOut() {
    logOut();
    router.replace("/");
  }

  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));

  return (
    <div className="flex min-h-dvh">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface/70 p-4 backdrop-blur lg:flex">
        <Link href="/app" className="flex items-center gap-2 px-2 py-2 font-display text-xl font-extrabold text-pine">
          <span aria-hidden>🌱</span> Sprout
        </Link>
        <nav aria-label="Primary" className="mt-4 flex flex-1 flex-col gap-1">
          {NAV.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              aria-current={isActive(t.href) ? "page" : undefined}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf",
                isActive(t.href) ? "bg-pine text-white shadow-sm" : "text-ink-2 hover:bg-leaf/10 hover:text-pine",
              ].join(" ")}
            >
              <span aria-hidden className="text-lg">{t.icon}</span>
              {t.label}
            </Link>
          ))}
        </nav>
        <UserBox user={user?.name ?? null} isGuest={isGuest} onSignOut={signOut} />
      </aside>

      {/* content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <header className="sticky top-0 z-30 border-b border-line bg-paper/80 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
            <Link href="/app" className="font-display text-lg font-extrabold text-pine lg:hidden">
              <span aria-hidden>🌱</span> Sprout
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <span className="pill bg-leaf/15 text-pine">
                <span aria-hidden>🌿</span> <span className="font-data font-bold">{sprigs.toLocaleString("en-IN")}</span>
              </span>
              <span className="pill bg-honey/20 text-amber-800">
                <span aria-hidden>🔥</span> <span className="font-data font-bold">{streak}</span>
              </span>
            </div>
          </div>
          {/* mobile nav row */}
          <nav aria-label="Primary" className="flex gap-1 overflow-x-auto px-4 pb-2 sm:px-6 lg:hidden">
            {NAV.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                aria-current={isActive(t.href) ? "page" : undefined}
                className={[
                  "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition",
                  isActive(t.href) ? "bg-pine text-white" : "text-ink-2 hover:bg-leaf/10",
                ].join(" ")}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </header>

        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function UserBox({ user, isGuest, onSignOut }: { user: string | null; isGuest: boolean; onSignOut: () => void }) {
  return (
    <div className="mt-2 rounded-2xl border border-line bg-paper p-3">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf/20 text-lg" aria-hidden>
          {isGuest ? "👤" : "🌱"}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-canopy">{isGuest ? "Guest" : user ?? "You"}</p>
          {isGuest ? (
            <Link href="/signup" className="text-[11px] font-medium text-pine hover:underline">
              Sign up to save →
            </Link>
          ) : (
            <p className="text-[11px] text-ink-3">Signed in</p>
          )}
        </div>
      </div>
      <button type="button" onClick={onSignOut} className="btn btn-soft mt-2 w-full text-sm">
        {isGuest ? "Exit guest" : "Sign out"}
      </button>
    </div>
  );
}
