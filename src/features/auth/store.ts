"use client";

import { create } from "zustand";
import type { AccountTier } from "./types";
import { getTierConfig } from "./types";
import { getSupabase } from "@/shared/lib/supabase";

/**
 * Auth store — Supabase-backed with localStorage demo fallback.
 * When SUPABASE_URL is configured → real auth.
 * When not configured → demo mode with localStorage persistence.
 */

interface AuthStore {
  // State
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userTier: AccountTier;
  userAvatar: string | null;
  loading: boolean;
  error: string | null;

  // Usage tracking
  projectCount: number;
  storageUsedMb: number;
  aiCallsToday: number;

  // Auth actions
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setTier: (tier: AccountTier) => void;
  clearError: () => void;

  // Helpers
  canAccess: (feature: string) => boolean;
  canCreateProject: () => { allowed: boolean; reason?: string };
  canUseAiCall: () => { allowed: boolean; reason?: string };
  incrementAiCalls: () => Promise<void>;
  getTierLabel: () => string;

  // Hydration
  loadSession: () => Promise<void>;
}

const STORAGE_KEY = "modulca-auth";

/** Save to localStorage (demo fallback) */
function saveLocal(data: { id?: string; name: string; email: string; tier: AccountTier }) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* */ }
}

/** Load from localStorage */
function loadLocal(): { id?: string; name: string; email: string; tier: AccountTier } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  isAuthenticated: false,
  userId: null,
  userName: null,
  userEmail: null,
  userTier: "free",
  userAvatar: null,
  loading: false,
  error: null,
  projectCount: 0,
  storageUsedMb: 0,
  aiCallsToday: 0,

  /* ── Sign Up ── */
  signUp: async (email, password, name) => {
    set({ loading: true, error: null });
    const sb = getSupabase();

    if (!sb) {
      // Demo mode — just save locally
      const id = `demo-${Date.now()}`;
      set({ isAuthenticated: true, userId: id, userName: name, userEmail: email, userTier: "free", loading: false });
      saveLocal({ id, name, email, tier: "free" });
      return true;
    }

    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });

    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }

    if (data.user) {
      // Create profile row
      await sb.from("profiles").upsert({
        id: data.user.id,
        email,
        display_name: name,
        tier: "free",
      });

      set({
        isAuthenticated: true,
        userId: data.user.id,
        userName: name,
        userEmail: email,
        userTier: "free",
        loading: false,
      });
    }
    return true;
  },

  /* ── Sign In ── */
  signIn: async (email, password) => {
    set({ loading: true, error: null });
    const sb = getSupabase();

    if (!sb) {
      // Demo mode
      const name = email.split("@")[0];
      const local = loadLocal();
      const tier = local?.tier ?? "free";
      set({ isAuthenticated: true, userId: `demo-${Date.now()}`, userName: name, userEmail: email, userTier: tier, loading: false });
      saveLocal({ name, email, tier });
      return true;
    }

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }

    if (data.user) {
      // Fetch profile for tier
      const { data: profile } = await sb.from("profiles").select("display_name, tier, avatar_url").eq("id", data.user.id).single();
      set({
        isAuthenticated: true,
        userId: data.user.id,
        userName: profile?.display_name ?? data.user.email?.split("@")[0] ?? null,
        userEmail: data.user.email ?? null,
        userTier: (profile?.tier as AccountTier) ?? "free",
        userAvatar: profile?.avatar_url ?? null,
        loading: false,
      });
    }
    return true;
  },

  /* ── Google OAuth ── */
  signInWithGoogle: async () => {
    const sb = getSupabase();
    if (!sb) {
      // Demo mode — simulate
      set({
        isAuthenticated: true,
        userId: "demo-google",
        userName: "Demo User",
        userEmail: "demo@modulca.com",
        userTier: "free",
      });
      saveLocal({ name: "Demo User", email: "demo@modulca.com", tier: "free" });
      return;
    }
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  },

  /* ── Sign Out ── */
  signOut: async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
    set({
      isAuthenticated: false,
      userId: null,
      userName: null,
      userEmail: null,
      userTier: "free",
      userAvatar: null,
      error: null,
      projectCount: 0,
      storageUsedMb: 0,
      aiCallsToday: 0,
    });
  },

  /* ── Set Tier ── */
  setTier: (tier) => {
    const { userId } = get();
    set({ userTier: tier });
    const sb = getSupabase();
    if (sb && userId) {
      sb.from("profiles").update({ tier }).eq("id", userId).then(() => {});
    }
    // Also update local fallback
    const local = loadLocal();
    if (local) saveLocal({ ...local, tier });
  },

  clearError: () => set({ error: null }),

  /* ── Feature Access ── */
  canAccess: (feature) => {
    const { userTier } = get();
    const config = getTierConfig(userTier);
    const val = (config.features as unknown as Record<string, unknown>)[feature];
    if (typeof val === "boolean") return val;
    if (typeof val === "number") return val > 0 || val === -1;
    return true;
  },

  canCreateProject: () => {
    const { userTier, projectCount } = get();
    const config = getTierConfig(userTier);
    const max = config.features.maxProjects;
    if (max === -1) return { allowed: true };
    if (projectCount >= max) {
      return { allowed: false, reason: `You've reached the limit of ${max} projects on the ${config.label} plan. Upgrade for more.` };
    }
    return { allowed: true };
  },

  canUseAiCall: () => {
    const { userTier, aiCallsToday } = get();
    const config = getTierConfig(userTier);
    const max = config.features.aiRendersPerMonth;
    if (max === -1) return { allowed: true };
    // Daily limit = monthly / 30, minimum 1
    const dailyLimit = Math.max(1, Math.ceil(max / 30));
    if (aiCallsToday >= dailyLimit) {
      return { allowed: false, reason: `Daily AI limit reached (${dailyLimit}/day on ${config.label} plan). Resets at midnight.` };
    }
    return { allowed: true };
  },

  incrementAiCalls: async () => {
    const { userId, aiCallsToday } = get();
    const newCount = aiCallsToday + 1;
    set({ aiCallsToday: newCount });
    const sb = getSupabase();
    if (sb && userId) {
      await sb.from("profiles").update({
        ai_calls_today: newCount,
        ai_calls_reset_at: new Date().toISOString().split("T")[0],
      }).eq("id", userId);
    }
  },

  getTierLabel: () => getTierConfig(get().userTier).label,

  /* ── Load Session (on page load) ── */
  loadSession: async () => {
    const sb = getSupabase();

    if (!sb) {
      // Demo mode — load from localStorage
      const local = loadLocal();
      if (local) {
        set({
          isAuthenticated: true,
          userId: local.id ?? "demo",
          userName: local.name,
          userEmail: local.email,
          userTier: local.tier ?? "free",
        });
      }
      return;
    }

    // Supabase mode — check session
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.user) return;

    const { data: profile } = await sb.from("profiles")
      .select("display_name, tier, avatar_url, project_count, storage_used_mb, ai_calls_today, ai_calls_reset_at")
      .eq("id", session.user.id)
      .single();

    // Reset AI calls if it's a new day
    const today = new Date().toISOString().split("T")[0];
    const aiCalls = profile?.ai_calls_reset_at === today ? (profile?.ai_calls_today ?? 0) : 0;

    set({
      isAuthenticated: true,
      userId: session.user.id,
      userName: profile?.display_name ?? session.user.email?.split("@")[0] ?? null,
      userEmail: session.user.email ?? null,
      userTier: (profile?.tier as AccountTier) ?? "free",
      userAvatar: profile?.avatar_url ?? null,
      projectCount: profile?.project_count ?? 0,
      storageUsedMb: profile?.storage_used_mb ?? 0,
      aiCallsToday: aiCalls,
    });
  },
}));

// Auto-hydrate on client
if (typeof window !== "undefined") {
  queueMicrotask(() => {
    useAuthStore.getState().loadSession();
  });
}
