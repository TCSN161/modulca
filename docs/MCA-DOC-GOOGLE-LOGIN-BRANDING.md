# Login Google cu numele ModulCA (BUG-ST18)

**Scris:** 2026-11-27 · sesiunea 1.04 MAIN · **Pentru:** Costin (pașii sunt în consolele Google și Supabase; nimic din cod nu se schimbă)

## Problema

La „Continuă cu Google” de pe `/login`, ecranul Google spune *„to continue to **gtlldluonbtgjabokjfo.supabase.co**”*.
Google afișează domeniul adresei de întoarcere (callback-ul Supabase `https://gtlldluonbtgjabokjfo.supabase.co/auth/v1/callback`) atât timp cât aplicația OAuth nu are un brand verificat. Pentru un utilizator beta, asta arată a phishing.

Sunt două căi de rezolvare:

| | A. Brand verificat în Google (gratuit) | B. Domeniu propriu pentru auth în Supabase (plătit) |
|---|---|---|
| Ce vede utilizatorul | „to continue to **ModulCA**” + logo | „to continue to **auth.modulca.eu**” (și, cu A, numele ModulCA) |
| Cost | 0 € | Add-on Custom Domain: **~10 USD/lună** pe proiect **+ planul Pro (~25 USD/lună)**, pentru că acum suntem pe Free (corectat 27 nov) |
| Durată | 15 min de completat + **2–3 zile lucrătoare** verificarea Google | ~30 min + propagarea DNS (minute–ore) |
| Risc | Niciunul pentru utilizatorii actuali | Trebuie adăugat noul callback în Google înainte de activare, altfel loginul Google cade |

## ✅ Recomandare: A acum, B doar dacă e nevoie

Beta e pe 15 decembrie, deci verificarea Google (2–3 zile) intră lejer. Scope-urile noastre (`openid`, `email`, `profile`) sunt **nesensibile**, deci e nevoie doar de verificarea brandului, fără audit de securitate. Dacă după verificare tot apare domeniul supabase.co (sau vrei ca și adresa să fie modulca.eu), adaugă B.

---

## A. Pași, varianta gratuită (Google Cloud Console)

Ai nevoie de proiectul Google Cloud în care e creat OAuth Client ID-ul folosit de Supabase (Supabase → Authentication → Sign In / Providers → Google arată Client ID-ul; caută-l în Google Cloud → APIs & Services → Credentials).

1. **Search Console:** `modulca.eu` trebuie verificat ca proprietate de domeniu cu **același cont Google** care deține proiectul Cloud (deja ai Search Console; dacă e alt cont, adaugă contul proiectului ca Owner în Search Console).
2. Google Cloud Console → **Google Auth Platform** (fostul „OAuth consent screen”) → **Branding**:
   - **App name:** `ModulCA`
   - **User support email:** o adresă de suport, de ex. `contact@modulca.eu` (vizibilă public)
   - **App logo:** pătrat 120×120 px, PNG/JPG, max 1 MB (logo ModulCA pe fond simplu). ⚠️ Un logo nou declanșează și el verificare.
   - **Application home page:** `https://www.modulca.eu`
   - **Application privacy policy link:** `https://www.modulca.eu/privacy`
   - **Application terms of service link:** `https://www.modulca.eu/terms`
   - **Authorized domains:** `modulca.eu` (adaugă și `supabase.co` doar dacă consola cere, pentru callback; varianta B îl elimină)
   - **Developer contact information:** adresa ta de e-mail
3. **Audience:** User type = **External**, Publishing status = **In production** (nu „Testing”, care limitează la 100 de utilizatori de test și arată avertisment).
4. **Data Access:** verifică să fie doar `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`. Nimic altceva.
5. **Verification Center** → **Verify branding** / „Submit for verification”. Răspunde la e-mailul Google dacă cer ceva (de obicei: privacy policy să menționeze datele Google folosite → `/privacy` are deja secțiunea de date de cont; dacă cer explicit, Chat 2 adaugă o frază).
6. După aprobare (e-mail de la Google, 2–3 zile lucrătoare): testează într-o fereastră incognito `/login` → Google. Trebuie să apară „ModulCA” + logo.

## B. Pași, varianta plătită (Supabase Custom Domain)

Fă asta doar după A sau dacă A nu ajunge.

1. Supabase Dashboard → proiectul `gtlldluonbtgjabokjfo` → **Project Settings → Add-ons → Custom Domain** → activează (≈10 USD/lună, facturat pe ore).
2. Introdu `auth.modulca.eu`. Supabase îți dă:
   - un **CNAME**: `auth.modulca.eu` → `gtlldluonbtgjabokjfo.supabase.co`
   - un **TXT** de verificare (`_acme-challenge.auth.modulca.eu` sau similar).
   Adaugă-le la registrarul DNS al modulca.eu (CNAME fără proxy, dacă e Cloudflare: nor gri).
3. Apasă **Verify** în Supabase până trece (certificatul SSL se emite automat).
4. **Înainte de Activate:** Google Cloud → Credentials → OAuth Client → **Authorized redirect URIs** → adaugă
   `https://auth.modulca.eu/auth/v1/callback` (păstrează și pe cel vechi `https://gtlldluonbtgjabokjfo.supabase.co/auth/v1/callback`).
5. Supabase → **Activate** domeniul. Vechiul `*.supabase.co` rămâne funcțional.
6. Vercel → Environment Variables → `NEXT_PUBLIC_SUPABASE_URL` = `https://auth.modulca.eu` (Production + Preview) → Redeploy. Spune-i lui MAIN să actualizeze și `.env.local`.
7. Test incognito: Google arată acum `auth.modulca.eu` (și „ModulCA” dacă A e aprobat). Verifică și login cu email/parolă + logout.

## Ce NU s-a schimbat

Nicio consolă și nicio variabilă de mediu nu au fost modificate de Claude. Codul de login (`features/auth/store.ts`, `redirectTo: <origin>/auth/callback`) funcționează la fel cu ambele variante.
