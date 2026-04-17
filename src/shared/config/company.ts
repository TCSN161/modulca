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

  /** Legal representative / administrator (confirmed by owner 2026-04-17) */
  administrator: {
    surname: "MURARU",
    name: "PETRIA",
    role: "Administrator",
    /** Full name as it must appear on Stripe, invoices, and legal docs */
    fullName: "MURARU PETRIA",
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
    /** Primary public business email — forwarded via Namecheap Email
     *  Forwarding to uii.acgs.auto@gmail.com (the business automation inbox,
     *  also used as the Namecheap registrant contact).
     *  Resend sends FROM @modulca.eu (domain verified). */
    email: "contact@modulca.eu",
    /** Actual inbox where forwarded emails land (kept private — internal
     *  reference only, used for validating setup). */
    forwardDestination: "uii.acgs.auto@gmail.com",
    /** Registered ANAF/ONRC phone — NOT displayed publicly. Used only on
     *  invoices, Stripe business profile, and legal documents. */
    phone: "+40723599514",
    /** Whether phone is allowed on the public website (footer/contact) */
    phoneIsPublic: false,
    website: "https://www.modulca.eu",
    /** Role-based aliases (all forward to the same business inbox) */
    aliases: {
      contact: "contact@modulca.eu",      // general business inquiries
      hello: "hello@modulca.eu",          // marketing / partnerships
      petria: "petria@modulca.eu",        // legal / DPO / administrator
      billing: "billing@modulca.eu",      // invoices / Stripe support
      support: "support@modulca.eu",      // customer support
    },
  },

  /** Share capital — confirmed by owner 2026-04-17 */
  shareCapital: {
    amount: 200,
    currency: "RON",
    /** Formatted string for invoices and legal docs */
    formatted: "200 RON",
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
