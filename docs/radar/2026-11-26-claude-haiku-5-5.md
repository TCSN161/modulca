# Claude Haiku 5.5 for translation and tagging (checked 2026-11-26)

- `claude-haiku-5-5`, released 7 Oct, from $0.10 / $0.50 per M tokens, 1M context. [Models](https://platform.claude.com/docs/en/about-claude/models/overview) · [release notes](https://platform.claude.com/docs/en/release-notes/overview)
- Breaks Haiku 4.5-style calls: `temperature`/`top_p`/`top_k`, `budget_tokens` and assistant prefill return 400. Its tokenizer counts more tokens.
- "From" pricing: confirm the full price tiers before estimating cost.
- **Action (Chat 2, S–M, W49):** translate 5 CATUC samples with Haiku 5.5 and with today's DeepSeek path; compare quality and real cost, then decide.
