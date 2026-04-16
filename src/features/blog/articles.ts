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
  {
    slug: "biophilic-design-homes",
    title: "Biophilic Design: How Nature Makes Better Homes",
    excerpt:
      "Discover the 14 patterns of biophilic design and how integrating nature into your home improves health, wellbeing, and property value.",
    date: "2026-04-08",
    author: "ModulCA Team",
    readMinutes: 6,
    tags: ["biophilic", "nature", "wellbeing", "design"],
    sections: [
      {
        heading: "What Is Biophilic Design?",
        body: "Biophilic design is an architectural approach rooted in the idea that humans have an innate need to connect with nature. The term comes from biologist E.O. Wilson's biophilia hypothesis, which suggests that our wellbeing is deeply tied to our relationship with the natural world. In residential architecture, biophilic design translates this principle into concrete strategies: maximizing natural light, incorporating plants and water features, using natural materials, and creating visual connections to the outdoors.\n\nResearch from the World Green Building Council shows that biophilic design elements can reduce stress by up to 37%, improve cognitive function by 20%, and boost overall mood. For homeowners, this means a house that doesn't just look beautiful but actively supports your physical and mental health every day.",
      },
      {
        heading: "The 14 Patterns of Biophilic Design",
        body: "Terrapin Bright Green identified 14 patterns of biophilic design, grouped into three categories. The first group, Nature in the Space, includes direct experiences like visual connection with nature, non-visual sensory stimuli (birdsong, scent of wood), non-rhythmic sensory stimuli, thermal airflow variability, presence of water, dynamic and diffuse light, and connection to natural systems like seasonal change.\n\nThe second group, Natural Analogues, covers indirect references to nature: biomorphic forms and patterns, material connection with nature (wood, stone, wool), and complexity and order found in fractal geometries. The third group, Nature of the Space, addresses spatial configurations that evoke natural environments: prospect (open views), refuge (sheltered nooks), mystery (partially obscured views that invite exploration), and risk/peril (safe exposure to height or depth). A well-designed home incorporates elements from all three categories.\n\nYou don't need to implement all 14 patterns to benefit. Even integrating three or four can meaningfully improve your living experience. Start with maximizing daylight, using natural materials for surfaces you touch daily, and ensuring at least one room has a strong visual connection to your garden or surrounding landscape.",
      },
      {
        heading: "Health Benefits Backed by Science",
        body: "The evidence for biophilic design's health benefits is substantial. A study published in Environmental Health Perspectives found that people living in homes with greater access to natural light and views of greenery reported 18% fewer sick days. Heart rate and cortisol levels measurably decrease in spaces with natural materials and plants.\n\nFor children, biophilic homes support better sleep patterns and improved concentration. For older adults, natural light exposure helps regulate circadian rhythms and reduces the risk of seasonal depression. In Romania, where winters can be long and grey, designing homes that maximize southern exposure and bring nature indoors is especially valuable for year-round wellbeing.",
      },
      {
        heading: "Practical Tips for Your Modular Home",
        body: "Modular construction is particularly well-suited to biophilic design because you can plan these features from the factory stage. Specify large south-facing windows during module configuration. Choose timber cladding or exposed wood ceilings for natural material connections. Plan your module layout to frame garden views from living areas and bedrooms.\n\nIndoor green walls can be integrated into module designs with built-in irrigation systems installed during factory production. Consider a courtyard layout with modules arranged in an L or U shape, creating a protected outdoor space visible from multiple rooms. Budget approximately 5-10% more for biophilic features, but expect this investment to pay for itself in energy savings from passive solar gain and increased property value of 10-15%.",
      },
    ],
  },
  {
    slug: "clt-timber-construction",
    title: "CLT Timber Construction: The Future of Sustainable Building",
    excerpt:
      "Cross-Laminated Timber (CLT) is revolutionizing sustainable construction across Europe. Learn about its benefits, fire safety, and how it fits modular building.",
    date: "2026-04-08",
    author: "ModulCA Team",
    readMinutes: 6,
    tags: ["CLT", "timber", "sustainability", "modular"],
    sections: [
      {
        heading: "What Is Cross-Laminated Timber?",
        body: "Cross-Laminated Timber (CLT) is an engineered wood product made by gluing layers of solid lumber together at right angles. This cross-lamination creates panels with exceptional strength, dimensional stability, and rigidity comparable to concrete and steel. CLT panels typically consist of three, five, or seven layers and can be manufactured in sizes up to 3.5 meters wide and 18 meters long.\n\nDeveloped in Austria in the early 1990s, CLT has become the material of choice for sustainable construction across Europe. Buildings up to 18 stories have been constructed using CLT, including the Mjostaarnet tower in Norway. The material is now gaining rapid adoption in Romania's modular construction sector, where it offers a compelling combination of speed, sustainability, and performance.",
      },
      {
        heading: "Benefits of CLT for Modular Homes",
        body: "CLT offers remarkable advantages for modular construction. Its strength-to-weight ratio is five times better than concrete, meaning lighter modules that are easier and cheaper to transport. Factory precision cutting with CNC machines ensures millimeter-accurate panels that fit together perfectly on site, reducing assembly time to days rather than weeks.\n\nFrom an environmental perspective, CLT stores carbon rather than emitting it. One cubic meter of CLT sequesters approximately one tonne of CO2. A typical CLT modular home stores 15-25 tonnes of carbon, making it a carbon-negative structure. The material also provides excellent thermal insulation (lambda value around 0.12 W/mK), natural humidity regulation, and superior acoustic performance compared to lightweight steel frames.\n\nCost-wise, CLT modular homes in Romania range from €800-1,400 per square meter including finishing. While the raw material cost is 10-20% higher than traditional timber frame, savings in construction time, reduced waste, and lower energy costs over the building's lifetime make it economically competitive.",
      },
      {
        heading: "Fire Safety: Debunking the Myths",
        body: "The most common objection to timber construction is fire safety, but CLT actually performs remarkably well in fire conditions. Unlike steel, which loses structural integrity at around 500 degrees Celsius and can cause sudden collapse, CLT chars at a predictable rate of approximately 0.65mm per minute. This charring layer insulates the inner wood, maintaining structural capacity for extended periods.\n\nCLT panels can achieve fire resistance ratings of 60, 90, or even 120 minutes depending on thickness, meeting or exceeding the requirements for most residential and mid-rise buildings under EU fire safety standards (EN 1995-1-2). Romanian building code P118 recognizes engineered timber as a valid structural material when properly designed, and CLT buildings routinely pass all required fire safety certifications.",
      },
      {
        heading: "CLT and EU Standards",
        body: "The European Technical Assessment (ETA) framework provides harmonized standards for CLT products across the EU. The key standard is EN 16351, which covers CLT manufacturing requirements, structural performance, and quality control. Products carrying the CE mark under this standard can be used in any EU member state, including Romania.\n\nThe EU's revised Construction Products Regulation (CPR) and the European Green Deal's Renovation Wave strategy both favor bio-based building materials. From 2027, the EPBD recast will require whole-life carbon assessments for new buildings, giving CLT a significant regulatory advantage. Romania's adoption of Eurocode 5 for timber design means that architects and engineers can confidently specify CLT using established calculation methods.",
      },
    ],
  },
  {
    slug: "building-regulations-romania-2026",
    title: "Building Regulations in Romania: 2026 Guide for Homeowners",
    excerpt:
      "Navigate Romania's building codes and permit process with confidence. Covers P100 seismic, C107 thermal, fire safety, and accessibility requirements for 2026.",
    date: "2026-04-09",
    author: "ModulCA Team",
    readMinutes: 7,
    tags: ["regulations", "Romania", "permits", "codes"],
    sections: [
      {
        heading: "Overview of Romanian Building Regulations",
        body: "Romania's building regulatory framework is governed by Law 50/1991 (amended) for construction permits and a series of technical normatives that cover structural safety, energy performance, fire protection, and accessibility. Understanding these regulations is essential before starting any building project, whether traditional or modular.\n\nThe permitting process involves several stages: obtaining an urbanism certificate (certificat de urbanism), preparing project documentation through an authorized architect, getting approvals from utility providers and relevant authorities, and finally receiving the building permit (autorizatie de construire). The entire process typically takes 3-6 months, though ModulCA's platform helps streamline documentation preparation significantly.",
      },
      {
        heading: "Seismic Design: P100 Code",
        body: "Romania is one of the most seismically active countries in Europe, with the Vrancea zone producing significant earthquakes. The P100-1/2013 seismic design code (currently under revision for 2026) divides the country into seismic zones with peak ground acceleration values ranging from 0.10g to 0.40g. Bucharest and much of southern Romania fall in the highest seismic zone.\n\nFor modular homes, this means structural connections between modules must be engineered to withstand seismic forces. CLT and steel-frame modular systems can both achieve compliance, but the connection details are critical. Your structural engineer must verify that module-to-module joints and module-to-foundation anchoring meet P100 requirements. ModulCA generates structural layouts that account for your specific seismic zone based on your plot location.\n\nKey documentation required includes a geotechnical study of your plot, structural calculations by a certified engineer (verificator de proiecte), and resistance expertise report. Budget €1,500-3,000 for structural engineering services.",
      },
      {
        heading: "Energy Performance: C107 and nZEB",
        body: "The C107/2005 thermal normative (revised 2010) sets minimum thermal performance requirements for building envelopes in Romania. The country is divided into four climatic zones, and minimum U-values vary accordingly. For the most common zones, exterior walls must achieve U-values of 0.56 W/m2K or better, though best practice for new construction targets 0.20-0.30 W/m2K.\n\nSince 2021, all new buildings in Romania must meet nearly Zero Energy Building (nZEB) standards, aligned with the EU's EPBD directive. This requires a primary energy consumption below 100 kWh/m2/year for residential buildings and mandatory use of renewable energy sources. Modular homes with proper insulation, high-performance windows (triple glazing recommended), and a heat pump or solar panel system easily meet these requirements.",
      },
      {
        heading: "Fire Safety and Accessibility",
        body: "Fire protection is regulated under P118/1999 (revised), which classifies buildings by fire risk and sets requirements for fire resistance of structural elements, escape routes, and fire detection systems. Single-family homes have relatively straightforward requirements, but multi-unit modular buildings must comply with stricter compartmentalization and egress standards. Smoke detectors are mandatory in all new residential construction.\n\nAccessibility requirements under NP 051/2012 apply primarily to public buildings and multi-unit residential complexes. However, designing for accessibility from the start is smart practice even for single-family homes, as it supports aging in place and increases resale value. ModulCA allows you to configure accessible module layouts with wider doorways (minimum 90cm), level thresholds, and wheelchair-accessible bathrooms as optional features during the design phase.",
      },
    ],
  },
  {
    slug: "building-regulations-netherlands-2026",
    title: "Building in the Netherlands: Regulations Guide for 2026",
    excerpt:
      "A comprehensive guide to Dutch building regulations in 2026, covering the Omgevingswet, BBL, BENG energy standards, and what they mean for modular construction.",
    date: "2026-04-09",
    author: "ModulCA Team",
    readMinutes: 7,
    tags: ["regulations", "Netherlands", "Bouwbesluit", "BENG"],
    sections: [
      {
        heading: "The Omgevingswet: A New Regulatory Framework",
        body: "The Netherlands introduced the Omgevingswet (Environment and Planning Act) on January 1, 2024, replacing 26 separate laws including the old Bouwbesluit 2012. This sweeping reform consolidates all rules related to spatial planning, environmental protection, and building regulations into a single integrated framework. For homeowners and builders, this means a simpler permit process with one digital portal (DSO) for all applications.\n\nUnder the Omgevingswet, municipalities have more freedom to set local rules through their omgevingsplan (environmental plan). This means building requirements can vary between municipalities, so always check your local omgevingsplan before starting a project. The national technical building requirements are now found in the Besluit bouwwerken leefomgeving (BBL), which replaces the former Bouwbesluit.",
      },
      {
        heading: "BBL Technical Requirements",
        body: "The Besluit bouwwerken leefomgeving (BBL) sets minimum technical requirements for new buildings and renovations. Key areas include structural safety (based on Eurocodes), fire safety (minimum 60-minute fire resistance for load-bearing structures), sound insulation (minimum 52 dB between dwellings), ventilation (minimum capacity based on room function), and daylight (minimum daylight factor of 2.1% in habitable rooms).\n\nFor modular construction, the BBL requirements are fully achievable and in many cases easier to meet than with traditional construction, since factory conditions allow precise quality control. Sound insulation between modules can be addressed with acoustic separation layers installed during factory production. Dutch building inspectors (Bouwtoezicht) will check compliance during and after construction, so maintaining detailed documentation from the factory is essential.\n\nA notable change in 2026 is the strengthened enforcement of the Wet kwaliteitsborging (Quality Assurance Act), which shifts quality control from municipalities to independent quality inspectors (kwaliteitsborgers) for simpler buildings. This applies to most residential construction and requires engaging an approved inspector early in the process.",
      },
      {
        heading: "BENG Energy Standards",
        body: "The Netherlands has some of the most ambitious energy standards in Europe. The BENG (Bijna Energieneutrale Gebouwen, or Nearly Energy-Neutral Buildings) standards have been mandatory for all new buildings since 2021 and were tightened in 2025. Three indicators must be met: BENG 1 limits energy demand for heating and cooling to a maximum of 70 kWh/m2/year for residential buildings, BENG 2 limits primary fossil energy use to 30 kWh/m2/year, and BENG 3 requires a minimum 50% share of renewable energy.\n\nMeeting BENG standards typically requires high-performance insulation (Rc values of 6.0 m2K/W for roofs and 4.7 for walls), triple-glazed windows, mechanical ventilation with heat recovery, and renewable energy systems such as solar panels or heat pumps. Modular homes designed with these specifications from the factory stage can exceed BENG requirements cost-effectively, as the controlled manufacturing environment ensures airtight construction with measured performance.",
      },
      {
        heading: "Permits and Practical Steps",
        body: "For most new-build homes in the Netherlands, you need an omgevingsvergunning (environmental permit) which can be applied for through the DSO digital portal. Processing time is typically 8 weeks for standard applications and 26 weeks for complex ones. Modular homes generally fall under the standard procedure if they comply with the local omgevingsplan.\n\nBefore applying, you need: a structural design by a registered engineer, an energy performance calculation (EPC) by a certified advisor, a ventilation and daylight assessment, and a fire safety plan. If your plot is in a welstandsvrij (design-freedom) area, aesthetic review is not required, which benefits standardized modular designs. Budget €2,000-5,000 for all permit-related costs. ModulCA's platform generates documentation compatible with Dutch requirements, accelerating the permit preparation phase.",
      },
    ],
  },
  {
    slug: "passive-house-worth-it",
    title: "Is a Passive House Worth the Extra Cost?",
    excerpt:
      "Passive House construction costs 10-15% more upfront but slashes energy bills by up to 90%. We break down the numbers, comfort gains, and long-term ROI.",
    date: "2026-04-10",
    author: "ModulCA Team",
    readMinutes: 6,
    tags: ["passive-house", "energy", "costs", "ROI"],
    sections: [
      {
        heading: "What Makes a Passive House Different?",
        body: "A Passive House (Passivhaus) is a building standard developed by the Passive House Institute in Darmstadt, Germany. It requires specific performance targets: annual heating demand below 15 kWh/m2, total primary energy demand below 120 kWh/m2, airtightness below 0.6 air changes per hour at 50 Pa pressure, and no thermal bridges. The result is a building that maintains comfortable temperatures year-round with minimal active heating or cooling.\n\nThe standard achieves this through five core principles: superinsulation (typically 25-40cm in walls), high-performance triple-glazed windows, elimination of thermal bridges, airtight construction with controlled ventilation, and heat recovery ventilation (HRV) systems that recapture 80-90% of outgoing warmth. These are not exotic technologies but rather careful engineering and quality execution.",
      },
      {
        heading: "The Cost Premium: What to Expect",
        body: "In Romania, building to Passive House standard adds approximately 10-15% to construction costs compared to standard code-compliant construction. For a 100 sqm home, this translates to an additional €8,000-15,000 on top of a base cost of €80,000-120,000. The main cost drivers are thicker insulation, triple-glazed windows (€150-300 more per window than double-glazed), the HRV system (€3,000-6,000), and the blower door testing and certification process (€1,500-2,500).\n\nModular construction reduces the Passive House premium because factory conditions make it easier to achieve the required airtightness and eliminate thermal bridges. When modules are built with Passive House specifications from the start, the additional cost can be as low as 8-12% compared to standard modular construction, since many quality-control measures are already built into the factory process.",
      },
      {
        heading: "Energy Savings and Comfort",
        body: "A certified Passive House in Romania's climate typically consumes 80-90% less energy for heating than a standard new build. At current energy prices (approximately €0.15/kWh for gas, €0.25/kWh for electricity), a 100 sqm Passive House saves €800-1,200 per year on heating costs. With energy prices trending upward across Europe, these savings will grow over time.\n\nBeyond the numbers, the comfort difference is dramatic. Passive Houses maintain stable indoor temperatures between 20-25 degrees Celsius throughout the year without drafts or cold spots. The continuous fresh air supply from the HRV system ensures excellent indoor air quality while filtering out pollen and pollution. Residents consistently report better sleep, fewer respiratory issues, and greater overall comfort compared to conventional homes.",
      },
      {
        heading: "Long-Term ROI and Resale Value",
        body: "The payback period for the Passive House premium in Romania is typically 8-12 years based on energy savings alone. However, the full financial picture is more favorable when you factor in reduced HVAC equipment costs (no traditional heating system needed, just a small heat pump), lower maintenance expenses, and increased property value.\n\nStudies across Europe show that certified Passive Houses command a 10-20% price premium on the resale market. In the Netherlands and Germany, this premium is well-established; in Romania, as awareness grows and energy prices rise, the premium is emerging. For investors and homeowners thinking long-term, the Passive House standard represents one of the best risk-adjusted investments you can make in a building. ModulCA can configure your modular home to meet Passive House targets, with energy performance estimates generated during the design phase.",
      },
    ],
  },
  {
    slug: "choosing-architect-romania",
    title: "How to Choose an Architect in Romania",
    excerpt:
      "Hiring the right architect is crucial for your building project. Learn about OAR registration, typical fees, what to expect, and red flags to watch for.",
    date: "2026-04-10",
    author: "ModulCA Team",
    readMinutes: 5,
    tags: ["architect", "Romania", "tips", "process"],
    sections: [
      {
        heading: "Why Your Architect Choice Matters",
        body: "In Romania, an authorized architect is legally required to sign off on building permit documentation for any new construction or major renovation. But beyond the legal requirement, your architect is the person who translates your vision into a buildable, code-compliant design. The right architect saves you money by avoiding costly mistakes, navigating regulations efficiently, and optimizing your layout for your specific needs and plot conditions.\n\nThe architect's role in Romania covers the full project lifecycle: from the initial feasibility study (studiu de fezabilitate) through the building permit project (DTAC/PAC), to the detailed execution project (PTh/DE) and construction supervision (dirigentie de santier, though this can also be a separate specialist). Understanding this scope helps you evaluate what you're getting for your investment.",
      },
      {
        heading: "OAR Registration and Qualifications",
        body: "The Ordinul Arhitectilor din Romania (OAR) is the professional body that licenses architects in Romania. Only architects registered with OAR can legally sign building permit documentation. There are three registration levels: architect with full right of signature (drept de semnatura), specialist architect (limited scope), and landscape architect. Always verify your architect's OAR registration status, which is publicly searchable on the OAR website.\n\nBeyond OAR registration, look for relevant experience with your project type. An architect experienced in modular or prefabricated construction understands the specific technical requirements and opportunities that differ from traditional building. Ask to see completed projects similar in scale and style to what you want. A good portfolio and transparent communication style matter more than prestigious office addresses.",
      },
      {
        heading: "Typical Fees and What to Expect",
        body: "Architect fees in Romania vary significantly by project complexity, location, and the architect's experience. For a single-family home, expect to pay between 3-8% of the total construction cost for full architectural services (design through construction supervision). For a home costing €100,000 to build, that means €3,000-8,000 in architect fees. Some architects charge fixed fees per project phase, while others bill hourly (€30-80/hour is typical).\n\nThe fee should cover: initial consultation and site analysis, concept design with options, building permit documentation (DTAC), detailed execution drawings (PTh), structural engineering coordination, and at least periodic site supervision. Get a clear written contract specifying deliverables, timeline, revision rounds included, and payment schedule. Most architects require 30-50% upfront with the balance tied to milestone deliverables.",
      },
      {
        heading: "Red Flags to Watch For",
        body: "Be cautious of architects who are not registered with OAR or cannot provide their registration number. Avoid those who promise unrealistically fast timelines (a proper building permit project takes 4-8 weeks minimum) or refuse to provide references from past clients. An architect who discourages you from getting a geotechnical study or skips the urbanism certificate review is cutting dangerous corners.\n\nOther warning signs include unwillingness to provide a written contract, vague fee structures with hidden costs, inability to explain regulatory requirements clearly, and resistance to coordination with structural engineers or MEP consultants. If you're building modular, be wary of architects who dismiss the approach without understanding it. ModulCA works with a network of OAR-registered architects experienced in modular design, and our platform-generated documentation gives your architect a head start on the permit process.",
      },
    ],
  },
  {
    slug: "modular-home-myths",
    title: "7 Myths About Modular Homes (Debunked)",
    excerpt:
      "Modular homes are just trailers? They fall apart? They all look the same? We debunk the 7 most common myths about modular construction with facts.",
    date: "2026-04-11",
    author: "ModulCA Team",
    readMinutes: 6,
    tags: ["modular", "myths", "quality", "perception"],
    sections: [
      {
        heading: "Myth 1: Modular Homes Are Just Fancy Trailers",
        body: "This is the most persistent and most wrong misconception. Mobile homes (trailers) are built on a permanent chassis and are designed to be moved. Modular homes are permanent structures built to the same building codes as any traditional home. They sit on permanent foundations, have standard utility connections, and are legally classified as real estate, not vehicles.\n\nThe confusion stems from the fact that both involve factory production and transport. But the similarities end there. Modular homes use the same materials as traditional construction — concrete foundations, timber or steel frames, brick or render facades — and must pass identical building inspections. In Romania, a modular home requires the same building permit and undergoes the same ISC (Inspectoratul de Stat in Constructii) inspections as a conventionally built house.",
      },
      {
        heading: "Myth 2: They Don't Last as Long",
        body: "Modular homes have the same lifespan as traditionally built homes — 50 to 100+ years with proper maintenance. In fact, several factors give them a durability advantage. Factory construction means materials are never exposed to rain during the building process, preventing moisture damage that plagues many traditional builds. Structural connections are engineered and quality-controlled in factory conditions, ensuring consistent joint strength.\n\nCLT modular homes in particular have demonstrated exceptional longevity. Timber buildings in Scandinavia and Japan have stood for centuries. The key to durability is proper design, quality materials, and good maintenance — none of which are unique to either construction method. Your modular home's foundation, waterproofing, and ventilation design matter far more for longevity than whether it was assembled on-site or in a factory.",
      },
      {
        heading: "Myth 3: They All Look the Same / Myth 4: Limited Customization",
        body: "Early modular construction did suffer from repetitive designs, but today's modular homes are highly customizable. By combining different module types, sizes, and configurations, you can create thousands of unique floor plans. Exterior finishes range from traditional render and brick to modern timber cladding, metal panels, and green walls. Interior layouts are fully customizable within the module grid.\n\nThe ModulCA platform demonstrates this flexibility directly — you can arrange modules in L-shapes, U-shapes, two-story configurations, and add terraces, balconies, or carports. Custom window placement, ceiling heights, and material choices mean no two ModulCA-designed homes need look alike. The modular grid is a design framework, not a design limitation, much like how LEGO blocks enable infinite creativity despite standardized dimensions.",
      },
      {
        heading: "Myth 5: Poor Quality / Myth 6: Bad Resale Value / Myth 7: Not Energy Efficient",
        body: "Quality in modular construction is actually easier to control than on-site building. Factory environments eliminate weather variables, enable consistent material storage conditions, and allow quality inspections at every stage. Many modular factories operate under ISO 9001 quality management systems with documented inspection protocols that exceed typical on-site practices.\n\nRegarding resale value, modular homes are appraised and sold identically to traditional homes. Banks in Romania provide mortgages for modular homes under the same terms as conventional construction. As modular building becomes more mainstream, any residual perception discount is disappearing. In markets like Sweden and the Netherlands, modular homes command market-rate prices with no discount.\n\nEnergy efficiency is another area where modular excels. The factory-controlled airtight construction, precision-fitted insulation, and absence of thermal bridges make it easier to achieve high energy performance ratings. Many modular homes achieve A or A+ energy ratings. Combined with a heat pump and solar panels, a modular home can easily reach nearly Zero Energy Building (nZEB) standards, outperforming the majority of traditionally built homes in Romania.",
      },
    ],
  },
  {
    slug: "smart-home-modular",
    title: "Smart Home Tech for Modular Buildings",
    excerpt:
      "Modular construction is ideal for smart home integration. Learn about pre-wiring during factory build, automation systems, costs, and the best tech for 2026.",
    date: "2026-04-11",
    author: "ModulCA Team",
    readMinutes: 5,
    tags: ["smart-home", "technology", "automation", "modular"],
    sections: [
      {
        heading: "Why Modular Homes and Smart Tech Are a Perfect Match",
        body: "Factory-built modules offer a unique advantage for smart home integration: all wiring, conduits, and infrastructure can be installed during the manufacturing phase under controlled conditions. This means cables are routed cleanly through walls and ceilings before panels are closed, sensors are embedded precisely where needed, and all connections are tested before the module leaves the factory.\n\nIn traditional construction, smart home wiring is often an afterthought that requires chasing cables into finished walls or relying on wireless solutions with their inherent reliability issues. With modular construction, you can specify your smart home requirements upfront and have everything pre-installed, resulting in a cleaner, more reliable, and cheaper installation than retrofitting.",
      },
      {
        heading: "Essential Smart Home Systems",
        body: "A well-designed smart modular home typically includes five core systems. First, lighting control with dimmable LED circuits and scene programming for different moods and times of day. Second, climate management through a smart thermostat integrated with your heat pump, underfloor heating zones, and motorized window ventilation. Third, security with IP cameras, smart door locks, motion sensors, and a centralized alarm system. Fourth, energy management with real-time consumption monitoring, solar panel optimization, and smart EV charging if applicable. Fifth, entertainment and connectivity with distributed audio, structured cabling for high-speed networking, and sufficient power outlets in every room.\n\nThe hub that ties everything together matters enormously. Open-standard systems like Home Assistant (running on a local server), KNX (the European professional standard), or Zigbee/Z-Wave mesh networks offer long-term reliability and vendor independence. Avoid systems that depend entirely on cloud services or a single manufacturer's ecosystem, as these create long-term dependency risks.",
      },
      {
        heading: "Costs and Planning",
        body: "Smart home integration in a modular home typically costs €3,000-15,000 depending on the scope. A basic package covering smart lighting, thermostat, and security runs €3,000-5,000. A mid-range system adding energy monitoring, motorized blinds, and distributed audio costs €5,000-10,000. A premium installation with KNX bus wiring, whole-home automation, and custom programming can reach €10,000-15,000 or more.\n\nThe key to controlling costs is planning during the design phase. Every smart feature specified before factory production is 30-50% cheaper to install than retrofitting later. At minimum, even if you don't want smart features now, have your modules built with Category 6A ethernet cabling to every room and empty conduits in walls for future sensor wiring. This future-proofing adds less than €500 to your build cost and saves thousands if you upgrade later.",
      },
      {
        heading: "Integration with ModulCA",
        body: "ModulCA's MEP (Mechanical, Electrical, Plumbing) layout engine accounts for smart home infrastructure when generating technical drawings. You can specify smart home readiness levels during the design phase, and the platform ensures appropriate conduit routing, electrical panel capacity, and network infrastructure are included in the drawings your builder receives.\n\nAs smart home technology evolves rapidly, we recommend focusing on robust infrastructure (wiring, network, power) rather than specific devices, which can be upgraded over time. A well-wired modular home built in 2026 will easily accommodate the smart home technologies of 2036.",
      },
    ],
  },
  {
    slug: "small-house-big-living",
    title: "Small House, Big Living: Designing Under 100 sqm",
    excerpt:
      "A compact home doesn't mean compromising on comfort. Discover space-saving strategies, multi-functional rooms, and smart layouts for homes under 100 square meters.",
    date: "2026-04-12",
    author: "ModulCA Team",
    readMinutes: 5,
    tags: ["small-house", "compact", "design", "efficiency"],
    sections: [
      {
        heading: "The Case for Compact Living",
        body: "Across Europe, a growing movement embraces smaller, more efficient homes. The reasons are both economic and philosophical: land and construction costs in Romania have risen 30-40% since 2020, pushing many first-time buyers toward compact designs. At the same time, the sustainability argument is compelling — a smaller home uses less energy, requires fewer materials, and generates less waste both during construction and throughout its lifetime.\n\nA well-designed 70-90 sqm home can comfortably accommodate a family of three to four. The secret is not cramming the same rooms into less space, but rethinking how space is used. Japanese and Scandinavian architecture have long demonstrated that compact homes can feel spacious, calm, and deeply functional when every square meter is intentionally designed.",
      },
      {
        heading: "Space-Saving Design Strategies",
        body: "The most impactful strategy is eliminating wasted circulation space. Traditional homes often dedicate 15-20% of floor area to hallways and corridors. In a compact modular home, open-plan living-kitchen areas, direct room-to-room connections, and central utility cores can reduce circulation to under 10%. A 90 sqm home with efficient circulation provides the usable living area of a poorly planned 110 sqm home.\n\nVertical space is equally important. Ceilings of 2.7-3.0 meters (achievable in modular construction by specifying taller modules) make rooms feel dramatically larger. Mezzanine sleeping lofts, tall built-in storage, and high-mounted windows all exploit vertical space. For two-story compact homes, an open stairwell with a skylight can serve as a light well, illuminating the center of the building and creating a sense of volume disproportionate to the floor area.\n\nBuilt-in furniture designed for specific module dimensions eliminates the wasted space around freestanding pieces. A built-in window seat with storage below, a fold-down desk in the living area, and a platform bed with drawers underneath can collectively save 5-8 sqm of floor area compared to conventional furniture.",
      },
      {
        heading: "Multi-Functional Rooms",
        body: "In a compact home, rooms that serve only one purpose are a luxury. The most effective approach is designing rooms with a primary and secondary function. A home office that doubles as a guest room with a Murphy bed. A dining area that serves as a homework station and craft workspace. A landing or wide hallway that accommodates a reading nook with built-in bookshelves.\n\nModular construction supports this flexibility through the module grid. A 3x6 meter double module can be configured as an open living-dining-kitchen space that feels generous despite being just 18 sqm. Sliding partitions rather than permanent walls allow the space to be reconfigured between social entertaining mode and quiet individual zones. When every room works twice as hard, your 80 sqm home lives like 120.",
      },
      {
        heading: "Compact Home Costs and Value",
        body: "Building smaller doesn't just save on construction costs — it compounds savings across every category. A 75 sqm modular home in Romania might cost €55,000-85,000 to build, compared to €80,000-120,000 for a 100 sqm home. But you also save on a smaller foundation (€1,500-3,000 less), lower utility connection fees, reduced annual energy costs (€300-500/year less), and lower property taxes.\n\nFrom an investment perspective, compact homes in urban and peri-urban areas offer excellent rental yields and resale potential. Young professionals and couples increasingly prefer well-designed small homes over large, poorly finished ones. On ModulCA, you can experiment with compact layouts using 6-8 modules, see real-time cost estimates, and find the sweet spot between space and budget that works for your family.",
      },
    ],
  },
  {
    slug: "eu-green-building-standards",
    title: "EU Green Building Standards: What Changes in 2026",
    excerpt:
      "The EU's revised EPBD and Green Deal are reshaping building standards across Europe. Learn about nZEB requirements, renovation targets, and what it means for new homes.",
    date: "2026-04-13",
    author: "ModulCA Team",
    readMinutes: 6,
    tags: ["EU", "EPBD", "green-building", "energy"],
    sections: [
      {
        heading: "The EPBD Recast: A New Era for Buildings",
        body: "The revised Energy Performance of Buildings Directive (EPBD), adopted in 2024, represents the most ambitious overhaul of EU building standards in a decade. The directive targets the building sector, which accounts for 40% of EU energy consumption and 36% of greenhouse gas emissions. The recast introduces stricter requirements for new buildings, mandatory renovation targets for existing stock, and a timeline toward zero-emission buildings by 2030.\n\nFor EU member states, including Romania, the directive requires transposition into national law by 2026. This means updated building codes, new energy performance certificate (EPC) methodologies, and enhanced enforcement. Homeowners building new homes in 2026 should understand these requirements, as they directly affect design decisions, material choices, and long-term operating costs.",
      },
      {
        heading: "Zero-Emission Buildings Standard",
        body: "From 2028 (2030 for residential), all new buildings in the EU must be zero-emission buildings (ZEB). This goes beyond the current nZEB (nearly Zero Energy Building) standard by requiring that buildings produce zero on-site carbon emissions from fossil fuels. In practice, this means no gas boilers, no oil heating, and mandatory on-site or nearby renewable energy generation.\n\nThe transition pathway means that homes built in 2026 should already be designed with ZEB compatibility in mind, even if the standard is not yet mandatory. Installing a heat pump instead of a gas boiler, providing roof space and electrical infrastructure for solar panels, and achieving high envelope performance are all investments that future-proof your home. Buildings that don't meet emerging standards will face lower property values and potential retrofit mandates.\n\nFor Romania specifically, the nZEB standard currently requires primary energy below 100 kWh/m2/year for residential buildings. The ZEB standard will tighten this further and add the zero-fossil-fuel requirement. ModulCA designs already target these performance levels, ensuring that homes built today remain compliant and competitive for decades.",
      },
      {
        heading: "The Renovation Wave and Existing Buildings",
        body: "While new buildings get the headlines, the EPBD recast places enormous emphasis on renovating existing building stock. The directive introduces minimum energy performance standards (MEPS) requiring the worst-performing buildings (rated G or F on energy certificates) to be renovated to at least class E by 2030 and class D by 2033 for residential buildings.\n\nThis creates both a challenge and an opportunity in Romania, where a large portion of the housing stock consists of poorly insulated communist-era apartment blocks. For homeowners of older properties, the message is clear: energy renovation is no longer optional but will become legally required. For those building new modular homes, this regulatory trend reinforces the value of building to high energy standards from the start.",
      },
      {
        heading: "What This Means for Your Building Project",
        body: "If you're planning a new home in 2026, design for the ZEB standard even though it's not yet mandatory. The marginal cost of reaching ZEB versus nZEB is modest (5-8% of construction cost), and it protects your investment against regulatory obsolescence. Specify a heat pump for heating and cooling, include solar panel infrastructure (even if you install panels later), ensure your building envelope achieves U-values 20-30% better than current minimums, and install an energy monitoring system.\n\nFrom 2026, all new buildings must also include a whole-life carbon assessment, accounting for embodied carbon in materials as well as operational energy. This favors timber and modular construction, which have lower embodied carbon than concrete and steel. ModulCA's platform is evolving to include carbon footprint estimates alongside cost and energy calculations, helping you make informed decisions aligned with EU green building requirements.",
      },
    ],
  },
  {
    slug: "foundation-types-modular",
    title: "Foundation Types for Modular Homes: Which One Do You Need?",
    excerpt:
      "Strip foundations, raft slabs, or screw piles? Learn which foundation type suits your modular home, with costs, pros/cons, and guidance for Romanian soil conditions.",
    date: "2026-04-14",
    author: "ModulCA Team",
    readMinutes: 6,
    tags: ["foundation", "modular", "construction", "technical"],
    sections: [
      {
        heading: "Why Foundations Matter for Modular Homes",
        body: "The foundation is the interface between your modular home and the ground, and getting it right is critical. Unlike traditional construction, where the foundation can be adjusted as building progresses, modular homes require a foundation that is precisely level and dimensionally accurate before module delivery. Modules are manufactured to exact dimensions, so the foundation must match within a tolerance of plus or minus 10 millimeters.\n\nThe choice of foundation type depends on several factors: soil conditions (determined by a geotechnical study), groundwater level, topography, seismic zone, frost depth, and budget. In Romania, frost depth varies from 60cm in the south to 110cm in the north, and all foundations must extend below this depth. A geotechnical study costing €500-1,000 is an essential first step that will determine which foundation types are feasible for your plot.",
      },
      {
        heading: "Strip Foundations (Fundatii Continue)",
        body: "Strip foundations are the most common foundation type in Romania for single-family homes. They consist of continuous concrete strips running beneath all load-bearing walls. For a modular home, strip foundations are placed along the module grid lines where modules connect and transfer loads to the ground. Typical dimensions are 40-60cm wide and 80-120cm deep (depending on frost depth and soil bearing capacity).\n\nStrip foundations work well on stable soils with good bearing capacity (above 150 kPa) and are cost-effective for most Romanian conditions. For a 100 sqm modular home, expect to pay €4,000-7,000 for a complete strip foundation including excavation, reinforcement, concrete, and waterproofing. Construction time is typically 2-3 weeks including curing. The main disadvantage is that they're less suitable for sloping sites or areas with variable soil conditions.\n\nA reinforced concrete ring beam on top of the strip foundation provides the level surface needed for module placement and distributes loads evenly. This beam also serves as the anchor point for securing modules against seismic and wind forces.",
      },
      {
        heading: "Raft Foundations (Radier General)",
        body: "A raft foundation (also called a mat foundation) is a single reinforced concrete slab that covers the entire footprint of the building. This type is recommended when soil bearing capacity is low (below 100 kPa), when soil conditions vary across the plot, or when groundwater levels are high. The raft distributes the building load over a larger area, reducing pressure on the soil.\n\nFor modular homes, raft foundations offer an excellent flat, level surface for module placement. Typical thickness is 25-40cm with reinforcement mesh top and bottom. Costs range from €5,000-10,000 for a 100 sqm home, making them more expensive than strip foundations but more versatile. The raft also provides a ready-made ground floor surface that can receive insulation and floor finishing directly.\n\nIn Romania's seismic zones, raft foundations perform well because they move as a single rigid unit, preventing differential settlement that could misalign modules. For this reason, structural engineers often recommend raft foundations for modular homes in seismic zones III and IV (southern Romania, Bucharest area) regardless of soil conditions.",
      },
      {
        heading: "Screw Piles and Alternative Systems",
        body: "Screw pile foundations (also known as helical piles) are gaining popularity for modular homes across Europe. These are steel shafts with helical plates that are screwed into the ground using hydraulic machinery, requiring no excavation and no concrete. Installation takes just 1-2 days for a typical home, and modules can be placed immediately without waiting for concrete to cure.\n\nScrew piles excel on challenging sites: slopes, high water tables, poor soil conditions at shallow depth, and environmentally sensitive areas where minimal ground disturbance is preferred. They are also fully reversible — if the building is ever decommissioned, the piles can be unscrewed and the site restored. Costs in Romania range from €4,000-8,000 for a complete screw pile foundation, comparable to strip foundations.\n\nA steel or timber subframe connects the screw pile heads and provides the level platform for module placement. This creates a ventilated crawl space beneath the home, which is advantageous for moisture management but requires insulation of the floor modules. When specifying screw piles, ensure your structural engineer verifies compatibility with Romanian seismic requirements (P100), as the lateral load transfer mechanism differs from conventional foundations. ModulCA's foundation plan generator includes options for all three foundation types, tailored to your specific plot conditions.",
      },
    ],
  },
  {
    slug: "solar-panels-romania-2026",
    title: "Solar Panels in Romania: 2026 Guide to Costs and Subsidies",
    excerpt:
      "Romania offers generous solar subsidies through the AFM program. Learn about panel costs, ROI calculations, net metering rules, and how to maximize your investment in 2026.",
    date: "2026-04-15",
    author: "ModulCA Team",
    readMinutes: 6,
    tags: ["solar", "Romania", "energy", "subsidies"],
    sections: [
      {
        heading: "Why Solar Makes Sense in Romania",
        body: "Romania receives 1,200-1,600 hours of sunshine per year, with the southern and eastern regions being particularly favorable for solar energy production. A well-oriented rooftop solar system in Bucharest can generate 1,200-1,400 kWh per installed kWp annually. With electricity prices averaging €0.22-0.28/kWh for residential consumers in 2026 (including all taxes and grid fees), solar panels offer attractive returns even without subsidies.\n\nThe economics are especially compelling for modular homes, where solar can be planned from the design phase. Optimal roof orientation (south-facing, 30-35 degree tilt), structural reinforcement for panel weight, and electrical infrastructure for inverters and batteries can all be integrated during factory production, reducing installation costs by 15-20% compared to retrofitting.",
      },
      {
        heading: "System Costs and Sizing",
        body: "A typical residential solar system in Romania ranges from 3 kWp to 10 kWp. For a family of four in a 100 sqm home consuming 3,500-5,000 kWh per year, a 5 kWp system is usually optimal. In 2026, installed costs (panels, inverter, mounting, wiring, and commissioning) run approximately €900-1,200 per kWp, putting a 5 kWp system at €4,500-6,000 before subsidies.\n\nBattery storage adds €3,000-6,000 for a 5-10 kWh lithium-ion system, which allows you to store daytime production for evening use. While batteries improve self-consumption rates from 30-40% to 60-80%, their current cost means the payback period is longer. For most Romanian homeowners in 2026, a grid-connected system without batteries offers the best financial return, with batteries becoming more attractive as prices continue to decline.\n\nPremium monocrystalline panels from established manufacturers (with 25-year performance warranties) are recommended over cheaper alternatives. The price difference is small (10-15%) but the long-term reliability and degradation rates make premium panels the better investment over a 25-30 year system lifetime.",
      },
      {
        heading: "AFM Subsidies and Net Metering",
        body: "The Romanian Environment Fund Administration (AFM) runs the Casa Verde Fotovoltaice program, which provides subsidies of up to €5,000 for residential solar installations. The program has been renewed annually with strong government support. Eligibility requires ownership of the property, a valid building permit (or completed construction), and a grid connection agreement with your local distribution operator (Distributie Energie, E-Distributie, etc.).\n\nThe application process is competitive and opens in rounds, typically in spring and autumn. Demand consistently exceeds available funding, so early preparation is essential. Have your documentation ready before the round opens: property documents, grid connection approval, at least two installer quotes, and your energy consumption history. Processing takes 3-6 months from application to subsidy disbursement.\n\nRomania's net metering (also called net billing since 2023) system allows prosumers to export excess solar production to the grid and receive credit against their consumption. The compensation rate is set at the wholesale market price, which is lower than your retail purchase price. This makes self-consumption more valuable than export, reinforcing the importance of proper system sizing and potentially batteries to maximize the share of solar electricity you use directly.",
      },
      {
        heading: "ROI and Long-Term Value",
        body: "Without subsidies, a 5 kWp solar system in Romania pays for itself in 5-7 years and generates €15,000-25,000 in energy savings over its 25-year warranty period (assuming 2% annual electricity price increases). With the AFM subsidy covering up to €5,000, the payback drops to 2-4 years, making it one of the best investments available to Romanian homeowners.\n\nSolar panels also increase property value. European real estate studies indicate that homes with solar installations sell for 3-5% more than comparable homes without. For a €100,000 home, that's a €3,000-5,000 value increase on top of the energy savings. As EU regulations push toward zero-emission buildings, homes with existing solar infrastructure will have a significant market advantage.\n\nFor modular home builders using ModulCA, we recommend specifying solar-ready roof design from the start: south-facing roof modules with 30-35 degree pitch, pre-installed mounting rail brackets, conduit from roof to electrical panel location, and inverter mounting space near the main electrical distribution board. This solar-ready specification adds less than €300 to your modular build cost and saves €500-1,000 in future installation costs.",
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
