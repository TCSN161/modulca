# NEXT-10 — proposed next Chat 10 Business session

**Session:** `10.02.Business_Verify-Benchmarks-Pricing_2026MMDD` (date = day MAIN starts it; best after the beta survey has first answers)
**Written by:** 10.01 (2026-11-27) · **Model:** Sonnet is enough (research + docs, no code)

## Prompt

You are Chat 10 Business, session `10.02.Business_Verify-Benchmarks-Pricing`. Talk to Costin in Romanian.

Read first:
- The §9 read-first files in `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md`. Write only in Chat 10 paths (§10): `docs/MCA-STRAT-REVENUE-*`, `docs/MCA-STRAT-BUSINESS-*`, `docs/business/**`, plus `docs/sessions/NEXT-10.md`.
- `docs/business/MCA-STRAT-BUSINESS-PLAN-v0.md` (plan v0) and `docs/business/MCA-STRAT-BUSINESS-RESEARCH-2026-11-27.md` (sources; §7 lists what 10.01 could not verify).
- `docs/MCA-STRAT-REVENUE-STREAMS-2026-11-26.md` §6–§9 (findings, ranking, top 3, group 13 answer).

Do:
1. Close the open items in the research doc §7 with web search, sources linked, estimates marked: eMAG/Profitshare home + DIY + furniture rates (or the rates Costin reads from his affiliate account, if he made one); affiliate programs of Dedeman, Hornbach, Leroy Merlin, IKEA RO, Mobexpert, Vivre (2Performant, Awin); paid land listing prices on imobiliare.ro, Storia, OLX; RO mortgage-broker referral fees; RO PV / heat-pump lead prices; the full OAR deontology code on referral fees; current open PNRR / SME digital calls and cloud startup credits.
2. Get the current LLM API prices from Chat 2 / Chat 3 docs (never from memory) and redo plan v0 §5 consultant costs per tier. Check with Chat 4's current `types.ts` limits whether the "monthly cost cap = 30% of price" proposal was adopted; if not, restate it as a one-page handoff for Chat 4 in `docs/business/`.
3. If beta data exists (sign-ups, "would pay" answers, product clicks), replace the 🟡 assumptions in plan v0 §6 with it and write `MCA-STRAT-BUSINESS-PLAN-v1.md`. If not, do only steps 1–2.
4. Draft a 1-page R3 CATUC pack offer (what is in €9 / €19 / €29) for Chat 2 and Chat 6 to review.

Rules: €50/month ops cap, no paid tools. Don't contact anyone, don't create accounts. Never publish the partner architect's name. Commit only your files with explicit paths and a plain `git push`; if the pre-push hook blocks on other sessions' `src/` edits, leave the commit local and say so. End with the next prompt in `docs/sessions/NEXT-10.md`. Do not start other sessions.
