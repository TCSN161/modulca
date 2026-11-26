/**
 * BUG-ST22: visible "update in progress" banner for live blog posts that still
 * describe Legea 50/1991. The CATUC rewrites wait for the partner architect's
 * review, so the old text stays; this banner goes first until the swap.
 * Remove the banner from a post when its CATUC version goes live.
 */
import type { ArticleSection } from "./articles";

const RO = "Actualizare în curs: Legea 169/2026 (CATUC) înlocuiește Legea 50/1991 de la 25.08.2026";
const EN = "Update in progress: Law 169/2026 (CATUC) replaces Law 50/1991 from 25.08.2026";

export const CATUC_BANNER_RO: ArticleSection = {
  heading: `⚠️ ${RO}`,
  body: `Unele informații din acest articol (DTAC, termene de valabilitate, verificare) sunt după legea veche și sunt în curs de revizuire. Documentația se numește acum PAC (fostul DTAC). Informativ, nu consultanță juridică.\n\n${EN}. Some details below follow the old law and are under review.`,
};

export const CATUC_BANNER_EN: ArticleSection = {
  heading: `⚠️ ${EN}`,
  body: `Some details in this article (DTAC, permit validity, technical checking) follow the old law and are under review. The permit project is now called PAC (formerly DTAC). Informational only, not legal advice.\n\n${RO}. Unele informații de mai jos sunt după legea veche și sunt în curs de revizuire.`,
};
