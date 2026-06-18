import Link from "next/link";

/**
 * Honesty pattern: any mock / simulated data wears this chip in plain language,
 * so simulated social proof never reads as deceptive. Retire each chip as its
 * real backend lands (Phase B/C).
 */
export function DemoChip({
  label = "Demo data",
  title = "Simulated for now — real data arrives when the backend lands.",
}: {
  label?: string;
  title?: string;
}) {
  return (
    <span className="chip-demo" title={title}>
      <span aria-hidden>◐</span> {label}
      <span className="sr-only"> (simulated data)</span>
    </span>
  );
}

/** The always-reachable methodology link for any screen showing numbers. */
export function MethodologyLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/methodology"
      className={`text-xs font-medium text-pine underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf ${className}`}
    >
      Every number comes from the disclosed methodology →
    </Link>
  );
}
