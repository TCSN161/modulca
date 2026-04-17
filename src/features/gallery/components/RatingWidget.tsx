"use client";

/**
 * RatingWidget — 1-5 stars. Guest clicks → redirect to register with
 * return-to URL so they land back on the same render after signup.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";

interface Props {
  slug: string;
  initialAvg: number;
  initialCount: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export default function RatingWidget({
  slug,
  initialAvg,
  initialCount,
  size = "md",
  showCount = true,
}: Props) {
  const router = useRouter();
  const { userId, isAuthenticated } = useAuthStore();
  const [avg, setAvg] = useState(initialAvg);
  const [count, setCount] = useState(initialCount);
  const [myVote, setMyVote] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const starSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-7 h-7" : "w-5 h-5";

  const handleClick = async (stars: number) => {
    if (!isAuthenticated || !userId) {
      try {
        sessionStorage.setItem("modulca-rate-intent", JSON.stringify({ slug, stars }));
      } catch {
        /* ignore */
      }
      router.push(`/register?redirect=${encodeURIComponent(`/g/${slug}`)}`);
      return;
    }

    setLoading(true);
    setFlash(null);
    try {
      const res = await fetch("/api/renders/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, stars, userId }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        ratingAvg: number;
        ratingCount: number;
        isOwner: boolean;
      };
      setMyVote(stars);
      setAvg(data.ratingAvg);
      setCount(data.ratingCount);
      setFlash(data.isOwner ? "Vote saved (owner, counts 0.5×)" : "Thanks for voting!");
      setTimeout(() => setFlash(null), 2500);
    } catch (err) {
      console.error("[rating]", err);
      setFlash(err instanceof Error ? err.message : "Vote failed");
      setTimeout(() => setFlash(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const displayValue = hover ?? myVote ?? Math.round(avg);

  return (
    <div className="flex items-center gap-2" aria-label={`Rating: ${avg.toFixed(1)} of 5, ${count} votes`}>
      <div className="flex gap-0.5" onMouseLeave={() => setHover(null)}>
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= displayValue;
          return (
            <button
              key={n}
              type="button"
              disabled={loading}
              onClick={() => handleClick(n)}
              onMouseEnter={() => setHover(n)}
              className={`${starSize} transition-transform hover:scale-110 disabled:cursor-wait`}
              aria-label={`Rate ${n} stars`}
            >
              <svg
                viewBox="0 0 24 24"
                fill={filled ? "#f59e0b" : "none"}
                stroke={filled ? "#f59e0b" : "#9ca3af"}
                strokeWidth={1.5}
                className="w-full h-full"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          );
        })}
      </div>

      <div className="text-xs text-brand-gray">
        {count > 0 ? (
          <span>
            <span className="font-semibold text-brand-charcoal">{avg.toFixed(1)}</span>
            {showCount && <span className="ml-1">({count})</span>}
          </span>
        ) : (
          <span className="text-brand-gray/60">No votes yet</span>
        )}
      </div>

      {flash && (
        <span
          className="text-[10px] text-brand-olive-700 animate-pulse"
          role="status"
        >
          {flash}
        </span>
      )}
    </div>
  );
}
