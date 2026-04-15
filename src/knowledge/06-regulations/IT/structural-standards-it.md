---
id: "it-structural"
title: "Structural Standards & NTC (Italy)"
category: "regulations"
region: "IT"
regionScope: "national"
tags: ["structural", "NTC", "eurocode", "italy", "loads", "seismic"]
sources: ["NTC 2018 (DM 17/01/2018)", "Circolare 7/2019"]
difficulty: "advanced"
lastUpdated: "2026-04-15"
proOnly: true
relatedArticles: ["eu-eurocodes-overview", "it-seismic"]
---

# Structural Standards — Italy (NTC 2018)

## Overview

Italy's structural design is governed by the **Norme Tecniche per le Costruzioni (NTC 2018)** — a comprehensive national code that incorporates Eurocodes with Italian national parameters. The NTC replaced the previous 2008 edition and is accompanied by **Circolare 7/2019** (explanatory circular).

Italy's high seismicity makes the NTC particularly demanding on structural design.

## Load Categories (NTC §2.5)

### Permanent Loads (G)
| Load | Typical Value |
|------|--------------|
| CLT floor (120mm) | 0.55 kN/m² |
| Finishing + services | 1.0–2.0 kN/m² |
| Lightweight partition allowance | 0.80 kN/m² |
| Green roof | 1.5–3.0 kN/m² |

### Variable Loads (Q)
| Category | Load (kN/m²) |
|----------|-------------|
| A — Residential | 2.0 |
| B — Office | 2.0 |
| Balconies | 4.0 |
| Stairs | 4.0 |
| Accessible roof | 0.50 (maintenance only) |

### Snow Loads (NTC §3.4)
| Zone | Reference Load qsk (kN/m²) |
|------|---------------------------|
| Zone I-Alpina | 1.50 |
| Zone I-Mediterranea | 1.50 |
| Zone II | 1.00 |
| Zone III | 0.60 |

Altitude correction: qs = qsk × [1 + (as/481)²] for as > 200m

### Wind Loads (NTC §3.3)
| Zone | Base velocity vb (m/s) |
|------|----------------------|
| Zone 1 (Valle d'Aosta, Piemonte, Lombardia) | 25 |
| Zone 2 (Emilia-Romagna, Veneto) | 25 |
| Zone 3 (Toscana, Lazio, Umbria) | 27 |
| Zone 4–5 (Puglia, Calabria, Sicilia) | 28 |
| Zone 6–9 (Sardegna, islands) | 28–31 |

## Timber Structures (NTC Chapter 4.4)

- Design per Eurocode 5 (UNI EN 1995) with Italian NA
- CLT: Must comply with ETA or equivalent technical assessment
- **Ductility classes** for timber connections critical in seismic zones
- Quality mark required: Italian S marking or CE

## ModulCA Application

Italian structural design is demanding due to:
- **High seismicity**: All of Italy is seismic — see NTC seismic article
- **Variable climate**: Alpine snow loads to Mediterranean wind
- **Strict oversight**: Structural project must be filed with Genio Civile
- ModulCA modules pre-engineered for Zone 2 seismic + 1.0 kN/m² snow as baseline
