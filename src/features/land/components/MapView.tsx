"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon as LeafletPolygon,
  Polygon,
  CircleMarker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLandStore, type MapLayer } from "../store";
import { createCellCornersFn, getPolygonCenter } from "../utils/grid";
import { MODULE_TYPES } from "@/shared/types";

const TILE_LAYERS: Record<
  MapLayer,
  { url: string; attribution: string; maxZoom: number; maxNativeZoom: number }
> = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 22,
    maxNativeZoom: 18,
  },
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 22,
    maxNativeZoom: 19,
  },
  hybrid: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 22,
    maxNativeZoom: 18,
  },
};

/* Street labels overlay for satellite/hybrid modes */
const LABELS_OVERLAY = {
  url: "https://stamen-tiles.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png",
  attribution: "Labels &copy; Stamen Design",
  maxZoom: 22,
  maxNativeZoom: 18,
};

/** Handle map click events for polygon drawing */
function DrawHandler() {
  const { isDrawing, addPolygonPoint } = useLandStore();

  useMapEvents({
    click(e) {
      if (isDrawing) {
        addPolygonPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });

  return null;
}

/** Render the grid cells on the map as properly-squared polygons */
function GridOverlay() {
  const {
    gridCells,
    polygon,
    gridRotation,
    selectedModuleType,
    placeModule,
    removeModule,
  } = useLandStore();

  // Precompute the corner function (avoids recalculating bbox per cell)
  const getCorners = useMemo(() => {
    if (polygon.length < 3 || gridCells.length === 0) return null;
    const center = getPolygonCenter(polygon);
    return createCellCornersFn(polygon, center, gridRotation);
  }, [polygon, gridCells.length, gridRotation]);

  if (!getCorners) return null;

  return (
    <>
      {gridCells.map((cell) => {
        const corners = getCorners(cell.row, cell.col);

        const moduleColor = cell.moduleType
          ? MODULE_TYPES.find((m) => m.id === cell.moduleType)?.color || "#ccc"
          : "transparent";

        return (
          <Polygon
            key={`${cell.row}-${cell.col}`}
            positions={corners}
            pathOptions={{
              color: cell.moduleType ? moduleColor : "rgba(255,255,255,0.6)",
              weight: 1,
              fillColor: moduleColor,
              fillOpacity: cell.moduleType ? 0.75 : 0.05,
            }}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                if (cell.moduleType) {
                  removeModule(cell.row, cell.col);
                } else if (selectedModuleType) {
                  placeModule(cell.row, cell.col);
                }
              },
            }}
          />
        );
      })}
    </>
  );
}

/** Sync map center/zoom when store changes (e.g. from address search) */
function MapSync() {
  const map = useMap();
  const { mapCenter, mapZoom } = useLandStore();

  useEffect(() => {
    map.flyTo([mapCenter.lat, mapCenter.lng], mapZoom, { duration: 1.5 });
  }, [map, mapCenter.lat, mapCenter.lng, mapZoom]);

  return null;
}

/** Fit map to polygon bounds */
function FitBounds() {
  const map = useMap();
  const { polygon, phase } = useLandStore();

  useEffect(() => {
    if (polygon.length >= 3 && (phase === "grid" || phase === "modules")) {
      const bounds = L.latLngBounds(
        polygon.map((p) => [p.lat, p.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [polygon, phase, map]);

  return null;
}

export default function MapView() {
  const { mapCenter, mapZoom, mapLayer, polygon, phase } = useLandStore();
  const tile = TILE_LAYERS[mapLayer];

  return (
    <MapContainer
      center={[mapCenter.lat, mapCenter.lng]}
      zoom={mapZoom}
      maxZoom={22}
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        key={mapLayer}
        url={tile.url}
        attribution={tile.attribution}
        maxZoom={tile.maxZoom}
        maxNativeZoom={tile.maxNativeZoom}
      />

      {/* Street/city labels on top of satellite and hybrid views */}
      {(mapLayer === "satellite" || mapLayer === "hybrid") && (
        <TileLayer
          key={`${mapLayer}-labels`}
          url={LABELS_OVERLAY.url}
          attribution={LABELS_OVERLAY.attribution}
          maxZoom={LABELS_OVERLAY.maxZoom}
          maxNativeZoom={LABELS_OVERLAY.maxNativeZoom}
          pane="overlayPane"
        />
      )}

      <MapSync />
      <DrawHandler />
      <FitBounds />

      {/* User-drawn polygon */}
      {polygon.length >= 3 && (
        <LeafletPolygon
          positions={polygon.map((p) => [p.lat, p.lng] as [number, number])}
          pathOptions={{
            color: "#E8913A",
            weight: 2,
            fillColor: "#E8913A",
            fillOpacity: 0.1,
            dashArray: "6 4",
          }}
        />
      )}

      {/* Drawing vertices */}
      {phase === "draw" &&
        polygon.map((p, i) => (
          <CircleMarker
            key={i}
            center={[p.lat, p.lng]}
            radius={5}
            pathOptions={{
              color: "#E8913A",
              fillColor: "#fff",
              fillOpacity: 1,
              weight: 2,
            }}
          />
        ))}

      {/* Grid overlay */}
      {(phase === "grid" || phase === "modules") && <GridOverlay />}
    </MapContainer>
  );
}
