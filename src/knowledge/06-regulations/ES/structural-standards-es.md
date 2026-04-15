---
id: "es-structural"
title: "Structural Standards & Eurocode (Spain)"
category: "regulations"
region: "ES"
regionScope: "national"
tags: ["structural", "eurocode", "spain", "CTE-DB-SE", "loads", "snow", "wind"]
sources: ["CTE DB-SE", "Eurocode — Spanish National Annex"]
difficulty: "advanced"
lastUpdated: "2026-04-15"
proOnly: true
relatedArticles: ["eu-eurocodes-overview", "es-seismic"]
---

# Structural Standards — Spain

## Overview

Structural design in Spain follows **CTE DB-SE** (Seguridad Estructural) and Eurocodes with **Spanish National Annexes**. Spain is transitioning fully to Eurocodes, with national annexes providing locally calibrated parameters.

## Key Documents

| Code | Scope |
|------|-------|
| CTE DB-SE | General structural safety |
| CTE DB-SE-AE | Actions (loads) on structures |
| CTE DB-SE-M | Timber structures |
| CTE DB-SE-A | Steel structures |
| CTE DB-SE-F | Masonry structures |
| CTE DB-SE-C | Foundations & geotechnics |
| NCSE-02 | Seismic (see separate article) |

## Design Loads (DB-SE-AE)

### Snow Loads by Altitude (kN/m²)
| Altitude | Zone 1 (North) | Zone 2 (Central) | Zone 3 (Mediterranean) |
|----------|---------------|------------------|----------------------|
| 0–200m | 0.3 | 0.4 | 0.2 |
| 400m | 0.5 | 0.6 | 0.3 |
| 800m | 1.0 | 1.2 | 0.6 |
| 1000m | 1.5 | 1.8 | 0.9 |

### Wind Loads
- **Basic wind speed**: 26–29 m/s (zone A–C)
- **Design wind pressure**: Varies by zone, height, exposure
- Zone A (central): 26 m/s — most inland areas
- Zone B (Galicia, Strait): 27 m/s
- Zone C (coastal, Canary Islands): 29 m/s

### Residential Live Loads
- **Residential rooms**: 2.0 kN/m²
- **Balconies**: 3.0 kN/m²
- **Stairs**: 3.0 kN/m²
- **Accessible roof**: 1.0 kN/m² (maintenance only)

## Timber (DB-SE-M) — Relevant for ModulCA CLT

- Design based on Eurocode 5 with Spanish national parameters
- Service class: Usually Class 1 (interior) or Class 2 (sheltered exterior)
- CLT characteristic bending strength: Typically C24 or better
- Modification factor kmod: 0.60 (permanent) to 0.90 (short-term)
- Connection design: EN 1995-1-1 with Spanish annex parameters

## ModulCA Application

ModulCA's structural design for Spain considers:
- **Seismic**: NCSE-02 applies across most of Spain (see seismic article)
- **Wind**: Coastal sites (Mediterranean, Atlantic) need enhanced connections
- **Snow**: Mountain/meseta locations above 600m need reinforced roof modules
- **Foundation**: Varies dramatically — from rock in meseta to expansive clay in river valleys
