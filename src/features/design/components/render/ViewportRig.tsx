"use client";

/**
 * Camera rig + capture for the render viewport (5.03-A, fixes bake-off B1).
 *
 * Lives inside a <Canvas> next to an <OrbitControls makeDefault>. It moves the
 * live camera when the preset changes (the Canvas `camera` prop is read only
 * once), applies the field of view, and registers the capture functions:
 * RGB frame + linear depth map of exactly the same camera.
 */
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PerspectiveCamera, type Vector3 } from "three";
import type { CameraPose } from "./cameraPresets";
import { captureDepthPng, captureRgbPng } from "./depthCapture";

export interface SceneCapture {
  /** PNG data URI of the current frame */
  rgb: () => string | null;
  /** PNG data URI: white = near, black = far, same camera and size */
  depth: () => string | null;
}

export interface ViewportRigProps {
  pose: CameraPose;
  /** Changes when the preset (or the room it targets) changes: re-places the camera. */
  poseKey: string;
  fovDeg: number;
  /** Bounding sphere of the house, for the depth range. */
  sphere: { center: [number, number, number]; radius: number };
  onReady?: (capture: SceneCapture) => void;
}

export function ViewportRig({ pose, poseKey, fovDeg, sphere, onReady }: ViewportRigProps) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const controls = useThree((s) => s.controls) as unknown as { target: Vector3; update: () => void } | null;

  useEffect(() => {
    camera.position.set(...pose.position);
    if (controls?.target) {
      controls.target.set(...pose.target);
      controls.update();
    } else {
      camera.lookAt(...pose.target);
    }
    // pose is read through poseKey on purpose: orbiting must not be undone on re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poseKey, camera, controls]);

  useEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      camera.fov = fovDeg;
      camera.updateProjectionMatrix();
    }
  }, [camera, fovDeg]);

  const [cx, cy, cz] = sphere.center;
  const r = sphere.radius;
  useEffect(() => {
    onReady?.({
      rgb: () => captureRgbPng(gl, scene, camera),
      depth: () => captureDepthPng(gl, scene, camera, [cx, cy, cz], r),
    });
  }, [gl, scene, camera, cx, cy, cz, r, onReady]);

  return null;
}

/** OrbitControls settings: look-around in place for first-person, orbit otherwise. */
export function orbitPropsFor(firstPerson: boolean, orbit: { minDistance: number; maxDistance: number; maxPolarAngle: number }) {
  return firstPerson
    ? { minDistance: 0.01, maxDistance: 0.1, enableZoom: false, enablePan: false, rotateSpeed: -0.35, minPolarAngle: 0.3, maxPolarAngle: Math.PI - 0.3 }
    : { ...orbit, enableZoom: true, rotateSpeed: 1, minPolarAngle: 0.05 };
}
