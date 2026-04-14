---
id: "fr-land-registry"
title: "Land Registry & Urban Planning Rules (France)"
category: "regulations"
region: "FR"
regionScope: "national"
tags: ["cadastre", "PLU", "urbanisme", "land", "france", "servitudes", "COS", "certificat"]
sources: ["Code de l'Urbanisme", "PLU — Plan Local d'Urbanisme", "SCOT — Schéma de Cohérence Territoriale"]
difficulty: "intermediate"
lastUpdated: "2026-04-14"
proOnly: true
relatedArticles: ["fr-building-permit", "fr-energy-re2020", "fr-water-drainage", "fr-accessibility"]
---

# Land Registry & Urban Planning Rules (France)

## Overview
Before building in France, you must verify what can be built on a given plot (parcelle). This involves consulting the cadastre (land registry), the Plan Local d'Urbanisme (PLU), and obtaining a certificat d'urbanisme. French land use planning is hierarchical: national law sets the framework, regional SCOT documents define broad strategy, and municipal PLU documents set plot-level rules.

## Planning Hierarchy

| Level | Document | Scope |
|-------|----------|-------|
| National | Code de l'Urbanisme | Framework law for all urban planning |
| Regional | SCOT (Schéma de Cohérence Territoriale) | Intercommunal strategic planning |
| Municipal | PLU / PLUi (intercommunal) | Zoning, building rules per zone |
| Plot-level | Certificat d'urbanisme | Specific buildability confirmation |
| Historical | Cadastre | Property boundaries, ownership |

## The Cadastre

The cadastre is France's land registry, maintained by the Direction Générale des Finances Publiques (DGFiP):

| Feature | Detail |
|---------|--------|
| Content | Plot boundaries, area, ownership, buildings |
| Access | Free online via cadastre.gouv.fr |
| Reference system | Section + numéro de parcelle (e.g., AB 0123) |
| Legal weight | Fiscal document — not definitive for boundaries |
| For precise boundaries | Bornage by géomètre-expert (sworn land surveyor) |
| Updates | Automatic upon sale; owner can request correction |

Important: The cadastre shows fiscal boundaries, not legal ones. For exact boundary determination, a bornage (survey) by a géomètre-expert is needed.

## Plan Local d'Urbanisme (PLU)

The PLU is the key document governing what can be built on any plot in a commune:

### PLU Zones

| Zone | Code | Description | Buildable? |
|------|------|-------------|------------|
| Urban | U (UA, UB, UC...) | Already urbanized areas | Yes, under zone rules |
| To urbanize | AU (1AU, 2AU) | Future development areas | 1AU: yes with conditions; 2AU: future |
| Agricultural | A | Farmland protection | Very limited (farm buildings only) |
| Natural | N | Protected natural areas | Very limited (existing buildings only) |

### Key PLU Rules per Zone (Règlement)

| Rule | Article | What It Controls |
|------|---------|-----------------|
| Permitted uses | Art. 1-2 | What activities/buildings are allowed or forbidden |
| Road access | Art. 3 | Access from public road requirements |
| Utilities | Art. 4 | Connection to water, sewer, electricity |
| Plot area | Art. 5 | Minimum plot size (less common since Loi ALUR 2014) |
| Implantation / alignment | Art. 6 | Setback from public road |
| Boundary setback | Art. 7 | Distance from neighboring plots (typically H/2 or 3m min) |
| Building spacing | Art. 8 | Distance between buildings on same plot |
| Emprise au sol | Art. 9 | Maximum ground footprint ratio (CES) |
| Height | Art. 10 | Maximum building height (meters and/or floors) |
| Appearance | Art. 11 | Facade materials, colors, roof type, fences |
| Parking | Art. 12 | Number of parking spaces required |
| Green spaces | Art. 13 | Minimum vegetated area percentage |

## Certificat d'Urbanisme

Two types exist, both requested at the mairie (town hall):

| Type | Content | Validity | Response Time |
|------|---------|----------|---------------|
| CUa (information) | Applicable rules, taxes, servitudes | 18 months | 1 month |
| CUb (operational) | Whether a specific project is feasible | 18 months | 2 months |

The CUb is highly recommended before purchasing land — it confirms whether your project is permitted under current rules.

### How to Request

| Step | Action |
|------|--------|
| 1 | Fill Cerfa n° 13410*07 form |
| 2 | Submit to mairie (or online via urbanisme.gouv.fr) |
| 3 | Include: site plan, project description (for CUb) |
| 4 | Receive response within 1-2 months |

## Servitudes

Servitudes are legal constraints on a property that limit what you can do:

| Type | Examples | Source |
|------|----------|--------|
| Servitudes d'utilité publique (SUP) | Heritage protection zones, flood zones, pipeline easements | State/prefect |
| Servitudes de droit privé | Right of way (droit de passage), shared wall (mur mitoyen), view rights | Civil Code |
| Servitudes d'urbanisme | PLU setbacks, height limits, architectural constraints | PLU |
| PPR (Plan de Prévention des Risques) | Flood risk (PPRi), landslide, wildfire zones | Prefect |

Check servitudes via: PLU annexes, mairie, géoportail-urbanisme.gouv.fr, and the notaire's title search.

## Online Resources for Due Diligence

| Resource | URL | What You Find |
|----------|-----|---------------|
| Cadastre | cadastre.gouv.fr | Plot boundaries, area |
| Géoportail | geoportail.gouv.fr | Aerial photos, risk overlays |
| Géoportail urbanisme | geoportail-urbanisme.gouv.fr | PLU documents, zoning maps |
| Géorisques | georisques.gouv.fr | Natural and technological risk zones |
| BRGM InfoTerre | infoterre.brgm.fr | Geology, soil data |
| DVF (land values) | app.dvf.etalab.gouv.fr | Recent property sale prices |

## Checking Building Rights — Step by Step

| Step | Action | Tool |
|------|--------|------|
| 1 | Identify the plot (section + number) | cadastre.gouv.fr |
| 2 | Find the PLU zone | géoportail-urbanisme.gouv.fr |
| 3 | Read the PLU règlement for that zone | Mairie or online PLU |
| 4 | Check risk zones (flood, seismic, etc.) | géorisques.gouv.fr |
| 5 | Check servitudes | PLU annexes, notaire |
| 6 | Request CUb for certainty | Mairie (Cerfa 13410) |

## ModulCA Application
- **PLU appearance rules**: Module facade materials and colors must match PLU Art. 11 — ModulCA offers configurable finishes
- **Height compliance**: ModulCA 2-story homes typically 6-7m — well within most PLU height limits of 9-12m
- **Emprise au sol**: Compact modular footprint allows efficient CES use on smaller plots
- **Setback compliance**: Module placement plan respects Art. 6 and Art. 7 boundary setbacks
- **CUb recommended**: Always request a CUb before committing to a ModulCA project on a new plot

## References
- Code de l'Urbanisme — Articles L.151-1 et seq. (PLU), L.410-1 (certificat d'urbanisme)
- SCOT — Schéma de Cohérence Territoriale framework
- Cadastre.gouv.fr — Official French land registry portal
