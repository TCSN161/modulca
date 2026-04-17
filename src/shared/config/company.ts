/**
 * Single source of truth for ModulCA's legal business information.
 *
 * This data is PUBLIC (visible on ANAF, ONRC, invoices, and the website footer).
 * Used across:
 *   - Website footer (Footer.tsx)
 *   - Terms of Service + Privacy Policy pages
 *   - Invoice templates (PDF/HTML)
 *   - Stripe business profile
 *   - Contact page
 *   - Sentry organization tag
 *
 * Source: firmeo.ro (data updated 2026-04-13), ONRC, ANAF
 */

export const COMPANY = {
  /** Full legal name as registered at ONRC */
  legalName: "ATELIER DE PROIECTARE MCA S.R.L.",
  /** Short/display name for UI */
  displayName: "ModulCA",
  /** Trading brand */
  brand: "ModulCA",

  /** Tax identification number (Codul Unic de Înregistrare) */
  cui: "35294600",
  /** ONRC Trade Register registration number */
  regCom: "J40/14760/2015",
  /** Founding date */
  foundedAt: "2015-12-04",

  /** Registered headquarters address */
  address: {
    street: "Str. Lacul Plopului nr. 10",
    city: "București",
    sector: "Sector 5",
    postalCode: "051735",
    country: "România",
    /** Full one-liner for invoices/footer */
    full: "Str. Lacul Plopului nr. 10, Sector 5, București, 051735, România",
  },

  /** VAT registration status */
  vat: {
    /** Not VAT-registered — prices are final, no VAT added */
    registered: false,
    /** Required legal note on invoices (Romanian Tax Code art. 310) */
    invoiceNote: "Neplătitor TVA conform art. 310 din Codul Fiscal",
    /** Threshold in RON — crossing this triggers mandatory VAT registration */
    mandatoryThresholdRon: 300_000,
  },

  /** Primary activity code (Clasificarea Activităților din Economia Națională) */
  caen: {
    code: "7111",
    label: "Activități de arhitectură",
  },

  /** Legal representative / administrator */
  administrator: {
    // TODO: confirm full name — bank doc shows "MURARU PETRIA"
    surname: "MURARU",
    name: "PETRIA",
    role: "Administrator",
  },

  /** Bank account for invoicing */
  bank: {
    name: "UniCredit Bank S.A.",
    iban: "RO02BACX0000004111280000",
    currency: "RON",
    swift: "BACXROBU", // UniCredit Romania SWIFT
  },

  /** Contact info (business-facing — NOT personal) */
  contact: {
    // TODO: user to provide business email + phone
    email: "contact@modulca.eu",
    phone: "", // fill in when available
    website: "https://www.modulca.eu",
  },

  /** Share capital — required on invoices for SRL in Romania */
  // TODO: user to confirm exact amount (1 RON if still from SRL-D, or 200 RON minimum if converted)
  shareCapital: {
    amount: 200,
    currency: "RON",
  },

  /** ANAF / data sources last verified */
  lastVerified: "2026-04-17",
} as const;

/** Convenience getters for common formats */
export const companyInvoiceFooter = (): string =>
  [
    `${COMPANY.legalName}`,
    `CUI: ${COMPANY.cui}  •  ${COMPANY.regCom}`,
    COMPANY.address.full,
    `Cont: ${COMPANY.bank.iban}  •  ${COMPANY.bank.name}`,
    COMPANY.vat.invoiceNote,
  ].join("\n");

export const companyFooterLine = (): string =>
  `© ${new Date().getFullYear()} ${COMPANY.legalName} • CUI ${COMPANY.cui} • ${COMPANY.regCom}`;

export type CompanyInfo = typeof COMPANY;
