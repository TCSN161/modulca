"use client";

import { useState, useCallback } from "react";

interface EngineResult {
  engineId: string;
  label: string;
  status: "success" | "failed" | "error";
  image?: string;
  contentType?: string;
  engine?: string;
  costUsd?: number;
  costPerImage?: number;
  latencyMs?: number;
  imageSize?: number;
  error?: string;
  capabilities: string[];
  freeQuota: string;
}

interface CompareResponse {
  prompt: string;
  width: number;
  height: number;
  seed: string;
  timestamp: string;
  engines: EngineResult[];
}

interface BudgetEngine {
  engineId: string;
  totalBudgetUsd: number;
  spentUsd: number;
  renderCount: number;
  failCount: number;
  dailyRenderCount: number;
  dailyLimit: number;
  disabled: boolean;
  healthScore: number;
  avgLatencyMs: number;
  lastSuccessAt: string | null;
  lastError: string | null;
  remainingRenders: number;
  remainingBudget: number;
}

interface BudgetSummary {
  totalSpent: number;
  totalRenders: number;
  totalFails: number;
  engines: BudgetEngine[];
}

const DEFAULT_PROMPT =
  "modern scandinavian living room, natural light, minimalist birch furniture, white walls, warm atmosphere, interior design photography";

export default function EngineComparisonPage() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(288);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompareResponse | null>(null);
  const [selectedEngines, setSelectedEngines] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"latency" | "cost" | "size">("latency");
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [showBudget, setShowBudget] = useState(false);

  const loadBudget = useCallback(async () => {
    try {
      const res = await fetch("/api/ai-render/budget");
      const data: BudgetSummary = await res.json();
      setBudget(data);
      setShowBudget(true);
    } catch (err) {
      console.error("Failed to load budget:", err);
    }
  }, []);

  const allEngineIds = [
    "pollinations", "ai-horde", "together", "cloudflare", "huggingface",
    "fal", "fireworks", "segmind", "deepinfra", "replicate",
    "leonardo", "blackforest", "stability", "openai", "prodia",
  ];

  const runComparison = useCallback(async () => {
    setLoading(true);
    setResults(null);
    try {
      const params = new URLSearchParams({
        prompt,
        width: String(width),
        height: String(height),
      });
      if (selectedEngines.length > 0) {
        params.set("engines", selectedEngines.join(","));
      }
      const res = await fetch(`/api/ai-render/compare?${params}`);
      const data: CompareResponse = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Comparison failed:", err);
    } finally {
      setLoading(false);
    }
  }, [prompt, width, height, selectedEngines]);

  const toggleEngine = (id: string) => {
    setSelectedEngines((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedEngines([]);
  const selectFree = () =>
    setSelectedEngines(["pollinations", "ai-horde", "together", "cloudflare", "huggingface"]);
  const selectImg2Img = () =>
    setSelectedEngines(["together", "fal", "replicate", "stability"]);

  const sortedResults = results?.engines
    ? [...results.engines].sort((a, b) => {
        if (sortBy === "latency") return (a.latencyMs ?? 999999) - (b.latencyMs ?? 999999);
        if (sortBy === "cost") return (a.costUsd ?? a.costPerImage ?? 0) - (b.costUsd ?? b.costPerImage ?? 0);
        if (sortBy === "size") return (b.imageSize ?? 0) - (a.imageSize ?? 0);
        return 0;
      })
    : [];

  const successCount = sortedResults.filter((r) => r.status === "success").length;
  const totalCost = sortedResults
    .filter((r) => r.status === "success")
    .reduce((sum, r) => sum + (r.costUsd ?? 0), 0);
  const avgLatency =
    successCount > 0
      ? sortedResults
          .filter((r) => r.status === "success")
          .reduce((sum, r) => sum + (r.latencyMs ?? 0), 0) / successCount
      : 0;

  return (
    <div style={{ padding: "24px", maxWidth: "1600px", margin: "0 auto", fontFamily: "system-ui, sans-serif", background: "#0a0a0a", color: "#e0e0e0", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700 }}>
          AI Engine Comparison
        </h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={loadBudget} style={{ ...chipStyle(showBudget), padding: "8px 16px" }}>
            {showBudget ? "Hide Budget" : "Show Budget"}
          </button>
          <a href="/admin" style={{ padding: "8px 16px", fontSize: "12px", borderRadius: "6px", border: "1px solid #333", background: "#1a1a1a", color: "#888", textDecoration: "none" }}>
            Admin Home
          </a>
        </div>
      </div>
      <p style={{ color: "#888", marginBottom: "24px" }}>
        Test all 15 engines with the same prompt. Compare quality, speed, and cost side-by-side.
      </p>

      {/* Budget Panel */}
      {showBudget && budget && (
        <div style={{ background: "#141414", borderRadius: "12px", padding: "20px", marginBottom: "24px", border: "1px solid #222" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>Engine Budget Status</h2>
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
            <StatCard label="Total Renders" value={String(budget.totalRenders)} />
            <StatCard label="Total Failures" value={String(budget.totalFails)} color={budget.totalFails > 0 ? "#ef4444" : "#22c55e"} />
            <StatCard label="Total Spent" value={`$${budget.totalSpent.toFixed(4)}`} />
            <StatCard label="Success Rate" value={budget.totalRenders > 0 ? `${((1 - budget.totalFails / (budget.totalRenders + budget.totalFails)) * 100).toFixed(0)}%` : "—"} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
            {budget.engines.map((e) => (
              <div key={e.engineId} style={{
                padding: "10px 12px", borderRadius: "8px",
                background: e.disabled ? "#1a1010" : e.healthScore < 30 ? "#1a1a10" : "#101a10",
                border: `1px solid ${e.disabled ? "#3a1a1a" : e.healthScore < 30 ? "#3a3a1a" : "#1a3a1a"}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>{e.engineId}</span>
                  <span style={{ fontSize: "11px", color: e.healthScore >= 70 ? "#22c55e" : e.healthScore >= 30 ? "#fbbf24" : "#ef4444" }}>
                    HP {e.healthScore}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "#888" }}>
                  {e.renderCount} renders | ${e.spentUsd.toFixed(4)} spent
                </div>
                <div style={{ fontSize: "11px", color: "#888" }}>
                  {e.remainingRenders === -1 ? "Unlimited" : `${e.remainingRenders} left`}
                  {e.totalBudgetUsd !== -1 && ` | $${e.remainingBudget.toFixed(2)} budget`}
                </div>
                {e.lastError && (
                  <div style={{ fontSize: "10px", color: "#ef4444", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.lastError}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ background: "#141414", borderRadius: "12px", padding: "20px", marginBottom: "24px", border: "1px solid #222" }}>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "#999" }}>
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          style={{ width: "100%", background: "#1a1a1a", color: "#e0e0e0", border: "1px solid #333", borderRadius: "8px", padding: "10px", fontSize: "14px", resize: "vertical" }}
        />

        <div style={{ display: "flex", gap: "16px", marginTop: "12px", flexWrap: "wrap", alignItems: "end" }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#999" }}>Width</label>
            <select value={width} onChange={(e) => setWidth(Number(e.target.value))} style={selectStyle}>
              <option value={256}>256 (tiny)</option>
              <option value={512}>512 (draft)</option>
              <option value={768}>768 (medium)</option>
              <option value={1024}>1024 (standard)</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#999" }}>Height</label>
            <select value={height} onChange={(e) => setHeight(Number(e.target.value))} style={selectStyle}>
              <option value={256}>256</option>
              <option value={288}>288</option>
              <option value={512}>512</option>
              <option value={576}>576</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={selectAll} style={chipStyle(selectedEngines.length === 0)}>All (14)</button>
            <button onClick={selectFree} style={chipStyle(false)}>Free only</button>
            <button onClick={selectImg2Img} style={chipStyle(false)}>img2img</button>
          </div>

          <button
            onClick={runComparison}
            disabled={loading}
            style={{
              marginLeft: "auto",
              padding: "10px 28px",
              background: loading ? "#333" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Running comparison..." : "Run Comparison"}
          </button>
        </div>

        {/* Engine selector */}
        <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {allEngineIds.map((id) => (
            <button
              key={id}
              onClick={() => toggleEngine(id)}
              style={{
                padding: "4px 10px",
                fontSize: "12px",
                borderRadius: "6px",
                border: "1px solid",
                borderColor: selectedEngines.length === 0 || selectedEngines.includes(id) ? "#2563eb" : "#333",
                background: selectedEngines.length === 0 || selectedEngines.includes(id) ? "#1e3a5f" : "#1a1a1a",
                color: selectedEngines.length === 0 || selectedEngines.includes(id) ? "#93c5fd" : "#666",
                cursor: "pointer",
              }}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
          <div style={{ fontSize: "20px", marginBottom: "8px" }}>Testing engines in parallel...</div>
          <div style={{ fontSize: "14px" }}>This may take up to 60 seconds. Each engine has a timeout.</div>
        </div>
      )}

      {/* Summary stats */}
      {results && !loading && (
        <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
          <StatCard label="Engines Tested" value={String(results.engines.length)} />
          <StatCard label="Successful" value={`${successCount}/${results.engines.length}`} color={successCount > 0 ? "#22c55e" : "#ef4444"} />
          <StatCard label="Total Cost" value={`$${totalCost.toFixed(4)}`} />
          <StatCard label="Avg Latency" value={`${Math.round(avgLatency)}ms`} />

          {/* Sort controls */}
          <div style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#888" }}>Sort by:</span>
            <button onClick={() => setSortBy("latency")} style={chipStyle(sortBy === "latency")}>Speed</button>
            <button onClick={() => setSortBy("cost")} style={chipStyle(sortBy === "cost")}>Cost</button>
            <button onClick={() => setSortBy("size")} style={chipStyle(sortBy === "size")}>Quality</button>
          </div>
        </div>
      )}

      {/* Results grid */}
      {results && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {sortedResults.map((r) => (
            <div
              key={r.engineId}
              style={{
                background: "#141414",
                borderRadius: "12px",
                border: `1px solid ${r.status === "success" ? "#222" : "#3a1a1a"}`,
                overflow: "hidden",
              }}
            >
              {/* Image */}
              <div style={{ width: "100%", aspectRatio: `${width}/${height}`, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {r.status === "success" && r.image ? (
                  <img
                    src={r.image}
                    alt={`${r.label} render`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>X</div>
                    <div style={{ fontSize: "13px" }}>{r.error || "Failed"}</div>
                  </div>
                )}

                {/* Capabilities badges */}
                <div style={{ position: "absolute", top: "8px", left: "8px", display: "flex", gap: "4px" }}>
                  {r.capabilities?.map((cap) => (
                    <span key={cap} style={{ padding: "2px 8px", fontSize: "10px", borderRadius: "4px", background: cap === "img2img" ? "#7c3aed" : "#1e3a5f", color: cap === "img2img" ? "#ddd6fe" : "#93c5fd" }}>
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontWeight: 600, fontSize: "14px" }}>{r.label}</span>
                  <span style={{
                    padding: "2px 8px",
                    fontSize: "11px",
                    borderRadius: "4px",
                    background: r.status === "success" ? "#14532d" : "#7f1d1d",
                    color: r.status === "success" ? "#86efac" : "#fca5a5",
                  }}>
                    {r.status}
                  </span>
                </div>

                {r.status === "success" && (
                  <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#888" }}>
                    <span>Cost: <b style={{ color: (r.costUsd ?? 0) === 0 ? "#22c55e" : "#fbbf24" }}>${(r.costUsd ?? 0).toFixed(4)}</b></span>
                    <span>Latency: <b style={{ color: "#93c5fd" }}>{((r.latencyMs ?? 0) / 1000).toFixed(1)}s</b></span>
                    <span>Size: <b>{((r.imageSize ?? 0) / 1024).toFixed(0)}KB</b></span>
                  </div>
                )}

                <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
                  Free: {r.freeQuota}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Helper components ── */

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: "#141414", border: "1px solid #222", borderRadius: "8px", padding: "12px 20px" }}>
      <div style={{ fontSize: "12px", color: "#888" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: 700, color: color || "#e0e0e0" }}>{value}</div>
    </div>
  );
}

/* ── Styles ── */

const selectStyle: React.CSSProperties = {
  background: "#1a1a1a",
  color: "#e0e0e0",
  border: "1px solid #333",
  borderRadius: "6px",
  padding: "8px 12px",
  fontSize: "14px",
};

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: "6px 12px",
    fontSize: "12px",
    borderRadius: "6px",
    border: "1px solid",
    borderColor: active ? "#2563eb" : "#333",
    background: active ? "#1e3a5f" : "#1a1a1a",
    color: active ? "#93c5fd" : "#888",
    cursor: "pointer",
  };
}
