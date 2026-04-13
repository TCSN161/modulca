"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store";
import { getSupabase } from "@/shared/lib/supabase";
import Link from "next/link";

interface PlatformStats {
  totalUsers: number;
  totalProjects: number;
  dbSizeMb: number;
  tierBreakdown: { tier: string; count: number }[];
  recentSignups: { email: string; created_at: string; tier: string }[];
}

const FREE_LIMITS = {
  dbMb: 500,
  storageMb: 1000,
  mau: 50000,
  bandwidthGb: 5,
};

function UsageBar({ label, used, total, unit }: { label: string; used: number; total: number; unit: string }) {
  const pct = Math.min(100, (used / total) * 100);
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-brand-olive-500";
  const alert = pct >= 90 ? "CRITICAL" : pct >= 70 ? "WARNING" : "";

  return (
    <div className="rounded-[12px] border border-brand-bone-300/60 bg-white p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">{label}</span>
        {alert && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pct >= 90 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
            {alert}
          </span>
        )}
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-2xl font-bold text-brand-charcoal">{used.toFixed(1)}</span>
        <span className="text-sm text-brand-gray mb-0.5">/ {total} {unit}</span>
      </div>
      <div className="w-full h-2 bg-brand-bone-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-right text-[10px] text-brand-gray mt-1">{pct.toFixed(1)}%</div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-[12px] border border-brand-bone-300/60 bg-white p-4">
      <div className="text-[10px] font-bold text-brand-gray uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-bold text-brand-charcoal">{value}</div>
      {sub && <div className="text-xs text-brand-gray mt-1">{sub}</div>}
    </div>
  );
}

export default function AdminPage() {
  const { isAuthenticated, userEmail } = useAuthStore();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple admin check — only your email can access
  const ADMIN_EMAILS = ["uii.acgs.auto@gmail.com"];
  const isAdmin = isAuthenticated && userEmail && ADMIN_EMAILS.includes(userEmail);

  useEffect(() => {
    if (!isAdmin) return;
    loadStats();
  }, [isAdmin]);

  async function loadStats() {
    const sb = getSupabase();
    if (!sb) {
      setError("Supabase not configured");
      setLoading(false);
      return;
    }

    try {
      // Fetch all profiles
      const { data: profiles, error: profileErr } = await sb
        .from("profiles")
        .select("email, tier, project_count, storage_used_mb, created_at")
        .order("created_at", { ascending: false });

      if (profileErr) throw new Error(`Profiles query: ${profileErr.message} (${profileErr.code})`);

      const users = profiles ?? [];
      const totalUsers = users.length;
      const totalProjects = users.reduce((sum, u) => sum + (u.project_count ?? 0), 0);
      const totalStorageMb = users.reduce((sum, u) => sum + (u.storage_used_mb ?? 0), 0);

      // Estimate DB size: ~2KB per profile + ~50KB per project avg
      const estimatedDbMb = (totalUsers * 0.002) + (totalProjects * 0.05);

      // Tier breakdown
      const tierMap: Record<string, number> = {};
      users.forEach((u) => {
        const t = u.tier ?? "free";
        tierMap[t] = (tierMap[t] ?? 0) + 1;
      });
      const tierBreakdown = Object.entries(tierMap).map(([tier, count]) => ({ tier, count }));

      // Recent signups (last 10)
      const recentSignups = users.slice(0, 10).map((u) => ({
        email: u.email ?? "unknown",
        created_at: u.created_at ?? "",
        tier: u.tier ?? "free",
      }));

      setStats({
        totalUsers,
        totalProjects,
        dbSizeMb: estimatedDbMb + totalStorageMb,
        tierBreakdown,
        recentSignups,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-brand-bone-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-charcoal mb-2">Access Denied</h1>
          <p className="text-sm text-brand-gray mb-4">Admin access is restricted.</p>
          <Link href="/" className="btn-primary text-sm px-4 py-2">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bone-100">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-bone-300/60 bg-white/95 backdrop-blur-md px-4 md:px-8">
        <Link href="/" className="text-lg font-bold text-brand-charcoal tracking-tight">
          Modul<span className="text-brand-olive-700">CA</span>
          <span className="ml-2 text-xs font-normal text-brand-gray">Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/admin/engines" className="text-sm text-brand-olive-700 hover:underline">
            Engine Test
          </Link>
          <Link href="/admin/analytics" className="text-sm text-brand-olive-700 hover:underline">
            Render Analytics
          </Link>
          <button onClick={() => loadStats()} className="text-sm text-brand-olive-700 hover:underline">
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-brand-charcoal tracking-heading mb-6">Platform Dashboard</h1>

        {loading && <p className="text-sm text-brand-gray">Loading stats...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {stats && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <StatCard label="Total Users" value={stats.totalUsers} sub="All time" />
              <StatCard label="Total Projects" value={stats.totalProjects} sub="Across all users" />
              <StatCard
                label="Est. DB Size"
                value={`${stats.dbSizeMb.toFixed(1)} MB`}
                sub={`${((stats.dbSizeMb / FREE_LIMITS.dbMb) * 100).toFixed(1)}% of free tier`}
              />
              <StatCard
                label="Revenue"
                value="€0"
                sub="No paid tiers yet"
              />
            </div>

            {/* Usage Bars — Infrastructure Limits */}
            <h2 className="text-lg font-bold text-brand-charcoal mb-3">Infrastructure Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              <UsageBar label="Database" used={stats.dbSizeMb} total={FREE_LIMITS.dbMb} unit="MB" />
              <UsageBar label="File Storage" used={0} total={FREE_LIMITS.storageMb} unit="MB" />
              <UsageBar label="Monthly Active Users" used={stats.totalUsers} total={FREE_LIMITS.mau} unit="MAU" />
              <UsageBar label="Bandwidth (est.)" used={0} total={FREE_LIMITS.bandwidthGb} unit="GB" />
            </div>

            {/* Tier Breakdown */}
            <h2 className="text-lg font-bold text-brand-charcoal mb-3">User Tiers</h2>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {["free", "premium", "architect"].map((tier) => {
                const count = stats.tierBreakdown.find((t) => t.tier === tier)?.count ?? 0;
                const colors: Record<string, string> = {
                  free: "border-gray-300",
                  premium: "border-amber-400",
                  architect: "border-teal-500",
                };
                return (
                  <div key={tier} className={`rounded-[12px] border-2 ${colors[tier]} bg-white p-4 text-center`}>
                    <div className="text-2xl font-bold text-brand-charcoal">{count}</div>
                    <div className="text-xs font-bold text-brand-gray uppercase">{tier}</div>
                  </div>
                );
              })}
            </div>

            {/* Scaling Alerts */}
            <h2 className="text-lg font-bold text-brand-charcoal mb-3">Scaling Alerts</h2>
            <div className="rounded-[12px] border border-brand-bone-300/60 bg-white p-4 mb-8 space-y-2">
              {stats.dbSizeMb > FREE_LIMITS.dbMb * 0.7 ? (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  <span className="font-bold">!</span> DB at {((stats.dbSizeMb / FREE_LIMITS.dbMb) * 100).toFixed(0)}% — consider upgrading Supabase to Pro ($25/mo)
                </div>
              ) : null}
              {stats.totalUsers > 200 ? (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  <span className="font-bold">!</span> {stats.totalUsers} users — plan Supabase Pro upgrade soon
                </div>
              ) : null}
              {stats.dbSizeMb <= FREE_LIMITS.dbMb * 0.7 && stats.totalUsers <= 200 && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
                  All systems healthy — well within free tier limits
                </div>
              )}
            </div>

            {/* Recent Signups */}
            <h2 className="text-lg font-bold text-brand-charcoal mb-3">Recent Signups</h2>
            <div className="rounded-[12px] border border-brand-bone-300/60 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-bone-300/60 bg-brand-bone-100">
                    <th className="text-left px-4 py-2 text-[10px] font-bold text-brand-gray uppercase">Email</th>
                    <th className="text-left px-4 py-2 text-[10px] font-bold text-brand-gray uppercase">Tier</th>
                    <th className="text-left px-4 py-2 text-[10px] font-bold text-brand-gray uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSignups.map((u, i) => (
                    <tr key={i} className="border-b border-brand-bone-300/30 last:border-0">
                      <td className="px-4 py-2 text-brand-charcoal">{u.email}</td>
                      <td className="px-4 py-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          u.tier === "architect" ? "bg-teal-100 text-teal-700" :
                          u.tier === "premium" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {u.tier}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-brand-gray">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                  {stats.recentSignups.length === 0 && (
                    <tr><td colSpan={3} className="px-4 py-4 text-center text-brand-gray">No users yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
