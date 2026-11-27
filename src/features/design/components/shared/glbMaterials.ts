import * as THREE from "three";

/**
 * 3.10: the furniture GLBs in public/models all ship `KHR_materials_unlit`, so
 * GLTFLoader builds MeshBasicMaterial: no light, no shade, no shadow. That flat
 * look is what reads as "blurry" in the configurator (DPR and antialias are fine).
 * This swaps each basic material for a matte MeshStandardMaterial with the same
 * colour/map and turns shadows on. Converted materials are cached per source
 * material, so clones of one model share them. A real PBR GLB passes through.
 */
const litCache = new WeakMap<THREE.Material, THREE.Material>();

export function toLitMaterial(m: THREE.Material): THREE.Material {
  if (!(m instanceof THREE.MeshBasicMaterial)) return m;
  const cached = litCache.get(m);
  if (cached) return cached;
  const lit = new THREE.MeshStandardMaterial({
    name: m.name,
    color: m.color.clone(),
    map: m.map,
    alphaMap: m.alphaMap,
    transparent: m.transparent,
    opacity: m.opacity,
    side: m.side,
    vertexColors: m.vertexColors,
    roughness: 0.8,
    metalness: 0,
  });
  litCache.set(m, lit);
  return lit;
}

export function makeGlbLit(root: THREE.Object3D): void {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
    child.material = Array.isArray(child.material)
      ? child.material.map(toLitMaterial)
      : toLitMaterial(child.material);
  });
}
