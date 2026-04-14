---
id: "quality-control"
title: "Quality Control for Modular Construction"
category: "project-management"
tags: ["quality", "inspection", "QC", "airtightness", "ISO", "CE-marking"]
sources: ["ISO 9001:2015", "EN 14080 (Glulam)", "Dutch Wet Kwaliteitsborging", "Romanian ISC Regulations"]
difficulty: "advanced"
lastUpdated: "2026-04-11"
proOnly: true
relatedArticles: ["cost-estimation", "contractor-selection", "site-preparation"]
---

# Quality Control for Modular Construction

## Overview

Modular construction offers inherent quality advantages: factory-controlled environments eliminate weather exposure during fabrication, enable repeatable processes, and allow systematic inspection before modules leave the production line. However, quality control must extend to transportation, on-site assembly, and inter-module connections where factory precision meets real-world conditions.

## Factory QC vs Site QC

| Aspect | Factory QC | Site QC |
|--------|-----------|---------|
| Environment | Controlled (temperature, humidity, dust) | Variable (weather, access constraints) |
| Repeatability | High -- jigs, templates, CNC precision | Lower -- manual adjustments needed |
| Inspection timing | Continuous during production | At key milestones only |
| Defect correction | Easy and low-cost before shipping | Expensive and disruptive after assembly |
| Documentation | Digital quality logs per module | Site inspection reports |
| Responsibility | Factory QC manager | Site supervisor + independent inspector |

**Rule of thumb:** 80% of quality is determined in the factory; 20% depends on site execution.

## Key Inspection Points

### 1. Structural Connections
- Verify bolt torque values at all inter-module connections (typically M16-M20, 150-350 Nm)
- Check alignment tolerances: max 3mm deviation between adjacent modules
- Inspect steel brackets and connection plates for corrosion protection
- Verify load paths are continuous through module joints

### 2. Airtightness Testing (Blower Door)
- Target: n50 <= 1.0 h-1 for low-energy buildings (Romania), n50 <= 0.6 h-1 for BENG (Netherlands)
- Test after module assembly and sealing, before interior finishing
- Common failure points: module-to-module joints, window/door frames, MEP penetrations
- Equipment: calibrated blower door fan (EN 13829 / ISO 9972)
- Retest after any remediation work

### 3. Thermal Bridge Assessment
- Infrared thermography scan of all module joints during heating season
- Check window reveals, floor-wall junctions, and roof-wall connections
- Maximum acceptable thermal bridge: Psi <= 0.01 W/(m*K) for passive house standard
- Document with timestamped IR images and ambient temperature readings

### 4. MEP Pressure Testing
- Water supply: pressure test at 1.5x operating pressure for minimum 30 minutes (no drop)
- Heating circuits: 6 bar pressure test for 24 hours
- Gas (if applicable): leak test per EN 1775 at 150 mbar for 10 minutes
- Drainage: water flow test on all fixtures, check gradient (min 1% slope)
- Electrical: insulation resistance test (min 1 MOhm at 500V DC)

## Standards and Certifications

### ISO 9001 for Factories
- Quality management system certification is the baseline for any modular factory
- Covers design control, procurement, production, inspection, and corrective actions
- Annual surveillance audits by accredited certification body
- ModulCA requires all partner factories to hold valid ISO 9001 certification

### CE Marking for Structural Elements
- Structural timber products: EN 14081 (solid timber), EN 14080 (glulam)
- Steel connections: EN 1090 (execution of steel structures)
- CE marking confirms Declaration of Performance (DoP) against harmonized European standards
- Factory Production Control (FPC) system required for CE marking

### Country-Specific Requirements

| Requirement | Romania | Netherlands | Germany | France |
|-------------|---------|-------------|---------|--------|
| Building inspection authority | ISC (Inspectoratul de Stat in Constructii) | Municipality + Kwaliteitsborger | Bauaufsichtsamt | Bureau de controle |
| Independent QC role | Diriginte de santier (mandatory) | Kwaliteitsborger (mandatory since 2024) | Prufingenieur (for structural) | Controleur technique (mandatory) |
| Structural inspection | At foundation, structure, completion | Per Wkb instrument for bouwbesluit | At key phases per LBO | At each construction phase |
| Energy performance test | Energy certificate at completion | BENG compliance + EPA label | EnEV / GEG compliance | DPE (Diagnostic de Performance Energetique) |
| Airtightness test required | Not mandatory (but recommended) | Mandatory for BENG compliance | Mandatory for KfW standards | Mandatory for RE2020 |
| Warranty period | 10 years (structural by law) | 10 years (verborgen gebreken) | 5 years (BGB) | 10 years (garantie decennale) |

## QC Documentation Checklist

For every ModulCA project, the following documents must be produced:

- [ ] Factory inspection reports per module (dimensions, materials, visual)
- [ ] Structural connection torque logs
- [ ] Airtightness test report (blower door)
- [ ] IR thermography report (if heating season)
- [ ] MEP pressure test certificates (water, heating, gas)
- [ ] Electrical installation test certificate
- [ ] Foundation inspection report
- [ ] Energy performance certificate
- [ ] As-built drawings reflecting any site modifications
- [ ] Warranty certificates from factory and site contractors

## ModulCA Application

ModulCA implements a dual-layer QC system. In the factory, each module receives a digital quality passport with dimensional checks, photo documentation, and material certificates before dispatch. On site, the assembly team follows a standardized checklist that must be completed and photographed at each phase before the next phase begins. The platform stores all QC documentation linked to the specific project, creating a permanent quality record accessible to the homeowner. This digital trail supports warranty claims and future resale due diligence.

## References

- ISO 9001:2015 -- Quality management systems
- EN 13829 / ISO 9972 -- Thermal performance of buildings, airtightness measurement
- EN 14081, EN 14080 -- Structural timber CE marking standards
- EN 1090 -- Execution of steel structures and aluminium structures
- Dutch Wet Kwaliteitsborging voor het bouwen (Wkb), effective 2024
- Romanian Law 10/1995 on construction quality, updated 2023
- ISC (Inspectoratul de Stat in Constructii) inspection procedures
