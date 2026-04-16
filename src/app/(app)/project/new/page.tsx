"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/store";
import { saveProject } from "@/features/auth/projectService";
import { BUILDING_PRESETS } from "@/shared/types";

export default function NewProjectPage() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const [name, setName] = useState("");
  const [preset, setPreset] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);

    try {
      const data: Record<string, unknown> = { preset: preset ?? undefined };
      const result = await saveProject(userId ?? "demo", { name: name.trim(), data });

      if (result) {
        try {
          localStorage.setItem("modulca-active-project", JSON.stringify({ id: result.id, name: result.name }));
        } catch { /* */ }
        router.push(`/project/${result.id}/land`);
      }
    } catch (err) {
      console.error("[NewProject] Failed to create:", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-brand-teal-800">
          &larr; Back to Dashboard
        </Link>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h1 className="mb-1 text-xl font-bold text-brand-teal-800">New Project</h1>
          <p className="mb-6 text-sm text-gray-500">Name your project and optionally pick a starting template.</p>

          <div className="mb-5">
            <label htmlFor="project-name" className="mb-1 block text-xs font-medium text-gray-600">Project Name</label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Modular Home"
              autoFocus
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-teal-500 focus:ring-1 focus:ring-brand-teal-500"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-xs font-medium text-gray-600">Start from template (optional)</label>
            <div className="grid grid-cols-3 gap-2">
              {BUILDING_PRESETS.map((bp) => (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => setPreset(preset === bp.id ? null : bp.id)}
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

          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="w-full rounded-lg bg-brand-amber-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-amber-600 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
