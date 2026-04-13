import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/shared/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/ai-render/analytics?days=7
 *
 * Returns render analytics from Supabase render_logs table.
 * Used by admin dashboard for cost/usage insights.
 */
export async function GET(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const days = Number(req.nextUrl.searchParams.get("days") || "7");
  const since = new Date(Date.now() - days * 86400_000).toISOString();

  // Fetch recent logs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: logs, error } = await (supabase.from("render_logs") as any)
    .select("engine_id, status, cost_usd, latency_ms, image_size_bytes, cache_hit, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1000) as { data: Array<{ engine_id: string; status: string; cost_usd: number; latency_ms: number; image_size_bytes: number; cache_hit: boolean; created_at: string }> | null; error: Error | null };

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aggregate per engine
  const byEngine: Record<string, {
    total: number; success: number; failed: number;
    totalCost: number; avgLatency: number; cacheHits: number;
  }> = {};

  for (const log of logs || []) {
    const e = byEngine[log.engine_id] ??= {
      total: 0, success: 0, failed: 0, totalCost: 0, avgLatency: 0, cacheHits: 0,
    };
    e.total++;
    if (log.status === "success") e.success++;
    else e.failed++;
    e.totalCost += log.cost_usd || 0;
    e.avgLatency += log.latency_ms || 0;
    if (log.cache_hit) e.cacheHits++;
  }

  // Finalize averages
  for (const e of Object.values(byEngine)) {
    e.avgLatency = e.success > 0 ? Math.round(e.avgLatency / e.success) : 0;
  }

  const totalCost = (logs || []).reduce((sum, l) => sum + (l.cost_usd || 0), 0);
  const totalRenders = (logs || []).length;
  const cacheHitRate = totalRenders > 0
    ? ((logs || []).filter(l => l.cache_hit).length / totalRenders * 100).toFixed(1)
    : "0";

  return NextResponse.json({
    period: { days, since },
    summary: { totalRenders, totalCost: +totalCost.toFixed(4), cacheHitRate: `${cacheHitRate}%` },
    byEngine,
    recentLogs: (logs || []).slice(0, 50),
  });
}
