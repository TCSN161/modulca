# MCA-STRAT-2026-11-19-reboot

**Status**: Active strategic plan — ModulCA 2.0  
**Owner**: Costin Muraru  
**Scope**: Strategic rebaseline after 7-month pause + CATUC law change  
**Supersedes**: April 2026 plans (beta target 2026-05-01 → obsolete)  
**Related**: [[MCA-DOC-STATUS-2026-11-19]] · [[MCA-DOC-AUDIT-2026-11-19]] · [[MCA-STRAT-AI-DELEGATION-2026-11-19]] · [[MCA-STRAT-MARKETING-2026-11-19]]

---

## 1. Why ModulCA 2.0 (not 1.1)

Three factors demand a "version bump":

1. **Legal reset** — CATUC 169/2026 replaces the legal foundation (Legea 50/1991 + 350/2001) on which original content was built.
2. **AI landscape shift** — 7 months = 2-3 major model generations. Must re-evaluate stack.
3. **Operational reset** — original 11-day launch was never executed. Re-plan with lessons.

Not a rewrite. Not a rebrand. Same site, same domain. But a conscious re-baseline with "ready for real users" as the bar.

---

## 2. North Star

**One sentence**: *By Feb 1, 2027, modulca.eu is the fastest way for a Romanian family to legally design, price, and start building a CATUC-compliant modular house — with a licensed architect's seal and a real pilot case (Cornetu) backing every claim.*

### Non-negotiables
- Zero legal content outdated at public launch (CATUC 100% integrated)
- Arh. Vlad Ioniță formally signatary
- Cornetu case study (or verified virtual demo) live
- Beta-tested with ≥10 users 2+ weeks before public
- Mobile-first works on 375px screens
- RO+EN fully localized

### Explicit non-goals (for v2.0)
- Expansion outside Romania
- Supabase Pro (only if revenue justifies)
- Marketing paid ads (organic only until month 2 post-launch)
- Features outside modular residential (no garages, no commercial)
- B2B SaaS integrations

---

## 3. Phases Overview (7-week plan)

| Phase | Dates | Theme | Key deliverables | Gate |
|---|---|---|---|---|
| **0 Reset** | Nov 19-20 (now) | Docs + audit kickoff | 5 MCA-* docs, CATUC folder committed, settings allow list | ✅ by tonight |
| **1 Audit** | Nov 21-25 | Read-only verify all systems + content | A1-A10 complete, MCA-DOC-BLOCKERS, MCA-DOC-AI-LANDSCAPE | ≥25/28 ops:check |
| **2 CATUC** | Nov 26 - Dec 5 | Content rewrite, not yet deployed | 11 `.new.md` files, CATUC knowledge chapter, Vlad formal review | Vlad signs off |
| **3 Platform** | Dec 6-14 | PermitTracker v0 + profile engine + CATUC checker | Working `/catuc-check` route, user-facing notification generator | E2E test green |
| **4 Polish** | Dec 15-22 | Beta blockers resolve, deploy CATUC updates, invite list | Beta users ready | Dec 15 invite-only starts |
| **5 Invite-only Beta** | Dec 15 - Jan 15 | 10-20 users test, feedback loops | Zero critical bugs, 5 testimonials | Go/No-Go Jan 15 |
| **6 Pre-launch** | Jan 16-31 | Marketing groundwork, press kit, Cornetu story | Content calendar ready, 3 journalists lined up | Press kit live |
| **7 Public** | Feb 1 | Launch | Metrics dashboard live | 200 signups week 1 |

---

## 4. Decision Log (today)

| # | Decision | Rationale |
|---|---|---|
| D1 | Rebrand "ModulCA 2.0" internally (not public) | Marker for scope + mindset reset |
| D2 | Captain architecture retained + hybrid with MCA-* naming | Captain layer for chats, MCA-* for artifacts (strategic/task/doc) |
| D3 | Public launch 2027-02-01 (not Dec 8 per handoff) | Needs holiday buffer + Cornetu validation time |
| D4 | Invite-only beta Dec 15 | Legal content must land + Vlad signs first |
| D5 | Multi-AI delegation adopted (see [[MCA-STRAT-AI-DELEGATION-2026-11-19]]) | Budget €50 requires cheap bulk execution |
| D6 | Marketing deferred to post-launch (groundwork now only) | Product-market fit before paid amplification |
| D7 | NeufertAI model upgrade: claude-sonnet-4-20250514 → claude-sonnet-5-5 | Available since April, better reasoning for CATUC complex queries |
| D8 | Store all CATUC source files (keep docx + pdf) | Audit trail; different content in each (PDF = Ministry Clarifications) |
| D9 | Arhitect semnatar = Vlad Ioniță | User confirmed 2026-11-19 |
| D10 | Beta tier promo (3 months free) retained from April plan | Incentive still valid |
| D11 | Phase 2 CATUC fixes go to `.new.md` siblings first (parallel track) | Non-destructive — only deploy after Vlad validates |

---

## 5. What's Different from April 2026 plan

| April 2026 | Nov 2026 (2.0) |
|---|---|
| Beta May 1 (11 days) | Beta Feb 1 (73 days) |
| Based on Legea 50/1991 + 350/2001 | Based on CATUC 169/2026 |
| Single Claude orchestration | Multi-AI delegated (DeepSeek + Gemini + NotebookLM etc) |
| Captain just-in-time | Captain + MCA-* hybrid |
| Marketing not planned | Marketing scheduled post-launch with groundwork now |
| No architect confirmed | Vlad Ioniță confirmed |
| Stripe unclear status | Will verify in audit |
| 28/28 ops passing (claim) | Must re-verify |

---

## 6. Resource allocation

### Costin's time (4h/day baseline, expandable)
- Monday: Review Claude's weekly plan, approve decisions, run user-side checks (A1-A7)
- Tuesday-Thursday: Specific user tasks from Claude's dispatch list
- Friday: Week-close review, plan adjustments
- Weekend: optional push on social handles / press kit

### Claude's time (continuous when invoked)
- Daily: Execute code-side audit/fix tasks, write docs
- Delegate to DeepSeek/Gemini when batch work arises
- Weekly: Produce brief update MCA-LOG at end of each week

### Budget
- Nov-Dec: €38/mo (Claude + GPT Plus)
- Jan: +€5-10 DeepSeek pay-per-use estimate
- Feb+: evaluate upgrade to Perplexity Pro (+€18) if organic works

---

## 7. Risks & Mitigations

| Risk | Impact | Prob | Mitigation |
|---|---|---|---|
| CATUC content takes longer than 2 weeks | High | Medium | Start NotebookLM synthesis immediately + parallel NeufertAI-assisted drafting |
| Vlad Ioniță unavailable or disagrees on content | Critical | Low | Early engagement (schedule call before Dec 1), have backup signatary candidate |
| Cornetu plot falls through | High | Medium | Prepare virtual case study as fallback |
| Budget suddenly constrained (€50 unavailable) | Medium | Low | Can downgrade to free tier only (€18 Claude Pro = sufficient) |
| Supabase Free hit limits before launch | Medium | Low | Monitor usage; upgrade just before public launch if needed |
| Claude token limit exceeded | Low (user ⟵ delegation) | Low | MCA-STRAT-AI-DELEGATION mitigates |
| Content gets flagged by Google as AI-spam | Medium | Medium | Always Claude-reviewed, E-E-A-T with Costin bio + Vlad credentials |
| Beta users find critical bug week 1 | High | Medium | Playwright E2E before beta start, Sentry monitoring active, hotfix pipeline ready |

---

## 8. This Week Priorities (Nov 19-22)

- [x] Write 5 MCA-* strategic docs (today — done after commit)
- [ ] Run ops:check + build + typecheck (today)
- [ ] Commit docs/references/catuc/ with provenance README (today)
- [ ] Propose .claude/settings.local.json allow rules (today)
- [ ] User does A1-A7 service verification (Thu-Fri)
- [ ] Rebaseline TASK_MASTER.md with MCA-* IDs (Fri)
- [ ] Start CATUC synthesis via NotebookLM (user uploads files) (weekend if user time)
- [ ] First MCA-LOG end-of-week (Fri evening)

---

## 9. Communication Protocol

- **Main chat**: Here (Claude Code) — all strategic + code decisions
- **Secondary research**: Perplexity + NotebookLM (chat handoffs documented in MCA-LOG)
- **Code execution**: Via this chat, with delegation per MCA-STRAT-AI-DELEGATION
- **Status updates to user**: End-of-session MCA-LOG + commits + brief inline updates
- **User to me**: Feel free to paste screenshots, ask anytime, veto/ redirect freely

---

## 10. Success Definition

ModulCA 2.0 succeeds if, at Feb 15 2027 (2 weeks post-launch):
1. ≥500 signups
2. ≥20 paid users across tiers
3. Zero legal complaints about content
4. At least 1 architect publicly endorses the tool
5. Cornetu case study published with real numbers
6. Vlad Ioniță retained as signing architect
7. Costin not burned out (sustainable 4-6h/day pace)

---

*A reboot is not an admission of failure. It's an admission that the ground under your feet changed. CATUC changed it. We rebuild better.*
