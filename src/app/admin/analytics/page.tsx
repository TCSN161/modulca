"use client";

import { useState, useCallback } from "react";

interface EngineStats {
  total: number;
  success: number;
  failed: number;
  totalCost: number;
  avgLatency: number;
  cacheHits: number;
}

interface AnalyticsData {
  period: { days: number; since: string };
  summary: { totalRenders: number; totalCost: number; cacheHitRate: string };
  byEngine: Record<string, EngineStats>;
  recentLogs: Array<{
    engine_id: string;
    status: string;
    cost_usd: number;
    latency_ms: number;
    cache_hit: boolean;
    created_at: string;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai-render/analytics?days=${days}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to load");
        return;
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [days]);

  const engines = data ? Object.entries(data.byEngine).sort((a, b) => b[1].total - a[1].total) : [];

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", fontFamily: "system-ui, sans-serif", background: "#0a0a0a", color: "#e0e0e0", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "4px" }}>Render Analytics</h1>
          <p style={{ color: "#888", fontSize: "14px" }}>Per-render cost tracking, engine performance, and cache efficiency.</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{ background: "#1a1a1a", color: "#e0e0e0", border: "1px solid #333", borderRadius: "6px", padding: "8px 12px", fontSize: "14px" }}
          >
            <option value={1}>Last 24h</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <button
            onClick={loadAnalytics}
            disabled={loading}
            style={{
              padding: "8px 20px",
              background: loading ? "#333" : "#2563eb",
              color: "#fff", border: "none", borderRadius: "8px",
              fontSize: "14px", fontWeight: 600, cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Loading..." : "Load Analytics"}
          </button>
          <a href="/admin/engines" style={{ padding: "8px 16px", fontSize: "12px", borderRadius: "6px", border: "1px solid #333", background: "#1a1a1a", color: "#888", textDecoration: "none" }}>
            Engine Test
          </a>
          <a href="/admin" style={{ padding: "8px 16px", fontSize: "12px", borderRadius: "6px", border: "1px solid #333", background: "#1a1a1a", color: "#888", textDecoration: "none" }}>
            Admin Home
          </a>
        </div>
      </div>

      {error && (
        <div style={{ background: "#1a1010", border: "1px solid #3a1a1a", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", color: "#fca5a5", fontSize: "14px" }}>
          {error}
          {error === "Supabase not configured" && (
            <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
              Run the migration: supabase/migrations/003_render_logs.sql
            </div>
          )}
        </div>
      )}

      {!data && !loading && !error && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#666" }}>
          <div style={{ fontSize: "18px", marginBottom: "8px" }}>Click &quot;Load Analytics&quot; to fetch render data from Supabase</div>
          <div style={{ fontSize: "13px" }}>Requires migration 003_render_logs.sql to be applied</div>
        </div>
      )}

      {data && (
        <>
          {/* Summary Cards */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
            <SummaryCard label="Total Renders" value={String(data.summary.totalRenders)} />
            <SummaryCard label="Total Cost" value={`$${data.summary.totalCost.toFixed(4)}`} color={data.summary.totalCost > 0 ? "#fbbf24" : "#22c55e"} />
            <SummaryCard label="Cache Hit Rate" value={data.summary.cacheHitRate} color="#93c5fd" />
            <SummaryCard label="Engines Used" value={String(engines.length)} />
            <SummaryCard label="Period" value={`${data.period.days}d`} />
          </div>

          {/* Per-Engine Table */}
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>Per-Engine Breakdown</h2>
          <div style={{ background: "#141414", borderRadius: "12px", border: "1px solid #222", overflow: "hidden", marginBottom: "24px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#1a1a1a", borderBottom: "1px solid #333" }}>
                  <th style={thStyle}>Engine</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Success</th>
                  <th style={thStyle}>Failed</th>
                  <th style={thStyle}>Success %</th>
                  <th style={thStyle}>Cost</th>
                  <th style={thStyle}>Avg Latency</th>
                  <th style={thStyle}>Cache Hits</th>
                </tr>
              </thead>
              <tbody>
                {engines.map(([id, stats]) => (
                  <tr key={id} style={{ borderBottom: "1px solid #222" }}>
                    <td style={tdStyle}><b>{id}</b></td>
                    <td style={tdStyle}>{stats.total}</td>
                    <td style={{ ...tdStyle, color: "#22c55e" }}>{stats.success}</td>
                    <td style={{ ...tdStyle, color: stats.failed > 0 ? "#ef4444" : "#666" }}>{stats.failed}</td>
                    <td style={tdStyle}>
                      {stats.total > 0 ? `${((stats.success / stats.total) * 100).toFixed(0)}%` : "—"}
                    </td>
                    <td style={{ ...tdStyle, color: stats.totalCost > 0 ? "#fbbf24" : "#22c55e" }}>
                      ${stats.totalCost.toFixed(4)}
                    </td>
                    <td style={{ ...tdStyle, color: "#93c5fd" }}>
                      {stats.avgLatency > 0 ? `${(stats.avgLatency / 1000).toFixed(1)}s` : "—"}
                    </td>
                    <td style={tdStyle}>{stats.cacheHits}</td>
                  </tr>
                ))}
                {engines.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ ...tdStyle, textAlign: "center", color: "#666", padding: "20px" }}>
                      No render data for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Recent Renders */}
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>Recent Renders (last 50)</h2>
          <div style={{ background: "#141414", borderRadius: "12px", border: "1px solid #222", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: "#1a1a1a", borderBottom: "1px solid #333" }}>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Engine</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Cost</th>
                  <th style={thStyle}>Latency</th>
                  <th style={thStyle}>Cache</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLogs.map((log, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #1a1a1a" }}>
                    <td style={{ ...tdStyle, color: "#888" }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={tdStyle}>{log.engine_id}</td>
                    <td style={{ ...tdStyle, color: log.status === "success" ? "#22c55e" : "#ef4444" }}>
                      {log.status}
                    </td>
                    <td style={tdStyle}>${(log.cost_usd || 0).toFixed(4)}</td>
                    <td style={{ ...tdStyle, color: "#93c5fd" }}>
                      {log.latency_ms ? `${(log.latency_ms / 1000).toFixed(1)}s` : "—"}
                    </td>
                    <td style={{ ...tdStyle, color: log.cache_hit ? "#22c55e" : "#666" }}>
                      {log.cache_hit ? "HIT" : "—"}
                    </td>
                  </tr>
                ))}
                {data.recentLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "#666", padding: "20px" }}>
                      No renders logged yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: "#141414", border: "1px solid #222", borderRadius: "8px", padding: "12px 20px" }}>
      <div style={{ fontSize: "12px", color: "#888" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: 700, color: color || "#e0e0e0" }}>{value}</div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left", padding: "10px 12px", fontSize: "11px",
  fontWeight: 700, color: "#888", textTransform: "uppercase",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 12px", color: "#e0e0e0",
};
