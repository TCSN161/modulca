"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/store";
import { saveProject } from "@/features/auth/projectService";
import { BUILDING_PRESETS } from "@/shared/types";

/**
 * New Project page — wrapped in Suspense because useSearchParams() needs it.
 * Supports URL params:
 *   ?name=MyHouse&preset=house-compact
 * for pre-filling from dashboard template clicks.
 */
function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId, canCreateProject } = useAuthStore();

  // Pre-fill from URL params (arriving from dashboard template)
  const initialName = searchParams.get("name") || "";
  const initialPreset = searchParams.get("preset");

  const [name, setName] = useState(initialName);
  const [preset, setPreset] = useState<string | null>(
    initialPreset && BUILDING_PRESETS.some((p) => p.id === initialPreset) ? initialPreset : null
  );
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If URL changes post-mount, keep in sync
  useEffect(() => {
    const n = searchParams.get("name");
    const p = searchParams.get("preset");
    if (n) setName(n);
    if (p && BUILDING_PRESETS.some((bp) => bp.id === p)) setPreset(p);
  }, [searchParams]);

  const handleCreate = async () => {
    setError(null);

    if (!name.trim()) {
      setError("Please enter a project name.");
      return;
    }

    // Respect tier limits — prevents silent failure when user hits cap
    const permission = canCreateProject();
    if (!permission.allowed) {
      setError(permission.reason || "You have reached your project limit. Upgrade your plan to create more.");
      return;
    }

    setCreating(true);

    try {
      const data: Record<string, unknown> = { preset: preset ?? undefined };
      const result = await saveProject(userId ?? "demo", { name: name.trim(), data });

      if (result.ok) {
        try {
          localStorage.setItem(
            "modulca-active-project",
            JSON.stringify({ id: result.value.id, name: result.value.name })
          );
        } catch {
          /* non-critical: localStorage might be disabled */
        }
        router.push(`/project/${result.value.id}/land`);
        return; // Don't reset creating — page is navigating
      }

      // Save failed — show concrete error instead of silently re-enabling button
      setError(
        result.error?.message ||
          "Could not create project. Please try again, or sign in if you haven't."
      );
    } catch (err) {
      console.error("[NewProject] Failed to create:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-brand-teal-800"
        >
          &larr; Back to Dashboard
        </Link>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h1 className="mb-1 text-xl font-bold text-brand-teal-800">New Project</h1>
          <p className="mb-6 text-sm text-gray-500">
            Name your project and optionally pick a starting template.
          </p>

          <div className="mb-5">
            <label
              htmlFor="project-name"
              className="mb-1 block text-xs font-medium text-gray-600"
            >
              Project Name
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim() && !creating) handleCreate();
              }}
              placeholder="My Modular Home"
              autoFocus={!initialName}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal-500 focus:ring-1 focus:ring-brand-teal-500"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-xs font-medium text-gray-600">
              Start from template (optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BUILDING_PRESETS.map((bp) => (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => {
                    setPreset(preset === bp.id ? null : bp.id);
                    if (error) setError(null);
                  }}
                  className={`rounded-lg border-2 px-2 py-2 text-left transition-colors ${
                    preset === bp.id
                      ? "border-brand-amber-500 bg-brand-amber-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="text-xs font-semibold text-gray-700">{bp.label}</div>
                  <div className="text-[10px] text-gray-400">{bp.cells.length} modules</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error display — user sees concrete reason if save fails */}
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="w-full rounded-lg bg-brand-amber-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-sm text-gray-400">Loading...</div>
        </div>
      }
    >
      <NewProjectForm />
    </Suspense>
  );
}
