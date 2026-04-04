"use client";

import { create } from "zustand";
import type { AccountTier } from "./types";
import { getTierConfig } from "./types";

/**
 * Auth store — manages current user session and tier.
 * For MVP this uses localStorage; will migrate to NextAuth / Supabase later.
 */

interface AuthStore {
  // User state
  isAuthenticated: boolean;
  userName: string | null;
  userEmail: string | null;
  userTier: AccountTier;
  userAvatar: string | null;

  // Actions
  signIn: (name: string, email: string, tier?: AccountTier) => void;
  signOut: () => void;
  setTier: (tier: AccountTier) => void;

  // Helpers
  canAccess: (feature: string) => boolean;
  getTierLabel: () => string;

  // Persistence
  loadSession: () => void;
}

const STORAGE_KEY = "modulca-auth";

export const useAuthStore = create<AuthStore>((set, get) => ({
  isAuthenticated: false,
  userName: null,
  userEmail: null,
  userTier: "free",
  userAvatar: null,

  signIn: (name, email, tier = "free") => {
    set({ isAuthenticated: true, userName: name, userEmail: email, userTier: tier, userAvatar: null });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, email, tier }));
    } catch { /* ignore */ }
  },

  signOut: () => {
    set({ isAuthenticated: false, userName: null, userEmail: null, userTier: "free", userAvatar: null });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  },

  setTier: (tier) => {
    set({ userTier: tier });
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        data.tier = tier;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch { /* ignore */ }
  },

  canAccess: (feature) => {
    const { userTier } = get();
    const config = getTierConfig(userTier);
    const val = (config.features as unknown as Record<string, unknown>)[feature];
    if (typeof val === "boolean") return val;
    if (typeof val === "number") return val > 0 || val === -1;
    return true;
  },

  getTierLabel: () => {
    const { userTier } = get();
    return getTierConfig(userTier).label;
  },

  loadSession: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      set({
        isAuthenticated: true,
        userName: data.name ?? null,
        userEmail: data.email ?? null,
        userTier: data.tier ?? "free",
      });
    } catch { /* ignore */ }
  },
}));

// Auto-hydrate on client
if (typeof window !== "undefined") {
  queueMicrotask(() => {
    useAuthStore.getState().loadSession();
  });
}
