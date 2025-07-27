import { CadastreProperties, Property } from "@/types";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCadastreInteraction } from "@/hooks/use-cadastre-interaction";
import { useDVFData } from "@/hooks/use-dvf-data";
import { useMapInstance } from "@/hooks/use-map-instance";
import { usePropertyMarkers } from "@/hooks/use-property-markers";

interface MapProps {
  center: [number, number];
  zoom: number;
  properties: Property[];
  onPropertyClick: (property: Property) => void;
  onMapClick?: (
    lat: number,
    lng: number,
    cadastreData?: CadastreProperties
  ) => void;
}

export default function MapLibreMap({
  center,
  zoom,
  properties,
  onPropertyClick,
  onMapClick,
}: MapProps) {
  // Initialize map instance and basic setup
  const { mapContainer, map, mounted } = useMapInstance({ center, zoom });

  // Handle DVF data fetching and management
  const { dvfHistory, fetchDVFData } = useDVFData();

  // Handle cadastre interactions (parcels, popup, selection)
  useCadastreInteraction({
    map,
    mounted,
    onMapClick,
    onFetchDVF: fetchDVFData,
    dvfHistory,
  });

  // Handle property markers rendering
  usePropertyMarkers({
    map,
    mounted,
    properties,
    onPropertyClick,
  });

  if (typeof window === "undefined") {
    return null;
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      <style>{`
        .maplibregl-popup-content {
          border: 0 !important;
          padding: 0;
          background-color: var(--background);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          --tw-shadow: 0 10px 15px -3px var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 4px 6px -4px var(--tw-shadow-color, rgb(0 0 0 / 0.1));
          box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
          --tw-shadow-color: rgb(0 0 0 / 0.1);
        }
      `}</style>
    </div>
  );
}
