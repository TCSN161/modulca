---
id: "modulca-platform"
title: "ModulCA Platform Overview"
category: "modulca"
tags: ["modulca", "platform", "overview", "features", "modular-home"]
sources: ["ModulCA Internal Documentation"]
difficulty: "beginner"
lastUpdated: "2026-04-11"
proOnly: false
relatedArticles: ["modulca-13-steps", "modulca-module-system", "modulca-pricing"]
---

# ModulCA Platform Overview

## What is ModulCA?
ModulCA is a digital platform for designing modular homes from standardized 3×3m modules. It guides clients from land selection through to final presentation in 13 steps, combining architectural expertise with an intuitive design tool.

## Who is ModulCA For?
- **Homeowners** who want to design their own modular home
- **Architects** who want to use modular construction for their projects
- **Investors** looking at modular housing developments
- **Builders** who want to offer modular home packages

## Platform Features

| Feature | Description | Available To |
|---------|-------------|-------------|
| 13-Step Design Flow | Guided process from land to presentation | All users |
| Neufert AI Consultant | Expert architectural advice based on Neufert standards | All users |
| 2D Layout Designer | Drag-and-drop module placement on grid | All users |
| 3D Visualization | Interactive 3D walkthrough of your design | All users |
| AI Renders | Photorealistic exterior renders in chosen style | Premium+ |
| Technical Drawings | Floor plans, sections, elevations, MEP layouts | Premium+ |
| Knowledge Base Library | Comprehensive architecture & regulation reference | Premium+ |
| PDF Presentation | Professional project presentation for permits/quotes | Architect tier |
| Product Marketplace | Browse and select finishes, fixtures, furniture | All users |
| Project Saving | Save and resume projects with Supabase cloud storage | Registered users |

## Technology
- Built with Next.js, React, TypeScript
- 3D visualization: Three.js + React Three Fiber
- Maps: Leaflet + OpenStreetMap
- AI: Multi-provider fallback (Groq, Together, Pollinations)
- Backend: Supabase (auth + PostgreSQL)
- Works offline with localStorage demo mode

## The ModulCA Vision
Every home should be well-designed, sustainable, and affordable. Modular construction makes this possible by combining factory precision with architectural flexibility. ModulCA puts professional design tools in everyone's hands.

## Target Markets
- 🇷🇴 **Romania** (active) — primary market, Romanian building regulations
- 🇳🇱 **Netherlands** (expansion) — next market, Dutch building regulations
- 🇪🇺 **EU expansion** — Germany, France, Belgium planned
