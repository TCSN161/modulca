"use client";

/**
 * Real ExpressDeps for the browser — only public interfaces of other chats:
 * wizard store (Chat 5 5.01), land store setters, productSelection,
 * projectSnapshot.saveActiveProject, computeProjectCost, renderPersistence,
 * POST /api/ai-render with the Bearer token (server tier + quota, SEC-02).
 */
import { useWizardStore } from "@/features/wizard/store";
import { useDesignStore } from "@/features/design/store";
import { useLandStore } from "@/features/land/store";
import { useAuthStore } from "@/features/auth/store";
import { getTierConfig } from "@/features/auth/types";
import { setSelectedProducts, getSelectedProducts } from "@/features/design/productSelection";
import { saveActiveProject } from "@/features/design/projectSnapshot";
import { computeProjectCost } from "@/features/design/projectCost";
import { persistSavedRender } from "@/features/design/renderPersistence";
import { readApiError } from "@/features/design/components/render/useRenderEngine";
import { STYLE_DIRECTIONS } from "@/features/design/styles";
import { authHeaders } from "@/shared/lib/authHeaders";
import { PRODUCT_CATALOG } from "@/assets";
import type { ExpressDeps } from "./orchestrator";
import type { ExpressJob, ExpressRenderView } from "./types";

export const EXPRESS_JOB_KEY = "modulca-express-job";

type SceneCapture = (view: ExpressRenderView) => Promise<{ baseImage: string; controlImage?: string | null } | null>;
let sceneCapture: SceneCapture | null = null;

/** Part 2: the hidden 3D scene registers its preset capturer here. */
export function registerSceneCapture(fn: SceneCapture | null): void {
  sceneCapture = fn;
}

export function loadExpressJob(): ExpressJob | null {
  try {
    const raw = localStorage.getItem(EXPRESS_JOB_KEY);
    return raw ? (JSON.parse(raw) as ExpressJob) : null;
  } catch {
    return null;
  }
}

const RENDER_TIMEOUT_MS = 90_000;

export function createClientDeps(): ExpressDeps {
  const auth = useAuthStore.getState();
  return {
    applyDesign(input) {
      const w = useWizardStore.getState();
      w.setInput(input);
      useWizardStore.getState().generate();
      const design = useWizardStore.getState().generatedDesign;
      if (!design) return null;
      useWizardStore.getState().applyToProject({ syncLand: true });
      return design;
    },
    applyLand({ center, polygon }) {
      const land = useLandStore.getState();
      land.setMapCenter(center);
      land.setPolygon(polygon);
      land.setPhase("modules");
    },
    applyProducts(items) {
      setSelectedProducts(items);
    },
    catalog: PRODUCT_CATALOG,
    styleName: (id) => STYLE_DIRECTIONS.find((s) => s.id === id)?.label ?? id,
    async saveProject(name) {
      const { userId } = useAuthStore.getState();
      if (!userId) return { ok: false, error: "auth" };
      // id "" → always a NEW project (never overwrite the active one)
      const r = await saveActiveProject(userId, name, "");
      return r.ok ? { ok: true, id: r.value.id } : { ok: false, error: r.error.message || r.error.code };
    },
    estimateEur() {
      const d = useDesignStore.getState();
      return computeProjectCost({ modules: d.modules, finishLevel: d.finishLevel, selectedProducts: getSelectedProducts() }).grandTotal;
    },
    async captureView(view) {
      return sceneCapture ? sceneCapture(view) : null;
    },
    async requestRender(body) {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), RENDER_TIMEOUT_MS);
      try {
        const res = await fetch("/api/ai-render", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(await authHeaders()) },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!res.ok) {
          const err = await readApiError(res);
          return { ok: false, status: res.status, message: err.message, retryAfterSec: err.retryAfterSec };
        }
        if (!(res.headers.get("content-type") ?? "").startsWith("image/")) {
          return { ok: false, status: 502, message: "not-an-image" };
        }
        const blob = await res.blob();
        if (blob.size < 500) return { ok: false, status: 502, message: "empty-image" };
        return { ok: true, blob, engine: res.headers.get("X-AI-Engine") ?? "unknown" };
      } catch (e) {
        return { ok: false, status: 0, message: e instanceof Error ? e.message : "network" };
      } finally {
        clearTimeout(t);
      }
    },
    async persistRender(render, projectId) {
      const r = await persistSavedRender(render, projectId);
      return r.ok;
    },
    persistJob(job) {
      try {
        localStorage.setItem(EXPRESS_JOB_KEY, JSON.stringify(job));
      } catch {
        /* non-fatal */
      }
    },
    maxCostUsd: getTierConfig(auth.userTier).features.maxCostUsdPerImage,
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
    now: () => new Date().toISOString(),
    uuid: () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
  };
}
