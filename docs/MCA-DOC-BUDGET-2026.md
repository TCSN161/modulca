# MCA-DOC-BUDGET-2026 — costuri lunare față de plafonul de €50 (v0)

**Scris**: 2026-11-27, sesiunea 1.05 MAIN (cerut de Radar 9.01). **Owner**: MAIN; se actualizează la fiecare închidere de lună (prima dată 1.06, Dum 29).
**Plafonul**: **max €50/lună total** pentru unelte, hosting și AI, până la venituri (decizia din 19 nov, [[MCA-LOG-2026-11-19-session-reboot]]).
**Surse**: `docs/COMPANY_INFO.md` (conturi, planuri), [[MCA-STRAT-AI-DELEGATION-2026-11-19]] (abonamente), `MCA-DOC-AI-ENGINES-BETA-READINESS-v2-2026-11-26.md` (solduri motoare), rapoartele 3.06/3.07/2.08 (cheltuieli de test), ghidul ST18 (Supabase Pro).

Legendă: ✅ cifră din documente · 🟡 estimare · ❓ **necunoscut, de confirmat de Costin** (din facturi / dashboard). Curs folosit: $1 ≈ €0,92 🟡.

---

## 1. Costuri fixe lunare

| Serviciu | Plan | Cost/lună | Sigur? | Notă |
|---|---|---|---|---|
| Supabase | **Free** | €0 | ✅ Costin (27 nov) + `MCA-DOC-BLOCKERS-2026-11-19.md` B1 („Keep Supabase Free”) | Limite Free: 500 MB DB, 1 GB stocare, 50k utilizatori activi/lună, **pauză automată după 7 zile fără activitate** (s-a întâmplat în nov), **fără backup zilnic**. Pro ($25 ≈ €23) doar peste ~400 utilizatori sau dacă vrem backup înainte de beta |
| Vercel | Hobby | €0 | ✅ verificat 27 nov (Team Settings → Billing: Hobby, fără card) | ⚠️ Hobby nu permite uz comercial → **Pro ($20 ≈ €18,5) cel târziu la lansare (1 feb)** sau la primul plătitor |
| Claude (Claude Code, abonament) | Pro €18 (19 nov) | €18 | ❓ | În W48 am rulat 3–4 sesiuni Opus deodată și am atins limita; dacă planul s-a schimbat (Max), totalul crește mult |
| ChatGPT Plus | Plus | €20 | ❓ (încă activ?) | Rol: „a doua opinie”. În W48 n-a fost folosit în niciun flux |
| Sentry | Team | ❓ ($26 dacă e plătit; €0 dacă e trial/free) | ❓ | `COMPANY_INFO.md` scrie „Team” → de verificat urgent |
| Resend (email tranzacțional) | Free, 3k/lună | €0 | ✅ | |
| Domeniu modulca.eu (Namecheap) | anual | ≈ €1 (€8–12/an) | 🟡 | data reînnoirii ❓ |
| GitHub, Mapbox, Search Console, NotebookLM | free | €0 | 🟡 | Mapbox: free până la 50k încărcări de hartă/lună |
| Perplexity Pro | condiționat | €0 (neactivat) | 🟡 | |

**Total fix cunoscut**: Claude €18 + ChatGPT €20 = **€38 → sub plafon (rămân €12)**, fără Sentry și fără Vercel Pro.

## 2. Costuri variabile (AI pe API, randări)

| Ce | Nov 2026 (până pe 27) | Sigur? | Notă |
|---|---|---|---|
| Cloudflare Workers AI (cloudflare + klein, 10k neuroni/zi) | €0 | ✅ | Motorul implicit; plafon zilnic gratuit |
| AI Horde, Pollinations | €0 | ✅ | |
| OpenAI (randări de test + consultant Premium) | ≈ €0,03 test + ❓ consultant | 🟡 / ❓ | Consultantul Premium merge **OpenAI first** (4.04) |
| Anthropic API (consultant Architect/Constructor) | ≈ €0,15 test (2.08) + ❓ prod | 🟡 / ❓ | Cu prompt caching; puțini utilizatori până la beta |
| Leonardo | prepaid (3.114 tokeni pe 26 nov; ~160 pierduți prin ST34, 60 în bake-off) | ✅ sold, ❓ cât s-a plătit inițial | €0 nou; ≈ 240 randări Depth rămase |
| Stability | prepaid, 25 credite | ✅ sold | €0 nou; ≈ 8 randări Structure |
| WaveSpeed | prepaid $1 | ✅ sold | |
| DeepSeek | $0 sold (nu s-a reîncărcat, decizia 26 nov) | ✅ | traducerile le face Claude |
| **Total variabil nov** | **< €1 sigur + consultant ❓** | | |

## 3. Pe luni

| Lună | Fix | Variabil | Total | Față de €50 |
|---|---|---|---|---|
| **Nov 2026** (real, parțial) | €38 cunoscut + Sentry ❓ | < €1 + ❓ | **≈ €39 + ❓** | 🟢 sub (dacă Sentry e free) |
| **Dec 2026** (prognoză, beta 15 dec) | €38 | €1–5 consultant + **€0–10 decizia motoare** | €39–53 | 🟡 la limită dacă luăm €10 pe motoare |
| **Ian 2027** (prognoză, pre-lansare) | €38 + Vercel Pro €18,5 = €56,5 | €5–15 | €62–72 | 🔴 peste — Vercel Pro din primele abonamente, sau renunțăm la ChatGPT Plus |

## 4. Ce propune MAIN (decide Costin)

1. **Renunți la ChatGPT Plus** (€20) → fix €18, loc în plafon pentru motoare și Vercel Pro. Claude face tot ce făcea „a doua opinie”.
1b. **Supabase rămâne Free** (✅ aprobat de Costin, 27 nov) până la ~400 utilizatori **sau ~400 MB în bază**; spațiul se notează în fiecare închidere de vineri (tabelul §6). Riscuri de urmărit: pauza după 7 zile fără trafic (în beta nu ar trebui să apară) și lipsa backup-ului zilnic → MAIN face un export manual al bazei înainte de 15 dec (pre-flight).
2. **Verifici Sentry**: dacă e „Team” plătit, treci pe Developer (free) până la lansare.
3. **Decizia €10 pe motoare** (termen 10 dec): întâi Leonardo Depth din creditul deja plătit (€0 nou), apoi Replicate doar dacă testul 2 arată randări nefidele. Cu (1) făcut, €10 încap în plafon.
4. **Vercel Pro** intră în bugetul din ianuarie, plătit din primele abonamente (plan de afaceri v0: plafonul rămâne €50 în dec–ian).
5. **Planul Claude**: dacă rămâne Pro, păstrăm max 2 sesiuni deodată; Max nu încape în plafon fără venit.

## 5. Ce trebuie completat (Costin, ~10 min, Lun 30)

- [ ] Planul Claude actual și prețul
- [ ] ChatGPT Plus: activ? păstrezi?
- [ ] Vercel: Hobby sau Pro?
- [ ] Sentry: planul real
- [ ] Domeniul: preț și data reînnoirii
- [ ] OpenAI + Anthropic: factura API din noiembrie (dashboard → Usage)

Automatizare mai târziu (Radar): linia de cost AI din Usage & Cost API Anthropic, sau o foaie Claude Sheets; nu acum.

## 6. Spațiul din baza Supabase (Free = 500 MB; la ~400 MB → Pro)

| Data | Spațiu folosit | Notă |
|---|---|---|
| Vin 27 nov | **50 / 500 MB (10%)** · egress 0,09 / 5 GB · fișiere 0,00 / 1 GB · 4 / 50.000 utilizatori activi · loguri 0,01 / 1 GB | prima valoare de referință (Costin, Org → Usage). Baza conține deja randări ca imagini în proiecte → urmărim creșterea pe săptămână |
