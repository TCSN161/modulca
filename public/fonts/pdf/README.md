# PDF fonts (presentation, BUG-ST32)

`Inter-Regular.woff` (400) and `Inter-SemiBold.woff` (600, used as bold) are the
"all subsets" builds of **Inter** by Rasmus Andersson, licensed under the
**SIL Open Font License 1.1** (https://openfontlicense.org, https://rsms.me/inter/).
Same font as the site (`next/font/google` Inter).

They are embedded (subset) by `@react-pdf/renderer` so the presentation PDF can
show Romanian diacritics (ă â î ș ț). The built-in Helvetica has no ș / ț / ă.
Registered in `src/features/presentation/pdf/fonts.ts`; fetched only when a PDF
is generated.
