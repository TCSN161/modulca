"use client";

import React, { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, useGLTF } from "@react-three/drei";
import type { ModuleConfig } from "../../store";
import { getPreset, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import type { FurnitureItem } from "../../layouts";

const MODULE_SIZE = 3;
const WALL_HEIGHT = 2.7;
const WALL_THICKNESS = 0.08;

type LightingMode = "daylight" | "evening" | "night";
type CameraAngle = "interior" | "corner" | "detail";

const CAMERA_POSITIONS: Record<CameraAngle, [number, number, number]> = {
  interior: [2.8, 1.6, 2.8],
  corner: [5.5, 4.5, 5.5],
  detail: [1.5, 0.8, 2.5],
};

const LIGHTING_CONFIGS: Record<LightingMode, { ambient: number; sun: number; sunColor: string; bgColor: string }> = {
  daylight: { ambient: 0.6, sun: 1.4, sunColor: "#fff8e7", bgColor: "#e8f0f8" },
  evening: { ambient: 0.3, sun: 0.9, sunColor: "#ff9944", bgColor: "#2a1810" },
  night: { ambient: 0.15, sun: 0.3, sunColor: "#6688cc", bgColor: "#0a0a1a" },
};

function Floor({ color }: { color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MODULE_SIZE / 2, 0, MODULE_SIZE / 2]} receiveShadow>
      <planeGeometry args={[MODULE_SIZE, MODULE_SIZE]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />
    </mesh>
  );
}

const DOOR_W = 0.9;
const DOOR_H = 2.1;
const WIN_W = 1.2;
const WIN_H = 1.0;
const WIN_SILL = 0.9;

/** Build a single wall with optional window/door opening */
function WallWithType({
  position, size, wallType, color, transparent,
}: {
  position: [number, number, number];
  size: [number, number, number]; // width, height, thickness
  wallType: string;
  color: string;
  transparent?: boolean;
}) {
  const [w, h, t] = size;
  const mat = <meshStandardMaterial color={color} roughness={0.5} transparent={transparent} opacity={transparent ? 0.3 : 1} />;

  if (wallType === "none" || wallType === "shared") return null;

  if (wallType === "solid") {
    return (
      <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={[w, h, t]} />
        {mat}
      </mesh>
    );
  }

  // For window/door, we build segments around the opening
  const isHorizontal = w > t; // wall runs along X
  const wallLen = isHorizontal ? w : t;
  const wallThick = isHorizontal ? t : w;

  if (wallType === "window") {
    const gapW = Math.min(WIN_W, wallLen * 0.5);
    const sideW = (wallLen - gapW) / 2;
    const topH = h - WIN_SILL - WIN_H;
    const segs: React.ReactElement[] = [];
    // Left segment
    if (isHorizontal) {
      segs.push(<mesh key="l" position={[position[0] - wallLen / 2 + sideW / 2, position[1], position[2]]} castShadow><boxGeometry args={[sideW, h, wallThick]} />{mat}</mesh>);
      segs.push(<mesh key="r" position={[position[0] + wallLen / 2 - sideW / 2, position[1], position[2]]} castShadow><boxGeometry args={[sideW, h, wallThick]} />{mat}</mesh>);
      segs.push(<mesh key="b" position={[position[0], position[1] - h / 2 + WIN_SILL / 2, position[2]]} castShadow><boxGeometry args={[gapW, WIN_SILL, wallThick]} />{mat}</mesh>);
      if (topH > 0) segs.push(<mesh key="t" position={[position[0], position[1] + h / 2 - topH / 2, position[2]]} castShadow><boxGeometry args={[gapW, topH, wallThick]} />{mat}</mesh>);
      // Glass
      segs.push(<mesh key="g" position={[position[0], position[1] - h / 2 + WIN_SILL + WIN_H / 2, position[2]]}><boxGeometry args={[gapW, WIN_H, wallThick * 0.3]} /><meshStandardMaterial color="#a8d4e6" transparent opacity={0.4} roughness={0.1} metalness={0.3} /></mesh>);
    } else {
      segs.push(<mesh key="l" position={[position[0], position[1], position[2] - wallLen / 2 + sideW / 2]} castShadow><boxGeometry args={[wallThick, h, sideW]} />{mat}</mesh>);
      segs.push(<mesh key="r" position={[position[0], position[1], position[2] + wallLen / 2 - sideW / 2]} castShadow><boxGeometry args={[wallThick, h, sideW]} />{mat}</mesh>);
      segs.push(<mesh key="b" position={[position[0], position[1] - h / 2 + WIN_SILL / 2, position[2]]} castShadow><boxGeometry args={[wallThick, WIN_SILL, gapW]} />{mat}</mesh>);
      if (topH > 0) segs.push(<mesh key="t" position={[position[0], position[1] + h / 2 - topH / 2, position[2]]} castShadow><boxGeometry args={[wallThick, topH, gapW]} />{mat}</mesh>);
      segs.push(<mesh key="g" position={[position[0], position[1] - h / 2 + WIN_SILL + WIN_H / 2, position[2]]}><boxGeometry args={[wallThick * 0.3, WIN_H, gapW]} /><meshStandardMaterial color="#a8d4e6" transparent opacity={0.4} roughness={0.1} metalness={0.3} /></mesh>);
    }
    return <group>{segs}</group>;
  }

  if (wallType === "door") {
    const gapW = Math.min(DOOR_W, wallLen * 0.4);
    const sideW = (wallLen - gapW) / 2;
    const topH = h - DOOR_H;
    const segs: React.ReactElement[] = [];
    if (isHorizontal) {
      segs.push(<mesh key="l" position={[position[0] - wallLen / 2 + sideW / 2, position[1], position[2]]} castShadow><boxGeometry args={[sideW, h, wallThick]} />{mat}</mesh>);
      segs.push(<mesh key="r" position={[position[0] + wallLen / 2 - sideW / 2, position[1], position[2]]} castShadow><boxGeometry args={[sideW, h, wallThick]} />{mat}</mesh>);
      if (topH > 0) segs.push(<mesh key="t" position={[position[0], position[1] + h / 2 - topH / 2, position[2]]} castShadow><boxGeometry args={[gapW, topH, wallThick]} />{mat}</mesh>);
    } else {
      segs.push(<mesh key="l" position={[position[0], position[1], position[2] - wallLen / 2 + sideW / 2]} castShadow><boxGeometry args={[wallThick, h, sideW]} />{mat}</mesh>);
      segs.push(<mesh key="r" position={[position[0], position[1], position[2] + wallLen / 2 - sideW / 2]} castShadow><boxGeometry args={[wallThick, h, sideW]} />{mat}</mesh>);
      if (topH > 0) segs.push(<mesh key="t" position={[position[0], position[1] + h / 2 - topH / 2, position[2]]} castShadow><boxGeometry args={[wallThick, topH, gapW]} />{mat}</mesh>);
    }
    return <group>{segs}</group>;
  }

  // Fallback solid
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[w, h, t]} />
      {mat}
    </mesh>
  );
}

function Walls({ color, showFront, wallConfigs }: { color: string; showFront: boolean; wallConfigs?: { north: string; south: string; east: string; west: string } }) {
  const h = WALL_HEIGHT / 2;
  const t = WALL_THICKNESS / 2;
  const s = MODULE_SIZE / 2;
  const wc = wallConfigs ?? { north: "solid", south: "solid", east: "solid", west: "solid" };
  return (
    <group>
      {/* North wall (z=0) */}
      <WallWithType position={[s, h, t]} size={[MODULE_SIZE, WALL_HEIGHT, WALL_THICKNESS]} wallType={wc.north} color={color} />
      {/* West wall (x=0) */}
      <WallWithType position={[t, h, s]} size={[WALL_THICKNESS, WALL_HEIGHT, MODULE_SIZE]} wallType={wc.west} color={color} />
      {/* East wall */}
      <WallWithType position={[MODULE_SIZE - t, h, s]} size={[WALL_THICKNESS, WALL_HEIGHT, MODULE_SIZE]} wallType={wc.east} color={color} />
      {/* South wall (front) */}
      {showFront && (
        <WallWithType position={[s, h, MODULE_SIZE - t]} size={[MODULE_SIZE, WALL_HEIGHT, WALL_THICKNESS]} wallType={wc.south} color={color} transparent />
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  GLB Model loader (same as ModuleScene3D)                           */
/* ------------------------------------------------------------------ */

const LABEL_TO_GLB: Record<string, string> = {
  bed: "/models/bedDouble.glb", "single bed": "/models/bedSingle.glb",
  sofa: "/models/loungeSofa.glb", couch: "/models/loungeSofa.glb",
  "l-sofa": "/models/loungeSofaCorner.glb", chair: "/models/chair.glb",
  "office chair": "/models/chairDesk.glb", "desk chair": "/models/chairDesk.glb",
  desk: "/models/desk.glb", table: "/models/table.glb",
  "dining table": "/models/table.glb", "round table": "/models/tableRound.glb",
  "coffee table": "/models/tableRound.glb", nightstand: "/models/sideTable.glb",
  "side table": "/models/sideTable.glb", wardrobe: "/models/cabinetBedDrawer.glb",
  closet: "/models/cabinetBedDrawer.glb", dresser: "/models/cabinetBedDrawer.glb",
  toilet: "/models/toilet.glb", wc: "/models/toilet.glb",
  shower: "/models/shower.glb", bathtub: "/models/bathtub.glb",
  bath: "/models/bathtub.glb", sink: "/models/bathroomSink.glb",
  "kitchen sink": "/models/kitchenSink.glb", lamp: "/models/lampRoundFloor.glb",
  "floor lamp": "/models/lampRoundFloor.glb", "table lamp": "/models/lampRoundTable.glb",
  plant: "/models/pottedPlant.glb", armchair: "/models/loungeChair.glb",
  "tv unit": "/models/cabinetBedDrawer.glb", bookshelf: "/models/cabinetBedDrawer.glb",
  fridge: "/models/cabinetBedDrawer.glb", counter: "/models/kitchenSink.glb",
  stove: "/models/table.glb", vanity: "/models/bathroomSink.glb",
  shelves: "/models/cabinetBedDrawer.glb", cabinet: "/models/cabinetBedDrawer.glb",
};

function getGlbPath(label: string): string | null {
  const lbl = label.toLowerCase();
  if (LABEL_TO_GLB[lbl]) return LABEL_TO_GLB[lbl];
  const sorted = Object.entries(LABEL_TO_GLB).sort((a, b) => b[0].length - a[0].length);
  for (const [key, path] of sorted) {
    if (lbl.includes(key) || key.includes(lbl)) return path;
  }
  return null;
}

function GlbFurniture({ path, w, h, d }: { path: string; w: number; h: number; d: number }) {
  const { scene } = useGLTF(path);
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!ref.current) return;
    const cloned = scene.clone(true);
    while (ref.current.children.length) ref.current.remove(ref.current.children[0]);
    ref.current.add(cloned);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const scaleX = size.x > 0 ? w / size.x : 1;
    const scaleY = size.y > 0 ? h / size.y : 1;
    const scaleZ = size.z > 0 ? d / size.z : 1;
    cloned.scale.set(scaleX, scaleY, scaleZ);
    const box2 = new THREE.Box3().setFromObject(cloned);
    const center = box2.getCenter(new THREE.Vector3());
    const minY = box2.min.y;
    cloned.position.set(-center.x, -minY, -center.z);
  }, [scene, w, h, d]);

  return <group ref={ref} position={[0, -h / 2, 0]} />;
}

class SafeGlbFurniture extends React.Component<
  { path: string; w: number; h: number; d: number; color: string; label: string },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return <DetailedFurniture w={this.props.w} h={this.props.h} d={this.props.d} color={this.props.color} label={this.props.label} />;
    }
    return (
      <Suspense fallback={<mesh><boxGeometry args={[this.props.w, this.props.h, this.props.d]} /><meshStandardMaterial color={this.props.color} wireframe /></mesh>}>
        <GlbFurniture path={this.props.path} w={this.props.w} h={this.props.h} d={this.props.d} />
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
        {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sz], i) => (
          <mesh key={i} position={[sx*(w/2-0.04), -h/2+legH/2, sz*(d/2-0.04)]}>
            <cylinderGeometry args={[0.025, 0.025, legH, 8]} />
            <meshStandardMaterial color={legColor} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, -h/2+legH+mattH/2, 0]} castShadow>
          <boxGeometry args={[w-0.04, mattH, d-0.04]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        <mesh position={[0, -h/2+legH+mattH+0.04, -d/2+0.03]} castShadow>
          <boxGeometry args={[w-0.02, 0.08+mattH*0.3, 0.05]} />
          <meshStandardMaterial color={legColor} roughness={0.6} />
        </mesh>
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
        <mesh position={[0, -h/2+seatH/2, 0.03]} castShadow>
          <boxGeometry args={[w-armW*2, seatH, d-0.06]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
        <mesh position={[0, -h/2+seatH+backH/2, -d/2+0.06]} castShadow>
          <boxGeometry args={[w-armW*2, backH, 0.1]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
        <mesh position={[-w/2+armW/2, -h/2+(seatH+0.06)/2, 0]} castShadow>
          <boxGeometry args={[armW, seatH+0.06, d]} />
          <meshStandardMaterial color={legColor} roughness={0.7} />
        </mesh>
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
        <mesh position={[0, h/2-topH/2, 0]} castShadow>
          <boxGeometry args={[w, topH, d]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
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
        <mesh position={[0, seatY, 0.02]} castShadow>
          <boxGeometry args={[w, seatH, d-0.04]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        <mesh position={[0, seatY + (h/2-seatY)/2+seatH/2, -d/2+0.025]} castShadow>
          <boxGeometry args={[w-0.04, h/2-seatY, 0.03]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
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
        <mesh position={[0, 0, d/2+0.001]}>
          <planeGeometry args={[0.005, h-0.1]} />
          <meshBasicMaterial color={legColor} />
        </mesh>
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
        <mesh position={[0, -h/2+h*0.2, 0.02]} castShadow>
          <boxGeometry args={[w*0.7, h*0.4, d*0.7]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
        </mesh>
        <mesh position={[0, -h/2+h*0.45, 0.04]} castShadow>
          <cylinderGeometry args={[w*0.35, w*0.3, 0.06, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
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
        <mesh position={[0, -h/2+0.02, 0]} castShadow>
          <boxGeometry args={[w, 0.04, d]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.2} />
        </mesh>
        <mesh position={[w/2-0.02, 0, 0]}>
          <boxGeometry args={[0.02, h, d]} />
          <meshStandardMaterial color="#b8d4e3" transparent opacity={0.3} roughness={0.1} />
        </mesh>
        <mesh position={[-w/2+0.06, 0, -d/2+0.06]}>
          <cylinderGeometry args={[0.012, 0.012, h, 8]} />
          <meshStandardMaterial color="#999" metalness={0.8} />
        </mesh>
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
        <mesh position={[0, h/2-0.03, 0]} castShadow>
          <boxGeometry args={[w, 0.05, d]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.03, 0]} castShadow>
          <boxGeometry args={[w-0.02, h-0.06, d-0.02]} />
          <meshStandardMaterial color={legColor} roughness={0.6} />
        </mesh>
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
        <mesh position={[0, h*0.15, d/2+0.001]}>
          <planeGeometry args={[w-0.04, 0.005]} />
          <meshBasicMaterial color={legColor} />
        </mesh>
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

function FurniturePiece({ item, colorOverride, rotationOverride }: { item: FurnitureItem; colorOverride?: string; rotationOverride?: number }) {
  const c = colorOverride || item.color;
  const rotY = rotationOverride ?? 0;
  const glbPath = getGlbPath(item.label);
  return (
    <group
      position={[item.x + item.width / 2, item.height / 2, item.z + item.depth / 2]}
    >
      <group rotation={[0, rotY, 0]}>
        {glbPath ? (
          <SafeGlbFurniture path={glbPath} w={item.width} h={item.height} d={item.depth} color={c} label={item.label} />
        ) : (
          <DetailedFurniture w={item.width} h={item.height} d={item.depth} color={c} label={item.label} />
        )}
      </group>
    </group>
  );
}

function Ceiling() {
  return (
    <mesh position={[MODULE_SIZE / 2, WALL_HEIGHT, MODULE_SIZE / 2]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[MODULE_SIZE, MODULE_SIZE]} />
      <meshStandardMaterial color="#f8f8f4" roughness={0.9} />
    </mesh>
  );
}

/** Inner component that registers the gl capture function with the parent */
function CanvasCapture({ onReady }: { onReady: (capture: () => string | null) => void }) {
  const { gl } = useThree();
  useEffect(() => {
    onReady(() => {
      try {
        return gl.domElement.toDataURL("image/png");
      } catch {
        return null;
      }
    });
  }, [gl, onReady]);
  return null;
}

interface SceneContentProps {
  module: ModuleConfig;
  lighting: LightingMode;
  camera: CameraAngle;
  showPlants: boolean;
}

function SceneContent({ module, lighting, camera, showPlants }: SceneContentProps) {
  const lc = LIGHTING_CONFIGS[lighting];

  const preset = getPreset(module.moduleType, module.layoutPreset);
  const furniture = preset?.furniture || [];
  const floorColor = FLOOR_MATERIALS.find((f) => f.id === module.floorFinish)?.color || "#D4A76A";
  const wallColor = WALL_MATERIALS.find((w) => w.id === module.wallColor)?.color || "#F0EDE5";

  return (
    <>
      <color attach="background" args={[lc.bgColor]} />
      <ambientLight intensity={lc.ambient} />
      <directionalLight
        position={[6, 8, 4]}
        intensity={lc.sun}
        color={lc.sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-3, 5, -2]} intensity={lc.sun * 0.2} color={lc.sunColor} />

      {/* Room interior light */}
      <pointLight position={[MODULE_SIZE / 2, WALL_HEIGHT - 0.3, MODULE_SIZE / 2]} intensity={lighting === "night" ? 0.8 : 0.3} color={lighting === "night" ? "#ffcc88" : "#fff"} />

      <group position={[-MODULE_SIZE / 2, 0, -MODULE_SIZE / 2]}>
        <Floor color={floorColor} />
        <Walls color={wallColor} showFront={camera !== "interior"} wallConfigs={module.wallConfigs} />
        <Ceiling />

        {furniture.map((item) => {
          const ovr = (module.furnitureOverrides?.[module.layoutPreset] ?? {})[item.id];
          return (
            <FurniturePiece
              key={item.id}
              item={item}
              colorOverride={ovr?.color}
              rotationOverride={ovr?.rotation}
            />
          );
        })}

        {/* Plants */}
        {showPlants && (
          <group position={[2.6, 0, 2.6]}>
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.15, 0.5, 8]} />
              <meshStandardMaterial color="#8B5E3C" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.7, 0]} castShadow>
              <sphereGeometry args={[0.25, 8, 8]} />
              <meshStandardMaterial color="#4A7A4A" roughness={0.8} />
            </mesh>
          </group>
        )}
      </group>

      <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={12} blur={2.5} />

      <OrbitControls
        target={[0, 1.2, 0]}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={2}
        maxDistance={10}
        enablePan={false}
      />
    </>
  );
}

export interface RenderScene3DProps {
  module: ModuleConfig;
  lighting: LightingMode;
  camera: CameraAngle;
  showPlants: boolean;
  onReady?: (capture: () => string | null) => void;
}

export default function RenderScene3D({ module, lighting, camera, showPlants, onReady }: RenderScene3DProps) {
  const camPos = CAMERA_POSITIONS[camera];

  return (
    <Canvas
      shadows
      gl={{ preserveDrawingBuffer: true }}
      camera={{ position: camPos, fov: camera === "detail" ? 50 : 35, near: 0.1, far: 100 }}
      style={{ width: "100%", height: "100%" }}
    >
      {onReady && <CanvasCapture onReady={onReady} />}
      <SceneContent module={module} lighting={lighting} camera={camera} showPlants={showPlants} />
    </Canvas>
  );
}
