# CATUC 169/2026 — Reference Files

**Law**: Legea nr. 169/2026 — Codul Amenajării Teritoriului, Urbanismului și Construcțiilor  
**Published**: Monitorul Oficial nr. 661/10.08.2026  
**Effective**: 25.08.2026  
**Abrogates**: Legea 50/1991 (autorizare construcții) + Legea 350/2001 (amenajarea teritoriului și urbanismul)  
**Source URL**: https://legislatie.just.ro/Public/DetaliiDocumentAfis/313329

---

## Files in this folder

| File | Size | Type | Purpose |
|---|---|---|---|
| `catuc-169-2026-text.md` | 1.25 MB | Markdown | Cleaned legal text for RAG/search/NeufertAI knowledge base. ⚠️ Formatting partially broken — needs cleanup pass (cuvinte lipite "urbanismPARTEA", bold-uri sparte) |
| `catuc-169-2026-articole.json` | 1.25 MB | Structured JSON | Parsed per-article data. Used by the CATUC checker and notification profile engine. Articles 415 and 524 headings may need manual detection fix |
| `CATUC copiat de pe site copy paste 169.2026.docx` | 599 KB | Microsoft Word | **ORIGINAL SOURCE** — copy/paste from legislatie.just.ro. Keep as audit trail: if `.md` has cleanup errors, we recover from here |
| `CATUC _ Clarificari privind 169.2026.pdf` | 646 KB | PDF | **DIFFERENT CONTENT!** Ministry of Development clarifications — 15 items answering common application questions. NOT the law text; a separate official document. Integrate into knowledge base as its own chapter |

---

## Provenance

- **Date copied**: October 2026 (user's own action, before this session)
- **Who cleaned MD**: User (manual markdown cleanup pass)
- **Status of JSON**: Auto-parsed from text, with known gaps (articles 415, 524 headings)
- **Where tracked in code**: Will be referenced by `src/knowledge/06-regulations/RO/CATUC-169-2026.md` (NEW doc to write) and `src/features/design/components/technical/PermitTracker.tsx` logic

---

## Key articles relevant to modular construction

| Article | Topic | Impact |
|---|---|---|
| Art. 294(2)(a)(ii) | Notification for P / D+P houses up to 150m² | Allows modular up to 16 modules × 9m² = 144m² under NOTIFICATION, not full building permit |
| Art. 295-298 | Notification procedure | 30-day municipal response window |
| Art. 299(2)(c) | No-formalities for annexes ≤ 20m² rural | Studio preset (2 modules × 9m²) DOES NOT qualify — modules are 3m tall vs annex threshold |
| Art. 415 | TBD — needs heading fix in JSON | Impact on construction authorization |
| Art. 524 | TBD — needs heading fix in JSON | Impact on compliance |

---

## Transition rules (CATUC vs old laws)

The law entered force 25.08.2026. All project documentation after this date MUST reference CATUC, not Legea 50/1991 or 350/2001.

**Project state ModulCA (2026-11-19)**: 11 code/doc files STILL reference repealed laws. Fix pending in Phase 2 (see [[MCA-DOC-AUDIT-2026-11-19]] CHECK-A8).

---

## DO NOT DELETE

All 4 files are needed:
- `.md` for runtime (code reads this for AI context)
- `.json` for structured lookups (checker engine reads this)
- `.docx` for audit trail (if `.md` has error, recover from here)
- `.pdf` for Ministry Clarifications (separate legal document from the law itself)

---

## Related docs

- [[../../MCA-DOC-STATUS-2026-11-19]]
- [[../../MCA-DOC-AUDIT-2026-11-19]]
- [[../../MCA-STRAT-2026-11-19-reboot]]
- `docs/sessions/active/2026-04-20-captain-handoff.md` (original Captain plan, now obsolete for launch dates)

---

*Last updated: 2026-11-19 by Claude (reboot session). Next review when NotebookLM synthesis completes.*
