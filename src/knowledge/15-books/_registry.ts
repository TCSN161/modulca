/**
 * Book & Reference Registry
 *
 * Centralized catalog of architecture books, standards, and references.
 * Each entry links to external sources (no PDFs stored) — zero storage cost.
 *
 * Integration:
 *   - Open Library API → covers + "Read Free Online" links (via ISBN/OLID)
 *   - Amazon affiliate links → paid books (tag=modulca-21)
 *   - Direct links → Gutenberg, Archive.org, Wikisource, Smithsonian
 *
 * Add a book → add entry here + optional .md summary in this folder.
 */

import type { KBSource } from "../_types";

/* ------------------------------------------------------------------ */
/*  Complete Book & Reference Registry                                 */
/* ------------------------------------------------------------------ */

export const BOOK_REGISTRY: KBSource[] = [
  /* ── FREE / Public Domain Books ─────────────────────────── */
  {
    id: "vitruvius-ten-books",
    title: "De Architectura (Ten Books on Architecture)",
    author: "Vitruvius",
    year: "~30 BC",
    type: "book",
    free: true,
    url: "https://www.gutenberg.org/ebooks/20239",
    olid: "OL38640W",
    regions: [],
  },
  {
    id: "palladio-four-books",
    title: "The Four Books of Architecture",
    author: "Andrea Palladio",
    year: "1570",
    type: "book",
    free: true,
    url: "https://archive.org/details/fourbooksofarch00pall",
    olid: "OL1170027W",
    regions: [],
  },
  {
    id: "le-corbusier-towards",
    title: "Towards a New Architecture (Vers une architecture)",
    author: "Le Corbusier",
    year: "1923",
    type: "book",
    free: true,
    url: "https://archive.org/details/towardsnewarchi00leco",
    olid: "OL1340562W",
    regions: [],
  },
  {
    id: "le-corbusier-modulor",
    title: "The Modulor: A Harmonious Measure to the Human Scale",
    author: "Le Corbusier",
    year: "1948",
    type: "book",
    free: true,
    url: "https://archive.org/details/modulor-le-corbusier",
    olid: "OL5765972W",
    regions: [],
  },
  {
    id: "ruskin-seven-lamps",
    title: "The Seven Lamps of Architecture",
    author: "John Ruskin",
    year: "1849",
    type: "book",
    free: true,
    url: "https://www.gutenberg.org/ebooks/35898",
    olid: "OL1174283W",
    regions: [],
  },
  {
    id: "semper-style",
    title: "Style in the Technical and Tectonic Arts (Der Stil)",
    author: "Gottfried Semper",
    year: "1860",
    type: "book",
    free: true,
    url: "https://archive.org/details/derstilindentec02sempgoog",
    regions: [],
  },
  {
    id: "sullivan-autobiography",
    title: "The Autobiography of an Idea",
    author: "Louis Sullivan",
    year: "1924",
    type: "book",
    free: true,
    url: "https://archive.org/details/autobiographyofi0000sull",
    olid: "OL6039028W",
    regions: [],
  },
  {
    id: "mckay-building-construction",
    title: "Building Construction (Volume 1)",
    author: "W.B. McKay",
    year: "1945",
    type: "book",
    free: true,
    url: "https://archive.org/details/W.B.McKayVol11945",
    regions: [],
  },

  /* ── FREE Online Resources ───────────────────────────────── */
  {
    id: "eurocode-jrc",
    title: "Eurocodes: Building the Future (JRC Reference Reports)",
    author: "European Commission — JRC",
    year: "Current",
    type: "standard",
    free: true,
    url: "https://eurocodes.jrc.ec.europa.eu/",
    regions: ["EU"],
  },
  {
    id: "passive-house-guide",
    title: "Passive House Planning Package — Guidelines",
    author: "Passive House Institute (PHI)",
    year: "Current",
    type: "standard",
    free: true,
    url: "https://passivehouse.com/02_informations/01_basics/01_basics.htm",
    regions: [],
  },
  {
    id: "ro-building-codes",
    title: "Romanian Building Legislation (full text of laws)",
    author: "MDLPA / legislatie.just.ro",
    year: "Current",
    type: "law",
    free: true,
    url: "https://legislatie.just.ro/",
    regions: ["RO"],
  },
  {
    id: "nl-bouwbesluit",
    title: "Bouwbesluit 2012 / Besluit bouwwerken leefomgeving (BBL)",
    author: "Dutch Government",
    year: "Current",
    type: "law",
    free: true,
    url: "https://wetten.overheid.nl/BWBR0030461/",
    regions: ["NL"],
  },
  {
    id: "nl-omgevingswet-resources",
    title: "Environment & Planning Act (Omgevingswet) — Guidance",
    author: "IPLO — Informatiepunt Leefomgeving",
    year: "Current",
    type: "law",
    free: true,
    url: "https://iplo.nl/",
    regions: ["NL"],
  },
  {
    id: "mit-ocw-architecture",
    title: "MIT OpenCourseWare — Architecture",
    author: "MIT",
    year: "Current",
    type: "course",
    free: true,
    url: "https://ocw.mit.edu/search/?d=Architecture&s=department_course_numbers.sort_coursenum",
    regions: [],
  },
  {
    id: "khan-academy-architecture",
    title: "Khan Academy — Architecture in Art History",
    author: "Khan Academy",
    year: "Current",
    type: "course",
    free: true,
    url: "https://www.khanacademy.org/humanities/ap-art-history",
    regions: [],
  },
  {
    id: "archdaily",
    title: "ArchDaily — Architecture News & Projects",
    author: "ArchDaily",
    year: "Current",
    type: "website",
    free: true,
    url: "https://www.archdaily.com/",
    regions: [],
  },
  {
    id: "dezeen",
    title: "Dezeen — Design & Architecture Magazine",
    author: "Dezeen",
    year: "Current",
    type: "website",
    free: true,
    url: "https://www.dezeen.com/",
    regions: [],
  },

  /* ── PAID — Essential References (affiliate links) ──────── */
  {
    id: "neufert-architects-data",
    title: "Neufert — Architects' Data (43rd Edition)",
    author: "Ernst & Peter Neufert",
    year: "2019",
    type: "book",
    free: false,
    cost: "€80–120",
    isbn: "9781119284352",
    url: "https://www.amazon.com/dp/1119284354?tag=modulca-21",
    regions: [],
  },
  {
    id: "ching-building-construction",
    title: "Building Construction Illustrated (6th Edition)",
    author: "Francis D.K. Ching",
    year: "2020",
    type: "book",
    free: false,
    cost: "€45–55",
    isbn: "9781119583073",
    url: "https://www.amazon.com/dp/1119583071?tag=modulca-21",
    regions: [],
  },
  {
    id: "ching-form-space-order",
    title: "Architecture: Form, Space, and Order (4th Edition)",
    author: "Francis D.K. Ching",
    year: "2014",
    type: "book",
    free: false,
    cost: "€45–55",
    isbn: "9781118745083",
    url: "https://www.amazon.com/dp/1118745086?tag=modulca-21",
    regions: [],
  },
  {
    id: "alexander-pattern-language",
    title: "A Pattern Language: Towns, Buildings, Construction",
    author: "Christopher Alexander",
    year: "1977",
    type: "book",
    free: false,
    cost: "€35–45",
    isbn: "9780195019193",
    url: "https://www.amazon.com/dp/0195019199?tag=modulca-21",
    regions: [],
  },
  {
    id: "kellert-biophilic-design",
    title: "Biophilic Design: The Theory, Science, and Practice",
    author: "Stephen R. Kellert, Judith Heerwagen, Martin Mador",
    year: "2008",
    type: "book",
    free: false,
    cost: "€40–50",
    isbn: "9780470163344",
    url: "https://www.amazon.com/dp/0470163348?tag=modulca-21",
    regions: [],
  },
  {
    id: "time-saver-standards",
    title: "Time-Saver Standards for Building Types (4th Edition)",
    author: "Joseph De Chiara, John Callender",
    year: "2001",
    type: "book",
    free: false,
    cost: "€120–160",
    isbn: "9780071432092",
    url: "https://www.amazon.com/dp/0071432094?tag=modulca-21",
    regions: [],
  },
  {
    id: "detail-magazine",
    title: "Detail Magazine — Architecture & Construction Details",
    author: "Detail",
    year: "Current",
    type: "website",
    free: false,
    cost: "€150/yr",
    url: "https://www.detail.de/",
    regions: [],
  },
  {
    id: "phaidon-atlas",
    title: "Phaidon Atlas of 21st Century World Architecture",
    author: "Phaidon Editors",
    year: "2011",
    type: "book",
    free: false,
    cost: "€50–70",
    isbn: "9780714848747",
    url: "https://www.amazon.com/dp/0714848743?tag=modulca-21",
    regions: [],
  },
  {
    id: "smith-prefab-architecture",
    title: "Prefab Architecture: A Guide to Modular Design and Construction",
    author: "Ryan E. Smith",
    year: "2010",
    type: "book",
    free: false,
    cost: "€55–70",
    isbn: "9780470275610",
    url: "https://www.amazon.com/dp/0470275618?tag=modulca-21",
    regions: [],
  },
  {
    id: "kaufmann-prefab-green",
    title: "Prefab Green (New 2nd Edition)",
    author: "Michelle Kaufmann, Catherine Remick",
    year: "2009",
    type: "book",
    free: false,
    cost: "€30–40",
    isbn: "9781423603498",
    url: "https://www.amazon.com/dp/1423603494?tag=modulca-21",
    regions: [],
  },
  {
    id: "wastiels-material-experience",
    title: "Materials Experience: Fundamentals of Materials and Design",
    author: "Lisa Wastiels, Elvin Karana",
    year: "2013",
    type: "book",
    free: false,
    cost: "€50–65",
    isbn: "9780080993591",
    url: "https://www.amazon.com/dp/0080993591?tag=modulca-21",
    regions: [],
  },
];

/* ------------------------------------------------------------------ */
/*  Open Library Integration Helpers                                    */
/* ------------------------------------------------------------------ */

/**
 * Get the Open Library cover URL for a book.
 * Uses ISBN (preferred) or OLID as fallback.
 * Size: S (small), M (medium), L (large)
 */
export function getBookCoverUrl(book: KBSource, size: "S" | "M" | "L" = "M"): string | null {
  if (book.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-${size}.jpg`;
  if (book.olid) return `https://covers.openlibrary.org/b/olid/${book.olid}-${size}.jpg`;
  return null;
}

/**
 * Get the Open Library reading page URL for a book.
 * Only meaningful for free/public domain books.
 */
export function getOpenLibraryUrl(book: KBSource): string | null {
  if (book.isbn) return `https://openlibrary.org/isbn/${book.isbn}`;
  if (book.olid) return `https://openlibrary.org/works/${book.olid}`;
  return null;
}

/* ------------------------------------------------------------------ */
/*  Filter & Search Helpers                                             */
/* ------------------------------------------------------------------ */

/** Get only books (not websites/standards/courses) */
export function getBooks(): KBSource[] {
  return BOOK_REGISTRY.filter((b) => b.type === "book");
}

/** Get all free resources */
export function getFreeBooks(): KBSource[] {
  return BOOK_REGISTRY.filter((b) => b.free);
}

/** Get all free books specifically (not websites/standards) */
export function getFreeReadableBooks(): KBSource[] {
  return BOOK_REGISTRY.filter((b) => b.free && b.type === "book");
}

/** Get all paid books (with affiliate links) */
export function getPaidBooks(): KBSource[] {
  return BOOK_REGISTRY.filter((b) => !b.free && b.type === "book");
}

/** Get books relevant to a specific region */
export function getBooksByRegion(regionCode: string): KBSource[] {
  return BOOK_REGISTRY.filter(
    (b) => b.regions?.length === 0 || b.regions?.includes(regionCode)
  );
}

/** Get books by type */
export function getBooksByType(type: KBSource["type"]): KBSource[] {
  return BOOK_REGISTRY.filter((b) => b.type === type);
}

/** Search books by title/author keyword */
export function searchBooks(query: string): KBSource[] {
  const q = query.toLowerCase();
  return BOOK_REGISTRY.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q)
  );
}
