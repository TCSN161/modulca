# Presentation Slides — Modular Architecture

This folder contains individual slide components extracted from the monolithic
`PresentationPage.tsx`. Each slide is self-contained and consumes a uniform
`SlideContext` via props.

## Pattern

```tsx
// 1. Component file in this folder
import { SlideCard, SlideHeader } from "./shared";
import type { SlideContext } from "./types";

interface Props extends SlideContext {
  slideNumber: number;
  // ...additional props the slide needs
}

export default function MySlide(props: Props) {
  const { template: tmpl, slideNumber } = props;

  return (
    <SlideCard bg={tmpl.bg} text={tmpl.text}>
      <SlideHeader accent={tmpl.accent} text={tmpl.text} number={slideNumber} title="My Slide" />
      {/* slide content */}
    </SlideCard>
  );
}
```

```tsx
// 2. In PresentationPage.tsx, lazy-import and render
const MySlide = lazy(() => import("./slides/MySlide"));

{activeSlide === "my-slide" && slides.find(s => s.id === "my-slide")?.enabled && (
  <Suspense fallback={<div>Loading...</div>}>
    <MySlide {...slideContext} slideNumber={5} />
  </Suspense>
)}
```

## Extraction Status

| Slide | Status | Reason / Blocker |
|---|---|---|
| Cover | ✅ Extracted | Simple, mostly text + hero image |
| Description | 🟡 Inline | Auto-generates from modules — needs `useSlideData` hook first |
| Site | 🟡 Inline | Depends on `useLandStore` |
| Floorplan | 🟡 Inline | Custom SVG renderer, depends on modules state |
| Vision | 🟡 Inline | Depends on `styleDirection` + moodboard URLs |
| Modules | 🟡 Inline | Per-module renderer, depends on `getPreset`, `FLOOR_MATERIALS` etc |
| Renders | 🟡 Inline | Depends on `savedRenders` localStorage state |
| Materials | 🟡 Inline | Texture lookup from `MATERIAL_TEXTURES` |
| Products | 🟡 Inline | Depends on localStorage product selection |
| Cost | 🟡 Inline | Uses `computeCost` helpers from design module |
| Next Steps | ✅ Extracted | Pure presentational, no state deps |

## Extraction Plan (for future sessions)

1. **Build `useSlideData` hook** that aggregates all state reads:
   - `useDesignStore` — modules, style, finish, products
   - `useLandStore` — terrain, coordinates, rotation
   - localStorage — savedRenders, selected products
   Returns a single `SlideData` object with all derived values pre-computed.

2. **Extract slides one by one** using the pilot pattern above. Each extraction
   should:
   - Move the JSX as-is into the slide file
   - Replace direct store reads with prop destructuring
   - Keep the original behavior identical
   - Add a unit test with snapshot of 2-3 sample inputs

3. **Lazy-load slides** via `lazy()` + `Suspense` to reduce initial bundle —
   only the active slide's code downloads.

## Why incremental?

The page has 11 slides, each with different data dependencies. A big-bang
refactor risks regressions in a feature that's on the critical path for Beta.
Incremental extraction with snapshot tests per slide is safer.

The two pilot extractions (Cover, NextSteps) prove the pattern works and
serve as templates for the remaining 9.
