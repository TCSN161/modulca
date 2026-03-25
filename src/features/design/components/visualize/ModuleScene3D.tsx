"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, ContactShadows, useCursor } from "@react-three/drei";
import type { ModuleConfig } from "../../store";
import { useDesignStore } from "../../store";
import { getPreset, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import type { FurnitureItem } from "../../layouts";
import type { FurnitureOverride } from "../../store";

const MODULE_SIZE = 3; // 3m
const WALL_HEIGHT = 2.7;
const WALL_THICKNESS = 0.08;

function Floor({ color }: { color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MODULE_SIZE / 2, 0, MODULE_SIZE / 2]}>
      <planeGeometry args={[MODULE_SIZE, MODULE_SIZE]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

/** Invisible floor plane used as the raycast target for drag operations. */
function DragPlane({
  onPointerMove,
  onPointerUp,
}: {
  onPointerMove: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (e: ThreeEvent<PointerEvent>) => void;
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[MODULE_SIZE / 2, 0.001, MODULE_SIZE / 2]}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <planeGeometry args={[MODULE_SIZE, MODULE_SIZE]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

function Walls({ color }: { color: string }) {
  const halfSize = MODULE_SIZE / 2;
  const halfHeight = WALL_HEIGHT / 2;
  const halfThick = WALL_THICKNESS / 2;

  return (
    <group>
      {/* Back wall */}
      <mesh position={[halfSize, halfHeight, halfThick]}>
        <boxGeometry args={[MODULE_SIZE, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Left wall */}
      <mesh position={[halfThick, halfHeight, halfSize]}>
        <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, MODULE_SIZE]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Right wall */}
      <mesh position={[MODULE_SIZE - halfThick, halfHeight, halfSize]}>
        <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, MODULE_SIZE]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Ceiling() {
  return (
    <mesh position={[MODULE_SIZE / 2, WALL_HEIGHT, MODULE_SIZE / 2]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[MODULE_SIZE, MODULE_SIZE]} />
      <meshStandardMaterial color="#f5f5f0" transparent opacity={0.15} side={2} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Detailed furniture geometry based on label                         */
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

interface FurniturePieceProps {
  item: FurnitureItem;
  override: FurnitureOverride | undefined;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onDragStart: (e: ThreeEvent<PointerEvent>, item: FurnitureItem) => void;
}

function FurniturePiece({
  item,
  override,
  isSelected,
  isDragging,
  onSelect,
  onDragStart,
}: FurniturePieceProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const posX = override?.x ?? item.x;
  const posZ = override?.z ?? item.z;
  const displayColor = override?.color ?? item.color;
  const halfH = item.height / 2;

  return (
    <group position={[posX + item.width / 2, halfH, posZ + item.depth / 2]}>
      {/* Invisible hitbox for interaction */}
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
        <boxGeometry args={[item.width, item.height, item.depth]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Detailed geometry */}
      <DetailedFurniture
        w={item.width}
        h={item.height}
        d={item.depth}
        color={displayColor}
        label={item.label}
      />

      {/* Hover/selection glow overlay */}
      {(hovered || isSelected) && (
        <mesh>
          <boxGeometry args={[item.width, item.height, item.depth]} />
          <meshStandardMaterial
            color={displayColor}
            transparent
            opacity={0.15}
            emissive={isSelected ? "#4488ff" : "#666666"}
            emissiveIntensity={isSelected ? 0.5 : 0.2}
          />
        </mesh>
      )}

      {/* Selection wireframe outline */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[item.width + 0.02, item.height + 0.02, item.depth + 0.02]} />
          <meshBasicMaterial color="#4488ff" wireframe />
        </mesh>
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

/* ------------------------------------------------------------------ */
/*  Scene contents (inside Canvas)                                     */
/* ------------------------------------------------------------------ */

interface SceneContentProps {
  module: ModuleConfig;
  furniture: FurnitureItem[];
  floorColor: string;
  wallColor: string;
}

function SceneContent({ module, furniture, floorColor, wallColor }: SceneContentProps) {
  const orbitRef = useRef<any>(null);

  const selectedFurniture = useDesignStore((s) => s.selectedFurniture);
  const setSelectedFurniture = useDesignStore((s) => s.setSelectedFurniture);
  const updateFurnitureOverride = useDesignStore((s) => s.updateFurnitureOverride);

  const [dragging, setDragging] = useState<FurnitureItem | null>(null);
  // Offset between pointer hit and furniture center so the piece doesn't jump on grab
  const dragOffset = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  /* ---- helpers ---- */

  const clampPos = useCallback(
    (x: number, z: number, fw: number, fd: number) => ({
      x: Math.max(0, Math.min(MODULE_SIZE - fw, x)),
      z: Math.max(0, Math.min(MODULE_SIZE - fd, z)),
    }),
    [],
  );

  /** Convert a pointer event on the drag plane to room-local coords. */
  const toRoomCoords = useCallback((e: ThreeEvent<PointerEvent>) => {
    // The group is offset by [-MODULE_SIZE/2, 0, -MODULE_SIZE/2], so world
    // coords need to be shifted back into room space.
    const pt = e.point;
    return { x: pt.x + MODULE_SIZE / 2, z: pt.z + MODULE_SIZE / 2 };
  }, []);

  /* ---- arrow-key movement for selected furniture ---- */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedFurniture === null) return;

      const STEP_NORMAL = 0.05;
      const STEP_SHIFT = 0.2;

      let dx = 0;
      let dz = 0;

      switch (e.key) {
        case "ArrowUp":
          dz = -1;
          break;
        case "ArrowDown":
          dz = 1;
          break;
        case "ArrowLeft":
          dx = -1;
          break;
        case "ArrowRight":
          dx = 1;
          break;
        default:
          return;
      }

      e.preventDefault();

      const item = furniture.find((f) => f.id === selectedFurniture);
      if (!item) return;

      const step = e.shiftKey ? STEP_SHIFT : STEP_NORMAL;
      const presetOvr = module.furnitureOverrides[module.layoutPreset] ?? {};
      const override = presetOvr[selectedFurniture];
      const curX = override?.x ?? item.x;
      const curZ = override?.z ?? item.z;

      const clamped = clampPos(curX + dx * step, curZ + dz * step, item.width, item.depth);
      updateFurnitureOverride(module.row, module.col, selectedFurniture, {
        x: clamped.x,
        z: clamped.z,
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFurniture, furniture, module.furnitureOverrides, module.row, module.col, clampPos, updateFurnitureOverride]);

  /* ---- drag handlers ---- */

  const handleDragStart = useCallback(
    (e: ThreeEvent<PointerEvent>, item: FurnitureItem) => {
      e.stopPropagation();
      (e as any).nativeEvent?.target?.setPointerCapture?.((e as any).nativeEvent?.pointerId);

      const roomPt = toRoomCoords(e);
      const presetOvrDrag = module.furnitureOverrides[module.layoutPreset] ?? {};
      const overridePos = presetOvrDrag[item.id];
      const curX = overridePos?.x ?? item.x;
      const curZ = overridePos?.z ?? item.z;

      dragOffset.current = {
        x: roomPt.x - (curX + item.width / 2),
        z: roomPt.z - (curZ + item.depth / 2),
      };

      setDragging(item);
      setSelectedFurniture(item.id);
      if (orbitRef.current) orbitRef.current.enabled = false;
    },
    [module.furnitureOverrides, setSelectedFurniture, toRoomCoords],
  );

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragging) return;
      e.stopPropagation();

      const roomPt = toRoomCoords(e);
      const rawX = roomPt.x - dragOffset.current.x - dragging.width / 2;
      const rawZ = roomPt.z - dragOffset.current.z - dragging.depth / 2;
      const clamped = clampPos(rawX, rawZ, dragging.width, dragging.depth);

      updateFurnitureOverride(module.row, module.col, dragging.id, {
        x: clamped.x,
        z: clamped.z,
      });
    },
    [dragging, clampPos, module.row, module.col, toRoomCoords, updateFurnitureOverride],
  );

  const handlePointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragging) return;
      e.stopPropagation();
      setDragging(null);
      if (orbitRef.current) orbitRef.current.enabled = true;
    },
    [dragging],
  );

  const handleBackgroundClick = useCallback(() => {
    if (!dragging) setSelectedFurniture(null);
  }, [dragging, setSelectedFurniture]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[8, 10, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 6, -2]} intensity={0.3} />

      {/* Module structure */}
      <group position={[-MODULE_SIZE / 2, 0, -MODULE_SIZE / 2]}>
        <Floor color={floorColor} />
        <Walls color={wallColor} />
        <Ceiling />

        {/* Invisible drag plane */}
        <DragPlane onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} />

        {/* Furniture */}
        {furniture.map((item) => (
          <FurniturePiece
            key={item.id}
            item={item}
            override={(module.furnitureOverrides[module.layoutPreset] ?? {})[item.id]}
            isSelected={selectedFurniture === item.id}
            isDragging={dragging?.id === item.id}
            onSelect={() => setSelectedFurniture(item.id)}
            onDragStart={handleDragStart}
          />
        ))}
      </group>

      {/* Click on empty space deselects */}
      <mesh
        visible={false}
        position={[0, -0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleBackgroundClick}
      >
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial />
      </mesh>

      {/* Ground plane shadow */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.3}
        scale={10}
        blur={2}
      />

      {/* Controls */}
      <OrbitControls
        ref={orbitRef}
        target={[0, 1, 0]}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={12}
        enablePan={false}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported wrapper                                                   */
/* ------------------------------------------------------------------ */

interface ModuleScene3DProps {
  module: ModuleConfig;
}

export default function ModuleScene3D({ module }: ModuleScene3DProps) {
  const preset = getPreset(module.moduleType, module.layoutPreset);
  const furniture = preset?.furniture || [];
  const floorColor = FLOOR_MATERIALS.find((f) => f.id === module.floorFinish)?.color || "#D4A76A";
  const wallColor = WALL_MATERIALS.find((w) => w.id === module.wallColor)?.color || "#F0EDE5";

  return (
    <Canvas
      shadows
      camera={{
        position: [5.5, 4.5, 5.5],
        fov: 35,
        near: 0.1,
        far: 100,
      }}
      style={{ background: "#f8f8f6" }}
    >
      <SceneContent
        module={module}
        furniture={furniture}
        floorColor={floorColor}
        wallColor={wallColor}
      />
    </Canvas>
  );
}
