# MCA-DOC-WEEKEND-PLAN-2026-11-22

**Pentru**: Costin  
**Perioada**: Sâmbătă 22 Nov - Luni 24 Nov  
**Scop**: Pași concreti pentru weekend + luni, timp estimat pentru fiecare

Phase 1 e închisă. Phase 2 kickoff oficial Miercuri 26 Nov. Weekend-ul = pregătire ușoară + rest.

---

## 🧘 Prioritate 1: Odihnă

Ai livrat 3 zile intense. Weekend-ul merită liniște. Nu-ți face program dens — alege DOAR 2-3 din lista de mai jos.

---

## 📋 Opțiuni (toate opționale)

### 🌟 Prioritate MARE (impact mare / timp mic)

#### A. Vlad Ioniță outreach (30 min)
- **Când**: Duminică seara sau Luni dimineața
- **Ce**: Open [docs/MCA-DOC-VLAD-EMAIL-TEMPLATE.md](MCA-DOC-VLAD-EMAIL-TEMPLATE.md) → personalize (adaugă sume, nr telefon, zile preferate call) → send
- **De ce**: Phase 2 deploy e blocat fără Vlad engagement. Mai repede îl începi, mai repede închidem blocker B4.

#### B. NotebookLM CATUC upload (15 min + 1h paste)
- **Când**: Când ai 1-2h liber și calm (Sâmbătă după-amiază, Duminică dimineață?)
- **Ce**:
  1. Deschide [notebooklm.google.com](https://notebooklm.google.com) → login Google
  2. Click "+ New notebook" → nume "CATUC 169/2026"
  3. Click "Add sources" → "Upload" → selectează:
     - `C:\Users\Costin\Documents\modulca\docs\references\catuc\catuc-169-2026-text.md`
     - `C:\Users\Costin\Documents\modulca\docs\references\catuc\catuc-169-2026-articole.json`
     - `C:\Users\Costin\Documents\modulca\docs\references\catuc\CATUC _ Clarificari privind 169.2026.pdf`
  4. Aștepți ~2 min processing
  5. Deschide [docs/research/2026-11-19-notebooklm-catuc-queries.md](research/2026-11-19-notebooklm-catuc-queries.md)
  6. Paste Q1 → citește răspuns → copy-save (sau Save to note în NotebookLM)
  7. Repetă pentru Q2, Q3, ..., Q10 (Q11-Q25 pot aștepta Phase 2)
- **Rezultat**: Ai 10 răspunsuri CATUC gata pentru Claude integration
- **Următorul pas**: Export answers ca JSON sau paste în chat aici Luni → eu rulez `scripts/catuc-ingest.mjs`

### ⭐ Prioritate medie (useful dar nu urgent)

#### C. Social handles reservation (30-60 min)
- **Când**: Oricând, în timp ce aștepți NotebookLM processing
- **Ce**: Signup + reserve `@modulca_eu` pe:
  - [ ] Instagram
  - [ ] LinkedIn company page
  - [ ] TikTok
  - [ ] X/Twitter
  - [ ] Facebook page
  - [ ] YouTube
  - [ ] Reddit r/modulca
  - [ ] Pinterest
- **Bio minimal**: "Platformă pentru case modulare în România. Lansare publică feb 2027. modulca.eu"
- **Nu posta nimic yet** — doar rezervi numele

#### D. Namecheap auto-renew check (3 min)
- Login Namecheap → modulca.eu → verifică Auto-Renew = ON + card nu-i expirat
- (Deja verificat ieri, dar double-check nu strică)

### 💤 Prioritate MICĂ (optional)

#### E. Google Workspace signup (costin@modulca.eu)
- **Când**: Când ai €6-7 disponibili
- **De ce**: Phase 6 marketing credibility — "costin@modulca.eu" vs "costin.telefon@gmail.com" pentru outreach presă
- **Cost**: ~€6/lună Google Workspace Business Starter
- **Nu urgent**: Phase 6 e ianuarie 2027

---

## 🗓️ Calendar săptămâna viitoare (23-29 Nov)

| Zi | Priority | Ce |
|---|---|---|
| **Lu 23** | Vlad outreach (dacă nu ai făcut în weekend) | Email send |
| **Lu 23** | Opt: light cleanup/review cu Claude dacă vrei | ~30 min |
| **Ma 24** | NotebookLM Q&A dacă n-ai făcut weekend | ~1h user + 1h Claude integration |
| **Mi 25** | Prep ultim: verific toate deferredele deschise, revizuim planul Phase 2 | ~30 min cu Claude |
| **Mi 26** | **PHASE 2 KICKOFF** — F2 building-permit-process.new.md | ~3h Claude + review cu tine |
| **Jo 27** | F3 modular-prefab-regulations.new.md (CRITICAL — fiecare cuvânt review Vlad) | ~4h Claude + 2h Vlad |
| **Vi 28** | F4 + F6 body rewrites | ~3h |

Vlad window pentru review: **Nov 28 - Dec 3** (din email template suggerit). Depinde de când răspunde.

---

## ⚠️ What to avoid

- **NU** fă rotations noi fără Claude (risk prod break)
- **NU** modifica `.env.local` manual pe rute auth/supabase/stripe
- **NU** rulează `vercel --prod` fără să-mi zici (deploy nou cu config greșit = rollback headache)
- **NU** posta pe social media încă — brand voice nu-i finalizat

---

## 📞 Dacă apar surprize

- **Prod cade** (modulca.eu nu răspunde): deschizi Claude Code → "sentry errors?" + verific log
- **Workflow failure email de la GitHub**: forward sau paste în chat
- **Vlad întreabă ceva tehnic imediat**: link-l la `docs/MCA-SPEC-CATUC-PHASE2-PLAN.md` ca să vadă scope
- **Orice dubiu**: deschide Claude Code, întreabă — mai bine să întrebi 1 min decât să strici ceva

---

## ☕ Bottom line

Weekend-ul = ori odihnă pură, ori max **A + B** (Vlad email + NotebookLM Q&A) = ~2h total, nimic mai mult. Restul aștepta până Luni/Miercuri.

Phase 2 va porni în ritm bun pentru că:
- Infrastructure 100% ready
- 6/10 CATUC files pre-prepped
- catuc-ingest.mjs script gata
- Toate rotations done
- CI/CD healthy

🌙 Noapte bună.
