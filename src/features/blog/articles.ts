/**
 * Static blog articles for SEO and investor demo.
 * No MDX/CMS needed — just TypeScript data.
 * Add articles here; they auto-appear on /blog and generate static pages.
 */

export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  date: string;           // ISO date
  author: string;
  readMinutes: number;
  tags: string[];
  /** Article body — array of content blocks */
  sections: ArticleSection[];
}

export interface ArticleSection {
  heading?: string;
  body: string;           // Plain text (rendered as paragraphs split by \n\n)
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "what-is-modular-construction",
    title: "What Is Modular Construction? A Complete Guide for 2026",
    excerpt:
      "Modular construction is transforming how we build homes. Learn about the benefits, costs, and timeline of modular building in Romania and beyond.",
    date: "2026-03-15",
    author: "ModulCA Team",
    readMinutes: 5,
    tags: ["modular construction", "guide", "Romania"],
    sections: [
      {
        heading: "The Rise of Modular Construction",
        body: "Modular construction has grown from a niche alternative into a mainstream building method adopted across Europe. Instead of building everything on-site, modular homes are assembled from prefabricated room-sized units (modules) manufactured in controlled factory environments.\n\nThis approach dramatically reduces construction time, waste, and weather-related delays while improving quality control.",
      },
      {
        heading: "How Does It Work?",
        body: "The process starts with designing your layout using standard 3×3 meter modules. Each module represents a functional room — bedroom, bathroom, kitchen, living area, or utility space.\n\nModules are manufactured in parallel with site preparation, then transported and assembled on your foundation. A typical modular home can be move-in ready in 8-12 weeks, compared to 6-12 months for traditional construction.",
      },
      {
        heading: "Benefits for Romanian Homeowners",
        body: "Romania's construction sector faces skilled labor shortages and rising material costs. Modular construction addresses both by standardizing the build process and optimizing material usage.\n\nKey benefits include 30-50% faster delivery, 10-20% cost savings, consistent quality, and significantly less construction waste. The method also supports energy-efficient designs that meet or exceed Romanian building codes.",
      },
      {
        heading: "Getting Started with ModulCA",
        body: "ModulCA makes modular design accessible to everyone. Our platform lets you place modules on your actual land plot, visualize your home in 3D, get AI-generated renders, and receive technical drawings — all before talking to a builder.\n\nStart with our free Explorer plan to design your first modular home today.",
      },
    ],
  },
  {
    slug: "modular-home-costs-romania-2026",
    title: "Modular Home Costs in Romania: 2026 Price Guide",
    excerpt:
      "How much does a modular home cost in Romania? Breakdown of module prices, foundation, transport, and finishing costs for 2026.",
    date: "2026-03-28",
    author: "ModulCA Team",
    readMinutes: 4,
    tags: ["costs", "Romania", "pricing"],
    sections: [
      {
        heading: "Understanding Modular Home Pricing",
        body: "The cost of a modular home depends on several factors: the number and type of modules, finishing level, site preparation, and location. In Romania, modular construction typically ranges from €600-1,200 per square meter for the structure, with finishing adding €200-500/sqm.",
      },
      {
        heading: "Module Cost Breakdown",
        body: "A standard 3×3m module (9 sqm) costs between €5,400 and €10,800 depending on the room type. Bathrooms and kitchens are at the higher end due to plumbing and fixtures. Simple bedrooms and living rooms are more affordable.\n\nA typical 2-bedroom modular home uses 6-8 modules, putting the base structure cost at €35,000-€65,000.",
      },
      {
        heading: "Additional Costs to Budget For",
        body: "Beyond the modules themselves, budget for: foundation (€3,000-8,000), transport and crane assembly (€2,000-5,000), utility connections (€1,500-4,000), and interior finishing (€10,000-25,000).\n\nPermits and documentation typically add €1,000-3,000. ModulCA's building permit tracker helps you navigate this process step by step.",
      },
      {
        heading: "How ModulCA Helps You Estimate Costs",
        body: "Our platform generates real-time cost estimates based on your specific module configuration, chosen materials, and location. The cost breakdown updates as you design, so you always know where your budget stands.\n\nTry the free demo to see cost estimates for your own modular home design.",
      },
    ],
  },
  {
    slug: "ai-architecture-future-home-design",
    title: "How AI Is Changing Home Design: From Renders to Building Permits",
    excerpt:
      "Artificial intelligence is revolutionizing architecture. See how AI renders, automated drawings, and smart design tools are making home building easier.",
    date: "2026-04-05",
    author: "ModulCA Team",
    readMinutes: 4,
    tags: ["AI", "architecture", "technology"],
    sections: [
      {
        heading: "AI Meets Architecture",
        body: "The intersection of AI and architecture is creating tools that were unimaginable just a few years ago. From photorealistic renders generated in seconds to automated technical drawings, AI is democratizing home design.\n\nPlatforms like ModulCA are at the forefront of this revolution, making professional-grade design tools accessible to everyone — not just architects.",
      },
      {
        heading: "AI-Powered Visualization",
        body: "Traditional architectural renders require expensive software, specialized skills, and hours of work. AI changes this equation entirely.\n\nModulCA uses multiple AI engines to generate photorealistic interior and exterior renders from your module layout. Choose from different styles — modern, traditional, Scandinavian, industrial — and see your future home in stunning detail within seconds.",
      },
      {
        heading: "Automated Technical Drawings",
        body: "Technical drawings are essential for construction and permits, but traditionally require CAD expertise. ModulCA automatically generates six types of drawings from your design: floor plans, sections, elevations, wall details, MEP layouts, and foundation plans.\n\nThese SVG-based drawings are CAD-quality and can be exported as PDF or DWG for professional use.",
      },
      {
        heading: "The Future: AI-Assisted Building",
        body: "We're moving toward a future where AI doesn't just visualize buildings but helps optimize them — suggesting better layouts for energy efficiency, structural integrity, and livability.\n\nModulCA is building toward this vision, combining AI visualization with smart module placement and building code compliance checking.",
      },
    ],
  },
];

/** Get a single article by slug */
export function getArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}

/** Get all slugs for static generation */
export function getAllSlugs(): string[] {
  return BLOG_ARTICLES.map((a) => a.slug);
}
