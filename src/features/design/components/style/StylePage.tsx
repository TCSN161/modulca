"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useDesignStore } from "../../store";
import { useAuthStore } from "@/features/auth/store";
import { useSaveDesign } from "../../hooks/useSaveDesign";
import { STYLE_DIRECTIONS, getStyleDirection } from "../../styles";
import { cn } from "@/shared/utils/cn";
import Moodboard from "./Moodboard";
import StepNav from "../shared/StepNav";
import MobileStepFooter from "../shared/MobileStepFooter";
import { useProjectId } from "@/shared/hooks/useProjectId";

export default function StylePage() {
  const projectId = useProjectId();
  const styleDirection = useDesignStore((s) => s.styleDirection);
  const styleDescription = useDesignStore((s) => s.styleDescription);
  const stylePhoto = useDesignStore((s) => s.stylePhoto);
  const setStyleDirection = useDesignStore((s) => s.setStyleDirection);
  const setStyleDescription = useDesignStore((s) => s.setStyleDescription);
  const setStylePhoto = useDesignStore((s) => s.setStylePhoto);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { saved, handleSave } = useSaveDesign();
  const [activeTab, setActiveTab] = useState<"style" | "moodboard">("style");
  const [mobileSidebar, setMobileSidebar] = useState<"left" | "right" | null>(null);

  const canAccess = useAuthStore((s) => s.canAccess);
  const betaPromoActive = useAuthStore((s) => s.betaPromoActive);

  const selectedStyle = styleDirection
    ? getStyleDirection(styleDirection)
    : null;

  // Check if user can use premium styles (premium tier, architect, constructor, or beta promo)
  const canUsePremiumStyles = canAccess("customStyleUpload") || betaPromoActive;

  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setStylePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [setStylePhoto]
  );

  const handleSelectStyle = useCallback(
    (id: string) => {
      setStyleDirection(id as Parameters<typeof setStyleDirection>[0]);
      // Apply after a tick so the store updates
      setTimeout(() => {
        useDesignStore.getState().applyStyleToModules();
      }, 0);
    },
    [setStyleDirection]
  );

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top Nav */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={4} />
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${saved ? "bg-green-600" : "bg-brand-teal-800 hover:bg-brand-teal-700"}`}
          >
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </header>

      {/* Navigation bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-3 md:px-6 py-2 md:py-3 gap-2">
        <Link
          href={`/project/${projectId}/design`}
          className="hidden md:inline text-sm text-gray-500 hover:text-brand-teal-800"
        >
          &larr; Back to Preview
        </Link>
        {/* Tab switcher */}
        <div className="flex items-center rounded-lg bg-gray-100 p-0.5 md:p-1">
          {(["style", "moodboard"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-md px-3 md:px-4 py-1 md:py-1.5 text-[10px] md:text-xs font-semibold transition-all",
                activeTab === tab
                  ? "bg-white text-brand-teal-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab === "style" ? "Style Direction" : "Moodboard"}
            </button>
          ))}
        </div>
        {/* Mobile sidebar toggles */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={() => setMobileSidebar(mobileSidebar === "left" ? null : "left")}
            className={cn(
              "px-2 py-1 rounded-full text-[10px] font-bold transition-colors",
              mobileSidebar === "left" ? "bg-brand-olive-700 text-white" : "bg-gray-100 text-gray-500"
            )}
          >
            Vision
          </button>
          <button
            onClick={() => setMobileSidebar(mobileSidebar === "right" ? null : "right")}
            className={cn(
              "px-2 py-1 rounded-full text-[10px] font-bold transition-colors",
              mobileSidebar === "right" ? "bg-brand-olive-700 text-white" : "bg-gray-100 text-gray-500"
            )}
          >
            Summary
          </button>
        </div>
        <Link
          href={`/project/${projectId}/configure`}
          className="hidden md:inline-block rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600"
        >
          Configure Modules &rarr;
        </Link>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setMobileSidebar(null)} />
      )}

      {/* Mobile left panel slide-over */}
      <div
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 overflow-y-auto p-5 pt-16 transition-transform duration-200",
          mobileSidebar === "left" ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button onClick={() => setMobileSidebar(null)} className="absolute top-3 right-3 text-gray-400 text-xs font-bold">✕</button>
        <h3 className="mb-3 text-sm font-bold text-brand-teal-800 uppercase tracking-wider">Your Style Vision</h3>
        <textarea
          value={styleDescription}
          onChange={(e) => setStyleDescription(e.target.value)}
          placeholder="Describe your dream space..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-amber-500 focus:outline-none resize-none"
          rows={4}
        />
        {selectedStyle && (
          <div className="mt-4">
            <h4 className="mb-2 text-xs font-bold text-gray-500 uppercase">Style Keywords</h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedStyle.keywords.map((kw) => (
                <span key={kw} className="rounded-full bg-brand-teal-800/10 px-2.5 py-0.5 text-[10px] font-medium text-brand-teal-800">{kw}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile right panel slide-over */}
      <div
        className={cn(
          "md:hidden fixed inset-y-0 right-0 z-40 w-72 bg-white border-l border-gray-200 overflow-y-auto p-5 pt-16 transition-transform duration-200",
          mobileSidebar === "right" ? "translate-x-0" : "translate-x-full"
        )}
      >
        <button onClick={() => setMobileSidebar(null)} className="absolute top-3 left-3 text-gray-400 text-xs font-bold">✕</button>
        <h3 className="mb-4 text-sm font-bold text-brand-teal-800 uppercase tracking-wider">Design Summary</h3>
        {selectedStyle ? (
          <div className="space-y-4">
            <div className="text-sm font-bold text-brand-teal-800">{selectedStyle.label}</div>
            <p className="text-xs text-gray-500">{selectedStyle.description}</p>
            <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Floor</span><span className="font-medium">{selectedStyle.floorDefault}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Wall</span><span className="font-medium">{selectedStyle.wallDefault}</span></div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400">Select a style to see summary.</p>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR — desktop only */}
        <aside className="hidden md:block w-72 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-5">
          <h3 className="mb-3 text-sm font-bold text-brand-teal-800 uppercase tracking-wider">
            Your Style Vision
          </h3>

          <textarea
            value={styleDescription}
            onChange={(e) => setStyleDescription(e.target.value)}
            placeholder="Describe your dream space... Warm tones? Minimal? Cozy? Modern?"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-amber-500 focus:outline-none focus:ring-1 focus:ring-brand-amber-500 resize-none"
            rows={5}
          />

          {/* Photo upload */}
          <div className="mt-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-brand-amber-400 hover:bg-brand-amber-50/30 transition-colors"
            >
              {stylePhoto ? (
                <img
                  src={stylePhoto}
                  alt="Inspiration"
                  className="aspect-[16/10] w-full rounded object-cover"
                />
              ) : (
                <>
                  <svg
                    className="mb-2 h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <span className="text-xs text-gray-500">
                    Upload inspiration photo
                  </span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {stylePhoto && (
              <button
                onClick={() => setStylePhoto(null)}
                className="mt-2 text-xs text-gray-400 hover:text-red-500"
              >
                Remove photo
              </button>
            )}
          </div>

          {/* Keywords from selected style */}
          {selectedStyle && (
            <div className="mt-5">
              <h4 className="mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Style Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedStyle.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-brand-teal-800/10 px-3 py-1 text-xs font-medium text-brand-teal-800"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* CENTER */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === "moodboard" ? (
            <Moodboard />
          ) : !selectedStyle ? (
            /* Style selection grid — 8 styles */
            <div>
              <h2 className="mb-1 text-lg font-bold text-brand-teal-800">
                Choose Your Style Direction
              </h2>
              <p className="mb-6 text-sm text-gray-500">
                Select a style to generate your moodboard and apply materials to
                all modules. {!canUsePremiumStyles && (
                  <span className="text-brand-amber-600 font-medium">
                    Upgrade to Premium to unlock 5 additional styles.
                  </span>
                )}
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {STYLE_DIRECTIONS.map((style) => {
                  const isPremiumStyle = style.tier === "premium";
                  const isLocked = isPremiumStyle && !canUsePremiumStyles;

                  return (
                    <div
                      key={style.id}
                      className={cn(
                        "overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow",
                        isLocked ? "border-gray-200 opacity-75" : "border-gray-200"
                      )}
                    >
                      {/* Hero image */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden">
                        <img
                          src={style.heroImage}
                          alt={style.label}
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            (e.target as HTMLImageElement).parentElement!.style.backgroundColor = style.moodColors[0];
                          }}
                        />
                        {isPremiumStyle && (
                          <div className="absolute top-2 right-2 rounded-full bg-brand-amber-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                            Premium
                          </div>
                        )}
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <svg className="h-8 w-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-brand-teal-800">
                          {style.label}
                        </h3>
                        <p className="mt-0.5 text-xs font-medium text-brand-amber-600">
                          {style.tagline}
                        </p>
                        <p className="mt-1.5 text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                          {style.description}
                        </p>
                        {isLocked ? (
                          <Link
                            href="/pricing"
                            className="mt-3 block w-full rounded-lg border-2 border-brand-amber-400 px-3 py-2 text-center text-xs font-semibold text-brand-amber-600 hover:bg-brand-amber-50 transition-colors"
                          >
                            Upgrade to Unlock
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleSelectStyle(style.id)}
                            className="mt-3 w-full rounded-lg bg-brand-teal-800 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-teal-700 transition-colors"
                          >
                            Select This Style
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Moodboard */
            <div>
              {/* Header */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-brand-teal-800">
                    {selectedStyle.label}
                  </h2>
                  <p className="text-sm text-brand-amber-600">
                    {selectedStyle.tagline}
                  </p>
                </div>
                <button
                  onClick={() => setStyleDirection(null)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Change Style
                </button>
              </div>

              {/* Color Palette */}
              <section className="mb-8">
                <h3 className="mb-4 text-[10px] font-bold text-brand-olive-500 uppercase tracking-[0.08em]">
                  Color Palette
                </h3>
                <div className="flex flex-wrap items-center gap-3 md:gap-5">
                  {selectedStyle.palette.map((swatch) => (
                    <div key={swatch.label} className="flex flex-col items-center gap-2">
                      <div
                        className="h-14 w-14 rounded-full border-2 border-brand-bone-300 shadow-card hover:scale-105 transition-transform"
                        style={{ backgroundColor: swatch.color }}
                      />
                      <span className="text-[10px] font-medium text-brand-gray">
                        {swatch.label}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Primary Materials — circular swatches */}
              <section className="mb-8">
                <h3 className="mb-4 text-[10px] font-bold text-brand-olive-500 uppercase tracking-[0.08em]">
                  Primary Materials
                </h3>
                <div className="flex flex-wrap items-center gap-3 md:gap-5">
                  {selectedStyle.materials.map((mat, i) => {
                    const abbrevs = ["OAK", "CONC", "METAL", "GLASS", "LINEN", "LACQ", "WALNT", "SLATE"];
                    const abbrev = abbrevs[i] || mat.label.slice(0, 4).toUpperCase();
                    return (
                      <div key={mat.label} className="flex flex-col items-center gap-2">
                        <div className="relative group">
                          <div
                            className="h-16 w-16 rounded-full border-2 border-brand-bone-300 shadow-card transition-all group-hover:border-brand-olive-400 group-hover:shadow-subtle group-hover:scale-105"
                            style={{ backgroundColor: mat.color }}
                          />
                          {i === 0 && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-olive-600 border-2 border-white flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">
                          {abbrev}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Product Recommendations */}
              <section className="mb-8">
                <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Product Recommendations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedStyle.products.map((product) => (
                    <div
                      key={product.label}
                      className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                    >
                      <div
                        className="aspect-[16/10] w-full overflow-hidden"
                        style={{ backgroundColor: product.color }}
                      />
                      <div className="p-3">
                        <div className="text-xs font-bold text-brand-teal-800">
                          {product.label}
                        </div>
                        <p className="mt-0.5 text-[10px] text-gray-500 leading-relaxed">
                          {product.description}
                        </p>
                        <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                          {product.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Mood Grid with images */}
              <section>
                <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Mood Grid
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedStyle.moodImages.map((img, i) => (
                    <div
                      key={img.label}
                      className="relative flex aspect-[4/3] w-full items-end rounded-lg overflow-hidden"
                      style={{ backgroundColor: selectedStyle.moodColors[i] }}
                    >
                      <img
                        src={img.url}
                        alt={img.label}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <span className="relative z-10 w-full bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                        {img.label}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR — desktop only */}
        <aside className="hidden md:block w-72 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto p-5">
          <h3 className="mb-4 text-sm font-bold text-brand-teal-800 uppercase tracking-wider">
            Design Summary
          </h3>

          {selectedStyle ? (
            <div className="space-y-5">
              <div>
                <div className="text-sm font-bold text-brand-teal-800">
                  {selectedStyle.label}
                </div>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  {selectedStyle.description}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  This style applies:
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Floor Material</span>
                    <span className="font-medium text-brand-teal-800">
                      {selectedStyle.floorDefault}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Wall Color</span>
                    <span className="font-medium text-brand-teal-800">
                      {selectedStyle.wallDefault}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Current Tier</span>
                  <span className="rounded-full bg-brand-teal-800/10 px-2.5 py-0.5 text-[10px] font-bold text-brand-teal-800 uppercase">
                    {selectedStyle.tier}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              Select a style direction to see your design summary.
            </p>
          )}

          <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
            {canUsePremiumStyles ? (
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-xs font-medium text-green-700">
                  All 8 styles unlocked {betaPromoActive && "(Beta bonus)"}
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-brand-amber-50 p-3">
                <p className="text-xs font-medium text-brand-amber-700">
                  Free tier: 3 styles &bull; Premium: all 8 styles
                </p>
              </div>
            )}
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">
                Each style auto-applies floor, wall, and color materials to all modules.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <MobileStepFooter activeStep={4} />
    </div>
  );
}
