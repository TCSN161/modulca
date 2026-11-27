/**
 * View-describing prompts for Image → Image (5.03-A, bake-off §4.2).
 *
 * The 3.06 bake-off showed the bad renders came from sending a whole-house top
 * view with a single-room prompt. The prompt must say what the picture IS
 * (cutaway axonometric, eye-level exterior, interior room, uploaded photo),
 * tell the engine to keep the camera and geometry, then add the user's style.
 */

export type RenderView = "overview" | "exterior" | "interior" | "upload";

export interface ViewPromptInput {
  view: RenderView;
  /** Module labels, one per module (duplicates allowed, e.g. two Bedrooms). */
  moduleLabels: string[];
  /** Room shown in an interior view (the selected module). */
  roomLabel?: string;
  styleName: string;
  lighting: string;
  /** Finish details for interior views, e.g. "oak flooring", "white walls". */
  finishes?: string[];
  /** People / plants / other extras. */
  extras?: string[];
  /** Prompt-template suffix (magazine, cozy, …). */
  templateSuffix?: string;
}

/** "2 Bedroom, Kitchen, Bathroom": counts repeated labels, keeps first-seen order. */
export function summarizeModules(labels: string[]): string {
  const counts = new Map<string, number>();
  for (const l of labels) counts.set(l, (counts.get(l) ?? 0) + 1);
  return [...counts].map(([l, n]) => (n > 1 ? `${n} ${l}` : l)).join(", ");
}

function styleTail(i: ViewPromptInput): string {
  return [
    `${i.styleName} design style`,
    `${i.lighting} lighting`,
    ...(i.finishes ?? []),
    ...(i.extras ?? []),
    "photorealistic, architectural photography",
    i.templateSuffix ?? "",
  ].filter(Boolean).join(", ");
}

/** The geometry-keeping sentence: one per view kind, bake-off §4.2 wording. */
export function viewSentence(i: ViewPromptInput): string {
  const n = i.moduleLabels.length;
  const house = `a modular house (${n} module${n === 1 ? "" : "s"}: ${summarizeModules(i.moduleLabels)})`;
  const room = (i.roomLabel || "room").toLowerCase();
  switch (i.view) {
    case "overview":
      return n > 1
        ? `Turn this 3D cutaway axonometric of ${house} into a photorealistic architectural cutaway render, seen from above at the same angle. Keep the exact camera, the outer walls cut at the same height, every window and door opening and every furniture position.`
        : `Turn this 3D cutaway axonometric of a ${room} module into a photorealistic architectural cutaway render, seen from above at the same angle. Keep the exact camera, the walls, every window and door opening and every furniture position.`;
    case "exterior":
      return `Turn this 3D eye-level exterior view of ${house} into a photorealistic architectural exterior photograph. Keep the exact camera, the building volume, every window and door opening.`;
    case "interior":
      return `Turn this 3D view of a ${room} into a photoreal interior render; keep the exact camera, walls, openings and furniture positions.`;
    case "upload":
      return "Turn this image into a photorealistic architectural render; keep the exact camera, the walls, every opening and every furniture position.";
  }
}

/** Full prompt: view sentence first (engines weigh the start most), then style. */
export function buildViewPrompt(i: ViewPromptInput): string {
  return `${viewSentence(i)} ${styleTail(i)}`;
}

/** Keeps prompt text safe for the route's filters; img2img prompts are longer. */
export const IMG2IMG_PROMPT_MAX = 700;
