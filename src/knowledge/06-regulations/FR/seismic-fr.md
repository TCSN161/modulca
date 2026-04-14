---
id: "fr-seismic"
title: "Seismic Regulations (France)"
category: "regulations"
region: "FR"
regionScope: "national"
tags: ["seismic", "earthquake", "france", "eurocode-8", "PS-MI", "timber", "zones"]
sources: ["Décret n° 2010-1254 du 22 octobre 2010", "Arrêté du 22 octobre 2010", "NF EN 1998 (Eurocode 8)", "Guide PS-MI (2014)"]
difficulty: "intermediate"
lastUpdated: "2026-04-14"
proOnly: true
relatedArticles: ["fr-structural", "fr-building-permit", "eurocodes-overview", "fr-modular-prefab"]
---

# Seismic Regulations (France)

## Overview
France's seismic regulations, reformed in 2010, classify the entire national territory into five seismic zones and impose construction requirements based on zone, building category, and soil conditions. The rules are based on Eurocode 8 (NF EN 1998) with the French National Annex. For individual houses, simplified rules (PS-MI) offer an alternative to full Eurocode 8 calculations in zones 2, 3, and 4.

## Regulatory Framework

| Text | Content |
|------|---------|
| Décret n° 2010-1254 (22 Oct 2010) | Seismic zoning of French territory |
| Arrêté du 22 octobre 2010 | Construction rules per zone and building category |
| NF EN 1998-1 (Eurocode 8) | General seismic design rules |
| NF EN 1998-1/NA | French National Annex to EC8 |
| Guide PS-MI (DHUP, 2014 revision) | Simplified rules for individual houses |
| NF EN 1998-5 | Foundations and retaining structures |

## Seismic Zones

| Zone | Seismicity Level | Peak Ground Acceleration (agr) | Regions |
|------|-----------------|-------------------------------|---------|
| 1 | Very low | — | Central/western France (Bassin Parisien interior, Bretagne) |
| 2 | Low | 0.7 m/s² | Île-de-France, northern France, most of Normandy |
| 3 | Moderate | 1.1 m/s² | Alsace, Rhône valley, Auvergne, Provence interior |
| 4 | Medium | 1.6 m/s² | Southern Alps, Pyrenees, Nice-Côte d'Azur, Alsace south |
| 5 | High | 3.0 m/s² | Antilles (Guadeloupe, Martinique, Saint-Martin) |

Note: Over 21,000 communes are classified. Check zone assignment at georisques.gouv.fr or préfecture websites.

## Building Importance Categories

| Category | Description | Examples |
|----------|-----------|---------|
| I | Negligible risk to life | Agricultural sheds, temporary structures |
| II | Standard risk | Residential housing, offices, shops |
| III | High occupancy / public | Schools, hospitals, stadiums |
| IV | Essential for civil protection | Fire stations, emergency command, nuclear facilities |

ModulCA homes fall in Category II (standard residential).

## Importance Factor (γI)

| Category | Zone 2 | Zone 3 | Zone 4 | Zone 5 |
|----------|--------|--------|--------|--------|
| I | — | — | — | 0.80 |
| II | 1.00 | 1.00 | 1.00 | 1.00 |
| III | 1.20 | 1.20 | 1.20 | 1.20 |
| IV | 1.40 | 1.40 | 1.40 | 1.40 |

## When Seismic Rules Apply

| Zone | Category I | Category II | Category III | Category IV |
|------|-----------|-------------|-------------|-------------|
| 1 | No | No | No | No |
| 2 | No | No | Yes | Yes |
| 3 | No | Yes | Yes | Yes |
| 4 | No | Yes | Yes | Yes |
| 5 | Yes | Yes | Yes | Yes |

For residential (Cat. II): seismic design is required in zones 3, 4, and 5.

## Soil Classification (NF EN 1998-1)

| Soil Class | Description | Vs,30 (m/s) | Amplification Factor (S) |
|-----------|-------------|-------------|-------------------------|
| A | Rock, hard soil | > 800 | 1.0 |
| B | Dense sand, gravel, stiff clay | 360-800 | 1.20 (zone 4) |
| C | Medium-dense sand, medium clay | 180-360 | 1.15-1.35 |
| D | Loose sand, soft clay | < 180 | 1.35-1.60 |
| E | Thin soft layer over rock | — | 1.40-1.80 |

Soil class determines the ground acceleration amplification — soft soils amplify seismic waves significantly.

## Design Approaches

### Full Eurocode 8 (NF EN 1998-1)

Required for:
- Multi-family buildings in zones 3-5
- Non-standard structures
- Buildings > 2 floors in zones 4-5

| Parameter | Value for Timber (DCM, ductility class) |
|-----------|----------------------------------------|
| Behaviour factor q (timber frame, braced) | 2.0-3.0 |
| Behaviour factor q (CLT walls) | 2.0 |
| Drift limit (damage limitation) | 0.75% of storey height (brittle partitions) |
| Drift limit (ductile partitions) | 1.0% of storey height |
| Foundation requirements | Rigid raft or tied strip foundations |

### Simplified Rules — PS-MI

For individual houses (maisons individuelles) meeting all conditions:

| Condition | Limit |
|-----------|-------|
| Building type | Individual house or assimilated |
| Max floors | R+1 (ground + 1) without inhabited attic, or R+1+combles |
| Max floor area | 400 m² per level |
| Regularity | Approximately regular in plan and elevation |
| Soil class | A, B, C, or D (not E or special soils) |
| Zone applicability | Zones 2, 3, and 4 only (not zone 5) |

### PS-MI Simplified Requirements for Timber

| Element | Zone 2 | Zone 3 | Zone 4 |
|---------|--------|--------|--------|
| Bracing walls (min length per facade) | L ≥ 25% of facade length | L ≥ 25% | L ≥ 33% |
| Anchor bolts (sill plate to foundation) | Every 1.30m | Every 1.00m | Every 0.80m |
| Hold-downs at bracing wall ends | Recommended | Required | Required |
| Foundation continuity | Continuous strip | Continuous strip | Continuous strip or raft |
| Diaphragm (floor/roof) | Structural panel (min 15mm OSB or plywood) | Min 18mm | Min 18mm |
| Connection specification | EN 14592 connectors | Calculated or PS-MI tables | Calculated or PS-MI tables |

## CLT-Specific Seismic Considerations

| Aspect | Requirement / Good Practice |
|--------|---------------------------|
| Wall panel connections | Angular brackets and hold-downs per EC8 or PS-MI |
| Panel-to-panel vertical joint | Designed for shear transfer (lap joint, plywood spline, or steel connector) |
| Panel-to-foundation | Hold-down anchors at each end, shear anchors along base |
| Ductility source | Connections provide ductility, NOT the CLT panels themselves |
| Overstrength | CLT panels designed with overstrength vs. connection capacity |
| Openings | Lintel and sill reinforcement; reduced shear capacity per opening ratio |

## Seismic Risk Maps and Tools

| Resource | URL | Purpose |
|----------|-----|---------|
| Géorisques | georisques.gouv.fr | Check commune seismic zone |
| SisFrance (BRGM) | sisfrance.net | Historical earthquake database |
| Plan Séisme | planseisme.fr | Government seismic risk portal |
| Eurocode tools | eurocodes.jrc.ec.europa.eu | Eurocode calculation aids |

## Comparison with Other Countries

| Aspect | France | Germany | Italy | Romania |
|--------|--------|---------|-------|---------|
| Max zone PGA | 3.0 m/s² (zone 5, Antilles) | 0.8 m/s² (zone 3) | 3.5 m/s² (zone 1) | 4.0 m/s² (Vrancea) |
| Simplified rules | PS-MI | Vereinfachtes Verfahren (EC8-1 4.3.5) | NTC simplified | P100 simplified |
| Timber behaviour factor q | 2.0-3.0 | 2.0-3.0 | 2.0-3.0 | 2.0-3.0 |
| Residential obligation | Zone 3+ (Cat. II) | Zone 1+ (all) | Entire territory | Entire territory |

## ModulCA Application
- **PS-MI eligible**: ModulCA single-family homes (≤ R+1, regular plan) qualify for PS-MI simplified rules in zones 2-4
- **CLT shear walls**: Factory-installed angular brackets and hold-downs meet PS-MI bracing requirements
- **Connection ductility**: Proprietary connector system designed as the ductile fuse — CLT panels remain elastic
- **Zone-adaptive design**: Module connection kits vary by seismic zone (more anchors/hold-downs for zone 4)
- **Foundation coordination**: ModulCA provides seismic foundation specifications per zone and soil class
- **Metropolitan France low risk**: Most of metropolitan France is zone 1-2 — many ModulCA projects require no seismic design
- **Zone 3-4 ready**: For Rhône valley, Alps, Pyrenees, and Provence projects, seismic kit is standard option

## References
- Décret n° 2010-1254 du 22 octobre 2010 — Seismic zoning
- Arrêté du 22 octobre 2010 — Seismic construction rules
- NF EN 1998-1 + French National Annex — Eurocode 8
- Guide PS-MI (DHUP, 2014) — Simplified seismic rules for individual houses
- Planseisme.fr — French government seismic risk portal
