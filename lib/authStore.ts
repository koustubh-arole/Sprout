"use client";

// Local, on-device accounts — a real signup/login experience with NO backend, so
// the deployed link can never break on auth. Passwords are salted + SHA-256 hashed
// (Web Crypto) before being stored in localStorage. For cross-device cloud accounts,
// this store is the seam to swap for Supabase later.

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Account = { name: string; email: string; hash: string; salt: string; createdAt: number };
export type AuthResult = { ok: boolean; error?: string };

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSalt(): string {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return Array.from(a)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const normalize = (email: string) => email.trim().toLowerCase();

type AuthState = {
  users: Record<string, Account>;
  sessionEmail: string | null;
  isGuest: boolean;
  hasHydrated: boolean;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  logIn: (email: string, password: string) => Promise<AuthResult>;
  logOut: () => void;
  continueAsGuest: () => void;
  setHasHydrated: (b: boolean) => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      users: {},
      sessionEmail: null,
      isGuest: false,
      hasHydrated: false,
      signUp: async (name, email, password) => {
        const key = normalize(email);
        if (!name.trim()) return { ok: false, error: "Please enter your name." };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) return { ok: false, error: "Enter a valid email." };
        if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
        if (get().users[key]) return { ok: false, error: "An account with this email already exists." };
        const salt = randomSalt();
        const hash = await sha256(password + salt);
        const account: Account = { name: name.trim(), email: key, hash, salt, createdAt: Date.now() };
        set((s) => ({ users: { ...s.users, [key]: account }, sessionEmail: key, isGuest: false }));
        return { ok: true };
      },
      logIn: async (email, password) => {
        const key = normalize(email);
        const user = get().users[key];
        if (!user) return { ok: false, error: "No account found for that email." };
        const hash = await sha256(password + user.salt);
        if (hash !== user.hash) return { ok: false, error: "Incorrect password." };
        set({ sessionEmail: key, isGuest: false });
        return { ok: true };
      },
      logOut: () => set({ sessionEmail: null, isGuest: false }),
      continueAsGuest: () => set({ isGuest: true, sessionEmail: null }),
      setHasHydrated: (b) => set({ hasHydrated: b }),
    }),
    {
      name: "sprout-auth-v1",
      skipHydration: true,
      partialize: (s) => ({ users: s.users, sessionEmail: s.sessionEmail, isGuest: s.isGuest }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);

export function useHydrateAuth() {
  useEffect(() => {
    void useAuth.persist.rehydrate();
  }, []);
}

/** The signed-in account (or null). Guests have a session but no account. */
export function useCurrentUser(): Account | null {
  return useAuth((s) => (s.sessionEmail ? s.users[s.sessionEmail] ?? null : null));
}
