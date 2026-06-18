"use client";

import { useRef, useState } from "react";
import { ACTIONS, type GreenAction } from "@/lib/carbon/actions";
import { useWorld } from "@/lib/store";

type Status = "idle" | "verifying" | "verified" | "rejected";
type VerifySource = "ai" | "unverified";

/** Downscale a picked image to <=1024px JPEG so the upload + scan stay fast. */
function downscale(file: File, max = 1024, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("read failed"));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = typeof fr.result === "string" ? fr.result : "";
    };
    fr.readAsDataURL(file);
  });
}

export function ActivityLogger() {
  const logAction = useWorld((s) => s.logAction);
  const [selected, setSelected] = useState<GreenAction | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [verdict, setVerdict] = useState<string>("");
  const [source, setSource] = useState<VerifySource>("ai");
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setSelected(null);
    setPhoto(null);
    setStatus("idle");
    setVerdict("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function onPick(action: GreenAction) {
    setSelected(action);
    setPhoto(null);
    setStatus("idle");
    setVerdict("");
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await downscale(file));
    } catch {
      setPhoto(null);
    }
  }

  async function verify() {
    if (!selected || !photo) return;
    setStatus("verifying");
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: selected.id, image: photo }),
      });
      const result = (await res.json()) as { ok: boolean; verdict: string; source: VerifySource };
      setVerdict(result.verdict);
      setSource(result.source);
      if (result.ok) {
        logAction(selected, photo ?? undefined, result.verdict);
        setStatus("verified");
        setTimeout(reset, 2400);
      } else {
        setStatus("rejected");
      }
    } catch {
      setVerdict("Couldn't reach the scanner — please try again.");
      setStatus("rejected");
    }
  }

  return (
    <section className="clay rounded-3xl p-4 sm:p-5" aria-labelledby="logger-heading">
      <div className="flex items-baseline justify-between">
        <h2 id="logger-heading" className="font-display text-xl font-semibold text-canopy">
          Log a real green action
        </h2>
        <span className="pill bg-leaf/15 text-pine text-[10px] uppercase tracking-wide">earns 🌿</span>
      </div>
      <p className="mt-1 text-sm text-ink-2">
        Did something low-carbon today? Prove it with a photo — AI vision checks it actually matches.
      </p>

      {/* action picker */}
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ACTIONS.map((a) => {
          const active = selected?.id === a.id;
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onPick(a)}
                aria-pressed={active}
                className={[
                  "flex w-full flex-col items-start gap-0.5 rounded-2xl border p-3 text-left transition",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf",
                  active ? "border-leaf bg-leaf/10 ring-1 ring-leaf" : "border-line bg-surface hover:border-leaf/60 hover:bg-leaf/5",
                ].join(" ")}
              >
                <span className="text-2xl" aria-hidden>
                  {a.emoji}
                </span>
                <span className="text-sm font-medium text-stone-900">{a.label}</span>
                <span className="font-data text-xs font-bold text-pine">
                  −{a.savedKg} kg · +{a.points} 🌿
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* proof + verify */}
      {selected && (
        <div className="mt-4 rounded-2xl border border-leaf/30 bg-leaf/5 p-4">
          <p className="text-sm text-ink-2">
            <span aria-hidden>📸 </span>
            Proof for <strong>{selected.label}</strong>: {selected.proofHint}.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-canopy transition hover:border-leaf focus-within:ring-2 focus-within:ring-leaf">
              <span aria-hidden>📷</span>
              {photo ? "Retake photo" : "Take / upload photo"}
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="sr-only" />
            </label>

            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Your proof" className="h-14 w-14 rounded-lg border border-line object-cover" />
            )}

            <button type="button" onClick={verify} disabled={!photo || status === "verifying"} className="btn btn-primary ml-auto text-sm">
              {status === "verifying" ? "Scanning…" : !photo ? "Add a photo first" : "Scan & log"}
            </button>
          </div>

          <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm">
            {status === "verifying" && <span className="text-ink-2">🔍 AI vision is checking your photo…</span>}
            {status === "verified" && (
              <span className="font-medium text-pine">
                {source === "ai" ? "✓ " : "• "}
                {verdict}
              </span>
            )}
            {status === "rejected" && <span className="text-[#9a3a22]">✗ {verdict}</span>}
          </p>

          <p className="mt-2 text-[11px] text-ink-3">
            🔍 Photos are scanned by AI vision to confirm they match the action — unrelated images are rejected.
          </p>
        </div>
      )}
    </section>
  );
}
