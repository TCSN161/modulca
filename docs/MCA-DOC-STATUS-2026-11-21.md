# MCA-DOC-STATUS-2026-11-21

**Snapshot**: Day 3 — start of new work week (post weekly token reset)  
**Prev**: [[MCA-DOC-STATUS-2026-11-20]]  
**Phase**: End of Phase 1 (100%), prep for Phase 2 (starts Wed Nov 26)

---

## 1. Status at week start

| | Thu 19 | Fri 20 | **Sat 21** |
|---|---:|---:|---:|
| Phase 1 % | 35% | 100% | **100% (closed)** |
| ops:check | 30 | 30 | **—** |
| Tests | 147 | 182 | **182** |
| TS errors | 0 | 0 | **0** |
| Vulnerabilities | 53 | 6 | **6** |
| Critical vulns | 5 | 0 | **0** |
| CI pipeline | ❌ | ✅ | **✅** |
| GitHub secrets | 0 | 8 | **17** |
| Workflows active+green | 0/4 | 2/4 | **4/4** 🎯 |
| MCA-* commits total | 11 | 25 | **26** |

---

## 2. Overnight (Fri 20 → Sat 21)

Zero commits, zero scheduled workflow failures.

---

## 3. Today priorities (~30 min)

1. ✅ Supabase migrated to new sb_ key system + legacy JWT disabled (anon → publishable, service_role → secret)
2. ✅ OpenAI key rotated (modulca-production-2026-11, both old revoked)
3. ✅ Phase 2 safe quick win: F7 `choosing-land-modular-home.md` sources updated
4. NotebookLM upload instructions final check — ready at [`docs/research/2026-11-19-notebooklm-catuc-queries.md`](research/2026-11-19-notebooklm-catuc-queries.md)

Prod verified healthy after each rotation (ops:check 30 ✅, /api/health status ok).

---

## 4. Phase 2 readiness check (starts Wed Nov 26)

- [x] NotebookLM query packet written (25 queries)
- [x] CATUC source files in repo (3.7 MB)
- [x] CATUC translate route live at `/api/catuc-translate`
- [x] `scripts/catuc-ingest.mjs` ready (NotebookLM JSON → auto-generated .new.md)
- [x] Pre-Phase 2 frontmatter wins: F1, F5, F6, F7 (4 files)
- [x] Pre-Phase 2 body inline refs: F9 (articles-ro.ts 2 blog bodies), F10 (ro-03 blog draft)
- [x] F2 skeleton stub (`building-permit-process.new.md`) — chapters + TBD markers ready for NotebookLM content fill
- [x] knowledge/_index.ts regenerated (reflects all frontmatter updates)
- [ ] Vlad Ioniță formal engagement (user coordinate — email template at `docs/MCA-DOC-VLAD-EMAIL-TEMPLATE.md`)
- [ ] NotebookLM upload done by user (step-by-step in `docs/MCA-DOC-WEEKEND-PLAN-2026-11-22.md`)
- [ ] F3, F4, F6 body — Phase 2 kickoff work (needs NotebookLM content)

**Total pre-prepped**: 6/10 CATUC source files + 1 skeleton = 7/10 visible progress. Phase 2 starts from position of strength.

---

## 5. Blocker short-list (post Phase 1 close)

Open:
- **B2** 7 remaining CATUC files — Phase 2 Nov 26
- **B4** Vlad Ioniță formal engagement — user action this week
- **B8** EXT-OPS-001 user decisions — Phase 6 reactivate
- **B15** 6 remaining vulnerabilities (require sharp breaking change) — dedicated session
- **B16** Novita top-up decision — deferred when revenue
- **Supabase SERVICE_ROLE rotation** — this morning
- **OpenAI rotation** — this morning

Closed yesterday:
- ~~B1~~ Supabase paused → restored
- ~~B3~~ NeufertAI model (Chat 3)
- ~~B5~~ CATUC folder committed
- ~~B11~~ Sentry Next 16 refactor
- ~~B12~~ middleware → proxy
- ~~B13~~ public_renders migration
- ~~B14~~ Together.ai removed
- ~~B17~~ Ops Check cron fully green

---

## 6. Week ahead (Nov 21 → Nov 27)

| Day | Priority |
|---|---|
| **Sat 21 (today)** | Rotations + status doc + F7 |
| **Sun 22** | Vlad Ioniță outreach, NotebookLM upload (user, 30 min) |
| **Mon 23** | Rest / optional: minor doc cleanup, Weekly Ops setup if desired |
| **Tue 24** | Prep Phase 2 — identify first batch of articles for DeepSeek translate |
| **Wed 25** | Prep continue |
| **Wed 26** (Phase 2 kickoff) | F2 building-permit-process.new.md + NotebookLM Q&A integration |
| **Thu 27** | F3 modular-prefab-regulations.new.md (critical legal) |

---

## 7. Metrics worth watching this week

- NotebookLM processing delay (first time user uses it) — informs whether to buffer Phase 2
- Any npm audit new advisories (auto via Weekly Engine Billing Audit)
- Any Sentry errors on modulca.eu live (per hour via Ops Check cron)

---

*Day 3 of ModulCA 2.0. Infrastructure solid, moving from "clean up after pause" to "advance product content."*
