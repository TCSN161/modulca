"use client";

import { useRef, useEffect, Component } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { MODULE_SIZE, WALL_HEIGHT } from "./constants";

/* ------------------------------------------------------------------ */
/*  Error boundary for R3F Canvas contents                             */
/* ------------------------------------------------------------------ */

interface CanvasErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
}

export class CanvasErrorBoundary extends Component<CanvasErrorBoundaryProps, CanvasErrorBoundaryState> {
  constructor(props: CanvasErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("[ModuleScene3D] Canvas error caught by boundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/*  HTML overlay shown when Canvas encounters an error                 */
/* ------------------------------------------------------------------ */

export function CanvasErrorFallback() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f8f6",
      }}
    >
      <div style={{ textAlign: "center", color: "#888", fontSize: 14 }}>
        <p style={{ fontWeight: 600 }}>3D view failed to load</p>
        <p style={{ fontSize: 12, marginTop: 4 }}>
          Try switching modules or refreshing the page.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading spinner shown inside the Canvas while GLBs load            */
/* ------------------------------------------------------------------ */

export function LoadingIndicator() {
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => {
    let id: number;
    const spin = () => {
      if (ref.current) ref.current.rotation.y += 0.03;
      id = requestAnimationFrame(spin);
    };
    id = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <mesh ref={ref} position={[0, 1, 0]}>
      <torusGeometry args={[0.3, 0.06, 8, 24]} />
      <meshStandardMaterial color="#888" transparent opacity={0.5} />
    </mesh>
  );
}

export function Floor({ color }: { color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MODULE_SIZE / 2, 0, MODULE_SIZE / 2]}>
      <planeGeometry args={[MODULE_SIZE, MODULE_SIZE]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

/** Invisible floor plane used as the raycast target for drag operations. */
export function DragPlane({
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

export function Ceiling() {
  return (
    <mesh position={[MODULE_SIZE / 2, WALL_HEIGHT, MODULE_SIZE / 2]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[MODULE_SIZE, MODULE_SIZE]} />
      <meshStandardMaterial color="#f5f5f0" transparent opacity={0.15} side={2} />
    </mesh>
  );
}
