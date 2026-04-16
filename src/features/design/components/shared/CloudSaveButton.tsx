"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/features/auth/store";
import { saveProject } from "@/features/auth/projectService";
import { useDesignStore } from "../../store";
import { useLandStore } from "@/features/land/store";
import { Cloud, CloudOff, Check, Loader2 } from "lucide-react";

/**
 * Cloud Save Button — shows in the design flow header.
 * Auto-saves to cloud every 60 seconds when user is authenticated.
 * Shows save status: saved, saving, unsaved, offline.
 */

type SaveStatus = "idle" | "saving" | "saved" | "error" | "offline";

export default function CloudSaveButton() {
  const { isAuthenticated, userId } = useAuthStore();
  const designStore = useDesignStore();
  const { gridCells, gridRotation } = useLandStore();

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [showNameInput, setShowNameInput] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load active project info from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("modulca-active-project");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.id) setProjectId(parsed.id);
        if (parsed.name) setProjectName(parsed.name);
      }
    } catch { /* */ }
  }, []);

  const doSave = useCallback(async () => {
    if (!userId) return;

    setStatus("saving");

    // Gather full design state
    const { modules, finishLevel, styleDirection, styleDescription, stylePhoto, moodboardPins, savedRenders, moduleFixtures } = designStore;

    const projectData: Record<string, unknown> = {
      modules,
      finishLevel,
      gridRotation,
      styleDirection,
      styleDescription,
      stylePhoto,
      moodboardPins,
      savedRenders,
      moduleFixtures,
      gridCells: gridCells.filter((c) => c.moduleType !== null),
    };

    try {
      const result = await saveProject(userId, {
        id: projectId ?? undefined,
        name: projectName,
        data: projectData,
      });

      if (result.ok) {
        setProjectId(result.value.id);
        setStatus("saved");
        setLastSaved(new Date());

        // Persist active project reference
        localStorage.setItem(
          "modulca-active-project",
          JSON.stringify({ id: result.value.id, name: projectName })
        );
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }

    // Reset status after 3s
    setTimeout(() => setStatus((s) => (s === "saved" || s === "error" ? "idle" : s)), 3000);
  }, [userId, projectId, projectName, designStore, gridCells, gridRotation]);

  // Auto-save every 60 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    const interval = setInterval(() => {
      if (designStore.modules.length > 0) {
        doSave();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, userId, doSave, designStore.modules.length]);

  // Not authenticated — show nothing or a subtle "sign in to save" hint
  if (!isAuthenticated) {
    return (
      <a
        href="/login"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        title="Sign in to save your project to the cloud"
      >
        <CloudOff size={14} />
        <span className="hidden sm:inline">Sign in to save</span>
      </a>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Project name (click to edit) */}
      {showNameInput ? (
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onBlur={() => setShowNameInput(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setShowNameInput(false);
              doSave();
            }
          }}
          className="w-32 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-brand-teal-500"
          autoFocus
        />
      ) : (
        <button
          onClick={() => setShowNameInput(true)}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors truncate max-w-[120px]"
          title="Click to rename project"
        >
          {projectName}
        </button>
      )}

      {/* Save button */}
      <button
        onClick={doSave}
        disabled={status === "saving"}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
          status === "saved"
            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
            : status === "saving"
            ? "bg-gray-100 text-gray-400 border border-gray-200"
            : status === "error"
            ? "bg-red-50 text-red-500 border border-red-200"
            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
        }`}
        title={lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : "Save to cloud"}
      >
        {status === "saving" ? (
          <Loader2 size={13} className="animate-spin" />
        ) : status === "saved" ? (
          <Check size={13} />
        ) : (
          <Cloud size={13} />
        )}
        <span className="hidden sm:inline">
          {status === "saving"
            ? "Saving..."
            : status === "saved"
            ? "Saved"
            : status === "error"
            ? "Error"
            : "Save"}
        </span>
      </button>
    </div>
  );
}
