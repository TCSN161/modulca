/**
 * Query normalisation + expansion for the consultant's keyword RAG scorer.
 *
 * Why: KB tags are ASCII ("autorizatie", "certificat-urbanism") while users type
 * Romanian with diacritics ("autorizație"), and no article is tagged "catuc" —
 * so CATUC questions matched nothing and Claude answered "no CATUC in library"
 * (smoke test 2026-11-26). We strip diacritics and append the tag vocabulary of
 * the permit/urbanism articles when a CATUC alias appears.
 */

/** Lowercase + strip diacritics (ă â î ș ş ț ţ → a a i s s t t). */
export function normalizeQuery(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Aliases (already normalised) → extra terms matching existing KB tags/titles. */
const EXPANSIONS: { aliases: string[]; terms: string }[] = [
  {
    // Codul Amenajării Teritoriului, Urbanismului și Construcțiilor (Legea 169/2026)
    aliases: ["catuc", "codul amenajarii", "legea 169", "l169", "l.169"],
    terms: "romania permit autorizatie certificat-urbanism urbanism legal building permit",
  },
  {
    aliases: ["legea 50", "l50", "l.50", "dtac", "pac "],
    terms: "romania permit autorizatie legal building permit",
  },
];

/** Normalised question with expansion terms appended (used for scoring only). */
export function expandQuery(question: string): string {
  const q = normalizeQuery(question);
  const extra = EXPANSIONS.filter((e) => e.aliases.some((a) => q.includes(a))).map((e) => e.terms);
  return extra.length ? `${q} ${extra.join(" ")}` : q;
}
