---
id: "be-noise-protection"
title: "Noise & Sound Insulation (Belgium)"
category: "regulations"
region: "BE"
regionScope: "national"
tags: ["noise", "acoustics", "belgium", "sound-insulation", "NBN-S01", "modular"]
sources: ["NBN S 01-400-1", "NBN S 01-400-2", "Vlarem II"]
difficulty: "intermediate"
lastUpdated: "2026-04-14"
proOnly: true
relatedArticles: ["be-building-permit", "be-fire-safety", "acoustics", "modular-principles"]
---

# Noise & Sound Insulation (Belgium)

## Overview

Sound insulation between dwellings and protection against external noise are regulated in Belgium through the NBN S 01-400 standard series. While not directly embedded in building permit legislation, these standards represent the accepted norm of good practice and are referenced by courts in dispute cases. Insurance companies and building controllers (controleorganismen) also reference them. For modular construction, acoustic performance at module joints is a critical design consideration.

## NBN S 01-400-1: Residential Buildings

NBN S 01-400-1 (2008, revised) defines acoustic criteria for residential buildings. It uses a performance classification system:

### Airborne Sound Insulation (DnT,w)

Between adjacent dwellings:

| Performance Level | DnT,w (dB) | Description |
|-------------------|-----------|-------------|
| Increased comfort | >= 58 | Premium residential, near-silent separation |
| Normal comfort | >= 54 | Standard expectation for new construction |
| Minimum | >= 50 | Acceptable but noticeable sound transfer |

Between a dwelling and common areas (corridors, stairwells):

| Performance Level | DnT,w (dB) |
|-------------------|-----------|
| Increased comfort | >= 58 |
| Normal comfort | >= 50 |
| Minimum | >= 46 |

### Impact Sound Insulation (L'nT,w)

Between floors of adjacent dwellings:

| Performance Level | L'nT,w (dB) | Description |
|-------------------|------------|-------------|
| Increased comfort | <= 50 | Barely audible footsteps |
| Normal comfort | <= 54 | Standard expectation for new construction |
| Minimum | <= 58 | Audible but acceptable |

Note: Lower values are better for impact sound (unlike airborne where higher is better).

### Facade Sound Insulation (DAtr)

Protection against external noise:

| External Noise Level | Required DAtr (dB) |
|---------------------|-------------------|
| Quiet area (< 56 dB Lden) | >= 26 |
| Normal road (56-66 dB Lden) | >= 30 |
| Busy road (66-71 dB Lden) | >= 36 |
| Major road / railway (71-76 dB Lden) | >= 41 |
| Very noisy (> 76 dB Lden) | >= 41+ (special study) |

## NBN S 01-400-2: Non-Residential Buildings

Applies to schools, offices, hospitals. Less directly relevant for modular housing but applicable to mixed-use projects:

| Space Type | DnT,w between rooms (dB) |
|-----------|-------------------------|
| Classrooms | >= 50 |
| Offices | >= 40 |
| Hospital rooms | >= 45 |

## Technical Equipment Noise

NBN S 01-400-1 also limits noise from building services:

| Source | Limit in Adjacent Dwelling |
|--------|---------------------------|
| Heating/cooling systems (continuous) | LAeq <= 30 dB(A) |
| Lift operation | LAeq <= 30 dB(A) |
| Water pipes, sanitary equipment (intermittent) | LAmax <= 35 dB(A) |
| Garage doors, communal equipment | LAmax <= 35 dB(A) |

## Vlarem II: Environmental Noise

Vlarem II (Flanders) regulates noise from installations and activities, relevant for:

| Source | Limit at Property Boundary (dB LAeq) |
|--------|--------------------------------------|
| HVAC equipment (residential zone, night) | 35-40 dB(A) |
| HVAC equipment (residential zone, day) | 40-45 dB(A) |
| Heat pump outdoor unit | Must comply with property boundary limits |

Wallonia and Brussels have equivalent environmental noise regulations through their own environmental permits.

## Acoustic Design for Modular Construction

### Key Challenge: Module Joints

The junction between modules is the weakest acoustic link. Sound travels through:

- **Structural connections** (flanking transmission via steel or timber frames)
- **Air gaps** at module joints
- **Services penetrations** (pipes, cables crossing module boundaries)

### Solutions by Construction Type

| Module Type | Airborne Solution | Impact Solution |
|-------------|------------------|-----------------|
| Timber frame | Double-leaf walls (separate studs), min 50 mm cavity with mineral wool | Floating floor on resilient layer (>= 30 mm mineral wool) |
| CLT | Double CLT panel with elastic interlayer, or CLT + isolated lining | Floating screed on resilient mat (>= 20 mm) |
| Steel frame | Double steel frames with no rigid connections, mineral wool infill | Floating floor on resilient pads/strips |
| Concrete/hybrid | Single dense element can achieve DnT,w >= 54 with mass alone | Floating screed on resilient layer |

### Flanking Transmission Control

| Path | Mitigation |
|------|-----------|
| Wall-floor junction | Elastic interlayers, structural breaks |
| Module-to-module vertical | Neoprene or rubber pads between stacked modules |
| Module-to-module horizontal | Flexible sealant, no rigid bridging between frames |
| Services | Acoustic wrapping on pipes, flexible connections at module boundaries |
| Facade-to-partition | Acoustic sealant at all junctions |

## Typical Wall Build-Ups for Modular (Meeting DnT,w >= 54 dB)

### Option A: Double Timber Frame Wall

| Layer | Thickness |
|-------|-----------|
| Gypsum board (2x 12.5 mm) | 25 mm |
| Timber stud + mineral wool | 120 mm |
| Air gap | 50 mm |
| Timber stud + mineral wool | 120 mm |
| Gypsum board (2x 12.5 mm) | 25 mm |
| **Total** | **340 mm** |
| **Performance** | **DnT,w ~ 56-60 dB** |

### Option B: CLT with Lining

| Layer | Thickness |
|-------|-----------|
| Gypsum board (12.5 mm) on resilient channel | 37 mm |
| CLT panel | 100 mm |
| Air gap + mineral wool | 50 mm |
| CLT panel | 100 mm |
| Gypsum board (12.5 mm) on resilient channel | 37 mm |
| **Total** | **324 mm** |
| **Performance** | **DnT,w ~ 58-62 dB** |

## Testing and Verification

| Test | Standard | When |
|------|----------|------|
| Field measurement (airborne) | NBN EN ISO 16283-1 | Post-construction |
| Field measurement (impact) | NBN EN ISO 16283-2 | Post-construction |
| Field measurement (facade) | NBN EN ISO 16283-3 | Post-construction |
| Laboratory test (element) | NBN EN ISO 10140 series | During product development |
| Prediction (design stage) | NBN EN ISO 12354 series | Design phase |

Post-construction testing is recommended (and may be required by the building controller) to verify that the design targets are achieved.

## Regional Differences Summary

| Aspect | Flanders | Wallonia | Brussels |
|--------|----------|----------|----------|
| Acoustic standard | NBN S 01-400-1 (voluntary but normative) | Same standard | Same standard |
| Environmental noise | Vlarem II | Conditions sectorielles | Ordonnance Bruit |
| Noise mapping | Geluidskaarten (VMM) | Cartes de bruit (SPW) | Cartes de bruit (Bruxelles Env.) |
| Heat pump noise | Strict Vlarem II limits | Environmental permit conditions | Environmental permit conditions |

## ModulCA Application

- **Factory-tested assemblies**: Wall and floor build-ups tested in laboratory conditions ensure predictable acoustic performance
- **Module joint detail**: Develop and test a standard acoustic joint detail for module-to-module connections
- **Floating floors as standard**: Include resilient layer under floor finish in all stacked modules
- **Service penetrations**: Seal all pipe and cable penetrations with acoustic mastic during factory assembly
- **Heat pump placement**: Design outdoor unit location to comply with Vlarem II boundary limits

## References

- NBN S 01-400-1 (2008) — Acoustic criteria for residential buildings
- NBN S 01-400-2 — Acoustic criteria for non-residential buildings
- Vlarem II — Flemish environmental regulation (noise chapters)
- NBN EN ISO 16283 series — Field measurement of sound insulation
- NBN EN ISO 12354 series — Building acoustics: estimation of acoustic performance
