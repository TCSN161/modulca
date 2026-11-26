# MCA-SPEC-EXPRESS-MODE-v0 — "Express" automated wizard (proposal)

**Status**: Proposal (MAIN, 2026-11-26). Waiting for Costin's go and for the sprint smoke test, which shows which modules are solid.
**Owner (proposed)**: new **Chat 8 Express / Automation**
**Related**: [[MCA-DOC-SPRINT-2026-11-26-27]] · [[MCA-STRAT-CATUC-SERVICE-CONTENT-2026-11-25]] §3 (same detachable-module rule)

---

## 1. What it is

The user answers **one prompt or 5–8 short questions**. ModulCA then fills all 14 wizard steps itself, picks products, generates **N renders** (3 / 5 / 8 / 10, depending on tier) and returns a **finished presentation + PDF**. The user can then open the normal wizard and tweak any step.

It serves three purposes:
1. **Visitors and clients**: "show me what you can do in 3 minutes". This is the conversion hook.
2. **Architects**: a fast first proposal for a client meeting.
3. **Us**: the same engine with fixed "golden briefs" becomes an **automated end-to-end test** of the whole platform, run before every deploy.

## 2. Questions (draft)

1. Where (county / town, rural or urban) and land size?
2. Who lives there (people, rooms needed)?
3. Target area (m²) and budget band?
4. Style (from our style list), with reference images optional
5. Levels (P / P+1 / P+M), terrace, garage?
6. Product preferences: facade, roof, windows; or "you choose"
7. How many renders, and which views (exterior day/night, interior)?
8. Free text: "anything else?"

Or a single free prompt, e.g. *"Casă 120 mp, 3 dormitoare, stil scandinav, lângă Cluj, buget 120k €, 8 randări"*.

## 3. How it works (modular)

```
Brief (questions / prompt)
  → Claude (structured output) → ExpressBrief (typed JSON, validated)
  → Step filler: calls each wizard step's PUBLIC setter, step by step
  → Product picker (from src/assets products library)
  → Render jobs (ai-render API, N jobs, engine fallback order from Chat 3)
  → Presentation + PDF export (existing output/presentation modules)
  → Result page: presentation, PDF download, "edit in wizard" button
```

Rules:
- Own folders: `src/features/express/**`, `src/app/api/express/**`, `src/app/(app)/express/**`, `tests/e2e/express*`.
- It **only calls public interfaces** of other modules (wizard store actions, render API, export functions) and never edits them. If an interface is missing, the owning chat adds it.
- **Job with steps and progress**: each step is saved. If renders fail, the user still gets the filled project and the presentation without the failed images, plus a "retry renders" button.
- **Feature flag** `EXPRESS_MODE_ENABLED` + per-tier limits: guest gets a demo with 1–3 renders, Premium 5, Architect 8, Constructor 10+.
- Claude cost per run: one structured-output call (~€0.01–0.03). Render cost is set by the engines and tier quotas.

## 4. Plan

| When | What | Who |
|---|---|---|
| W49 (after sprint) | Session 8.01: read-only audit of how each wizard step stores data + which public setters exist → final spec | Chat 8 |
| W49–W50 | MVP: questions → ExpressBrief → fill steps → 3 renders → presentation. Behind the flag | Chat 8 (+ small interface PRs from Chats 3 and 5) |
| W50 | Golden briefs (3 fixed) as an automated E2E test | Chat 8 + MAIN |
| Beta (Dec 15) | Enabled for beta users if the smoke test is green; otherwise admin-only | MAIN decides |
| Jan | Free-prompt mode, more renders, products, "explain this design" by the consultant | Chat 8 |

## 5. Risks

- The wizard state may not be callable outside the UI. Then the 8.01 audit finds it, and the fix is a thin "actions" layer in the wizard (owner: whoever owns `features/wizard`; MAIN to assign).
- Render quotas: Express can burn credits fast, so it always goes through `creditManager` (Chat 4).
- Quality: AI choices must respect Neufert/CATUC constraints, so the brief is validated against the same rules as the manual wizard.
