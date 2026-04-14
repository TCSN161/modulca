---
id: "de-structural-standards"
title: "Structural Standards and Eurocodes (Germany)"
category: "regulations"
region: "DE"
regionScope: "national"
tags: ["structural", "eurocodes", "din", "loads", "snow", "wind", "germany"]
sources: ["Eurocodes (DIN EN 1990-1999)", "DIN 1055", "DIN EN 1991 + NA", "DIN EN 1995 + NA"]
difficulty: "intermediate"
lastUpdated: "2026-04-14"
proOnly: true
relatedArticles: ["de-building-permit", "de-timber-construction", "eurocodes-overview"]
---

# Structural Standards and Eurocodes (Germany)

## Overview
Germany applies the European Eurocodes for structural design, each supplemented by a National Annex (Nationaler Anhang — NA) that adapts parameters to German conditions. The Eurocodes replaced the older DIN 1055 load standards and DIN 1052 (timber design). All structural calculations for building permits must follow the current Eurocode + NA framework, verified by an independent Prüfingenieur (checking engineer).

## Eurocode Framework in Germany

| Eurocode | DIN EN Number | Title | German NA |
|----------|--------------|-------|-----------|
| EC 0 | DIN EN 1990 | Basis of structural design | DIN EN 1990/NA |
| EC 1 | DIN EN 1991 | Actions on structures (loads) | DIN EN 1991/NA |
| EC 2 | DIN EN 1992 | Concrete structures | DIN EN 1992/NA |
| EC 3 | DIN EN 1993 | Steel structures | DIN EN 1993/NA |
| EC 5 | DIN EN 1995 | Timber structures | DIN EN 1995/NA |
| EC 6 | DIN EN 1996 | Masonry structures | DIN EN 1996/NA |
| EC 7 | DIN EN 1997 | Geotechnical design | DIN EN 1997/NA |
| EC 8 | DIN EN 1998 | Seismic design | DIN EN 1998/NA |

## Load Categories (DIN EN 1991 + NA)

### Dead Loads (Eigenlasten) — DIN EN 1991-1-1
Self-weight of structural and non-structural elements. Values from DIN EN 1991-1-1/NA Table A.1.

| Material | Density (kN/m3) |
|----------|----------------|
| CLT (cross-laminated timber) | 4.5-5.0 |
| Glulam (Brettschichtholz) | 3.7-4.4 |
| Concrete (reinforced) | 25.0 |
| Gypsum fibreboard | 10.0-12.0 |
| Mineral wool insulation | 0.3-1.5 |

### Imposed Loads (Nutzlasten) — DIN EN 1991-1-1

| Category | Use | Characteristic Load (kN/m2) |
|----------|-----|---------------------------|
| A | Residential floors | 1.5 (general), 2.0 (stairs) |
| B | Office areas | 2.0 |
| C | Assembly areas | 3.0-5.0 |
| D | Shopping areas | 4.0-5.0 |
| H | Accessible roofs (maintenance) | 0.75 |

## Snow Load Zones (DIN EN 1991-1-3/NA)

Germany is divided into snow load zones based on geographic location and altitude.

| Zone | Ground Snow Load sk (kN/m2) | Typical Region |
|------|---------------------------|----------------|
| 1 | 0.65 | Northern lowlands (Hamburg, Bremen, Berlin) |
| 1a | 0.81 | Transition zone (Hannover, Leipzig) |
| 2 | 0.85 | Central Germany (Frankfurt, Köln, Dresden) |
| 2a | 1.06 | Foothills (Freiburg, Nürnberg) |
| 3 | 1.10 | Pre-Alpine/mountain areas (Augsburg, Garmisch lower areas) |

For altitudes above the reference level, snow loads increase by a formula:
- sk = sk,0 + (A - A0) x Δs
- Where A = site altitude, A0 = reference altitude of the zone

Alpine and high-altitude regions (>1500m) require individual assessment.

## Wind Load Zones (DIN EN 1991-1-4/NA)

| Zone | Base Velocity Pressure qb,0 (kN/m2) | Typical Region |
|------|-------------------------------------|----------------|
| 1 | 0.32 | Southern inland (Bayern, Baden-Württemberg interior) |
| 2 | 0.39 | Central Germany (most of NRW, Hessen, Thüringen) |
| 3 | 0.47 | Northern lowlands (Niedersachsen, Brandenburg) |
| 4 | 0.56 | Coastal regions (North Sea, Baltic Sea coast) |

Terrain categories further modify the wind pressure:
- Category I: open sea, flat coastal area
- Category II: open terrain with low vegetation
- Category III: suburban areas, forests
- Category IV: urban centers with tall buildings

## Seismic Zones (DIN EN 1998-1/NA)

Germany has low to moderate seismic activity, concentrated in specific regions.

| Zone | Peak Ground Acceleration ag (m/s2) | Regions |
|------|-----------------------------------|---------|
| 0 | < 0.4 | Most of northern and central Germany |
| 1 | 0.4-0.6 | Rheingraben (Köln, Aachen), Schwäbische Alb |
| 2 | 0.6-0.8 | Upper Rheingraben (Freiburg, Karlsruhe area) |
| 3 | > 0.8 | Small areas near Albstadt, Aachen (rare) |

For residential buildings in zones 0-1, seismic design is generally not governing. In zones 2-3, simplified methods under EC8 + NA are usually sufficient for low-rise timber buildings due to the inherent ductility of timber connections.

## Timber Structural Design (DIN EN 1995 + NA)

Key parameters for CLT and timber-frame modular construction:

| Parameter | Value | Reference |
|-----------|-------|-----------|
| Service class 1 (heated interior) | Moisture ≤ 12% | DIN EN 1995-1-1 §2.3.1.3 |
| Service class 2 (sheltered exterior) | Moisture ≤ 20% | DIN EN 1995-1-1 §2.3.1.3 |
| kmod (modification factor, SC1, medium-term) | 0.80 | DIN EN 1995-1-1/NA Table NA.2 |
| Partial safety factor timber γM | 1.3 | DIN EN 1995-1-1/NA |
| CLT characteristic bending strength | 24 N/mm2 (typical) | ETA of manufacturer |
| Glulam GL24h bending strength | 24 N/mm2 | DIN EN 14080 |
| Deflection limit (floor, span/L) | L/250 (quasi-permanent) | DIN EN 1995-1-1/NA |
| Vibration limit (residential floor) | f1 ≥ 8 Hz | DIN EN 1995-1-1 §7.3 |

## Structural Verification Process

| Step | Action | Responsible |
|------|--------|-------------|
| 1 | Determine loads (dead, live, snow, wind) per DIN EN 1991 + NA | Tragwerksplaner |
| 2 | Load combinations per DIN EN 1990 | Tragwerksplaner |
| 3 | Structural analysis and member design per EC2/3/5 + NA | Tragwerksplaner |
| 4 | Connection design (steel plates, screws, dowels) | Tragwerksplaner |
| 5 | Foundation design per EC7 + NA | Tragwerksplaner + Bodengutachter |
| 6 | Independent check by Prüfingenieur | Prüfingenieur (state-appointed) |
| 7 | Prüfbericht (checking report) submitted to Bauamt | Prüfingenieur |

## ModulCA Application
- **Standardized loads**: ModulCA can pre-calculate structural capacity for each module type per snow/wind zone — parametric design
- **CLT sizing by zone**: Wall and roof CLT thickness can be optimized based on the client's location (snow zone 1 vs. 3)
- **Prüfingenieur workflow**: Factory-produced modules with consistent structural properties simplify the independent checking process
- **Vibration design**: CLT floor vibration (f1 ≥ 8 Hz) is critical for residential comfort — ModulCA floor assemblies should be pre-verified
- **Low seismic risk**: Most German sites are zone 0 — seismic design rarely governs for ModulCA single-family homes
- **EC5 + NA compliance**: All ModulCA timber calculations must reference DIN EN 1995-1-1/NA, not the older DIN 1052

## References
- DIN EN 1990 to DIN EN 1998 + National Annexes — Eurocode framework
- Muster-Verwaltungsvorschrift Technische Baubestimmungen (MVV TB) — Technical building regulations
- DIN EN 14080 — Glulam specification
- DIN EN 16351 — CLT specification
