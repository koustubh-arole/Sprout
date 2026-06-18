"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getCollectible, RARITY_RING } from "@/lib/rewards";
import { useWorld } from "@/lib/store";

/**
 * The variable-reward reveal. Mounts once at the app shell; whenever a daily
 * care opens a seed pack (store.pendingReward), it pops a celebratory modal.
 */
export function SeedPack() {
  const pendingReward = useWorld((s) => s.pendingReward);
  const claimReward = useWorld((s) => s.claimReward);
  const item = pendingReward ? getCollectible(pendingReward) : undefined;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Seed pack reward"
          onClick={claimReward}
        >
          <motion.div
            className="clay w-full max-w-xs p-7 text-center"
            initial={{ scale: 0.7, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-emerald-700">Seed pack opened!</p>
            <motion.div
              className={`mx-auto mt-4 flex h-28 w-28 items-center justify-center rounded-full bg-white text-6xl ring-4 ${RARITY_RING[item.rarity]}`}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: [0, 1.2, 1], rotate: [-20, 8, 0] }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <span aria-hidden>{item.emoji}</span>
            </motion.div>
            <p className="mt-4 text-lg font-bold text-stone-900">{item.name}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{item.rarity}</p>
            <button type="button" onClick={claimReward} className="clay-btn mt-5 w-full px-5 py-3 font-bold">
              Add to habitat 🌿
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
