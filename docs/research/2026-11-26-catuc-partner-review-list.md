# CATUC Phase 2 — what goes to the partner architect (Sat 28)

**From**: Chat 2 Neufert, session 2.04 (2026-11-26) · **For**: Chat 7, who packages it into the review package doc (handoff ITEM-5)
**Scope** (decision 2026-11-23, fee cap): full review of **F2 + F3 + the notification PDFs** only. F1 and F4–F10 get a Chat 2 self-check against the law text, not an architect review.
**Name rule**: the architect's name stays out of all files we write (public repo); Chat 7 adds it only in the package's private covering email.

## 1. Files to review

| # | File | What it is | Size |
|---|---|---|---|
| F2 | `src/knowledge/06-regulations/RO/building-permit-process.new.md` | Building permit process under CATUC: CU, PAC, studies, file, notification, no-formalities annexes, validity, transition, costs. RO + EN. | ~500 lines |
| F3 | `src/knowledge/06-regulations/RO/modular-prefab-regulations.new.md` | **Most sensitive.** How CATUC applies to modular/prefab houses: routes by configuration, foundations, PAC, CC1/checking, temporary houses, CE/CPR/agrement tehnic, transport/assembly, warranty. RO + EN. | ~360 lines |
| PDFs | Notification PDFs (as agreed in the 2026-11-23 decision) | Chat 7 attaches them from wherever the decision placed them. | — |

Suggested reading order: F3 RO first (highest exposure), then F2 RO. The EN sections are translations of the RO text, so the architect only needs to check them if they want to.

Both files cite one or more CATUC articles on every legal line. A script check against `docs/references/catuc/catuc-169-2026-articole.json` found 0 missing articles (F3: 43 articles cited). Annexes 1, 3 and 6 were read in the law text.

## 2. Questions to answer (from both files' provenance sections)

### F3 — modular-prefab-regulations

1. **Technical checking for CC1.** Annex 6 puts "locuințe unifamiliale P, P+1" in CC1, and art. 440(3) says CC1 projects need no technical checking. Art. 259(5) says a permit is issued for works checked by certified checkers. Does a CC1 house built with a permit need checking reports? *(Affects F2 too: F2 §3.2 and §4.6 currently say checking is required for a permit.)*
2. **Art. 346(4)** (relocatable/mobile constructions and containers under a siting approval): does it apply outside the special-character (SNAOPSN) regime, or only inside it?
3. **Temporary modular house**: is it permitted as a building (art. 259(2)(a)) or as landscaping works (art. 259(4) "containere", art. 286, Annex 4)? Can a dwelling be a temporary construction under art. 367(2) at all?
4. **Single non-residential module** (office, guest room, summer kitchen): can it count as an outbuilding under art. 294(2)(a)(i) or art. 299(2)(c)? Does a 3 m module height rule out art. 299 in every case?
5. **Whole volumetric module**: is it one construction product (CE marking / declaration of performance) or an assembly of products? When is an agrement tehnic needed (art. 559, 561(5), 563)?
6. **Annex 3 (simplified PAC)**: its title allows P+M and 150 m², while art. 264(4) says "gospodării unifamiliale în mediul rural". Does it apply to a rural P+M modular house under a full permit?
7. **Diriginte de șantier**: is one mandatory for a CC1 single-family house, or only when the owner appoints one (art. 454, 528(2))?

### F2 — building-permit-process

8. Art. 309(5) (extending validity is prohibited) vs. 309(6) (extension of up to 12 months when works cannot be completed) vs. 310(5) (execution period extension, 30% fee). Is the reading in F2 §6.1 correct?
9. **Metropolitan-area exclusion**: the law writes it only in art. 294(2)(a)(i) (outbuildings), not in (ii) (the house). Does it apply to the house in practice? *(Used in F3 §2.2 and §2.4 as well. The spec §4c row says "nu în zone metropolitane" for the house; Chat 2 corrects the row after the answer.)*
10. Art. 294(2)(a)(ii): does "avizate de arhitectul-șef de județ" cover only individual designs, or standard designs too?
11. **Transitional rule**: can unstarted permits issued under Law 50/1991 be extended ("o singură dată, ≤ 12 luni", MDLPA Clarificări pt. 8, scanned PDF, not checkable locally)?

### Act numbers (not in the files, needs a one-line confirmation)

12. Do **Ord. MDLPA nr. 1.022/2026** (M.Of. 724/28.08.2026) and **Ord. nr. 975/2026** (M.Of. 711/26.08.2026, forms for CU/AC/notification) exist as cited? They are only Portal Legislativ notes in our text. Both files currently say only "ordin al ministrului", and the numbers stay out until confirmed.

## 3. What we need back

- Per file: **OK / OK with edits / not OK**, plus edits as comments or tracked changes on the RO text.
- An answer to questions 1–12 (a short line each is enough).
- Explicit written sign-off for F2 and F3. This is the §8 deploy gate in `docs/MCA-SPEC-CATUC-PHASE2-PLAN.md`: no `.new.md` → `.md` swap without it.

## 4. After the review (Chat 2)

Chat 2 integrates the edits into both `.new.md` files, updates the spec §4 rows (the 🟨 transitional row, the ⚠️ order numbers, the metropolitan note) and fixes F2 §3.2/§4.6 if question 1 changes the answer. The swap to `.md` happens only after sign-off (W49).
