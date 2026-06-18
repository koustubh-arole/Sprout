"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "World" },
  { href: "/leaderboard", label: "Grove" },
  { href: "/challenges", label: "Pacts" },
  { href: "/blog", label: "Blog" },
  { href: "/profile", label: "You" },
];

/** Web-first top navigation bar. */
export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-paper/80 backdrop-blur">
      <nav aria-label="Primary" className="mx-auto flex w-full max-w-6xl items-center gap-1 px-4 py-3 sm:px-8">
        <Link href="/" className="mr-auto flex items-center gap-2 font-display text-xl font-bold text-pine">
          <span aria-hidden>🌱</span> Sprout
        </Link>
        {TABS.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={[
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf",
                active ? "bg-pine text-white" : "text-ink-2 hover:bg-leaf/10 hover:text-pine",
              ].join(" ")}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
