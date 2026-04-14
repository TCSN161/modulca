---
id: "fr-structural"
title: "Structural Standards — Eurocodes (France)"
category: "regulations"
region: "FR"
regionScope: "national"
tags: ["structure", "eurocodes", "france", "seismic", "snow", "wind", "NF-EN"]
sources: ["NF EN 1990 to NF EN 1999", "Arrêté du 22 octobre 2010", "Annexes Nationales françaises"]
difficulty: "intermediate"
lastUpdated: "2026-04-14"
proOnly: true
relatedArticles: ["fr-building-permit", "fr-seismic", "eurocodes-overview", "fr-fire-safety"]
---

# Structural Standards — Eurocodes (France)

## Overview
France applies the European Eurocodes (NF EN 1990 through NF EN 1999) as its primary structural design framework, supplemented by French National Annexes (Annexes Nationales, AN) that define country-specific parameters such as climatic loads, seismic zones, and safety factors. All structural calculations for new buildings, including modular and timber construction, must comply with these standards.

## Eurocode Framework Applied in France

| Eurocode | NF EN Standard | Scope |
|----------|---------------|-------|
| EC0 | NF EN 1990 | Basis of structural design, load combinations |
| EC1 | NF EN 1991 | Actions on structures (wind, snow, imposed loads) |
| EC2 | NF EN 1992 | Concrete structures |
| EC3 | NF EN 1993 | Steel structures |
| EC4 | NF EN 1994 | Composite steel-concrete structures |
| EC5 | NF EN 1995 | **Timber structures** (key for ModulCA) |
| EC6 | NF EN 1996 | Masonry structures |
| EC7 | NF EN 1997 | Geotechnical design |
| EC8 | NF EN 1998 | Seismic design |
| EC9 | NF EN 1999 | Aluminium structures |

## French National Annex Parameters

The Annexes Nationales adapt Eurocode parameters to French conditions. Key values include:

### Wind Regions (NF EN 1991-1-4/NA)

| Region | Base Wind Speed (Vb,0) | Typical Areas |
|--------|----------------------|---------------|
| 1 | 22 m/s | Interior, sheltered valleys |
| 2 | 24 m/s | Central France, Paris region |
| 3 | 26 m/s | Atlantic coast, Rhône valley |
| 4 | 28 m/s | Mediterranean coast, exposed Atlantic |

### Snow Regions (NF EN 1991-1-3/NA)

| Region | Characteristic Snow Load (sk) at sea level | Typical Areas |
|--------|-------------------------------------------|---------------|
| A1 | 0.45 kN/m² | Mediterranean coast, Corsica lowlands |
| A2 | 0.45 kN/m² | Atlantic coast, southwest |
| B1 | 0.55 kN/m² | Northern France, Paris |
| B2 | 0.55 kN/m² | Eastern plains |
| C1 | 0.65 kN/m² | Central highlands |
| C2 | 0.65 kN/m² | Pre-Alps, Jura lowlands |
| D | 0.90 kN/m² | Alps, Pyrenees foothills |
| E | 1.40 kN/m² | High Alps, high Pyrenees |

Altitude correction: snow load increases with elevation using formulas in the National Annex.

### Seismic Zones (See also fr-seismic)

| Zone | Seismicity Level | Areas |
|------|-----------------|-------|
| 1 | Very low | Central basins |
| 2 | Low | Northern France, Paris |
| 3 | Moderate | Rhône valley, Alsace |
| 4 | Medium | Southern Alps, Pyrenees |
| 5 | High | Antilles (Guadeloupe, Martinique) |

## Eurocode 5 — Timber (NF EN 1995)

Critical for modular timber construction:

| Parameter | French AN Value | Notes |
|-----------|----------------|-------|
| kmod (service class 1, medium-term) | 0.80 | Modification factor for load duration |
| Partial safety factor γM (GLT) | 1.25 | Glued laminated timber |
| Partial safety factor γM (CLT) | 1.25 | Cross-laminated timber |
| Serviceability deflection limit | L/300 (floors), L/200 (roofs) | National Annex values |
| Fire design method | Reduced cross-section (charring) | Charring rate 0.65 mm/min for CLT |

## Load Combinations (NF EN 1990/NA)

| Combination Type | Expression | Use |
|-----------------|------------|-----|
| ULS fundamental | 1.35 Gk + 1.5 Qk,1 + 1.5 Σψ0,i Qk,i | Strength verification |
| SLS characteristic | Gk + Qk,1 + Σψ0,i Qk,i | Irreversible serviceability |
| SLS quasi-permanent | Gk + Σψ2,i Qk,i | Long-term deflection |
| Seismic | Gk + AEd + Σψ2,i Qk,i | Earthquake combination |

## Key Imposed Loads (NF EN 1991-1-1/NA)

| Category | Load | Application |
|----------|------|-------------|
| A — Residential | 1.5 kN/m² | Floors, habitable rooms |
| A — Residential stairs | 2.5 kN/m² | Stairs and landings |
| A — Balconies | 3.5 kN/m² | Accessible balconies |
| H — Roofs (not accessible) | 0.8 kN/m² | Maintenance only |

## Structural Control Requirements

| Building Type | Bureau de Contrôle Required? | Notes |
|--------------|----------------------------|-------|
| Individual house (1ère famille) | Not mandatory (but recommended) | Structural engineer provides notes de calcul |
| Multi-family (2ème famille+) | Mandatory (mission L) | Contrôleur technique agréé |
| ERP (public buildings) | Mandatory (mission L + S + SH) | Extended missions |

## ModulCA Application
- **EC5 compliance**: All CLT module structural design follows NF EN 1995 with French National Annex parameters
- **Factory precision**: Structural connections designed and fabricated with tight tolerances, exceeding site-built quality
- **Wind/snow adaptable**: Module roof and wall designs parametrically adjusted per wind and snow region
- **Transport loads**: Modules must also be designed for transport stresses (lifting, road vibration) — not covered by Eurocodes but addressed in factory QA
- **Notes de calcul**: Structural calculations provided with each project by bureau d'études structure

## References
- NF EN 1990 to NF EN 1999 — Eurocodes with French National Annexes
- Arrêté du 22 octobre 2010 — Classification and rules for seismic construction
- AFNOR — French standardization body publishing NF EN standards
