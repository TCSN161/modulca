"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useArchitectStore } from "@/features/architect/store";
import ArchitectWorkspace from "@/features/architect/components/ArchitectWorkspace";
import FeatureGate from "@/shared/components/FeatureGate";
import { AuthNav } from "@/features/auth/components/AuthNav";
import Link from "next/link";

export default function ArchitectPage() {
  const params = useParams();
  const projectId = (params?.id as string) || "demo";
  const initProject = useArchitectStore((s) => s.initProject);

  useEffect(() => {
    initProject(projectId, `Project ${projectId}`);
  }, [projectId, initProject]);

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
            <span className="rounded-full bg-brand-teal-100 px-2 py-0.5 text-[9px] font-bold text-brand-teal-700 uppercase tracking-wider">
              Pro
            </span>
          </div>
          <AuthNav />
        </div>
      </header>

      {/* Gate to Architect+ tier */}
      <FeatureGate requires="projectCollaboration">
        <ArchitectWorkspace />
      </FeatureGate>
    </div>
  );
}
