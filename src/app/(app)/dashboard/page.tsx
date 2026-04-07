"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/store";
import { listProjects, deleteProject, type ProjectRecord } from "@/features/auth/projectService";
import { getTierConfig } from "@/features/auth/types";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, userId, userName, userEmail, userTier, signOut } = useAuthStore();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const tierConfig = getTierConfig(userTier);
  const maxProjects = tierConfig.features.maxProjects;
  const atLimit = maxProjects !== -1 && projects.length >= maxProjects;

  const loadProjects = useCallback(async () => {
    const list = await listProjects(userId ?? "demo");
    setProjects(list);
    setLoaded(true);
  }, [userId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleDelete = async (id: string) => {
    await deleteProject(userId ?? "demo", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleLoad = (project: ProjectRecord) => {
    // Store project data for the design flow to pick up
    try {
      localStorage.setItem("modulca-design", JSON.stringify(project.data));
      localStorage.setItem("modulca-active-project", JSON.stringify({ id: project.id, name: project.name }));
    } catch { /* */ }
    router.push("/project/demo/land");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-4 md:px-6 bg-white border-b border-gray-200 shrink-0">
        <Link href="/" className="text-lg font-bold text-brand-teal-800 tracking-tight">
          Modul<span className="text-brand-amber-500">CA</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/project/demo/land"
            className="px-4 py-2 rounded-lg bg-brand-amber-500 text-white text-sm font-semibold hover:bg-brand-amber-600 transition-colors"
          >
            + New Project
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-medium text-gray-700">{userName || userEmail}</div>
                <div className="text-[10px] text-gray-400" style={{ color: tierConfig.color }}>
                  {tierConfig.label}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm text-gray-500 hover:text-brand-teal-800">
              Log in
            </Link>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-10 px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-brand-teal-800">My Projects</h1>
              <p className="text-sm text-gray-500 mt-1">
                {projects.length}{maxProjects !== -1 ? `/${maxProjects}` : ""} project{projects.length !== 1 ? "s" : ""}
                {userTier === "free" && " (free tier)"}
              </p>
            </div>
            {atLimit && (
              <button
                onClick={() => setShowUpgrade(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-amber-500 to-brand-amber-600 text-white text-sm font-semibold hover:shadow-md transition-all"
              >
                Upgrade Plan
              </button>
            )}
          </div>

          {/* Upgrade banner */}
          {showUpgrade && (
            <div className="bg-gradient-to-br from-brand-teal-800 to-brand-teal-700 rounded-xl shadow-lg p-6 mb-8 text-white">
              <h2 className="text-lg font-bold mb-2">Upgrade to {userTier === "free" ? "Premium" : "Architect"}</h2>
              <p className="text-sm text-brand-teal-200 mb-4">
                {userTier === "free"
                  ? "Unlock up to 12 modules, HD AI renders, all drawing types, and building permits."
                  : "Unlock unlimited projects, 4K renders, DWG export, team collaboration, and white-label."}
              </p>
              <div className="flex items-center gap-6 mb-4">
                <div>
                  <span className="text-3xl font-bold">
                    &euro;{userTier === "free" ? "19" : "49"}
                  </span>
                  <span className="text-sm text-brand-teal-200">/month</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/pricing" className="px-5 py-2 rounded-lg bg-brand-amber-500 text-white text-sm font-semibold hover:bg-brand-amber-600 transition-colors">
                  Upgrade Now
                </Link>
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="px-5 py-2 rounded-lg border border-white/30 text-sm hover:bg-white/10 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Projects grid */}
          {!loaded ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-teal-800 border-t-transparent" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No projects yet</h3>
              <p className="text-sm text-gray-400 mb-6">Start designing your first modular building</p>
              <Link
                href="/project/demo/land"
                className="inline-flex px-6 py-3 rounded-lg bg-brand-amber-500 text-white text-sm font-semibold hover:bg-brand-amber-600 transition-colors"
              >
                Create Your First Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => {
                const data = project.data as Record<string, unknown>;
                const modules = Array.isArray(data.modules) ? data.modules.length : 0;
                const style = typeof data.styleDirection === "string" ? data.styleDirection : null;

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="h-32 bg-gradient-to-br from-brand-teal-100 to-brand-teal-50 flex items-center justify-center">
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(modules, 6) }).map((_, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded bg-brand-teal-300/50 border border-brand-teal-400/30"
                          />
                        ))}
                        {modules === 0 && (
                          <span className="text-xs text-brand-teal-400">Empty</span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-brand-teal-800 text-sm mb-1">{project.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                        <span>{modules} modules</span>
                        <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                      </div>
                      {style && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 capitalize mb-3">
                          {style}
                        </span>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoad(project)}
                          className="flex-1 py-2 rounded-lg bg-brand-teal-800 text-white text-xs font-semibold hover:bg-brand-teal-700 transition-colors"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* New project card */}
              {!atLimit && (
                <Link
                  href="/project/demo/land"
                  className="flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-amber-400 hover:bg-brand-amber-50/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-brand-amber-100 flex items-center justify-center mb-2 transition-colors">
                    <span className="text-xl text-gray-400 group-hover:text-brand-amber-500">+</span>
                  </div>
                  <span className="text-sm font-medium text-gray-400 group-hover:text-brand-amber-600">
                    New Project
                  </span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
