"use client";

/**
 * CloneProjectButton — "Start from this design" action.
 *
 * Flow:
 *   1. Not signed in → redirect to /register?redirect=/portfolio/[slug]
 *   2. Signed in → POST to /api/portfolio/clone → redirect to /project/{id}/design
 *
 * Shows loading state, success toast, and error handling.
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";

interface Props {
  slug: string;
  title: string;
  className?: string;
}

export default function CloneProjectButton({ slug, title, className }: Props) {
  const router = useRouter();
  const { userId, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClone = useCallback(async () => {
    setError(null);

    if (!isAuthenticated || !userId) {
      // Save intent so we can return here after signup
      try {
        sessionStorage.setItem("modulca-clone-intent", slug);
      } catch {
        /* ignore */
      }
      router.push(`/register?redirect=${encodeURIComponent(`/portfolio/${slug}`)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/portfolio/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name: `${title} (my copy)`, userId }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as { projectId: string; projectName: string };

      // Save as the active project before navigating
      try {
        localStorage.setItem(
          "modulca-active-project",
          JSON.stringify({ id: data.projectId, name: data.projectName })
        );
      } catch {
        /* ignore */
      }

      router.push(`/project/${data.projectId}/design`);
    } catch (err) {
      console.error("[CloneProjectButton]", err);
      setError(err instanceof Error ? err.message : "Failed to clone project");
      setLoading(false);
    }
  }, [isAuthenticated, userId, slug, title, router]);

  return (
    <div id="clone" className={className}>
      <button
        onClick={handleClone}
        disabled={loading}
        className="inline-flex items-center gap-2 btn-primary px-6 py-3 text-sm disabled:opacity-60"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
              <path
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                fill="currentColor"
              />
            </svg>
            Creating your copy...
          </>
        ) : (
          <>
            Start from this design
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      {!isAuthenticated && (
        <p className="mt-2 text-[11px] text-brand-gray">
          You&apos;ll be asked to sign in or create a free account first — takes 20 seconds.
        </p>
      )}
    </div>
  );
}
