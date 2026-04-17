"use client";

/**
 * /admin/gallery — analytics over the public_renders table.
 * Simple data viz: bar charts of engine / room / style distribution
 * and a top-rated table. No external chart lib — pure CSS bars keep
 * the bundle light.
 */

import { useState, useEffect, useCallback } from "react";

interface GalleryStats {
  summary: {
    totalRenders: number;
    activeCount: number;
    hallOfFameCount: number;
    archivedCount: number;
    totalVotes: number;
    totalViews: number;
    totalSizeMb: number;
  };
  byEngine: Record<string, number>;
  byRoomType: Record<string, number>;
  byStyle: Record<string, number>;
  byFinish: Record<string, number>;
  byTier: Record<string, number>;
  ratingByEngine: Record<string, { avg: number; count: number }>;
  ratingByStyle: Record<string, { avg: number; count: number }>;
  ratingByRoom: Record<string, { avg: number; count: number }>;
  topRenders: Array<{
    id: string;
    engine: string;
    room: string;
    style: string;
    avg: number;
    votes: number;
    views: number;
  }>;
  generatedAt: string;
}

export default function GalleryAnalyticsPage() {
  const [data, setData] = useState<GalleryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/gallery-stats");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as GalleryStats;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1400px",
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
        background: "#0a0a0a",
        color: "#e0e0e0",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700 }}>Gallery Analytics</h1>
          <p style={{ fontSize: "14px", color: "#999" }}>
            Trends across all published renders. Data updates live from Supabase.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: "#1e3a8a",
            color: "#dbeafe",
            border: "none",
            borderRadius: "6px",
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#7f1d1d",
            color: "#fca5a5",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Summary cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <StatCard label="Total renders" value={data.summary.totalRenders} />
            <StatCard label="Active" value={data.summary.activeCount} color="#86efac" />
            <StatCard label="Hall of Fame" value={data.summary.hallOfFameCount} color="#fcd34d" />
            <StatCard label="Archived" value={data.summary.archivedCount} color="#9ca3af" />
            <StatCard label="Total votes" value={data.summary.totalVotes} color="#93c5fd" />
            <StatCard label="Total views" value={data.summary.totalViews} color="#c084fc" />
            <StatCard label="Storage" value={`${data.summary.totalSizeMb} MB`} color="#fbbf24" />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <Distribution title="By Engine" data={data.byEngine} />
            <Distribution title="By Room Type" data={data.byRoomType} />
            <Distribution title="By Style Direction" data={data.byStyle} />
            <Distribution title="By Finish Level" data={data.byFinish} />
            <Distribution title="By User Tier" data={data.byTier} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <RatingTable title="Avg Rating by Engine" data={data.ratingByEngine} />
            <RatingTable title="Avg Rating by Style" data={data.ratingByStyle} />
            <RatingTable title="Avg Rating by Room" data={data.ratingByRoom} />
          </div>

          {/* Top rated renders */}
          {data.topRenders.length > 0 && (
            <div
              style={{
                background: "#141414",
                border: "1px solid #222",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "24px",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>
                🏆 Top Rated Renders
              </h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                    <th style={{ textAlign: "left", padding: "8px", color: "#888" }}>Engine</th>
                    <th style={{ textAlign: "left", padding: "8px", color: "#888" }}>Room</th>
                    <th style={{ textAlign: "left", padding: "8px", color: "#888" }}>Style</th>
                    <th style={{ textAlign: "right", padding: "8px", color: "#888" }}>⭐ Avg</th>
                    <th style={{ textAlign: "right", padding: "8px", color: "#888" }}>Votes</th>
                    <th style={{ textAlign: "right", padding: "8px", color: "#888" }}>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topRenders.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                      <td style={{ padding: "8px" }}>{r.engine}</td>
                      <td style={{ padding: "8px", color: "#9ca3af" }}>{r.room || "—"}</td>
                      <td style={{ padding: "8px", color: "#9ca3af" }}>{r.style || "—"}</td>
                      <td style={{ padding: "8px", textAlign: "right", color: "#fbbf24", fontWeight: 600 }}>
                        {r.avg.toFixed(2)}
                      </td>
                      <td style={{ padding: "8px", textAlign: "right" }}>{r.votes}</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>{r.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p style={{ fontSize: "11px", color: "#666", textAlign: "right" }}>
            Generated: {new Date(data.generatedAt).toLocaleString()}
          </p>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid #222",
        borderRadius: "8px",
        padding: "14px 18px",
      }}
    >
      <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div style={{ fontSize: "24px", fontWeight: 700, color: color || "#e0e0e0", marginTop: "4px" }}>
        {value}
      </div>
    </div>
  );
}

function Distribution({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid #222",
        borderRadius: "12px",
        padding: "16px 20px",
      }}
    >
      <h3 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "12px", color: "#9ca3af" }}>
        {title}
      </h3>
      {entries.length === 0 ? (
        <p style={{ fontSize: "12px", color: "#666" }}>No data yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {entries.map(([key, val]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "11px", width: "120px", color: "#e0e0e0" }}>
                {key || "—"}
              </span>
              <div
                style={{
                  flex: 1,
                  height: "18px",
                  background: "#1a1a1a",
                  borderRadius: "4px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(val / max) * 100}%`,
                    background: "linear-gradient(90deg, #1e3a8a, #3b82f6)",
                  }}
                />
              </div>
              <span style={{ fontSize: "11px", width: "32px", textAlign: "right", color: "#888" }}>
                {val}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RatingTable({
  title,
  data,
}: {
  title: string;
  data: Record<string, { avg: number; count: number }>;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1].avg - a[1].avg);
  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid #222",
        borderRadius: "12px",
        padding: "16px 20px",
      }}
    >
      <h3 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "12px", color: "#9ca3af" }}>
        {title}
      </h3>
      {entries.length === 0 ? (
        <p style={{ fontSize: "12px", color: "#666" }}>No rated renders yet.</p>
      ) : (
        <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
          <tbody>
            {entries.map(([k, v]) => (
              <tr key={k} style={{ borderBottom: "1px solid #1a1a1a" }}>
                <td style={{ padding: "5px 0", color: "#e0e0e0" }}>{k || "—"}</td>
                <td style={{ padding: "5px 0", textAlign: "right", color: "#fbbf24", fontWeight: 600 }}>
                  ⭐ {v.avg.toFixed(2)}
                </td>
                <td style={{ padding: "5px 0", textAlign: "right", color: "#666", width: "50px" }}>
                  {v.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
