"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/store";
import { listProjects, deleteProject, type ProjectRecord } from "@/features/auth/projectService";
import { getTierConfig } from "@/features/auth/types";
import { openCustomerPortal } from "@/shared/lib/stripe";

/* Sample templates shown when user has no projects */
const TEMPLATES = [
  { name: "Eco-Lodge Module", desc: "Solar-ready, 45sqm", gradient: "from-emerald-800 to-emerald-600", modules: 5 },
  { name: "Urban Studio Loft", desc: "Compact living, 27sqm", gradient: "from-slate-700 to-slate-500", modules: 3 },
  { name: "Family Courtyard", desc: "U-shape, 108sqm", gradient: "from-amber-800 to-amber-600", modules: 12 },
];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    isAuthenticated, userId, userName, userEmail, userTier,
    monthlyRenderCount, aiCallsToday, stripeCustomerId,
    signOut, loadSession,
  } = useAuthStore();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const tierConfig = getTierConfig(userTier);
  const maxProjects = tierConfig.features.maxProjects;
  const maxRenders = tierConfig.features.aiRendersPerMonth;
  const atLimit = maxProjects !== -1 && projects.length >= maxProjects;

  // Handle Stripe redirect
  useEffect(() => {
    const upgrade = searchParams.get("upgrade");
    if (upgrade === "success") {
      setUpgradeMsg("Your subscription is now active! Enjoy your new features.");
      // Reload session to get updated tier from Supabase
      loadSession();
      // Clean URL
      window.history.replaceState({}, "", "/dashboard");
      const timer = setTimeout(() => setUpgradeMsg(null), 6000);
      return () => clearTimeout(timer);
    }
    if (upgrade === "cancelled") {
      setUpgradeMsg(null);
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams, loadSession]);

  const loadProjects = useCallback(async () => {
    if (!userId) {
      setProjects([]);
      setLoaded(true);
      return;
    }
    try {
      const list = await listProjects(userId);
      setProjects(list);
    } catch (err) {
      console.error("[Dashboard] Failed to load projects:", err);
      setProjects([]);
    } finally {
      setLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      const ok = await deleteProject(userId ?? "", id);
      if (ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("[Dashboard] Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoad = (project: ProjectRecord) => {
    try {
      localStorage.setItem("modulca-design", JSON.stringify(project.data));
      localStorage.setItem("modulca-active-project", JSON.stringify({ id: project.id, name: project.name }));
    } catch { /* */ }
    router.push(`/project/${project.id}/land`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch { /* signout best-effort */ }
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bone-100">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-4 md:px-6 bg-white border-b border-brand-bone-300/60 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-brand-olive-700 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
          <span className="text-lg font-bold text-brand-charcoal tracking-tight">
            Modul<span className="text-brand-olive-700">CA</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-medium text-brand-charcoal">{userName || userEmail}</div>
                <div className="text-[10px] text-brand-gray" style={{ color: tierConfig.color }}>
                  {tierConfig.label}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs text-brand-gray hover:text-red-500 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm text-brand-gray hover:text-brand-olive-700 transition-colors">
              Log in
            </Link>
          )}
          <div className="h-8 w-8 rounded-full bg-brand-bone-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-brand-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-8 px-4 md:px-6">
          {/* Upgrade success banner */}
          {upgradeMsg && (
            <div className="mb-6 rounded-[12px] bg-green-50 border border-green-200 p-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-800 font-medium">{upgradeMsg}</p>
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-8">
            <p className="label-caps mb-1">Beta</p>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-charcoal tracking-heading mb-1">
              Welcome back,<br />{userName || "Architect"}
            </h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="rounded-[12px] bg-brand-bone-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-brand-olive-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.05em]">Projects</span>
              </div>
              <span className="text-2xl font-bold text-brand-charcoal">
                {loaded ? projects.length : "--"}
              </span>
              {maxProjects !== -1 && (
                <span className="text-[10px] text-brand-gray">/{maxProjects}</span>
              )}
            </div>
            <div className="rounded-[12px] bg-brand-bone-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-brand-olive-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                <span className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.05em]">AI Renders</span>
              </div>
              <span className="text-2xl font-bold text-brand-charcoal">
                {monthlyRenderCount}
              </span>
              {maxRenders !== -1 && (
                <span className="text-[10px] text-brand-gray">/{maxRenders}</span>
              )}
            </div>
            <div className="rounded-[12px] bg-brand-bone-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-brand-olive-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                <span className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.05em]">AI Today</span>
              </div>
              <span className="text-2xl font-bold text-brand-charcoal">
                {aiCallsToday}
              </span>
            </div>
            <div className="rounded-[12px] bg-brand-bone-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-brand-olive-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                <span className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.05em]">Plan</span>
              </div>
              <span className="text-sm font-bold" style={{ color: tierConfig.color }}>
                {tierConfig.label}
              </span>
              {userTier !== "architect" && userTier !== "constructor" && (
                <Link
                  href="/pricing"
                  className="mt-2 inline-block text-[10px] font-bold text-brand-amber-600 hover:text-brand-amber-700 transition-colors"
                >
                  Upgrade →
                </Link>
              )}
            </div>
          </div>

          {/* Start from Template */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-brand-charcoal">Start from Template</h2>
              <button className="text-xs font-semibold text-brand-olive-600 hover:text-brand-olive-800 transition-colors">
                View All
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
              {TEMPLATES.map((t) => (
                <Link
                  key={t.name}
                  href="/project/new"
                  className="flex-shrink-0 w-64 rounded-[16px] overflow-hidden shadow-card hover:shadow-subtle transition-all group"
                >
                  <div className={`h-36 bg-gradient-to-br ${t.gradient} relative p-4 flex flex-col justify-end`}>
                    <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-white">{t.name}</h3>
                    <p className="text-xs text-white/70">{t.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Projects */}
          <div>
            <h2 className="text-base font-bold text-brand-charcoal mb-4">Recent Projects</h2>

            {!loaded ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-olive-700 border-t-transparent" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 rounded-[16px] border border-dashed border-brand-bone-400 bg-white">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-bone-200 mb-3">
                  <svg className="w-7 h-7 text-brand-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-brand-charcoal mb-1">No projects yet</h3>
                <p className="text-xs text-brand-gray mb-5">Start designing your first modular building</p>
                <Link href="/project/new" className="btn-primary text-sm">
                  Create Your First Project
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => {
                  const data = project.data as Record<string, unknown>;
                  const modules = Array.isArray(data.modules) ? data.modules.length : 0;
                  const style = typeof data.styleDirection === "string" ? data.styleDirection : null;
                  const cost = modules * 9 * 1200; // rough estimate

                  return (
                    <div
                      key={project.id}
                      className="flex items-center gap-4 rounded-[12px] bg-white border border-brand-bone-300/60 p-3 shadow-card hover:shadow-subtle transition-all group cursor-pointer"
                      onClick={() => handleLoad(project)}
                    >
                      {/* Thumbnail */}
                      <div className="h-14 w-14 flex-shrink-0 rounded-[10px] bg-gradient-to-br from-brand-olive-100 to-brand-bone-200 flex items-center justify-center">
                        <div className="grid grid-cols-2 gap-0.5">
                          {Array.from({ length: Math.min(modules, 4) }).map((_, i) => (
                            <div key={i} className="w-2.5 h-2.5 rounded-sm bg-brand-olive-400/50" />
                          ))}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-brand-charcoal truncate">{project.name}</h3>
                        <div className="flex items-center gap-2 text-[11px] text-brand-gray">
                          <span>{modules} Modules</span>
                          {cost > 0 && (
                            <>
                              <span className="text-brand-bone-400">|</span>
                              <span>&euro;{cost.toLocaleString()}</span>
                            </>
                          )}
                          {style && (
                            <>
                              <span className="text-brand-bone-400">|</span>
                              <span className="capitalize">{style}</span>
                            </>
                          )}
                          <span className="text-brand-bone-400">|</span>
                          {project.id.startsWith("local-") ? (
                            <span className="text-amber-500" title="Saved locally only">Local</span>
                          ) : (
                            <span className="text-emerald-500" title="Synced to cloud">Cloud</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this project? This cannot be undone.")) {
                              handleDelete(project.id);
                            }
                          }}
                          disabled={deletingId === project.id}
                          className="p-1.5 rounded-lg text-brand-bone-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete project"
                        >
                          {deletingId === project.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          )}
                        </button>
                        <svg className="w-5 h-5 text-brand-bone-400 group-hover:text-brand-olive-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </div>
                  );
                })}

                {/* New project row */}
                {!atLimit && (
                  <Link
                    href="/project/new"
                    className="flex items-center justify-center gap-2 rounded-[12px] border border-dashed border-brand-bone-400 bg-white p-4 text-sm font-semibold text-brand-gray hover:text-brand-olive-700 hover:border-brand-olive-400 hover:bg-brand-olive-50/30 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    New Project
                  </Link>
                )}

                {/* Delete is available via long-press/right-click — keeping it subtle */}
                {projects.length > 0 && (
                  <p className="text-[10px] text-brand-gray/40 text-center pt-2">
                    {projects.length}{maxProjects !== -1 ? `/${maxProjects}` : ""} project{projects.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Subscription Management */}
          {isAuthenticated && (
            <div className="mt-10 rounded-[12px] bg-white border border-brand-bone-300/60 p-5">
              <h2 className="text-base font-bold text-brand-charcoal mb-3">Subscription</h2>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium" style={{ color: tierConfig.color }}>
                    {tierConfig.label}
                  </span>
                  <p className="text-xs text-brand-gray mt-0.5">{tierConfig.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {stripeCustomerId ? (
                    <button
                      onClick={async () => {
                        setPortalLoading(true);
                        await openCustomerPortal(stripeCustomerId);
                        setPortalLoading(false);
                      }}
                      disabled={portalLoading}
                      className="text-xs font-medium text-brand-olive-700 hover:text-brand-olive-900 border border-brand-olive-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                    >
                      {portalLoading ? "Loading..." : "Manage"}
                    </button>
                  ) : null}
                  {userTier !== "architect" && (
                    <Link
                      href="/pricing"
                      className="text-xs font-bold text-white bg-brand-olive-700 hover:bg-brand-olive-800 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      Upgrade
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
