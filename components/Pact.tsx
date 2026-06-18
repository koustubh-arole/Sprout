"use client";

import { useEffect, useState } from "react";
import { data, type Friend } from "@/lib/data";
import { useWorld } from "@/lib/store";
import { DemoChip } from "./DemoChip";

const TEMPLATES = [
  { text: "Take the metro or bus", target: 3 },
  { text: "Eat plant-based meals", target: 4 },
  { text: "Cycle or walk a trip", target: 3 },
];

export function Pact() {
  const pact = useWorld((s) => s.pact);
  const setPact = useWorld((s) => s.setPact);
  const clearPact = useWorld((s) => s.clearPact);

  const [tplIdx, setTplIdx] = useState(0);
  const [friendId, setFriendId] = useState<string>("");
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    let live = true;
    data.getFriends().then((f) => live && setFriends(f));
    return () => {
      live = false;
    };
  }, []);

  if (pact) {
    const pct = Math.min(100, Math.round((pact.progress / pact.target) * 100));
    const done = pact.progress >= pact.target;
    return (
      <section className="clay p-5" aria-labelledby="pact-heading">
        <h2 id="pact-heading" className="font-display text-xl font-bold text-emerald-950">
          Your pact {pact.friend ? `with ${pact.friend}` : ""}
        </h2>
        <p className="mt-1 text-stone-700">
          {pact.text} — <strong>{pact.progress}/{pact.target}</strong>
        </p>
        <div className="clay-sunk mt-3 h-4 w-full overflow-hidden rounded-full" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Pact progress">
          <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-3 text-sm text-emerald-800">
          {done ? "🎉 Pact complete — you kept your word!" : "A public promise you set yourself is the most powerful nudge there is. Keep going."}
        </p>
        <button type="button" onClick={clearPact} className="mt-4 text-sm font-medium text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline">
          {done ? "Start a new pact" : "Abandon pact"}
        </button>
      </section>
    );
  }

  const tpl = TEMPLATES[tplIdx];
  return (
    <section className="clay p-5" aria-labelledby="pact-heading">
      <h2 id="pact-heading" className="font-display text-xl font-bold text-emerald-950">
        Make a pact
      </h2>
      <p className="mt-1 text-sm text-stone-600">
        A self-set promise, optionally with a friend — the most evidence-backed nudge there is.
      </p>

      <fieldset className="mt-4">
        <legend className="text-xs font-semibold uppercase tracking-wide text-stone-500">This week I will…</legend>
        <div className="mt-2 space-y-2">
          {TEMPLATES.map((t, i) => (
            <label key={t.text} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 ${tplIdx === i ? "border-emerald-500 bg-emerald-50" : "border-stone-200"}`}>
              <input type="radio" name="pact" checked={tplIdx === i} onChange={() => setTplIdx(i)} className="accent-emerald-600" />
              <span className="text-sm font-medium text-stone-800">{t.text}</span>
              <span className="ml-auto text-sm font-bold text-emerald-700">{t.target}×</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-4 block">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Pair with a friend (optional) <DemoChip label="Demo friends" title="Sample friends until accounts sync (Phase B)." />
        </span>
        <select
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <option value="">Just me</option>
          {friends.map((f) => (
            <option key={f.id} value={f.name}>
              {f.avatar} {f.name}
            </option>
          ))}
        </select>
      </label>

      <button type="button" onClick={() => setPact(tpl.text, tpl.target, friendId || null)} className="clay-btn mt-5 w-full px-5 py-3 font-bold">
        Make this pact 🤝
      </button>
    </section>
  );
}
