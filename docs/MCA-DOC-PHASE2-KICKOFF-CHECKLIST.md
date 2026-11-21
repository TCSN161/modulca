# MCA-DOC-PHASE2-KICKOFF-CHECKLIST

**Pentru**: Miercuri 26 Nov 2026 — Phase 2 start day  
**Owner**: Costin + Claude  
**Prev**: [[MCA-SPEC-CATUC-PHASE2-PLAN]] · [[MCA-DOC-WEEKEND-PLAN-2026-11-22]]

Checklist concret pentru ziua de kickoff. Dacă prep-ul weekend-ului a mers → bifezi rapid + Phase 2 avansează cu 50% front-loading făcut.

---

## ✅ Pre-condiții din weekend (verifică că sunt done)

- [ ] **Vlad Ioniță** — email trimis (Lu 23 sau mai devreme), ideal confirmat că e disponibil Nov 28-Dec 3 pentru review
- [ ] **NotebookLM Q&A** — Q1-Q10 (minim) ingestate, răspunsurile într-un JSON structurat
- [ ] **Weekly budget** reset (Sâmbătă 6 AM, deja trecut Mi)

Dacă NotebookLM NU e done → tu faci primul pe Mi dimineață (1h paste), apoi reiau.

---

## 📋 Pe ziua de 26 Nov

### Dimineață (09:00-12:00)

**Pas 1 — Verificare stare (10 min)** — rulez eu
```bash
npm run ops:check
gh workflow list --all
gh run list --limit 5
```

**Pas 2 — Ingest NotebookLM answers (10 min)** — rulez eu
```bash
# User trimite qa.json în chat sau în fișier local
node scripts/catuc-ingest.mjs path/to/qa.json
```
Output:
- `docs/research/2026-11-26-notebooklm-catuc-answers.md` (consolidated)
- `src/knowledge/06-regulations/RO/catuc-169-2026.new.md` (chapter stub populated)

**Pas 3 — Article mapping table fill (30 min)** — rulez eu  
Update `docs/MCA-SPEC-CATUC-PHASE2-PLAN.md` §4 cu article references concrete din NotebookLM.

### Prânz (12:00-13:00)

Pauză. Decizi tu: cu Claude sau fără pentru etapa următoare.

### După-amiază (13:00-18:00) — F2 complete

**Pas 4 — F2 full rewrite** — rulez eu (~3h)
- Deja am skeleton la `src/knowledge/06-regulations/RO/building-permit-process.new.md`
- Umple TBD-urile cu content din NotebookLM
- Delegate primul draft la DeepSeek dacă vrei (cost ~$0.50)
- Claude review final + refining

**Pas 5 — Send F2 to Vlad pentru review** — tu
- Email cu link către branch sau atașat PDF export
- "Vlad, primul draft CATUC pentru review. Fereastră Nov 28 - Dec 3. Focus pe secțiunile [X, Y]."

### Seară (18:00-20:00) — F3 kickoff (CRITICAL)

**Pas 6 — F3 modular-prefab-regulations start** — rulez eu
- Skeleton la `modular-prefab-regulations.new.md`
- Content din NotebookLM Q5 (modular/prefab mentions) + Q7 (anexe) + Q10 (architect role)
- **MULT mai atent decât F2** — e critical legal content pentru USP-ul nostru
- Marchez TBD pe orice unclear → așteaptă Vlad

---

## 🎯 Deliverables fin ziua

- [ ] F2 `.new.md` COMPLETE (deploy gated pe Vlad)
- [ ] F3 `.new.md` 50-60% done, restul așteaptă Vlad per-paragraph
- [ ] Article mapping table 80%+ filled în MCA-SPEC-CATUC-PHASE2-PLAN
- [ ] First Vlad email sent cu F2 draft

**Fail state tolerable**: dacă F3 nu avansează, nu-i panică — F3 e gated de Vlad anyway.

**Hard fail state**: dacă F2 nu-i done, Phase 2 timeline alunecă — risk pentru Dec 15 beta.

---

## 🧰 Tools folosite în zi

- Claude Code (aici) — orchestrator + legal review
- `scripts/catuc-ingest.mjs` — deja scris
- DeepSeek API (optional, pentru bulk translate speed) — $0.14/1M tokens
- NotebookLM (user — doar Marți 24 Nov)
- Perplexity (optional fallback dacă NotebookLM miss ceva)

**Budget estimat**: Claude ~20-30k tokens (bulk Phase 2 kickoff) + DeepSeek $2-5 (translation delegation).

---

## 📅 Joi 27 Nov — continuare

- F3 complete + handoff Vlad full review
- F4 `urban-planning-pug-puz.new.md` start (skeleton deja făcut sâmbătă dimineață)
- Vlad primește primele feedback-uri pe F2 (hopefully)

---

## 🚨 Dacă ceva merge prost

| Issue | Acțiune |
|---|---|
| NotebookLM n-a răspuns bine la 3+ queries | Fallback: Perplexity cu aceleași Q, sau direct grep `catuc-169-2026-text.md` |
| DeepSeek balance $0 | Chat 4 action: $5 top-up | Sau alternativ: Groq free tier gpt-oss-120b |
| Vlad nu răspunde până vineri | Follow-up email, apoi backup architect (user to identify) |
| Prod cade mid-phase | Sentry alert → pausăm Phase 2, fix prod primul |

---

## ✅ Success criteria sfârșit săptămână (vineri 28)

- F2 deployed `.new.md` → `.md` dacă Vlad aprobă până vineri după-amiază
- F3 50%+ complete, waiting Vlad specifics
- F4 draft complete
- Zero prod incidents
- MCA-LOG-2026-11-28 written cu progress real

**Phase 2 health check vineri**: 60-70% complete = good; >80% = excellent; <50% = reschedule Vlad.

---

*Phase 2 is the week CATUC content becomes reality. Everything else this month leads here. Make it count.*
