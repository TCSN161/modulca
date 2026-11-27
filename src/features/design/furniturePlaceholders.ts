/**
 * 5.06 — furniture labels that render as a clean, correctly sized primitive
 * (procedural box / fridge / stove / wardrobe in DetailedFurniture) instead of
 * a GLB. Used because the kit has no fitting model and the old mapping was
 * wrong (kitchen counters → bathroom sink, fridge → bedside drawer) or the kit
 * model would be stretched > 3× (shelves, tall cabinets).
 *
 * Each entry = one model to make in Blender (3.11+ / W50). Remove the label
 * here once its real-size GLB is in public/models and mapped in LABEL_TO_GLB.
 */
export const PLACEHOLDER_LABELS: Record<string, string> = {
  // Kitchen
  "back counter": "base cabinet + worktop, 60 cm deep, 90 cm high, modular 30/60 cm",
  "side counter": "same as back counter (corner run)",
  "left counter": "same as back counter",
  "right counter": "same as back counter",
  "kitchen island": "island / bar block 90 cm high with overhang",
  fridge: "fridge 60×60×185 cm (procedural fridge until then)",
  stove: "freestanding cooker / hob unit 60×60×90 (kitchenStove.glb is missing)",
  // Storage & shelving (kit drawer would be stretched 5–8×)
  bookshelf: "open bookshelf 35–40 cm deep, 1.8 m",
  "shared shelf": "open shelf 35 cm deep, 1.5 m",
  "left shelves": "storage rack 50 cm deep, 2.2 m",
  "right shelves": "storage rack 50 cm deep, 2.2 m",
  "back shelves": "storage rack 50 cm deep, 2.2 m",
  "display shelf": "display shelf 30 cm deep, 1.8 m",
  "drying rack": "laundry drying rack / tall shelf",
  "storage cabinet": "tall metal cabinet 60×120×180",
  // Appliances
  washer: "washing machine 60×60×85",
  dryer: "tumble dryer 60×60×85",
  "water heater": "wall-hung water heater / boiler",
  // Wall-mounted
  mirror: "wall mirror (thin panel)",
  "wall tv": "wall TV 55\" (1.0 m wide)",
  "projector screen": "wall projector screen",
  whiteboard: "wall whiteboard",
  "tool wall": "pegboard with tools",
  "coat rack": "wall coat hook rail",
  "grab bar": "stainless grab bar",
  // Seating / outdoor
  bench: "outdoor bench (was matched to workbench → table.glb)",
  "hall bench": "hall bench",
  "shoe bench": "shoe bench with shelf",
  "sun lounger": "sun lounger",
  "bbq grill": "BBQ grill",
};

export function isPlaceholderLabel(label: string): boolean {
  return label.toLowerCase() in PLACEHOLDER_LABELS;
}
