"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MAX_FREE_PROJECTS = 3;

interface SavedProject {
  id: string;
  name: string;
  date: string;
  modules: number;
  totalCost: number;
  style: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("modulca-projects");
      if (raw) setProjects(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const handleDelete = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    localStorage.setItem("modulca-projects", JSON.stringify(updated));
    localStorage.removeItem(`modulca-design-${id}`);
  };

  const handleLoad = (id: string) => {
    const data = localStorage.getItem(`modulca-design-${id}`);
    if (data) {
      localStorage.setItem("modulca-design", data);
    }
    router.push("/project/demo/land");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-gray-200 shrink-0">
        <Link href="/" className="text-lg font-bold text-brand-teal-800 tracking-tight">
          Modul<span className="text-brand-amber-500">CA</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/project/demo/land"
            className="px-4 py-2 rounded-lg bg-brand-amber-500 text-white text-sm font-semibold hover:bg-brand-amber-600 transition-colors"
          >
            + New Project
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-10 px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-brand-teal-800">My Projects</h1>
              <p className="text-sm text-gray-500 mt-1">
                {projects.length}/{MAX_FREE_PROJECTS} free projects used
              </p>
            </div>
            {projects.length >= MAX_FREE_PROJECTS && (
              <button
                onClick={() => setShowUpgrade(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-amber-500 to-brand-amber-600 text-white text-sm font-semibold hover:shadow-md transition-all"
              >
                Upgrade to Pro
              </button>
            )}
          </div>

          {/* Upgrade banner */}
          {showUpgrade && (
            <div className="bg-gradient-to-br from-brand-teal-800 to-brand-teal-700 rounded-xl shadow-lg p-6 mb-8 text-white">
              <h2 className="text-lg font-bold mb-2">ModulCA Pro</h2>
              <p className="text-sm text-brand-teal-200 mb-4">
                Unlock unlimited projects, HD AI renders, priority support, and access to the full product catalog.
              </p>
              <div className="flex items-center gap-6 mb-4">
                <div>
                  <span className="text-3xl font-bold">&euro;29</span>
                  <span className="text-sm text-brand-teal-200">/month</span>
                </div>
                <div className="text-xs text-brand-teal-200 space-y-1">
                  <div>Unlimited saved projects</div>
                  <div>HD AI rendering</div>
                  <div>Real product models</div>
                  <div>Priority architect support</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-5 py-2 rounded-lg bg-brand-amber-500 text-white text-sm font-semibold hover:bg-brand-amber-600 transition-colors">
                  Start Free Trial
                </button>
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
          {projects.length === 0 ? (
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
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Project thumbnail placeholder */}
                  <div className="h-32 bg-gradient-to-br from-brand-teal-100 to-brand-teal-50 flex items-center justify-center">
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(project.modules, 6) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded bg-brand-teal-300/50 border border-brand-teal-400/30"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-brand-teal-800 text-sm mb-1">{project.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span>{project.modules} modules</span>
                      <span>&euro;{Math.round(project.totalCost).toLocaleString()}</span>
                      <span>{new Date(project.date).toLocaleDateString()}</span>
                    </div>
                    {project.style && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 capitalize mb-3">
                        {project.style}
                      </span>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoad(project.id)}
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
              ))}

              {/* New project card */}
              {projects.length < MAX_FREE_PROJECTS && (
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
