---
id: "es-land-registry"
title: "Land Registry & Cadastre (Spain)"
category: "regulations"
region: "ES"
regionScope: "national"
tags: ["land", "registry", "cadastre", "spain", "catastro", "registro-propiedad"]
sources: ["Registro de la Propiedad", "Catastro (DG del Catastro)"]
difficulty: "intermediate"
lastUpdated: "2026-04-15"
proOnly: true
relatedArticles: ["es-building-permit", "es-urban-planning"]
---

# Land Registry & Cadastre — Spain

## Overview

Spain has a **dual system**: the **Registro de la Propiedad** (Land Registry — legal ownership) and the **Catastro** (Cadastre — physical/tax description). Both must agree for secure transactions.

## Registro de la Propiedad (Land Registry)

| Aspect | Detail |
|--------|--------|
| Authority | Ministerio de Justicia — Colegio de Registradores |
| Purpose | Legal proof of ownership and encumbrances |
| Registration | Voluntary but essential for legal protection |
| Online access | registradores.org |
| Nota Simple | Quick ownership verification (€9.02) |
| Certificación | Full legal certificate (more detailed) |

### What It Records
- Ownership (titularidad)
- Mortgages (hipotecas)
- Servitudes (servidumbres) — right of way, drainage, etc.
- Planning restrictions (afecciones urbanísticas)
- Surface area and boundaries

## Catastro (Cadastre)

| Aspect | Detail |
|--------|--------|
| Authority | Dirección General del Catastro (Ministerio de Hacienda) |
| Purpose | Physical description + tax assessment (IBI) |
| Reference number | Referencia catastral (20 digits) |
| Online access | sedecatastro.gob.es (free) |
| Map viewer | Free GIS viewer with parcel boundaries |

### What It Records
- Physical boundaries and area (m²)
- Building footprints and floor areas
- Construction year and type
- Cadastral value (valor catastral) — basis for property tax (IBI)
- Land classification (rústica / urbana)

## Before Building — What to Check

1. **Nota Simple** from Registro — confirm ownership, check for charges
2. **Catastral reference** — verify boundaries match reality
3. **Clasificación urbanística** — suelo urbano (buildable) vs. rústica (rural)
4. **Calificación** — what can be built (residential, commercial, etc.)
5. **Plan General (PGOU)** — municipal development plan
6. **Normas subsidiarias** — building parameters (height, setbacks, plot ratio)

## ModulCA Application

For ModulCA land step integration:
- **Catastro API**: Free GIS data for parcel visualization
- **Buildability check**: Plot ratio (edificabilidad) determines max modules
- **Setback rules**: Minimum distances from boundaries vary by municipality
- **Referencia catastral**: Required input for project registration
