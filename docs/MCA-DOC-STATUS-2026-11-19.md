# MCA-DOC-STATUS-2026-11-19

**Status**: Current snapshot — day of reboot after 7-month pause  
**Owner**: Costin Muraru  
**Scope**: Honest state-of-affairs: what exists, what works, what doesn't, what's unclear  
**Note**: This is the baseline. [[MCA-DOC-AUDIT-2026-11-19]] verifies each claim.

---

## 1. Timeline Context

- **Last commit before pause**: 2026-04-20 `d0369da chore(captain): record session 1 commit SHA 584fcba`
- **Pause duration**: ~7 months (21.04.2026 → 19.11.2026)
- **Reason**: Personal — user reports continuity issues
- **Today**: 2026-11-19 (Thursday)
- **Public launch target (revised)**: 2027-02-01

---

## 2. Technical Stack — What's Confirmed

### Code base
- **Framework**: Next.js 16 (TypeScript, React)
- **DB**: Supabase (Frankfurt region)
- **Payments**: Stripe (presumed TEST mode — needs A3 verify)
- **Email**: Resend (configured — needs A4 verify)
- **Monitoring**: Sentry (configured — needs A5 verify)
- **Styling**: Tailwind
- **3D**: Three.js
- **State**: Zustand
- **Deployment**: Vercel (presumed Hobby tier — needs A1 verify)
- **Dev command**: `node --max-old-space-size=4096 node_modules/next/dist/bin/next dev --webpack`
- **Prebuild**: `node scripts/build-knowledge.mjs`

### Code size indicators
- `.env.local` has **46 env variables** (lots of AI providers + Stripe + Supabase)
- 212+ knowledge articles in `src/knowledge/`
- 20 GLB 3D models in `src/assets/`
- 14 step pages in app
- 5 AI providers in `providerChain` (anthropic, openai, groq, together, pollinations)

### Env variables present (confirmed .env.local 2026-04-17)
Services configured:
- Anthropic (incl. `MODULCA_ANTHROPIC_KEY` — likely scoped key)
- OpenAI, Groq, Together, Gemini, HuggingFace
- Fireworks, DeepInfra, Novita, Prodia, Fal, BFL
- Leonardo, Stability, Segmind, Replicate, Runway, Wavespeed
- Cloudflare (account + token)
- Supabase (URL, anon key, service role)
- Stripe (secret, webhook, publishable, 4 tier prices × 2 periods = 8 price IDs)
- Resend (API key + FROM email)
- Sentry (DSN, org, project)
- NextAuth (secret, URL)
- GA, Clarity
- NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_APP_NAME

**MISSING**:
- No `DEEPSEEK_API_KEY` yet
- No `PERPLEXITY_API_KEY` yet
- (These are Phase 2 adds per MCA-STRAT-AI-DELEGATION)

### Git state (2026-11-19 11:XX EET)
- Branch: `main` (or current — to verify)
- Working tree: CLEAN except `docs/references/catuc/` untracked
- Last commit: 2026-04-20 `d0369da`

### Docs structure
```
docs/
├── AI_PROVIDERS.md, AUTOMATION.md, AUTONOMOUS_AGENT.md
├── BUSINESS_STRATEGY.md, COMPANY_INFO.md, CONTINUOUS_AUDIT.md
├── DASHBOARD_SPEC.md, ECOSYSTEM_ARCHITECTURE.md, EMAIL_SETUP.md
├── ENGINE_BILLING.md, GALLERY_DEPLOY_CHECKLIST.md
├── GDPR/ (folder)
├── GIT_HISTORY_NOTES.md, I18N.md, META_SYSTEM.md
├── PARALLEL_SESSIONS.md, ROADMAP_AI_BETA.md
├── STRIPE_GO_LIVE_CHECKLIST.md, TASK_MASTER.md
├── TOOLS_INTEGRATION.md, vector-db-architecture.md
├── audits/
│   └── 2026-04-17.md  (only one, 7mo old)
├── blog-drafts/
├── pitch/
├── platform-accounts.md
├── references/
│   └── catuc/ ← UNTRACKED (4 files, 3.7 MB total)
└── sessions/
    ├── README.md, TRACKER.md
    ├── active/
    │   ├── 2026-04-18-external-ops-EXT-OPS-001.md
    │   ├── 2026-04-20-captain-2026-04.md
    │   └── 2026-04-20-captain-handoff.md
    └── templates/
        ├── captain.md, weekly-ops.md  (Captain architecture)
        └── 8 specialist templates
```

---

## 3. External Services — Status Summary (Pre-Audit)

| Service | Configured in env? | Live status | Verifier |
|---|---|---|---|
| Vercel (modulca.eu deploy) | yes (NEXT_PUBLIC_APP_URL) | **UNKNOWN — need to check Vercel dashboard** | A1 |
| Supabase (DB + auth) | yes (URL + keys) | **UNKNOWN — need /api/health + login test** | A2 |
| Stripe | yes (secret + webhook + prices) | **UNKNOWN — test mode? Live? bank verified?** | A3 |
| Resend (email) | yes | **UNKNOWN — domain still verified? limit used?** | A4 |
| Sentry | yes | **UNKNOWN — still active? free tier intact?** | A5 |
| AI providers (9 configured) | yes | **UNKNOWN — any keys revoked/expired?** | A6 |
| Domain modulca.eu | — | **UNKNOWN — still registered? renewal date?** | user |
| Namecheap account | — | **UNKNOWN — active?** | user |

---

## 4. Human Resources

| Role | Person | Status | Note |
|---|---|---|---|
| Founder / CEO (public) | Costin Muraru | ✅ Active | Email costin.telefon@gmail.com (identify only, private) |
| Administrator (paper) | Muraru Petria | ✅ On paper only | For SRL formalities; never public-facing |
| Arhitect semnatar | **Arh. Vlad Ioniță** | ✅ Confirmed today 2026-11-19 | Needs: formal contract + specialization details |
| Inginer structuri | ❌ NOT YET CONFIRMED | In progress | User working on it |
| Inginer instalații | ❌ NOT YET CONFIRMED | In progress | User working on it |
| Module producer | Discussions to resume | In pause | User: "am mai discutat dar trebuie reluate discutiile" |
| Marketing / Social | None dedicated | Deferred post-launch | Per [[MCA-STRAT-MARKETING-2026-11-19]] |

---

## 5. Legal State — CATUC

### Law in force
- **Legea 169/2026 (CATUC)** = Codul Amenajării Teritoriului, Urbanismului și Construcțiilor
- Monitorul Oficial nr. 661/10.08.2026
- **Effective date**: 25.08.2026
- **Abrogates**: Legea 50/1991, Legea 350/2001

### Local CATUC files (in `docs/references/catuc/`, untracked)
- `catuc-169-2026-text.md` (1.25 MB) — cleaned legal text (formatting broken, needs cleanup)
- `catuc-169-2026-articole.json` (1.25 MB) — structured articles
- `CATUC copiat de pe site copy paste 169.2026.docx` (599 KB) — original Word source
- `CATUC _ Clarificari privind 169.2026.pdf` (646 KB) — Ministry clarifications (15 items)

**Action**: Add README to folder explaining provenance. Commit to git.

### Code references to REPEALED laws (need update — 11 files)
1. `src/features/blog/articles-ro.ts`
2. `src/features/blog/articles.ts`
3. `src/features/design/components/technical/PermitTracker.tsx`
4. `src/knowledge/06-regulations/RO/building-permit-process.md`
5. `src/knowledge/06-regulations/RO/modular-prefab-regulations.md`
6. `src/knowledge/06-regulations/RO/urban-planning-pug-puz.md`
7. `src/knowledge/06-regulations/RO/_meta.yaml`
8. `src/knowledge/17-guides/building-permit-romania.md`
9. `src/knowledge/17-guides/choosing-land-modular-home.md`
10. `src/knowledge/_index.ts`
11. `docs/blog-drafts/ro-03-permis-constructie-romania-procesul-complet.md`

**Severity**: Legal content outdated = reputation risk. Must fix before public launch.

### Key CATUC articles for modular construction
- **Art. 294(2)(a)(ii)**: Notification for P / D+P houses up to 150m² (NOT P+1, NOT attic)
- **Art. 299(2)(c)**: No-formalities for annexes up to 20m² in rural (but current 3m module height disqualifies most "Studio preset")
- **Art. 295-298**: Notification procedure
- **Art. 415, 524**: TBD — need heading detection fix in JSON parse

---

## 6. Business / Legal Entity

- **Legal entity**: MCA SRL
- **ONRC**: J40/14760/2015
- **CUI/VAT**: RO35294600
- **HQ**: Str. Lacul Plopului nr. 10, Sector 5, București, 051735
- **Bank**: TBD (needed for Stripe live cutover)

---

## 7. Pilot Projects / Case Studies

| Project | Status | Role |
|---|---|---|
| Cornetu plot | Exists, access road complicated, metro zone TBD | Potential case study post-launch |
| Virtual demo (fallback) | Not yet planned | Backup if Cornetu delays |

---

## 8. Products / Assets (from memory, pre-pause state)

- 36 product variants
- 20 GLB 3D models
- 12 portfolio projects
- 212 knowledge articles
- 17 knowledge categories
- 7 regions (RO + 6 EU)
- 5 AI providers active

**All needs verification in audit**.

---

## 9. Subscription Tiers (from memory)

5 tiers:
- Guest (free)
- Explorer (free)
- Premium — €19.99/mo or €149.90/yr
- Architect — €49.99/mo
- Constructor — €149.90/mo

**Beta promo**: 3 months free (per memory — need to verify logic still active).

---

## 10. Context from Memory (pre-pause, needs refresh)

Per memory file `project_status_april2026.md` (snapshot 2026-04-16):
- "82% complete"
- "28/28 ops checks pass"
- "Critical path to May 1"

**Reality check (2026-11-19)**: `ops:check` result = **25 ✅ / 4 ⚠️ / 2 ❌** out of 31 checks (new checks added since April). Not bad for 7mo pause. See [[MCA-DOC-BLOCKERS-2026-11-19]] for critical items.

### Live ops:check findings (2026-11-19)

**Critical (❌)**:
- Supabase REST API: fetch failed
- Supabase Projects table: fetch failed
  - **Likely cause**: Supabase auto-paused after 1+ week inactivity on Free tier. Click "Restore" in dashboard likely fixes.
  - **Verify in**: supabase.com/dashboard/project/{id} → should show "Paused" badge

**Warnings (⚠️)**:
- Stripe mode = TEST (expected, planned to stay test until public launch)
- Supabase Profiles table: fetch failed (same root cause as critical)
- Supabase Auth service: fetch failed (same)
- Working tree: 1 uncommitted change (docs/references/catuc/ — intentional, to commit today)

**Confirmed working (25 ✅)**:
- All 46 env variables correctly configured
- Stripe: 6 active products, webhooks enabled, 3 tier prices live (€19.99 / €49.99 / €149.90 monthly)
- **Resend: modulca.eu domain VERIFIED** 🎯
- TypeScript: 0 errors
- Tests: 147 passing (unchanged from April — code didn't rot)
- modulca.eu: HTTP 200 LIVE 🎯
- /api/health endpoint: Status OK 🎯
- Git remote: up to date with origin

---

## 11. Active Subscriptions (user confirmed 2026-11-19)

| Service | User has | Paid tier? | Notes |
|---|---|---|---|
| Claude Pro (Anthropic) | ✅ Yes | €18/mo | This chat is here |
| ChatGPT Plus (OpenAI) | ✅ Yes | €20/mo | For delegation per MCA-STRAT-AI-DELEGATION |
| Perplexity | ⚠️ Yes account, Pro status unknown | TBD | User: "nu mai stiu daca e pro sau nu" |
| NotebookLM (Google) | ✅ Yes | FREE — sufficient | No Pro needed |
| Vercel | ⚠️ Yes account, tier unknown | TBD | Likely Hobby |
| Supabase | ⚠️ Yes account, tier unknown | TBD | Likely Free |
| X Premium (Grok access) | — | No | Not needed yet |

---

## 12. Open Questions (to resolve in Phase 1 audit)

**Technical**:
1. Does modulca.eu still load? (quick visit test)
2. Is database alive and migrations up-to-date?
3. Is Stripe in test mode or live? Any payments ever processed?
4. Is Resend domain still verified?
5. Are AI API keys still valid? (Anthropic rotates every ~12 months)
6. What was the actual state when pause began — does `ops:check` still pass 28/28?

**Legal**:
7. Is architectural signing contract with Vlad Ioniță formalized?
8. GDPR DPAs with vendors — any pending DPA responses from April 2026?
9. Cornetu plot legal status (metro zone or not)?

**Business**:
10. Any users signed up during pause? (unlikely if site paused, but check Supabase `auth.users`)
11. Any Stripe transactions? (unlikely in test mode but verify)
12. Domain modulca.eu renewal date?
13. Any third-party trial subs that expired (Namecheap domain purchases queue)?

---

## 13. What's Working (Presumed, pre-audit)

Based on last state 2026-04-20, these likely still work:
- [x] Code compiles (tests pass as of 2026-04-20)
- [x] Env config present
- [x] Captain architecture docs written
- [x] 3-Layer system templates in place
- [?] Deploy on Vercel (needs verify)

## 14. What's NOT Working / Needs Attention

- [ ] 11 files reference repealed laws (50/1991, 350/2001) — must update to CATUC 169/2026
- [ ] NeufertAI model uses `claude-sonnet-4-20250514` — should upgrade to `claude-sonnet-5-5`
- [ ] Beta launch date obsolete (was 2026-05-01, now 2027-02-01)
- [ ] CATUC content integration not started
- [ ] `docs/references/catuc/` not committed to repo
- [ ] Captain-2026-04 chat was never spawned (died in planning)
- [ ] EXT-OPS-001 session was prep-only, awaits user inputs
- [ ] WEEK-2026-W17 sprint never happened

---

## 15. Priorities Right Now (2026-11-19)

Per [[MCA-STRAT-2026-11-19-reboot]]:
1. ✅ (today) Reset session docs — this doc + MCA-DOC-AUDIT + MCA-STRAT-* + MCA-LOG
2. ⏳ (today) Run `ops:check` + `build` to verify tech still alive
3. ⏳ (today) Commit CATUC files (`docs/references/catuc/`) with README
4. ⏳ (tomorrow) A1-A7 service verification (half automated, half user-assisted)
5. ⏳ (this week) CATUC content rewrite for 11 files (parallel track, not deployed)
6. ⏳ (next week) Platform work: PermitTracker v0, CATUC profile engine

---

## 16. Related Documents

- [[MCA-DOC-AUDIT-2026-11-19]] — audit plan + checklist (A1-A7 breakdown)
- [[MCA-STRAT-2026-11-19-reboot]] — ModulCA 2.0 strategy
- [[MCA-STRAT-AI-DELEGATION-2026-11-19]] — multi-AI workflow
- [[MCA-STRAT-MARKETING-2026-11-19]] — marketing roadmap
- [[MCA-LOG-2026-11-19-session-reboot]] — session log (end of day today)
- [[MCA-DOC-HANDOFF-2026-11-19]] — original handoff from Claude.ai chat (in `C:\Users\Costin\Downloads\`)
- `docs/META_SYSTEM.md` — Captain architecture (still applicable)
- `docs/TASK_MASTER.md` — needs re-baselining

---

*This snapshot is taken on day 0 of ModulCA 2.0. Everything claimed here must be verified by audit. Truth > assumptions.*
