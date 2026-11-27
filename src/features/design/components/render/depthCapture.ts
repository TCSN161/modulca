/**
 * Depth map of the current 3D camera (5.03-A, bake-off §5 / §8.2).
 *
 * Contract (3.07): PNG, same camera and size as the RGB capture,
 * white = near, black = far. We render a LINEAR depth pass with a tiny shader
 * (MeshDepthMaterial is non-linear in perspective), with near/far tightened to
 * the house so the full grey range is used.
 */
import * as THREE from "three";

/** Near/far planes around a bounding sphere, seen from the camera. */
export function depthRange(
  cam: [number, number, number],
  center: [number, number, number],
  radius: number,
): { near: number; far: number } {
  const d = Math.hypot(cam[0] - center[0], cam[1] - center[1], cam[2] - center[2]);
  const near = Math.max(0.05, d - radius);
  const far = Math.max(near + 0.5, d + radius);
  return { near, far };
}

/** Same formula as the shader: view-space distance → grey 0..255 (255 = near). */
export function depthToGray(viewDist: number, near: number, far: number): number {
  const t = Math.min(1, Math.max(0, (viewDist - near) / (far - near)));
  return Math.round((1 - t) * 255);
}

export function createLinearDepthMaterial(near: number, far: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { uNear: { value: near }, uFar: { value: far } },
    vertexShader: /* glsl */ `
      varying float vDist;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDist = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uNear;
      uniform float uFar;
      varying float vDist;
      void main() {
        float t = clamp((vDist - uNear) / (uFar - uNear), 0.0, 1.0);
        gl_FragColor = vec4(vec3(1.0 - t), 1.0);
      }`,
    side: THREE.DoubleSide,
  });
}

/**
 * Render the scene once with the depth material and return a PNG data URI of
 * the canvas, then restore the scene and redraw the normal frame.
 * `center`/`radius` describe the house (bounding sphere).
 */
export function captureDepthPng(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  center: [number, number, number],
  radius: number,
): string | null {
  const p = camera.position;
  const { near, far } = depthRange([p.x, p.y, p.z], center, radius);
  const mat = createLinearDepthMaterial(near, far);
  const prevOverride = scene.overrideMaterial;
  const prevBg = scene.background;
  const prevShadows = gl.shadowMap.enabled;
  // Helper planes (click areas, contact shadows) lie on the floor, so they
  // get the floor's depth: nothing needs hiding.
  try {
    scene.overrideMaterial = mat;
    scene.background = new THREE.Color("#000000");
    gl.shadowMap.enabled = false;
    gl.render(scene, camera);
    return gl.domElement.toDataURL("image/png");
  } catch {
    return null;
  } finally {
    scene.overrideMaterial = prevOverride;
    scene.background = prevBg;
    gl.shadowMap.enabled = prevShadows;
    mat.dispose();
    gl.render(scene, camera);
  }
}

/** RGB frame of the current camera: render now so the buffer is fresh. */
export function captureRgbPng(gl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): string | null {
  try {
    gl.render(scene, camera);
    return gl.domElement.toDataURL("image/png");
  } catch {
    return null;
  }
}
