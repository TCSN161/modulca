"use client";

/**
 * /express — short brief form + live progress (MVP, behind EXPRESS_ENABLED).
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth/store";
import { useDesignStore } from "@/features/design/store";
import { getTierConfig } from "@/features/auth/types";
import { STYLE_DIRECTIONS } from "@/features/design/styles";
import { COUNTY_CENTROIDS } from "./countyCentroids";
import { EMPTY_ANSWERS, normalizeBrief } from "./normalize";
import { runExpress, retryFailedRenders, presentationUrl } from "./orchestrator";
import { createClientDeps, loadExpressJob } from "./clientDeps";
import { expressT, toExpressLocale } from "./i18n";
import type { BudgetBand, ExpressAnswers, ExpressJob, ExpressStage, ExpressStyleId } from "./types";
import type { FinishLevelId } from "@/features/design/store";

const STAGES: ExpressStage[] = ["design", "land", "products", "save", "renders", "done"];

const field = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal-800 focus:outline-none";
const label = "mb-1 block text-sm font-medium text-gray-700";

function numOrNull(v: string): number | null {
  const n = Number(v);
  return v.trim() === "" || !Number.isFinite(n) ? null : n;
}

function triState(v: string): boolean | null {
  return v === "yes" ? true : v === "no" ? false : null;
}

export default function ExpressPage() {
  const locale = toExpressLocale(useLocale());
  const t = expressT(locale);
  const { isAuthenticated, userTier } = useAuthStore();
  const [a, setA] = useState<ExpressAnswers>(EMPTY_ANSWERS);
  const [job, setJob] = useState<ExpressJob | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const last = loadExpressJob();
    if (last && (last.stage === "done" || last.stage === "failed")) setJob(last);
  }, []);

  const set = <K extends keyof ExpressAnswers>(k: K, v: ExpressAnswers[K]) => setA((p) => ({ ...p, [k]: v }));

  async function start() {
    if (busy) return;
    setBusy(true);
    try {
      const f = getTierConfig(userTier).features;
      const brief = normalizeBrief(a, { locale, maxModules: f.maxModules, rendersPerDay: f.aiRendersPerDay });
      await runExpress(brief, createClientDeps(), setJob);
    } finally {
      setBusy(false);
    }
  }

  async function retry() {
    if (!job || busy) return;
    setBusy(true);
    try {
      const d = useDesignStore.getState();
      await retryFailedRenders(job, { modules: d.modules, styleDirection: d.styleDirection ?? job.brief.styleId }, createClientDeps(), setJob);
    } finally {
      setBusy(false);
    }
  }

  const yesNo = (k: "wantsOffice" | "terrace" | "ownLand") => (
    <select className={field} value={a[k] === null ? "" : a[k] ? "yes" : "no"} onChange={(e) => set(k, triState(e.target.value))}>
      <option value="">{t.youChoose}</option>
      <option value="yes">{t.yes}</option>
      <option value="no">{t.no}</option>
    </select>
  );

  const failedRenders = job?.renders.some((r) => r.status === "failed") ?? false;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-teal-800">{t.title}</h1>
      <p className="mt-2 text-sm text-gray-600">{t.subtitle}</p>

      {!isAuthenticated && (
        <p className="mt-4 rounded-lg bg-brand-amber-500/10 p-3 text-sm text-gray-800">
          {t.signIn} <Link className="font-semibold underline" href="/login?redirect=/express">→</Link>
        </p>
      )}

      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => { e.preventDefault(); void start(); }}
        data-testid="express-form"
      >
        <div>
          <label className={label} htmlFor="x-bedrooms">{t.bedrooms}</label>
          <select id="x-bedrooms" className={field} value={a.bedrooms ?? ""} onChange={(e) => set("bedrooms", numOrNull(e.target.value))}>
            <option value="">{t.youChoose}</option>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="x-household">{t.household}</label>
          <select id="x-household" className={field} value={a.householdSize ?? ""} onChange={(e) => set("householdSize", numOrNull(e.target.value))}>
            <option value="">{t.youChoose}</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="x-area">{t.area}</label>
          <input id="x-area" type="number" min={27} max={180} className={field} placeholder={t.areaHint}
            value={a.targetAreaSqm ?? ""} onChange={(e) => set("targetAreaSqm", numOrNull(e.target.value))} />
        </div>
        <div>
          <label className={label} htmlFor="x-budget">{t.budget}</label>
          <select id="x-budget" className={field} value={a.budgetBand ?? ""} onChange={(e) => set("budgetBand", (e.target.value || null) as BudgetBand | null)}>
            <option value="">{t.youChoose}</option>
            {(["tight", "moderate", "generous"] as const).map((b) => <option key={b} value={b}>{t.budgetBands[b]}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="x-style">{t.style}</label>
          <select id="x-style" className={field} value={a.styleId ?? ""} onChange={(e) => set("styleId", (e.target.value || null) as ExpressStyleId | null)}>
            <option value="">{t.youChoose}</option>
            {STYLE_DIRECTIONS.map((s) => <option key={s.id} value={s.id ?? ""}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="x-finish">{t.finish}</label>
          <select id="x-finish" className={field} value={a.finishLevel ?? ""} onChange={(e) => set("finishLevel", (e.target.value || null) as FinishLevelId | null)}>
            <option value="">{t.youChoose}</option>
            {(["basic", "standard", "premium"] as const).map((f) => <option key={f} value={f}>{t.finishes[f]}</option>)}
          </select>
        </div>
        <div><label className={label}>{t.office}</label>{yesNo("wantsOffice")}</div>
        <div><label className={label}>{t.terrace}</label>{yesNo("terrace")}</div>
        <div><label className={label}>{t.ownLand}</label>{yesNo("ownLand")}</div>
        <div>
          <label className={label} htmlFor="x-plot">{t.plot}</label>
          <input id="x-plot" type="number" min={100} max={20000} className={field} placeholder="600"
            value={a.plotAreaSqm ?? ""} onChange={(e) => set("plotAreaSqm", numOrNull(e.target.value))} />
        </div>
        <div>
          <label className={label} htmlFor="x-county">{t.county}</label>
          <select id="x-county" className={field} value={a.county ?? ""} onChange={(e) => set("county", e.target.value || null)}>
            <option value="">{t.youChoose}</option>
            {Object.entries(COUNTY_CENTROIDS)
              .sort(([, x], [, y]) => x.name.localeCompare(y.name, "ro"))
              .map(([code, c]) => <option key={code} value={code}>{c.name}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="x-notes">{t.notes}</label>
          <textarea id="x-notes" maxLength={500} rows={2} className={field}
            value={a.notes ?? ""} onChange={(e) => set("notes", e.target.value || null)} />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={busy || !isAuthenticated}
            className="rounded-lg bg-brand-teal-800 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {busy ? t.running : t.start}
          </button>
        </div>
      </form>

      {job && (
        <section className="mt-8 rounded-xl border border-gray-200 p-5" data-testid="express-progress">
          {job.brief.warnings.length > 0 && (
            <ul className="mb-4 list-disc pl-5 text-sm text-amber-700">
              {job.brief.warnings.map((w) => <li key={w}>{t.warnings[w]}</li>)}
            </ul>
          )}
          <ol className="space-y-1 text-sm">
            {STAGES.map((s) => {
              const failed = job.stage === "failed";
              const idx = STAGES.indexOf(failed ? job.failedStage ?? "design" : job.stage);
              const mine = STAGES.indexOf(s);
              const mark = job.stage === "done" || mine < idx ? "✓" : mine === idx ? (failed ? "✗" : "…") : "·";
              return <li key={s}><span className="inline-block w-5">{mark}</span>{t.stages[s]}</li>;
            })}
          </ol>
          <ul className="mt-3 space-y-1 pl-5 text-sm">
            {job.renders.map((r) => (
              <li key={r.view}>
                {r.status === "ok" ? "✓" : r.status === "failed" ? "✗" : "…"} {t.renderViews[r.view]}
                {r.status === "failed" && (
                  <span className="text-gray-500"> — {t.renderErrors[(r.error === "quota" || r.error === "scene" || r.error === "persist") ? r.error : "other"]}</span>
                )}
              </li>
            ))}
          </ul>
          {job.stage === "failed" && <p className="mt-3 text-sm text-red-700">{t.stages.failed}: {job.error}</p>}
          {job.modules > 0 && (
            <p className="mt-3 text-sm text-gray-700">
              {job.modules} {t.modules} · {job.productCount} {t.products}
              {job.estimateEur !== null && <> · {t.estimate}: €{Math.round(job.estimateEur).toLocaleString(locale)}</>}
            </p>
          )}
          {job.stage === "done" && job.projectId && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={presentationUrl(job.projectId)} className="rounded-lg bg-brand-teal-800 px-4 py-2 text-sm font-semibold text-white">{t.openPresentation}</Link>
              <Link href={`/project/${job.projectId}/design`} className="rounded-lg border border-brand-teal-800 px-4 py-2 text-sm font-semibold text-brand-teal-800">{t.editInWizard}</Link>
              {failedRenders && (
                <button type="button" onClick={() => void retry()} disabled={busy}
                  className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{t.retryRenders}</button>
              )}
            </div>
          )}
          <p className="mt-4 text-xs text-gray-500">{t.disclaimer}</p>
        </section>
      )}
    </main>
  );
}
