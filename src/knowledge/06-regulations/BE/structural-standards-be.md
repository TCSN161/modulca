---
id: "be-structural"
title: "Structural Standards & Eurocodes (Belgium)"
category: "regulations"
region: "BE"
regionScope: "national"
tags: ["structural", "belgium", "eurocodes", "NBN-EN", "wind", "snow", "timber"]
sources: ["NBN EN 1990-1999", "Bureau de Normalisation (NBN)", "Belgian National Annexes"]
difficulty: "intermediate"
lastUpdated: "2026-04-14"
proOnly: true
relatedArticles: ["be-building-permit", "be-seismic", "eurocodes-overview", "modular-principles"]
---

# Structural Standards & Eurocodes (Belgium)

## Overview

Belgium applies the European Eurocodes (EN 1990 through EN 1999) as its primary structural design standards, implemented through the Bureau for Normalisation (NBN) as the NBN EN series. Each Eurocode is accompanied by a Belgian National Annex (ANB / Nationale Bijlage) that specifies nationally determined parameters (NDPs) such as safety factors, climatic loads, and combination rules. For modular construction, the relevant codes cover actions on structures, timber design, steel design, and foundations.

## Eurocode Overview for Residential Buildings

| Eurocode | NBN Reference | Subject | Relevance to Modular |
|----------|---------------|---------|---------------------|
| EN 1990 | NBN EN 1990 + ANB | Basis of structural design | Load combinations, safety factors |
| EN 1991-1-1 | NBN EN 1991-1-1 + ANB | Permanent and imposed loads | Floor loads, partition loads |
| EN 1991-1-3 | NBN EN 1991-1-3 + ANB | Snow loads | Roof design |
| EN 1991-1-4 | NBN EN 1991-1-4 + ANB | Wind loads | Facade, stability |
| EN 1993 | NBN EN 1993 + ANB | Steel structures | Steel-frame modules |
| EN 1995 | NBN EN 1995 + ANB | Timber structures | CLT, timber-frame modules |
| EN 1997 | NBN EN 1997 + ANB | Geotechnical design | Foundations |
| EN 1998 | NBN EN 1998 + ANB | Seismic design | Low seismicity (see seismic article) |

## Belgian Wind Load Zones

The Belgian National Annex to EN 1991-1-4 defines wind parameters:

| Parameter | Value |
|-----------|-------|
| Fundamental basic wind velocity (vb,0) | 26 m/s (most of Belgium) |
| Coastal zone (within ~5 km of coast) | Up to 27 m/s |
| Terrain categories | 0 (sea), I (open), II (suburban), III (urban), IV (city centre) |
| Direction factor (cdir) | 1.0 (all directions) |
| Season factor (cseason) | 1.0 |

Most residential modular projects in Belgium fall under terrain category II or III. The reference wind pressure at 10 m height in category II is approximately 0.71 kN/m².

## Belgian Snow Load Zones

Belgium has a relatively simple snow load map:

| Zone | Region | Ground snow load sk (kN/m²) |
|------|--------|---------------------------|
| Zone 1 | Low-lying areas (most of Flanders, Brussels) | 0.50 |
| Zone 2 | Transitional areas (Brabant, Limburg hills) | 0.60-0.80 |
| Zone 3 | Ardennes (high ground, Wallonia) | 0.80-1.20 |
| Hautes Fagnes | Highest plateau (~700 m) | Up to 1.60 |

The exposure coefficient Ce and thermal coefficient Ct are defined in the ANB. For most standard pitched roofs, Ce = 1.0 and Ct = 1.0.

## Imposed Loads for Residential Use

Per NBN EN 1991-1-1 and the Belgian National Annex:

| Category | Use | qk (kN/m²) | Qk (kN) |
|----------|-----|------------|---------|
| A | Residential floors | 2.0 | 2.0 |
| A | Residential stairs | 2.5 | 2.0 |
| A | Residential balconies | 3.0 | 2.0 |
| H | Roofs (not accessible) | 0.4 | 1.0 |
| — | Partition surcharge | 0.8 (light) / 1.2 (heavy) | — |

## Safety Factors (Belgian ANB)

| Limit State | Permanent (gamma_G) | Variable (gamma_Q) | Combination (psi_0) |
|-------------|--------------------|--------------------|---------------------|
| ULS (STR) | 1.35 (unfavourable) / 1.00 (favourable) | 1.50 | 0.7 (imposed) / 0.5 (snow) / 0.6 (wind) |
| SLS (characteristic) | 1.00 | 1.00 | 0.7 / 0.5 / 0.6 |

## Timber Design (NBN EN 1995)

For CLT and timber-frame modular structures:

| Parameter | Belgian ANB Value |
|-----------|------------------|
| Partial factor gamma_M (solid timber) | 1.30 |
| Partial factor gamma_M (glulam) | 1.25 |
| Partial factor gamma_M (CLT) | 1.25 |
| Service class (interior, heated) | 1 |
| Service class (sheltered exterior) | 2 |
| kmod (permanent, class 1) | 0.60 |
| kmod (medium-term, class 1) | 0.80 |

## Foundation Design (NBN EN 1997)

Belgian geotechnical practice requires:

- **Soil investigation**: Mandatory in Flanders (grondverzet/bodemsaneringsdeskundige); recommended elsewhere
- **Typical foundations**: Strip footings or raft slabs for low-rise residential
- **Frost depth**: Minimum 60 cm below ground level (80 cm in Ardennes)
- **Bearing capacity**: Varies widely; sandy soils in Flanders (100-200 kPa), clay in Polders (50-100 kPa), rock in Ardennes (>300 kPa)
- **Water table**: Often high in Flanders — waterproof basements or elevated foundations may be needed

## Design Approach for Modular

| Aspect | Consideration |
|--------|--------------|
| Transport loads | Modules must be designed for lifting and transport stresses (not covered by Eurocodes — use manufacturer data) |
| Connection design | Module-to-module and module-to-foundation connections: designed per EN 1993 (steel) or EN 1995 (timber) |
| Robustness | EN 1991-1-7 (accidental actions): progressive collapse prevention, especially for stacked modules |
| Tolerances | Factory production allows tighter tolerances than site-built; document in design specification |
| Temporary stability | Modules must be stable during placement before connections are completed |

## Professional Requirements

- **Structural engineer (stabiliteitsingenieur)**: Not legally required by title, but the architect or a qualified engineer must sign off on structural calculations
- **Geotechnical report**: Strongly recommended and often required by insurers
- **Decennial liability (tienjarige aansprakelijkheid)**: Structural design carries 10-year liability under Belgian law (Art. 1792 Civil Code)

## ModulCA Application

- **Factory precision**: Structural connections can be fabricated to tight tolerances, improving reliability
- **Wind bracing**: Critical for lightweight modular structures in Belgium's 26 m/s wind zone; ensure adequate bracing in both directions
- **Snow loads**: Standard modular roof designs handle 0.50-0.80 kN/m² easily; Ardennes projects require upgraded roof framing
- **Stacking loads**: Multi-storey modular must account for cumulative loads through load path analysis
- **Transport design case**: Often the governing load case for module structural sizing

## References

- NBN EN 1990 + ANB — Basis of structural design
- NBN EN 1991 series + ANBs — Actions on structures
- NBN EN 1993 + ANB — Design of steel structures
- NBN EN 1995 + ANB — Design of timber structures
- NBN EN 1997 + ANB — Geotechnical design
- Bureau voor Normalisatie (NBN) — www.nbn.be
