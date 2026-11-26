# NEXT-5 — proposed next Chat 5 Design + Drawings session

**Session:** `5.03.DesignDrawings_Project-Save-Bugs_2026112X` (date = day MAIN starts it)
**Written by:** 5.02 (2026-11-26) · **Model:** Opus (code)

## Prompt

You are Chat 5 Design + Drawings, session `5.03.DesignDrawings_Project-Save-Bugs`.

Read first:
- The §9 read-first files in `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md`. Write only in Chat 5 paths (§10).
- `docs/MCA-DOC-BETA-SMOKE-TEST.md`, rows ST06, ST08, ST09, ST10, ST11, ST12 and ST31.
- W48 live log §6 (`docs/MCA-DOC-WEEK-2026-W48-SCHEDULE.md`), the 5.01 and 5.02 lines.
- `src/features/design/projectSnapshot.ts` (single save/restore path) and `src/features/design/renderPersistence.ts` (5.02 pattern: write the store, then save at once).

Fix, in this order, one commit each:
1. **ST06 (high)**: products added on the Products step are lost on a full page load. The cloud load (`CloudSyncProvider` / `useSaveDesign` → `applyProjectSnapshot`) overwrites `modulca-selected-products` with the cloud copy `[]`. Fix both sides: a product change must save the project at once (like renders in 5.02), and `CloudSyncProvider` auto-save must also watch the product selection (it is not in the design store; add a subscription or a change event in `productSelection.ts`).
2. **ST09**: Constructor opening `/project/[id]/architect` by full page load sees the "Upgrade to Architect" gate; the in-app link works. The FeatureGate decides before the tier has loaded. Wait for the auth/tier load (loading state) before gating. If the gate component is outside Chat 5 paths, note the exact change for its owner instead.
3. **ST11**: the first dashboard load shows "0 projects" and the second shows 4 (race in the cloud fetch), plus a transient "Sign in to save" on Products while signed in. Show a loading state until the auth session is known. Do not render empty or signed-out states before that.
4. **ST12 + ST31**: there is one cost function. The dashboard card (€43,200) differs from Design/Finalize (€39,096). Products (EUR 65) are not in the Total Estimate. Per-m² products (XPS, gypsum) are quantity 1. Make the dashboard use `getStats()` (or a pure shared function). Add products to the total. Add a unit (`pcs` | `m2`) and quantity from the module area for per-m² items. Add tests.
5. **ST10**: the `/project/new` template choice ("Compact House") is ignored. Apply the template's modules (via `applyProjectSnapshot` or the wizard's `applyToProject`). Add accessible names to the template buttons.
6. **ST08** (low, high-collision file `FinalizePage.tsx`; check `git log` for the last hour first): add the products section, and make "N projects saved" use the same source as the dashboard.

Finish:
- `npx vitest run src/features/design src/features/wizard` + `npx tsc --noEmit` + `npm run test:run`.
- Explicit-path commits, push (the pre-push hook runs tsc).
- One line in §6 of the current week's schedule doc. Next prompt into `docs/sessions/NEXT-5.md`.
- Do not start any other session.

## Context carried over from 5.02
- Renders: `persistSavedRender()` re-encodes to a ≤1024 px JPEG and saves via `saveActiveProject`. `CloudSyncProvider` auto-save now also watches `savedRenders`. Reuse this pattern for products (ST06).
- `saveToLocalStorage` falls back to saving without `savedRenders` on a quota error. `loadFromLocalStorage` then keeps the in-memory renders.
- Not verified in a browser in 5.02: the built-in pane could not open localhost while another session's dev server was running. Do a quick browser pass of render → presentation → reload first, then start ST06.
- Open for others: Chat 3 should send `X-AI-Fallback-From`, and the presentation reader should show `fallbackFrom` and `baseSource` (live-log line). MAIN owns the ST05 compare call in `src/app/admin/engines/page.tsx` and the ST04 counter in `features/auth/store.ts`.
