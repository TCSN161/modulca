# MCA-DOC-PHASE4-BETA-PREP-CHECKLIST

**Phase**: 4 — Dec 15-22, 2026  
**Prev**: [[MCA-SPEC-CATUC-PHASE3-PLATFORM]]  
**Next**: Invite-only beta Dec 15 - Jan 15  
**Owner**: Costin + Claude + Vlad (sign-off)

---

## 1. Pre-flight checklist (complete BEFORE Dec 15 invite goes out)

### 1.1 Content gates (all 10 CATUC files)

- [ ] F1 PermitTracker.tsx — live (done Nov 20)
- [ ] F2 building-permit-process.md — deployed from .new.md (Phase 2)
- [ ] F3 modular-prefab-regulations.md — deployed + Vlad sign-off
- [ ] F4 urban-planning-pug-puz.md — deployed + Vlad sign-off
- [ ] F5 _meta.yaml — live (done Nov 20)
- [ ] F6 building-permit-romania.md — body complete + deployed
- [ ] F7 choosing-land-modular-home.md — live (done Nov 21)
- [ ] F9 articles-ro.ts — live (done Nov 21)
- [ ] F10 ro-03 draft — live (done Nov 21)
- [ ] New: catuc-169-2026.md — Vlad sign-off + deployed
- [ ] New: catuc-clarificari.md — deployed (Ministry answers)

**Deploy procedure**: for each `.new.md` file approved by Vlad:
```bash
# In repo
git mv src/knowledge/path/to/file.new.md src/knowledge/path/to/file.md
npm run build:kb   # regen _index.ts
npm run build      # verify
git commit -m "feat(catuc): deploy F<N> after Vlad review"
git push
# Vercel auto-deploys
```

### 1.2 Platform gates (from Phase 3)

- [ ] `/catuc-check` route live + 10+ tests green
- [ ] PermitTracker v0 downloads notification package
- [ ] Profile engine returns consistent output
- [ ] Vlad sign-off on PDF templates (with "DRAFT - pending signatory architect validation" removed)
- [ ] E2E Playwright test: Step 1 → Step 14 → download works

### 1.3 Infrastructure gates

- [ ] ops:check: 30+ passing, 0 critical (last verified: 2026-11-21)
- [ ] CI/CD: 4/4 workflows green
- [ ] Supabase: Projects + Profiles + Public_renders tables live
- [ ] Stripe: still TEST mode (OK for invite-only, live cutover Phase 6)
- [ ] Resend: modulca.eu verified, under 3k emails/mo
- [ ] Sentry: active, 0 unresolved critical errors
- [ ] All 17+ GitHub secrets live
- [ ] All Vercel env vars set

### 1.4 Legal/Human gates

- [ ] Arh. Vlad Ioniță formal engagement signed (B4 resolved)
- [ ] Vlad listed on `/about` or `/team` page (if agreed)
- [ ] Privacy Policy up-to-date (CATUC content references)
- [ ] Terms of Service: beta user clause ("preview product, no SLA")
- [ ] GDPR DPA with Supabase + Resend + Sentry + Vercel (EXT-OPS-001 from April)

### 1.5 Beta cohort prep

- [ ] 10-20 invite-only user list (Vlad recommendations + personal network)
- [ ] Invite email template drafted
- [ ] Beta-specific onboarding flow (show "BETA" badge + feedback widget)
- [ ] Feedback form (Google Form or built-in /feedback)

---

## 2. Dec 15 — Launch day (invite-only)

### Morning
- [ ] Final ops:check — must be 30+ ✅
- [ ] Final vercel deploy with latest commits
- [ ] Verify modulca.eu loads all 14 steps for a demo user
- [ ] Test PermitTracker v0 download with real user profile

### Afternoon
- [ ] Send invite emails to 10-20 users
- [ ] Post in Costin's personal network (LinkedIn, if desired)
- [ ] Open Sentry dashboard — watch for first-user errors

### Evening
- [ ] Review first 2-3 signups — any UX blockers?
- [ ] Respond to any beta user questions personally
- [ ] Write MCA-LOG-2026-12-15 end-of-day

---

## 3. Dec 16-22 — Monitor & iterate (soft phase)

Daily rhythm (~1h/day):
- Morning: check Sentry + any support emails
- Midday: review feedback form submissions
- Evening: triage bugs, prioritize for hotfix vs defer

Weekly:
- Friday Dec 19: midweek beta health check
- Sunday Dec 21: 1-week-in retrospective, prep Dec 23-31 pause (holidays)

### Dec 23 - Jan 5 — Holiday pause

- Nurture mode only (respond to emails, no new features)
- Sentry alerts should auto-notify Costin via GitHub Issues
- No deploys unless critical bug

### Jan 6-15 — Pre go/no-go

- Beta feedback consolidation
- Fix critical bugs
- Prep MCA-DOC-GO-NO-GO-2027-01-15 decision doc

---

## 4. Risks + mitigation

| Risk | Mitigation |
|---|---|
| Vlad doesn't sign off F3 in time | Backup: deploy F3 with explicit "unreviewed draft" banner, defer full deploy to Jan |
| Critical bug mid-beta | Hotfix workflow: push to master → auto-deploy → notify affected users via Resend |
| Beta users confused by missing features | Beta badge + "coming soon" markers on Step 14 advanced tools |
| Low signup rate (< 5 in first week) | Costin personal outreach + reduce ask (just signup, no review needed) |
| Supabase Free tier limits | Monitor DB size + auth user count weekly; upgrade to Pro only if crossing 400+ users |

---

## 5. Success criteria (end of Phase 4 / start of beta)

- [ ] All 10 CATUC files live
- [ ] 10+ beta signups within 72h of invite
- [ ] 0 critical errors in Sentry first 48h
- [ ] First user successfully downloads notification package (Vlad reviews it)

If 3/4 → GREEN. If 2/4 → YELLOW, iterate before Jan go/no-go. If 1/4 → consider delaying public launch Feb 1.

---

## 6. Deliverables Phase 4

1. All CATUC files deployed
2. Platform features polished (F3 era)
3. Beta cohort onboarded
4. First feedback batch collected
5. MCA-LOG-2026-12-22 end-of-phase retrospective

---

## 7. Links

- Phase 2 content prep: [[MCA-SPEC-CATUC-PHASE2-PLAN]]
- Phase 3 platform spec: [[MCA-SPEC-CATUC-PHASE3-PLATFORM]]
- Phase 2 kickoff checklist: [[MCA-DOC-PHASE2-KICKOFF-CHECKLIST]]
- CATUC references: `docs/references/catuc/README.md`

---

*Phase 4 = where content meets users. Last chance to fix before public eye.*
