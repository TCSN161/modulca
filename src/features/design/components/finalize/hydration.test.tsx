/**
 * BUG-ST20 (Sentry MODULCA-WEB-2): SSR-vs-client hydration check.
 *
 * Reproduces the prod sequence: the server renders an empty design store, then
 * on the client the store is filled from localStorage (module-load microtask)
 * BEFORE React hydrates. Any render-time read of the live store (getStats(),
 * getState()) then prints different text than the server HTML and React
 * reports "Hydration failed" / #418 through onRecoverableError.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import type { ReactElement } from "react";

vi.mock("@/features/auth/projectService", () => ({
  listProjectsSettled: vi.fn().mockResolvedValue([]),
  saveProject: vi.fn(),
}));
vi.mock("@/shared/hooks/useProjectId", () => ({ useProjectId: () => "p1" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/project/p1/finalize",
  useParams: () => ({ id: "p1" }),
  useSearchParams: () => new URLSearchParams(),
}));

import FinalizePage from "./FinalizePage";
import ProductsPage from "../products/ProductsPage";
import { useDesignStore } from "../../store";

const FILLED = [
  { row: 0, col: 0, moduleType: "living" },
  { row: 0, col: 1, moduleType: "bedroom" },
  { row: 1, col: 0, moduleType: "kitchen" },
] as never;

async function hydrationErrors(element: ReactElement): Promise<unknown[]> {
  // 1. "Server": empty project
  useDesignStore.setState({ modules: [] });
  const html = renderToString(element);

  // 2. Client: the saved project is loaded before hydration starts
  useDesignStore.getState().setModulesFromGrid(FILLED, 0);

  // 3. Hydrate the server HTML
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
  const errors: unknown[] = [];
  await act(async () => {
    hydrateRoot(container, element, { onRecoverableError: (e) => errors.push(e) });
  });
  container.remove();
  return errors;
}

describe("BUG-ST20 hydration (server snapshot vs live store)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("FinalizePage hydrates without a mismatch when the store fills before hydration", async () => {
    expect(await hydrationErrors(<FinalizePage />)).toEqual([]);
  });

  it("ProductsPage hydrates without a mismatch when the store fills before hydration", async () => {
    expect(await hydrationErrors(<ProductsPage />)).toEqual([]);
  });
});
