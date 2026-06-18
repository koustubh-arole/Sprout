"use client";

import { useRef, useState } from "react";
import type { Category } from "@/lib/carbon/factors";

type Stats = {
  totalKg: number;
  byCategory: Record<Category, number>;
  topCategory: Category | null;
  choiceCount: number;
  name?: string;
};

type Msg = { role: "you" | "sprout"; text: string; source?: "ai" | "fallback" };

const SUGGESTIONS = [
  "What if I take the metro daily for a month?",
  "Is eating local better than eating less meat?",
  "What's my single highest-impact change?",
];

export function CoachChat(stats: Stats) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setMessages((m) => [...m, { role: "you", text: q }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, ...stats }),
      });
      const data = (await res.json()) as { reply: string; source: "ai" | "fallback" };
      setMessages((m) => [...m, { role: "sprout", text: data.reply, source: data.source }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "sprout", text: "I couldn't reach the coach just now — but small daily swaps always add up. 🌱", source: "fallback" },
      ]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }));
    }
  }

  return (
    <section className="clay p-4 sm:p-5" aria-labelledby="chat-heading">
      <h2 id="chat-heading" className="font-display text-xl font-semibold text-emerald-900">
        Ask {stats.name ?? "Sprout"} — what if?
      </h2>
      <p className="mt-1 text-sm text-stone-600">Try a scenario and get hopeful, specific guidance.</p>

      {messages.length > 0 && (
        <div ref={listRef} className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "you" ? "flex justify-end" : "flex justify-start"}>
              <p
                className={[
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.role === "you" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-stone-800",
                ].join(" ")}
              >
                {m.text}
                {m.role === "sprout" && m.source === "fallback" && (
                  <span className="ml-1 align-middle text-[10px] uppercase tracking-wide text-stone-400">offline</span>
                )}
              </p>
            </div>
          ))}
          {busy && <p className="text-sm text-stone-400">{stats.name ?? "Sprout"} is thinking…</p>}
        </div>
      )}

      {messages.length === 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => ask(s)}
                className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 transition hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What if I…"
          aria-label="Ask Sprout a what-if question"
          className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          Ask
        </button>
      </form>
    </section>
  );
}
