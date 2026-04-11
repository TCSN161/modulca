---
id: "es-seismic"
title: "Seismic Design (Spain)"
category: "regulations"
region: "ES"
regionScope: "national"
tags: ["seismic", "earthquake", "spain", "ncse", "cte-se", "structural"]
sources: ["CTE DB-SE-AE", "NCSE-02 → Eurocode 8 + NA"]
difficulty: "advanced"
lastUpdated: "2026-04-11"
proOnly: false
relatedArticles: ["es-building-permit", "ro-seismic-p100", "eurocodes-overview"]
---

# Seismic Design (Spain)

## Overview
Spain has moderate seismic risk concentrated in the southeast (Murcia, Almería, Granada) and the Pyrenees. The traditional NCSE-02 seismic code is being replaced by Eurocode 8 with the Spanish National Annex. Light timber construction performs well in seismic zones due to low mass and ductile connections.

## Seismic Zones

| Region | Peak Ground Acceleration (ag) | Risk Level | Notes |
|--------|------------------------------|------------|-------|
| Murcia | 0.12-0.16g | Moderate-high | Highest in mainland Spain |
| Granada, Almería | 0.12-0.16g | Moderate-high | Significant activity |
| Alicante, Málaga | 0.08-0.12g | Moderate | Mediterranean coast |
| Pyrenees (Huesca) | 0.06-0.10g | Moderate | Mountain seismicity |
| Madrid | 0.04g | Low | Central plateau |
| Barcelona | 0.04-0.06g | Low | Minimal seismic risk |
| Galicia, Cantabria | ≤ 0.04g | Very low | Atlantic coast |
| Canary Islands | Variable | Volcanic risk | Different hazard type |

## Design Parameters (Eurocode 8 + NA)

| Parameter | Value Range | Notes |
|-----------|-------------|-------|
| ag (reference PGA) | 0.04-0.16g | Seismic zone dependent |
| Importance factor (γI) | 1.0 (residential) | Normal importance |
| Soil amplification (S) | 1.0-1.4 | Depends on soil type |
| Behaviour factor (q) | 1.5-2.0 (timber frame) | Ductility-dependent |
| Seismic weight | Dead + 0.3 × live | Combination factor |

## Comparison with Other Seismic Countries

| Parameter | Spain | Romania | Italy | Notes |
|-----------|-------|---------|-------|-------|
| Max PGA | 0.16g | 0.40g | 0.35g | Spain is lower |
| Seismic zone coverage | ~30% of territory | ~100% | ~100% | Spain: localized risk |
| Dominant hazard | Moderate, shallow | High, deep (Vrancea) | High, varied | Different source types |
| Design approach | EC8 + NA | P100 (→ EC8) | NTC 2018 (EC8-based) | All converging on EC8 |
| Timber advantage | Good (low mass) | Excellent (low mass) | Excellent (low mass) | Light construction benefits everywhere |

## ModulCA Application
- **Low mass advantage**: Timber modules weigh 3-5 tonnes vs. 15-20 tonnes for masonry — much lower seismic forces
- **Most of Spain**: In most regions (Madrid, Barcelona, north) seismic design is minimal — simpler connections
- **Southeast caution**: In Murcia/Granada zones, module connections need proper ductile detailing (bolted connections already qualify)
- **Foundation**: Screw piles in seismic zones need adequate lateral capacity — may need bracing in ag > 0.10g zones
- **Dual market**: Non-seismic Spain (most) uses simplified design; seismic southeast uses P100-like detailing — same as Romania experience

## References
- CTE DB-SE-AE — Structural safety: seismic actions
- NCSE-02 — Spanish seismic code (being replaced by EC8+NA)
- Eurocode 8 + Spanish National Annex
