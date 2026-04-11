/**
 * ModulCA Asset Library — Public API
 *
 * Import everything from here:
 *   import { PRODUCT_CATALOG, unsplash, getProduct } from "@/assets";
 */

// Types
export type {
  AssetSource,
  AssetFormat,
  AssetCategory,
  AssetSubcategory,
  MaterialSubcategory,
  FurnitureSubcategory,
  FixtureSubcategory,
  Asset,
  ImageAsset,
  Model3DAsset,
  DocumentAsset,
  AnyAsset,
  ProductEntry,
  AssetCollection,
  ImageSizeParams,
  UnsplashParams,
} from "./types";

// Source utilities
export {
  unsplash,
  extractUnsplashId,
  pexels,
  pixabay,
  local,
  model,
  unsplashSrcSet,
  SOURCE_INFO,
  IMAGE_APIS,
} from "./sources";

// Registry (data)
export {
  PRODUCT_CATALOG,
  MODEL_REGISTRY,
  STYLE_HERO_IMAGES,
  PORTFOLIO_IMAGES,
  getProduct,
  getProductsByCategory,
  getProductsByStyle,
  getProductsByRoom,
  getModel3D,
  searchProducts,
} from "./registry";
