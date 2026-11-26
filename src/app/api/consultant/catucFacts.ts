/**
 * CATUC (Legea 169/2026) awareness for the NeufertAI consultant — BUG-ST13.
 *
 * Why: the live KB permit articles are still the Legea 50/1991 versions until the
 * partner architect signs off the CATUC rewrites (`*.new.md`, deploy gate Phase 2).
 * Without this block the model said it "cannot confirm CATUC exists" and answered
 * from the repealed law (smoke test 1.03, 2026-11-26).
 *
 * CATUC_FACTS is appended to every tier's STABLE system prompt (cached prefix —
 * never put per-request data in it). Every article number below was checked
 * against docs/references/catuc/catuc-169-2026-articole.json (session 2.08).
 */
import { normalizeQuery } from "./queryExpansion";

export const CATUC_FACTS = `## Romanian Law Update — CATUC (Legea 169/2026) — VERIFIED, takes precedence

CATUC = Codul amenajării teritoriului, urbanismului și construcțiilor, **Legea nr. 169/2026**, M.Of. nr. 661/10.08.2026. It EXISTS and is IN FORCE since **25.08.2026** (art. 575(1); entry into force is automatic and does not wait for secondary legislation, art. 575(2)).
- It repealed (art. 576(3)): **Legea 350/2001** (lit. a), **Legea 50/1991** (lit. b), most of **Legea 10/1995** — art. 1–9, 11–40, 42–44 (lit. c), Ord. 233/2016 (lit. d), Ord. 839/2009 (lit. e). References in other acts to repealed provisions are read as references to CATUC (art. 583(3)).
- Transitional: urbanism certificates (CU) issued before 25.08.2026 stay valid and the permit is issued on their basis (art. 582(4)–(5)); per MDLPA Clarificări, applications registered up to 24.08.2026 follow the old law, those filed from 25.08.2026 follow CATUC.

Four routes for building works:
1. **Building permit (AC)** — the rule for new buildings (art. 259). The technical file is now the **PAC — Proiectul pentru autorizarea construirii** (art. 264), formerly DTAC; framework content Annex 2, simplified Annex 3 for single-family rural homesteads (art. 264(3)–(4)). AC issued within max 30 calendar days of a complete file (art. 273(1)).
2. **Notification (simplified procedure)** — art. 294(2)(a)(ii): ONE single-family house with its own access and plot, **ground floor (P) or semi-basement + ground floor (D+P), no basement, max 150 m² gross built area (suprafață desfășurată)**, only in the **built-up area (intravilan) of a RURAL locality**, outside protected areas and monument protection zones, respecting the approved urbanism documentation; designed either from a public type-project or as an individual project by a team of architects with signing rights + structural and MEP engineers, following the OAR rural architecture guide endorsed by the county chief architect.
   - Tacit approval **15 working days** after the notification is received (art. 296(1)(a)); in the same 15 working days the authority may instead ask for clarifications, require an AC, or reject (art. 296(1)(b)–(e)). Works start 15 calendar days after that term (art. 296(6)); the notified works must be carried out within 3 years (art. 296(5)).
   - No technical checking (verificare tehnică) needed (art. 298(2)), BUT for the house under art. 294(2)(a)(ii) a **geotechnical study and a topographic survey are mandatory** (art. 298(3)).
   - Urban areas, P+1 or P+M houses, houses with a basement, or > 150 m² → NOT eligible for notification → building permit (AC).
   - The metropolitan-area exclusion in the text applies only to outbuildings ≤ 50 m² (art. 294(2)(a)(i)), not to the house in (ii) — still under review by our partner architect; the CU for the plot is decisive.
3. **No formalities at all** — art. 299: closed list, e.g. listed repairs to existing buildings (art. 299(2)(a)) and rural outbuildings exterior to a single-family house (covered terraces, pergolas, summer kitchens, sheds…) **max 20 m² cumulated, max 2.5 m high, no foundation, temporary, demountable, timber or metal structure** (art. 299(2)(c)).
4. **Regularisation permit** for works done without/against a permit (art. 301).

Permit validity: an AC/demolition permit is valid **3 years from issue** (art. 309(1)) to START works; this 3-year term **cannot be extended** (art. 309(5)) but can be suspended once, max 12 months (art. 309(4)). Once works have started (and the start was notified) validity covers the execution period (art. 309(2)), which can be extended once by max 12 months on request filed at least 15 days before expiry (art. 309(6)).

Technical checking (verificare tehnică) for a permit: Annex 6 puts single-family houses P and P+1 in consequence class **CC1**, and art. 440(3) says CC1 projects need no technical checking; art. 259(5) refers to works checked by certified checkers. Whether a CC1 house built under an AC needs checking reports is **still under review** by our partner architect — say so; do not state either answer as settled.

A typical ModulCA modular home is a single-storey house: on a rural intravilan plot, P or D+P, ≤ 150 m², no basement it may qualify for notification; otherwise it needs an AC. A modular/prefab house follows the same routes as any house.

### How to use this block
- For Romanian permits/urbanism/construction law, **CATUC wins**: where a reference article below cites Legea 50/1991, Legea 350/2001, Ord. 839/2009 or "DTAC", treat that content as **pre-CATUC and possibly outdated**; answer from this block and say the older article is being updated.
- Never say you cannot confirm CATUC exists. Cite CATUC article numbers only from this block or from a reference article that cites CATUC; do not invent article numbers. If a point is not covered here, say it is not yet verified in our library and that the ModulCA CATUC articles are under review by a partner architect.
- End every answer about Romanian permits/CATUC with ONE disclaimer line in the language of the user's question (English question → English line) — RO: "*Informativ, nu consultanță juridică. Verificați certificatul de urbanism al terenului și consultați un arhitect cu drept de semnătură.*" EN: "*Informational only, not legal advice. Check the urbanism certificate for your plot and consult an architect with signing rights.*"`;

/** Normalised aliases that signal a CATUC / permit-law question (RO + EN). */
const CATUC_INTENT = [
  "catuc",
  "169/2026",
  "legea 169",
  "l169",
  "l.169",
  "codul amenajarii",
  "autoriz", // autorizare, autorizatie, autorizatia de construire
  "notific", // notificare, notification
  "permis de constru",
  "building permit",
  "construction permit",
  "legea 50",
  "50/1991",
  "dtac",
];

export function isCatucQuestion(question: string): boolean {
  const q = normalizeQuery(question);
  return CATUC_INTENT.some((a) => q.includes(a));
}

/** Articles written for CATUC carry these tags (the `.new.md` rewrites do). */
const CATUC_TAGS = new Set(["catuc", "legea-169-2026"]);

export function isCatucAware(article: { tags: string[] }): boolean {
  return article.tags.some((t) => CATUC_TAGS.has(t.toLowerCase()));
}

/** Rank boost for CATUC-aware articles on CATUC questions — larger than any keyword score. */
export const CATUC_RANK_BOOST = 1000;

const LEGACY_MARKERS = /legea\s*(nr\.\s*)?50\/1991|legea\s*(nr\.\s*)?350\/2001|law\s*50\/1991|\bdtac\b|839\/2009/i;

/** True when article text still reasons from the repealed law (and is not CATUC-tagged). */
export function isPreCatucContent(article: { tags: string[] }, content: string): boolean {
  return !isCatucAware(article) && LEGACY_MARKERS.test(content);
}

/** Heading note the model sees on pre-CATUC reference articles. */
export const PRE_CATUC_NOTE =
  "⚠️ PRE-CATUC CONTENT — written under Legea 50/1991 / 350/2001 (repealed 25.08.2026). Where it conflicts with the CATUC block in the system prompt, CATUC wins.";
