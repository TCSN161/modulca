# ModulCA — MASTER PLAN 2026

## VISION
ModulCA is a full-stack modular construction platform where clients design, visualize, price, and purchase modular homes — from selecting land to generating professional presentations for investors, banks, and builders.

---

## CURRENT STATE (What's Done)

### 11-Step Wizard (Working)
| # | Step | Route | Status | Description |
|---|------|-------|--------|-------------|
| 1 | Land | `/land` | Done | Map-based terrain selection, polygon drawing, grid placement |
| 2 | Design | `/design` | Done | Floor plan layout with drag/drop modules |
| 3 | Preview | `/output` | Done | Initial 3D preview of layout |
| 4 | Style | `/style` | Done | Design direction (Scandinavian, Industrial, Warm Contemporary) |
| 5 | Configure | `/configure` | Done | Walls, floors, doors, windows per module |
| 6 | Visualize | `/visualize` | Done | Full 3D visualization (single + combined) |
| 7 | Render | `/render` | Done | AI photorealistic rendering (5 engines) |
| 8 | Walkthrough | `/walkthrough` | Done | First-person 3D walkthrough with quality modes |
| 9 | Technical | `/technical` | Done | Technical drawings with PDF/SVG export |
| 10 | Products | `/products` | Done | Product catalog (32 SKUs), shopping cart |
| 11 | Finalize | `/finalize` | Done | Summary, save, next steps |

### AI Render Engine System (5 Engines)
| Engine | Type | Auth | Cost | Status |
|--------|------|------|------|--------|
| Pollinations AI | text2img | None | Free | Working |
| AI Horde | text2img | None | Free | Working |
| Stability AI | img2img | API key | 25 free credits | Key configured |
| Together.ai FLUX | text2img + img2img | API key | Free 3 months | Needs key |
| Leonardo.ai | text2img | API key | 150 free/day | Needs key |

### 3D Walkthrough Engine System
| Engine | Quality | Status |
|--------|---------|--------|
| Three.js Standard | Basic | Working |
| Three.js Enhanced | Better lighting/shadows | Working |
| Gaussian Splatting | Photorealistic | Coming Soon (premium) |

### Infrastructure
- Next.js 16 + TypeScript + Tailwind
- Zustand stores with localStorage persistence
- Three.js + React Three Fiber for 3D
- Modular engine architecture (pluggable AI + 3D engines)
- @react-pdf/renderer installed (not yet used)
- Prisma ORM + NextAuth (configured, not connected)

---

## PHASE 1: PRESENTATION & EXPORT (Priority: HIGH)
**Goal:** Clients can generate a professional architectural presentation PDF/deck

### Step 12: Presentation Builder (`/project/demo/presentation`)
A page where the client assembles their project into a professional presentation:

**Layout inspired by top architectural firms (Zaha Hadid, BIG, Foster+Partners):**
- Clean, minimal white layouts with strong typography
- Full-bleed AI renders as hero images
- Technical drawings with dimensions
- Moodboard collage from style selections
- Material/finish palette with color swatches
- Cost breakdown table
- Site plan with terrain/location map
- 3D walkthrough screenshots
- Product selections summary

**Presentation Sections (auto-populated from project data):**
1. Cover Page — Project name, date, location, hero AI render
2. Site Plan — Map screenshot, polygon area, terrain details
3. Floor Plan — Technical drawing, module layout, dimensions
4. Design Vision — Style direction, moodboard images, color palette
5. Module Details — Per-room: layout, materials, furniture, AI render
6. 3D Views — Visualization screenshots, walkthrough captures
7. AI Renders — All generated photorealistic renders
8. Materials & Finishes — Floor/wall/finish specifications
9. Products — Selected products with images and quantities
10. Cost Summary — Full breakdown: modules, products, design fee, total
11. Next Steps — Contact info, timeline, builder recommendations

**Export Options:**
- PDF download (using @react-pdf/renderer)
- Print-optimized HTML
- Share link (public URL with read-only view)
- Slide deck format (landscape, one section per slide)

**Presentation Tool Integration (like AI engine dropdown):**
| Tool | Account | Cost | Type |
|------|---------|------|------|
| Built-in PDF Generator | None | Free | @react-pdf/renderer |
| Canva Embed | Optional | Free tier | iframe embed API |
| Google Slides Export | Account | Free | Drive API |
| Figma Embed | Account | Free tier | iframe viewer |

---

## PHASE 2: LAND MARKETPLACE (Priority: HIGH)
**Goal:** Clients can browse, list, and purchase terrain directly through the platform

### Step 13: Marketplace (`/project/demo/marketplace` + `/marketplace`)

**For Buyers (integrated into wizard):**
- Browse available terrains on map
- Filter by: size, price, location, zoning, utilities
- Terrain detail cards: photos, satellite view, area, price/m2
- Terrain suitability score for modular construction
- One-click "Use This Terrain" → auto-populates Step 1 (Land)
- Price calculator: terrain + modules + products = total project cost
- Request info / contact seller
- Save favorites

**For Sellers (separate section):**
- List terrain for sale
- Upload photos, documents (cadastral, zoning)
- Set price, terms
- Dashboard: views, inquiries, offers
- Verification badge system

**Terrain Data Model:**
```
Terrain {
  id, title, description
  location: { lat, lng, address, city, county }
  polygon: LatLng[]
  area: number (m2)
  price: number (EUR)
  pricePerM2: number
  zoning: "residential" | "mixed" | "commercial"
  utilities: { water, electricity, gas, sewer }
  photos: string[]
  documents: string[]
  seller: { name, phone, email }
  status: "available" | "reserved" | "sold"
  suitabilityScore: number (0-100)
  createdAt, updatedAt
}
```

---

## PHASE 3: POLISH & INVESTOR DEMO (Priority: HIGH)
**Goal:** Platform looks and works flawlessly for investor demos

### 3.1 End-to-End Flow Polish
- [ ] Test all 13 steps in sequence
- [ ] Consistent navigation (StepNav everywhere)
- [ ] Loading states and skeleton screens
- [ ] Error boundaries per step
- [ ] Mobile responsive layout

### 3.2 Homepage Enhancements
- [ ] Hero section with animated 3D preview
- [ ] Video demo walkthrough
- [ ] Testimonials section (placeholder)
- [ ] FAQ section
- [ ] Footer with social links

### 3.3 Dashboard Improvements
- [ ] Project cards with thumbnail renders
- [ ] Project duplication
- [ ] Delete project with confirmation
- [ ] Project sharing (public link)

---

## PHASE 4: AUTHENTICATION & DATABASE (Priority: MEDIUM)
**Goal:** Real user accounts and persistent data

### 4.1 Auth System
- [ ] NextAuth with email/password + Google OAuth
- [ ] User profile page
- [ ] Email verification
- [ ] Password reset

### 4.2 Database Integration
- [ ] Prisma schema for: User, Project, Module, Terrain, Render, Product
- [ ] Supabase/PostgreSQL connection
- [ ] Migrate from localStorage to database
- [ ] File storage for renders/uploads (Supabase Storage or S3)

### 4.3 User Tiers
| Feature | Free | Pro ($19/mo) | Enterprise |
|---------|------|-------------|-----------|
| Projects | 3 | Unlimited | Unlimited |
| AI Renders | 5/day | 50/day | Unlimited |
| Engines | Pollinations, AI Horde | All 5 | All + custom |
| Walkthrough | Standard | Enhanced | Gaussian Splatting |
| Presentation | Basic PDF | Full PDF + sharing | White-label |
| Marketplace | Browse only | List + buy | Priority + API |
| Support | Community | Email | Dedicated |

---

## PHASE 5: ADVANCED FEATURES (Priority: LOW)
**Goal:** Competitive differentiators

### 5.1 AI Enhancements
- [ ] AI room layout suggestions (GPT-4 + floor plan analysis)
- [ ] AI furniture recommendations based on style
- [ ] AI cost optimization suggestions
- [ ] Voice-guided walkthrough (TTS)
- [ ] AI virtual staging from empty room photos

### 5.2 Collaboration
- [ ] Multi-user project editing (real-time)
- [ ] Architect review & annotation
- [ ] Client-architect chat
- [ ] Version history / revision tracking

### 5.3 Builder Integration
- [ ] Builder dashboard (see client projects)
- [ ] Quote system (builders submit quotes)
- [ ] Project handoff (specs → builder)
- [ ] Construction timeline tracking
- [ ] Builder verification & rating

### 5.4 3D Enhancements
- [ ] Gaussian Splatting from drone footage
- [ ] AR mode (view modules on actual terrain via phone)
- [ ] VR walkthrough (WebXR)
- [ ] Time-of-day simulation (sun position)
- [ ] Seasonal rendering (snow, autumn, etc.)

### 5.5 E-Commerce
- [ ] Real product catalog (affiliate partnerships)
- [ ] Direct purchase integration (Stripe)
- [ ] Delivery tracking
- [ ] Installation service booking

### 5.6 Analytics & Reporting
- [ ] User analytics dashboard
- [ ] Popular module combinations
- [ ] Regional pricing insights
- [ ] Market value estimator

---

## PHASE 6: SCALE & MONETIZATION
**Goal:** Revenue generation and growth

### Revenue Streams
1. **SaaS Subscriptions** — Pro/Enterprise tiers
2. **Marketplace Commission** — 2-5% on terrain sales
3. **Builder Referrals** — Fee per project handoff
4. **Product Affiliate** — Commission on furniture/materials
5. **Premium AI Renders** — Per-render pricing for high-quality engines
6. **White-label** — Licensed platform for construction companies
7. **Data Insights** — Anonymized market data for real estate firms

### Infrastructure Scaling
- [ ] CDN for static assets (Vercel Edge)
- [ ] Redis caching for API responses
- [ ] Queue system for AI render jobs
- [ ] WebSocket for real-time collaboration
- [ ] Multi-region deployment

---

## IMPLEMENTATION TIMELINE

### Week 1 (NOW)
- [x] AI render engine system (5 engines)
- [x] Walkthrough quality modes
- [x] Homepage fixes
- [x] Navigation fixes
- [ ] **Presentation Builder page (Step 12)**
- [ ] **PDF generator using @react-pdf/renderer**

### Week 2
- [ ] Land Marketplace page (Step 13)
- [ ] Terrain data model & UI
- [ ] End-to-end flow polish
- [ ] Mobile responsiveness

### Week 3
- [ ] Auth system (NextAuth)
- [ ] Database migration (Prisma + Supabase)
- [ ] User tiers implementation
- [ ] Deploy to Vercel

### Week 4
- [ ] Investor demo preparation
- [ ] Performance optimization
- [ ] Bug fixes & edge cases
- [ ] Documentation

### Month 2-3
- [ ] Builder integration
- [ ] Collaboration features
- [ ] E-commerce (Stripe)
- [ ] Advanced AI features

### Month 4-6
- [ ] Full marketplace launch
- [ ] Mobile app (React Native)
- [ ] AR/VR features
- [ ] International expansion

---

## FILE ARCHITECTURE (Planned)

```
src/
├── app/
│   ├── (app)/project/[id]/
│   │   ├── presentation/page.tsx    ← NEW: Step 12
│   │   └── marketplace/page.tsx     ← NEW: Step 13 (in-wizard)
│   ├── marketplace/page.tsx         ← NEW: Public marketplace
│   └── api/
│       ├── ai-render/engines/       ← Modular AI engines
│       ├── presentation/route.ts    ← PDF generation API
│       └── marketplace/route.ts     ← Terrain CRUD API
├── features/
│   ├── design/                      ← Existing design wizard
│   ├── land/                        ← Existing land selection
│   ├── presentation/                ← NEW: Presentation module
│   │   ├── components/
│   │   │   ├── PresentationPage.tsx
│   │   │   ├── PresentationPreview.tsx
│   │   │   ├── SlideRenderer.tsx
│   │   │   └── PdfGenerator.tsx
│   │   ├── templates/
│   │   │   ├── minimal.ts           ← Clean white (Zaha style)
│   │   │   ├── bold.ts              ← Dark contrast (BIG style)
│   │   │   └── classic.ts           ← Traditional architectural
│   │   └── store.ts
│   └── marketplace/                 ← NEW: Marketplace module
│       ├── components/
│       │   ├── MarketplacePage.tsx
│       │   ├── TerrainCard.tsx
│       │   ├── TerrainDetail.tsx
│       │   ├── TerrainFilters.tsx
│       │   └── SellerDashboard.tsx
│       └── store.ts
```
