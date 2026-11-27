"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useArchitectStore } from "@/features/architect/store";
import ArchitectWorkspace from "@/features/architect/components/ArchitectWorkspace";
import FeatureGate from "@/shared/components/FeatureGate";
import { AuthNav } from "@/features/auth/components/AuthNav";
import Link from "next/link";
import { useAuthReady } from "@/features/design/hooks/useAuthReady";
import AuthLoading from "@/features/design/components/AuthLoading";
import { useAuthStore } from "@/features/auth/store";
import { loadProject } from "@/features/auth/projectService";
import { getActiveProject } from "@/features/design/projectSnapshot";

export default function ArchitectPage() {
  const params = useParams();
  const projectId = (params?.id as string) || "demo";
  const initProject = useArchitectStore((s) => s.initProject);
  // BUG-ST09: on a full page load the tier is still the default guest one; wait for the session.
  const authReady = useAuthReady();

  const setProjectName = useArchitectStore((s) => s.setProjectName);
  const projectName = useArchitectStore((s) => s.project?.projectName);
  const userId = useAuthStore((s) => s.userId);

  useEffect(() => {
    // BUG-ST39: never the raw id; the real name is resolved below
    const active = getActiveProject();
    initProject(projectId, active.id === projectId && active.name ? active.name : "Project");
  }, [projectId, initProject]);

  // BUG-ST39: replace the placeholder / old "Project <id>" with the saved project's name
  useEffect(() => {
    const active = getActiveProject();
    if (active.id === projectId && active.name) {
      setProjectName(active.name);
      return;
    }
    if (!userId || projectId === "demo") return;
    let cancelled = false;
    loadProject(userId, projectId).then((r) => {
      if (!cancelled && r.ok && r.value.name) setProjectName(r.value.name);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [projectId, userId, setProjectName]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <Link
              href={`/project/${projectId}/presentation`}
              className="text-xs text-gray-400 hover:text-brand-teal-700 transition-colors"
            >
              &larr; Back to Project
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <h1 className="text-sm font-bold text-brand-teal-800">
              Architect Workspace
            </h1>
            {projectName && (
              <span className="hidden sm:inline max-w-[16rem] truncate text-xs text-gray-500" data-testid="architect-project-name">
                {projectName}
              </span>
            )}
            <span className="rounded-full bg-brand-teal-100 px-2 py-0.5 text-[9px] font-bold text-brand-teal-700 uppercase tracking-wider">
              Pro
            </span>
          </div>
          <AuthNav />
        </div>
      </header>

      {/* Gate to Architect+ tier */}
      {authReady ? (
        <FeatureGate requires="projectCollaboration">
          <ArchitectWorkspace />
        </FeatureGate>
      ) : (
        <AuthLoading />
      )}
    </div>
  );
}
