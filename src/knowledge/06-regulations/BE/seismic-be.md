---
id: "be-seismic"
title: "Seismic Design Requirements (Belgium)"
category: "regulations"
region: "BE"
regionScope: "national"
tags: ["seismic", "belgium", "eurocode-8", "earthquake", "low-seismicity", "modular"]
sources: ["NBN EN 1998", "Belgian National Annex to EN 1998-1"]
difficulty: "intermediate"
lastUpdated: "2026-04-14"
proOnly: true
relatedArticles: ["be-structural", "be-building-permit", "eurocodes-overview", "modular-principles"]
---

# Seismic Design Requirements (Belgium)

## Overview

Belgium is a low-seismicity country, but it is not seismically inactive. Historical earthquakes have caused damage, notably the 1692 Verviers earthquake (estimated magnitude 6.0) and the 1983 Liege earthquake (magnitude 4.9). Eurocode 8 (NBN EN 1998) applies in Belgium, with the Belgian National Annex defining seismic zones, importance classes, and the option for simplified rules for low-rise residential buildings. For most modular housing projects, seismic design is straightforward but cannot be ignored.

## Belgian Seismic Zones

The Belgian National Annex to EN 1998-1 divides the country into seismic zones based on the reference peak ground acceleration (agR) on rock:

| Zone | agR (m/s²) | ag (= gamma_I x agR) | Regions Affected |
|------|-----------|----------------------|------------------|
| Zone 0 | 0.00 | 0.00 | Most of West Flanders, parts of East Flanders |
| Zone 1 | 0.04 g (0.39 m/s²) | 0.039-0.059 | Antwerp, Brabant, parts of Hainaut, Namur |
| Zone 2 | 0.06 g (0.59 m/s²) | 0.059-0.071 | East Belgium, parts of Liege province |
| Zone 3 | 0.08 g (0.78 m/s²) | 0.078-0.096 | Liege region, Eupen-Malmedy, Verviers |
| Zone 4 | 0.10 g (0.98 m/s²) | 0.098-0.120 | Immediate Liege area, Haspengouw fault zone |

Note: Zone 0 requires no seismic design. Zones 1-4 require increasing levels of consideration.

## Importance Classes

| Class | gamma_I | Building Type |
|-------|---------|---------------|
| I | 0.8 | Agricultural, temporary |
| II | 1.0 | Ordinary residential, offices |
| III | 1.2 | Schools, assembly halls |
| IV | 1.4 | Hospitals, emergency services |

Most modular residential buildings are Importance Class II (gamma_I = 1.0).

## Ground Types

The Belgian NA uses the standard Eurocode 8 ground types:

| Ground Type | Description | vs,30 (m/s) | Soil Factor S |
|-------------|-------------|-------------|---------------|
| A | Rock | > 800 | 1.0 |
| B | Dense sand/gravel, stiff clay | 360-800 | 1.2 |
| C | Medium-dense sand, firm clay | 180-360 | 1.15 |
| D | Loose sand, soft clay | < 180 | 1.35 |
| E | Shallow soft layer over rock | — | 1.4 |

Most Belgian residential sites fall on ground types B, C, or D. The alluvial soils in the Meuse valley (where seismicity is highest) are typically type C or D, which amplifies ground motion.

## When Is Seismic Design Required?

| Condition | Seismic Design Required? |
|-----------|-------------------------|
| Zone 0 (West Flanders) | No |
| Zone 1-4, ag x S < 0.05 g | Simplified rules may apply (see below) |
| Zone 1-4, regular low-rise (< 3 floors) | Simplified rules per Belgian NA |
| Zone 1-4, irregular or > 3 floors | Full EN 1998 analysis |

## Simplified Rules for Low-Rise Residential

The Belgian National Annex allows simplified seismic design for buildings meeting ALL of these criteria:

| Criterion | Requirement |
|-----------|------------|
| Number of floors | Maximum 3 above ground |
| Structural regularity | Regular in plan and elevation |
| Wall density | Minimum shear wall area per direction (see below) |
| Foundation | Continuous strip or raft foundation |
| Soil conditions | Not ground type D with ag x S > 0.06 g |

### Minimum Wall Requirements (Simplified Method)

For masonry or timber-frame buildings in zones 1-3, the simplified approach requires minimum wall lengths in each direction:

| Condition | Minimum Wall Length (each direction) |
|-----------|-------------------------------------|
| Zone 1, 2 floors | 3% of floor area as shear walls |
| Zone 2, 2 floors | 4% of floor area as shear walls |
| Zone 3, 2 floors | 5% of floor area as shear walls |
| Zone 4 | Full calculation required |

For timber-frame modular construction, the sheathed wall panels (OSB or plywood on timber studs) act as shear walls and typically provide sufficient lateral resistance.

## Behaviour Factors (q)

For full Eurocode 8 analysis, the behaviour factor reduces seismic forces:

| Structural System | q Factor |
|-------------------|----------|
| Unreinforced masonry | 1.5 |
| Confined masonry | 2.0-2.5 |
| Timber frame (nailed sheathing) | 3.0-4.0 |
| CLT (panel system) | 2.0-3.0 |
| Steel moment frame | 4.0-6.5 |
| Steel braced frame | 2.0-4.0 |
| Hybrid (steel + timber) | 2.0-3.0 (conservative) |

Timber-frame and CLT modular systems benefit from relatively favourable behaviour factors due to the ductility of nailed and screwed connections.

## Design Considerations for Modular

### Connection Design

Module-to-module and module-to-foundation connections are the critical seismic elements:

| Connection Type | Seismic Function | Design Approach |
|-----------------|-----------------|-----------------|
| Module-to-foundation (hold-down) | Resist overturning | Anchor bolts or post-installed anchors, designed for seismic tension + shear |
| Module-to-module vertical (stacking) | Transfer horizontal forces between floors | Bolted connections through steel brackets |
| Module-to-module horizontal (side-by-side) | Ensure diaphragm action | Bolted or welded connections along module edges |
| Floor diaphragm | Distribute horizontal forces to walls | Plywood/OSB sheathing nailed to joists |

### Regularity

Modular buildings are inherently regular due to standardised module dimensions:

| Regularity Criterion | Modular Advantage |
|----------------------|-------------------|
| Plan regularity | Modules are rectangular, symmetric layouts are natural |
| Elevation regularity | Stacked modules maintain consistent stiffness per floor |
| Mass distribution | Identical modules have predictable mass distribution |
| Stiffness distribution | Repetitive wall layouts ensure balanced lateral resistance |

## Practical Implications by Zone

| Zone | Practical Impact on Modular Design |
|------|-----------------------------------|
| Zone 0 | No seismic requirements — standard design |
| Zone 1 | Minimal impact — standard connections with basic hold-downs sufficient |
| Zone 2 | Light-duty seismic connections; simplified rules usually apply for 1-3 floor modular |
| Zone 3 | Moderate connections; ensure shear wall density meets minimum; engineering calculation recommended |
| Zone 4 | Full seismic analysis by structural engineer; heavier connections and hold-downs |

## Seismic vs. Wind: Which Governs?

For most locations in Belgium, wind loads govern the lateral design rather than seismic loads:

| Location | Wind Force (approx. base shear) | Seismic Force (approx. base shear) | Governing |
|----------|---------------------------------|------------------------------------|-----------|
| Ostend (Zone 0) | High (coastal wind) | None | Wind |
| Antwerp (Zone 1) | Moderate | Very low | Wind |
| Brussels (Zone 1) | Moderate | Very low | Wind |
| Liege (Zone 3-4) | Moderate | Low-moderate | Often wind, but check seismic |
| Eupen (Zone 3) | Moderate | Low-moderate | Check both |

In practice, a modular building designed for Belgian wind loads (vb,0 = 26 m/s) will often satisfy seismic requirements in zones 1-2 without additional measures.

## ModulCA Application

- **Zone mapping**: Include seismic zone lookup in the site feasibility tool based on municipality
- **Standard connections**: Design base connection detail for zones 0-2 (covers most of Belgium)
- **Enhanced connections**: Design upgraded connection detail for zones 3-4 (Liege region)
- **Regularity by design**: Modular grid layouts naturally satisfy regularity criteria
- **Wind typically governs**: For most Belgian locations, wind design provides adequate seismic resistance
- **Liege market**: If targeting eastern Belgium, ensure structural engineer reviews seismic design

## References

- NBN EN 1998-1 + ANB — Eurocode 8: Design of structures for earthquake resistance (General rules)
- Belgian National Annex to EN 1998-1 — Seismic zones, NDPs, simplified rules
- NBN EN 1998-5 + ANB — Eurocode 8: Foundations, retaining structures, geotechnical aspects
- ROB/ORB (Royal Observatory of Belgium) — Seismic monitoring and hazard maps
- NBN EN 1995-1-1 + ANB — Eurocode 5: Timber structures (lateral resistance)
