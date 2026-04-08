"use client";

import { useRef, useState, useEffect, Suspense, Component } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { Text, useCursor, useGLTF } from "@react-three/drei";
import type { FurnitureItem } from "../../../layouts";
import type { FurnitureOverride } from "../../../store";

/* ------------------------------------------------------------------ */
/*  GLB Model loader — maps furniture labels to Kenney models          */
/* ------------------------------------------------------------------ */

const LABEL_TO_GLB: Record<string, string> = {
  // Beds
  "king bed": "/models/bedDouble.glb",
  "single bed": "/models/bedSingle.glb",
  bed: "/models/bedDouble.glb",
  daybed: "/models/bedSingle.glb",

  // Sofas & seating
  "l-sofa": "/models/loungeSofaCorner.glb",
  "recliner sofa": "/models/loungeSofa.glb",
  sofa: "/models/loungeSofa.glb",
  couch: "/models/loungeSofa.glb",
  "lounge chair": "/models/loungeChair.glb",
  armchair: "/models/loungeChair.glb",

  // Chairs & stools
  "office chair": "/models/chairDesk.glb",
  "desk chair": "/models/chairDesk.glb",
  "bar stool": "/models/chair.glb",
  "work stool": "/models/chair.glb",
  chair: "/models/chair.glb",

  // Desks & tables
  "l-desk": "/models/desk.glb",
  "desk 1": "/models/desk.glb",
  "desk 2": "/models/desk.glb",
  desk: "/models/desk.glb",
  "dining table": "/models/table.glb",
  "round table": "/models/tableRound.glb",
  "coffee table": "/models/sideTable.glb",
  table: "/models/table.glb",
  "kitchen island": "/models/table.glb",
  workbench: "/models/table.glb",

  // Side tables & small furniture
  nightstand: "/models/sideTable.glb",
  "side table": "/models/sideTable.glb",

  // Storage & cabinets
  wardrobe: "/models/cabinetBedDrawer.glb",
  closet: "/models/cabinetBedDrawer.glb",
  dresser: "/models/cabinetBedDrawer.glb",
  bookshelf: "/models/cabinetBedDrawer.glb",
  "shared shelf": "/models/cabinetBedDrawer.glb",
  sideboard: "/models/cabinetBedDrawer.glb",
  "media console": "/models/cabinetBedDrawer.glb",
  "tv unit": "/models/cabinetBedDrawer.glb",
  "file cabinet": "/models/cabinetBedDrawer.glb",
  "storage cabinet": "/models/cabinetBedDrawer.glb",

  // Shelving (map to cabinet as closest match)
  "left shelves": "/models/cabinetBedDrawer.glb",
  "right shelves": "/models/cabinetBedDrawer.glb",
  "back shelves": "/models/cabinetBedDrawer.glb",
  "drying rack": "/models/cabinetBedDrawer.glb",

  // Bathroom
  toilet: "/models/toilet.glb",
  "raised toilet": "/models/toilet.glb",
  wc: "/models/toilet.glb",
  shower: "/models/shower.glb",
  "rain shower": "/models/shower.glb",
  "roll-in shower": "/models/shower.glb",
  bathtub: "/models/bathtub.glb",
  "freestanding tub": "/models/bathtub.glb",
  bath: "/models/bathtub.glb",
  vanity: "/models/bathroomSink.glb",
  "low vanity": "/models/bathroomSink.glb",
  sink: "/models/bathroomSink.glb",

  // Kitchen
  stove: "/models/kitchenStove.glb",
  oven: "/models/kitchenStove.glb",
  cooktop: "/models/kitchenStove.glb",
  "utility sink": "/models/kitchenSink.glb",
  "kitchen sink": "/models/kitchenSink.glb",

  // Kitchen counters (use kitchenSink as closest match)
  "back counter": "/models/kitchenSink.glb",
  "side counter": "/models/kitchenSink.glb",
  "left counter": "/models/kitchenSink.glb",
  "right counter": "/models/kitchenSink.glb",

  // Appliances (use kitchenSink for counter-like, cabinet for box-like)
  fridge: "/models/cabinetBedDrawer.glb",
  refrigerator: "/models/cabinetBedDrawer.glb",
  washer: "/models/cabinetBedDrawer.glb",
  dryer: "/models/cabinetBedDrawer.glb",
  "water heater": "/models/cabinetBedDrawer.glb",

  // Lamps & plants
  lamp: "/models/lampRoundFloor.glb",
  "floor lamp": "/models/lampRoundFloor.glb",
  "table lamp": "/models/lampRoundTable.glb",
  "desk lamp": "/models/lampRoundTable.glb",
  plant: "/models/pottedPlant.glb",
};

/**
 * Resolve a furniture label to a GLB model path.
 * Uses exact match first (case-insensitive), then tries partial matching.
 * Longer keys are checked first during partial matching so that
 * "lounge chair" matches before "chair".
 */
function getGlbPath(label: string): string | null {
  const lbl = label.toLowerCase();
  // Try exact match first
  if (LABEL_TO_GLB[lbl]) return LABEL_TO_GLB[lbl];
  // Try partial match — sort keys longest-first so more specific keys win
  const sortedKeys = Object.keys(LABEL_TO_GLB).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lbl.includes(key) || key.includes(lbl)) return LABEL_TO_GLB[key];
  }
  return null;
}

function GlbFurniture({ path, w, h, d }: { path: string; w: number; h: number; d: number }) {
  const { scene } = useGLTF(path);
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!ref.current) return;
    const cloned = scene.clone(true);
    // Clear previous children
    while (ref.current.children.length) ref.current.remove(ref.current.children[0]);
    ref.current.add(cloned);

    // Compute bounding box to scale model to fit the designated dimensions
    // Use per-axis (non-uniform) scaling so furniture fills its bounding box
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const scaleX = size.x > 0 ? w / size.x : 1;
    const scaleY = size.y > 0 ? h / size.y : 1;
    const scaleZ = size.z > 0 ? d / size.z : 1;
    cloned.scale.set(scaleX, scaleY, scaleZ);

    // Re-compute after scale and position so the bottom sits at y=0
    const box2 = new THREE.Box3().setFromObject(cloned);
    const center = box2.getCenter(new THREE.Vector3());
    const minY = box2.min.y;
    cloned.position.set(-center.x, -minY, -center.z);
  }, [scene, w, h, d]);

  // Position the group so the bottom of the model is at the parent's -h/2
  // (the parent places center at halfH, so bottom at y=0 world)
  return <group ref={ref} position={[0, -h / 2, 0]} />;
}

/**
 * Error-boundary wrapper for GlbFurniture inside the R3F Canvas tree.
 * If the GLB fails to load (network error, corrupt file, etc.) we fall
 * back to the procedural DetailedFurniture geometry instead of crashing
 * the entire Canvas.
 */
interface SafeGlbFurnitureProps {
  path: string;
  w: number;
  h: number;
  d: number;
  color: string;
  label: string;
}

interface SafeGlbState {
  hasError: boolean;
}

class SafeGlbFurniture extends Component<SafeGlbFurnitureProps, SafeGlbState> {
  constructor(props: SafeGlbFurnitureProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): SafeGlbState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`[SafeGlbFurniture] Failed to load GLB "${this.props.path}":`, error);
  }

  render() {
    const { path, w, h, d, color, label } = this.props;
    if (this.state.hasError) {
      // Fall back to procedural geometry when GLB fails
      return <DetailedFurniture w={w} h={h} d={d} color={color} label={label} />;
    }
    return (
      <Suspense
        fallback={
          <mesh>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={color} transparent opacity={0.3} wireframe />
          </mesh>
        }
      >
        <GlbFurniture path={path} w={w} h={h} d={d} />
      </Suspense>
    );
  }
}

/* ------------------------------------------------------------------ */
/*  Detailed furniture geometry based on label (fallback)              */
/* ------------------------------------------------------------------ */

function darken(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - amount);
  const g = Math.max(0, ((n >> 8) & 0xff) - amount);
  const b = Math.max(0, (n & 0xff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function DetailedFurniture({ w, h, d, color, label }: { w: number; h: number; d: number; color: string; label: string }) {
  const lbl = label.toLowerCase();
  const legColor = darken(color, 40);

  // Bed: mattress + headboard + 4 legs + pillow
  if (lbl.includes("bed")) {
    const legH = 0.12;
    const mattH = h - legH - 0.08;
    return (
      <group>
        {/* Legs */}
        {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sz], i) => (
          <mesh key={i} position={[sx*(w/2-0.04), -h/2+legH/2, sz*(d/2-0.04)]}>
            <cylinderGeometry args={[0.025, 0.025, legH, 8]} />
            <meshStandardMaterial color={legColor} roughness={0.7} />
          </mesh>
        ))}
        {/* Mattress */}
        <mesh position={[0, -h/2+legH+mattH/2, 0]} castShadow>
          <boxGeometry args={[w-0.04, mattH, d-0.04]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        {/* Headboard */}
        <mesh position={[0, -h/2+legH+mattH+0.04, -d/2+0.03]} castShadow>
          <boxGeometry args={[w-0.02, 0.08+mattH*0.3, 0.05]} />
          <meshStandardMaterial color={legColor} roughness={0.6} />
        </mesh>
        {/* Pillow */}
        <mesh position={[0, -h/2+legH+mattH+0.04, -d/2+0.2]}>
          <boxGeometry args={[w*0.5, 0.06, 0.18]} />
          <meshStandardMaterial color="#f0ede5" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  // Sofa/Couch: seat + backrest + armrests
  if (lbl.includes("sofa") || lbl.includes("couch")) {
    const seatH = h * 0.4;
    const backH = h * 0.55;
    const armW = 0.08;
    return (
      <group>
        {/* Seat cushion */}
        <mesh position={[0, -h/2+seatH/2, 0.03]} castShadow>
          <boxGeometry args={[w-armW*2, seatH, d-0.06]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, -h/2+seatH+backH/2, -d/2+0.06]} castShadow>
          <boxGeometry args={[w-armW*2, backH, 0.1]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
        {/* Left armrest */}
        <mesh position={[-w/2+armW/2, -h/2+(seatH+0.06)/2, 0]} castShadow>
          <boxGeometry args={[armW, seatH+0.06, d]} />
          <meshStandardMaterial color={legColor} roughness={0.7} />
        </mesh>
        {/* Right armrest */}
        <mesh position={[w/2-armW/2, -h/2+(seatH+0.06)/2, 0]} castShadow>
          <boxGeometry args={[armW, seatH+0.06, d]} />
          <meshStandardMaterial color={legColor} roughness={0.7} />
        </mesh>
      </group>
    );
  }

  // Table/Desk: thin top + 4 legs
  if (lbl.includes("table") || lbl.includes("desk")) {
    const topH = 0.04;
    const legH = h - topH;
    return (
      <group>
        {/* Tabletop */}
        <mesh position={[0, h/2-topH/2, 0]} castShadow>
          <boxGeometry args={[w, topH, d]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        {/* Legs */}
        {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sz], i) => (
          <mesh key={i} position={[sx*(w/2-0.03), -topH/2, sz*(d/2-0.03)]}>
            <cylinderGeometry args={[0.02, 0.02, legH, 8]} />
            <meshStandardMaterial color={legColor} roughness={0.6} />
          </mesh>
        ))}
      </group>
    );
  }

  // Chair: seat + 4 legs + back
  if (lbl.includes("chair")) {
    const seatH = 0.04;
    const seatY = h * 0.1;
    const legH = h/2 + seatY;
    return (
      <group>
        {/* Seat */}
        <mesh position={[0, seatY, 0.02]} castShadow>
          <boxGeometry args={[w, seatH, d-0.04]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, seatY + (h/2-seatY)/2+seatH/2, -d/2+0.025]} castShadow>
          <boxGeometry args={[w-0.04, h/2-seatY, 0.03]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        {/* Legs */}
        {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sz], i) => (
          <mesh key={i} position={[sx*(w/2-0.03), -h/2+legH/2, sz*(d/2-0.03)]}>
            <cylinderGeometry args={[0.015, 0.015, legH, 8]} />
            <meshStandardMaterial color={legColor} roughness={0.6} />
          </mesh>
        ))}
      </group>
    );
  }

  // Wardrobe/Closet: tall box with door line
  if (lbl.includes("wardrobe") || lbl.includes("closet")) {
    return (
      <group>
        <mesh castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        {/* Door split line */}
        <mesh position={[0, 0, d/2+0.001]}>
          <planeGeometry args={[0.005, h-0.1]} />
          <meshBasicMaterial color={legColor} />
        </mesh>
        {/* Handles */}
        <mesh position={[-0.03, 0, d/2+0.01]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color={legColor} metalness={0.5} />
        </mesh>
        <mesh position={[0.03, 0, d/2+0.01]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color={legColor} metalness={0.5} />
        </mesh>
      </group>
    );
  }

  // Toilet: base + tank + seat
  if (lbl.includes("toilet")) {
    return (
      <group>
        {/* Base */}
        <mesh position={[0, -h/2+h*0.2, 0.02]} castShadow>
          <boxGeometry args={[w*0.7, h*0.4, d*0.7]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
        </mesh>
        {/* Seat */}
        <mesh position={[0, -h/2+h*0.45, 0.04]} castShadow>
          <cylinderGeometry args={[w*0.35, w*0.3, 0.06, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* Tank */}
        <mesh position={[0, -h/2+h*0.5, -d/2+0.08]} castShadow>
          <boxGeometry args={[w*0.6, h*0.45, 0.14]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
        </mesh>
      </group>
    );
  }

  // Shower: tray + glass panel + head
  if (lbl.includes("shower")) {
    return (
      <group>
        {/* Floor tray */}
        <mesh position={[0, -h/2+0.02, 0]} castShadow>
          <boxGeometry args={[w, 0.04, d]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.2} />
        </mesh>
        {/* Glass panel */}
        <mesh position={[w/2-0.02, 0, 0]}>
          <boxGeometry args={[0.02, h, d]} />
          <meshStandardMaterial color="#b8d4e3" transparent opacity={0.3} roughness={0.1} />
        </mesh>
        {/* Shower pole */}
        <mesh position={[-w/2+0.06, 0, -d/2+0.06]}>
          <cylinderGeometry args={[0.012, 0.012, h, 8]} />
          <meshStandardMaterial color="#999" metalness={0.8} />
        </mesh>
        {/* Shower head */}
        <mesh position={[-w/2+0.06, h/2-0.05, -d/2+0.12]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#bbb" metalness={0.8} />
        </mesh>
      </group>
    );
  }

  // Sink: counter + bowl
  if (lbl.includes("sink")) {
    return (
      <group>
        {/* Counter */}
        <mesh position={[0, h/2-0.03, 0]} castShadow>
          <boxGeometry args={[w, 0.05, d]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* Cabinet below */}
        <mesh position={[0, -0.03, 0]} castShadow>
          <boxGeometry args={[w-0.02, h-0.06, d-0.02]} />
          <meshStandardMaterial color={legColor} roughness={0.6} />
        </mesh>
        {/* Bowl */}
        <mesh position={[0, h/2-0.01, 0.02]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[Math.min(w,d)*0.3, 16, 8, 0, Math.PI*2, 0, Math.PI/2]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.2} />
        </mesh>
      </group>
    );
  }

  // Stove/Oven: box with burner rings
  if (lbl.includes("stove") || lbl.includes("oven")) {
    return (
      <group>
        <mesh castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
        {/* Burner rings */}
        {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sz], i) => (
          <mesh key={i} position={[sx*w*0.2, h/2+0.002, sz*d*0.2]} rotation={[-Math.PI/2, 0, 0]}>
            <torusGeometry args={[0.04, 0.008, 8, 16]} />
            <meshStandardMaterial color="#333" metalness={0.6} />
          </mesh>
        ))}
      </group>
    );
  }

  // Fridge: tall box with freezer/fridge divider
  if (lbl.includes("fridge") || lbl.includes("refrigerator")) {
    return (
      <group>
        <mesh castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* Divider line */}
        <mesh position={[0, h*0.15, d/2+0.001]}>
          <planeGeometry args={[w-0.04, 0.005]} />
          <meshBasicMaterial color={legColor} />
        </mesh>
        {/* Handle */}
        <mesh position={[w/2-0.04, 0, d/2+0.015]}>
          <boxGeometry args={[0.015, h*0.25, 0.02]} />
          <meshStandardMaterial color="#999" metalness={0.6} />
        </mesh>
      </group>
    );
  }

  // Default: simple box
  return (
    <mesh castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Interactive furniture piece                                        */
/* ------------------------------------------------------------------ */

export interface FurniturePieceProps {
  item: FurnitureItem;
  override: FurnitureOverride | undefined;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onDragStart: (e: ThreeEvent<PointerEvent>, item: FurnitureItem) => void;
}

export function FurniturePiece({
  item,
  override,
  isSelected,
  isDragging,
  onSelect,
  onDragStart,
}: FurniturePieceProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  // Robust override validation: only use override if finite and in module bounds
  const MODULE_SZ = 3; // match MODULE_SIZE
  let posX = item.x;
  let posZ = item.z;
  if (override) {
    if (typeof override.x === "number" && Number.isFinite(override.x) && override.x >= -0.5 && override.x <= MODULE_SZ + 0.5) posX = override.x;
    if (typeof override.z === "number" && Number.isFinite(override.z) && override.z >= -0.5 && override.z <= MODULE_SZ + 0.5) posZ = override.z;
  }
  if (!Number.isFinite(posX)) posX = MODULE_SZ / 2 - item.width / 2;
  if (!Number.isFinite(posZ)) posZ = MODULE_SZ / 2 - item.depth / 2;
  const displayColor = override?.color ?? item.color;
  const rotationY = (override?.rotation != null && Number.isFinite(override.rotation)) ? override.rotation : 0;
  const halfH = item.height / 2;

  return (
    <group position={[posX + item.width / 2, halfH, posZ + item.depth / 2]}>
      {/* Invisible hitbox for interaction — uses max(w,d) so it covers any rotation angle */}
      <mesh
        visible={false}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onDragStart(e, item);
        }}
      >
        <boxGeometry args={[Math.max(item.width, item.depth), item.height, Math.max(item.width, item.depth)]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Rotated group containing furniture geometry */}
      <group rotation={[0, rotationY, 0]}>
        {/* GLB model (with error boundary + Suspense) or fallback geometry */}
        {getGlbPath(item.label) ? (
          <SafeGlbFurniture
            path={getGlbPath(item.label)!}
            w={item.width}
            h={item.height}
            d={item.depth}
            color={displayColor}
            label={item.label}
          />
        ) : (
          <DetailedFurniture
            w={item.width}
            h={item.height}
            d={item.depth}
            color={displayColor}
            label={item.label}
          />
        )}

        {/* Selection wireframe outline only (no opaque overlay) */}
        {isSelected && (
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(item.width + 0.02, item.height + 0.02, item.depth + 0.02)]} />
            <lineBasicMaterial color="#4488ff" />
          </lineSegments>
        )}
      </group>

      {/* Rotation indicator ring on top of selected furniture */}
      {isSelected && (
        <group position={[0, halfH + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Circular ring */}
          <mesh>
            <torusGeometry args={[Math.max(item.width, item.depth) * 0.4, 0.012, 8, 32]} />
            <meshBasicMaterial color="#4488ff" transparent opacity={0.6} />
          </mesh>
          {/* Arrow head to indicate rotation direction */}
          <mesh position={[Math.max(item.width, item.depth) * 0.4, 0, 0.01]} rotation={[0, 0, -Math.PI / 4]}>
            <coneGeometry args={[0.04, 0.08, 6]} />
            <meshBasicMaterial color="#4488ff" transparent opacity={0.7} />
          </mesh>
        </group>
      )}

      {/* Shadow / highlight disc under dragged piece */}
      {isDragging && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -halfH + 0.005, 0]}>
          <circleGeometry args={[Math.max(item.width, item.depth) * 0.6, 24]} />
          <meshBasicMaterial color="#4488ff" transparent opacity={0.18} />
        </mesh>
      )}

      {/* Label floating above */}
      <Text
        position={[0, halfH + 0.12, 0]}
        fontSize={0.09}
        color="#555"
        anchorX="center"
        anchorY="bottom"
        font={undefined}
      >
        {item.label}
      </Text>
    </group>
  );
}
