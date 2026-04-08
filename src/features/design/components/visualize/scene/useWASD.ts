"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

const MOVE_SPEED = 4; // units per second

/**
 * WASD + QE camera panning for the Visualize scene.
 * Moves the OrbitControls target (and camera) in the XZ plane.
 * Q/E raise/lower the camera vertically.
 */
export function useWASD(orbitRef: React.RefObject<OrbitControlsImpl | null>) {
  const keys = useRef(new Set<string>());

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", "q", "e"].includes(key)) {
        keys.current.add(key);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      keys.current.delete(e.key.toLowerCase());
    };
    // Clear all on blur to prevent stuck keys
    const onBlur = () => keys.current.clear();

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useFrame((_, delta) => {
    if (keys.current.size === 0) return;
    const controls = orbitRef.current;
    if (!controls) return;

    const cam = controls.object;
    const speed = MOVE_SPEED * delta;

    // Forward direction in XZ plane (camera look direction projected)
    const forward = cam.getWorldDirection(cam.position.clone()).setY(0).normalize();
    const right = forward.clone().cross(cam.up).normalize();

    let dx = 0, dz = 0, dy = 0;
    if (keys.current.has("w")) { dx += forward.x; dz += forward.z; }
    if (keys.current.has("s")) { dx -= forward.x; dz -= forward.z; }
    if (keys.current.has("d")) { dx += right.x; dz += right.z; }
    if (keys.current.has("a")) { dx -= right.x; dz -= right.z; }
    if (keys.current.has("q")) dy -= 1;
    if (keys.current.has("e")) dy += 1;

    if (dx === 0 && dz === 0 && dy === 0) return;

    cam.position.x += dx * speed;
    cam.position.z += dz * speed;
    cam.position.y += dy * speed;
    controls.target.x += dx * speed;
    controls.target.z += dz * speed;
    controls.target.y += dy * speed;
    controls.update();
  });
}
