"use client";

/**
 * PublishButton — reusable button that publishes a render to the public gallery.
 *
 * Used in:
 *   - /admin/engines (admin test grid) — isAdmin=true, no user_id needed
 *   - /project/[id]/render (user-generated renders) — userId passed, isAdmin=false
 *
 * Input: imageDataUrl (data URL) + metadata about the render.
 * On success: shows landing page link, disables button (already published).
 */

import { useState } from "react";
import { useAuthStore } from "@/features/auth/store";

export interface PublishButtonProps {
  imageDataUrl: string;
  engineId: string;
  isAdmin?: boolean;
  promptExcerpt?: string;
  roomType?: string;
  styleDirection?: string;
  finishLevel?: string;
  moduleCount?: number;
  areaSqm?: number;
  estimatedCostEur?: number;
  showPrice?: boolean;
  latencyMs?: number;
  size?: "sm" | "md";
  /** Called with the new slug after successful publish */
  onPublished?: (payload: { slug: string; landingUrl: string }) => void;
}

export default function PublishButton(props: PublishButtonProps) {
  const { userId, userTier, isAuthenticated } = useAuthStore();
  const [state, setState] = useState<
    { status: "idle" }
    | { status: "loading" }
    | { status: "published"; slug: string; landingUrl: string }
    | { status: "error"; message: string }
  >({ status: "idle" });

  const handlePublish = async () => {
    if (!props.isAdmin && !isAuthenticated) {
      setState({ status: "error", message: "Sign in to publish" });
      return;
    }
    setState({ status: "loading" });
    try {
      const body = {
        imageDataUrl: props.imageDataUrl,
        engineId: props.engineId,
        userId: props.isAdmin ? undefined : userId,
        isAdmin: props.isAdmin ?? false,
        userTier: userTier ?? undefined,
        promptExcerpt: props.promptExcerpt,
        roomType: props.roomType,
        styleDirection: props.styleDirection,
        finishLevel: props.finishLevel,
        moduleCount: props.moduleCount,
        areaSqm: props.areaSqm,
        estimatedCostEur: props.estimatedCostEur,
        showPrice: props.showPrice ?? true,
        latencyMs: props.latencyMs,
      };
      const res = await fetch("/api/renders/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { slug: string; landingUrl: string };
      setState({ status: "published", slug: data.slug, landingUrl: data.landingUrl });
      props.onPublished?.(data);
    } catch (err) {
      console.error("[publish]", err);
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Publish failed",
      });
    }
  };

  if (state.status === "published") {
    return (
      <a
        href={state.landingUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: props.size === "sm" ? "4px 10px" : "6px 14px",
          fontSize: props.size === "sm" ? "11px" : "12px",
          borderRadius: "6px",
          background: "#14532d",
          color: "#86efac",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        ✓ Published — view ↗
      </a>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <button
        onClick={handlePublish}
        disabled={state.status === "loading"}
        style={{
          padding: props.size === "sm" ? "4px 10px" : "6px 14px",
          fontSize: props.size === "sm" ? "11px" : "12px",
          borderRadius: "6px",
          background: state.status === "loading" ? "#374151" : "#1e3a8a",
          color: "#dbeafe",
          border: "1px solid #2563eb",
          cursor: state.status === "loading" ? "wait" : "pointer",
          fontWeight: 600,
        }}
      >
        {state.status === "loading" ? "Publishing..." : "📤 Publish to gallery"}
      </button>
      {state.status === "error" && (
        <span style={{ fontSize: "10px", color: "#fca5a5" }}>{state.message}</span>
      )}
    </div>
  );
}
