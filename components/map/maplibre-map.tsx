import { Property } from "@/types";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";

// Custom property marker icon SVG
const propertyMarkerSVG = `
<svg width="25" height="35" viewBox="0 0 25 35" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 21.875 12.5 35 12.5 35C12.5 35 25 21.875 25 12.5C25 5.596 19.404 0 12.5 0Z" fill="#10B981"/>
  <circle cx="12.5" cy="12.5" r="5" fill="white"/>
  <circle cx="12.5" cy="12.5" r="3" fill="#10B981"/>
</svg>
`;

interface CadastreProperties {
  commune?: string;
  section?: string;
  numero?: string;
  contenance?: number;
  nature_culture?: string;
  code_insee?: string;
  updated?: string;
  created?: string;
}

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

interface CadastrePopoverData {
  lat: number;
  lng: number;
  properties: CadastreProperties;
}

export default function MapLibreMap({
  center,
  zoom,
  properties,
  onPropertyClick,
  onMapClick,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);

  const map = useRef<maplibregl.Map | null>(null);
  const cadastrePopupRef = useRef<maplibregl.Popup | null>(null);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);

  const clearParcelSelection = () => {
    if (!map.current) {
      return;
    }
    // If we have a specific parcel selected, try to clear it
    if (selectedParcelId) {
      try {
        map.current.removeFeatureState({
          source: "cadastre-dvf",
          sourceLayer: "parcelles",
          id: selectedParcelId,
        });
      } catch (e) {
        console.warn("Could not clear previous selection:", e);
      }

      // Also try with numeric ID if stored as string
      try {
        const numericId = Number(selectedParcelId);
        if (!isNaN(numericId)) {
          map.current.removeFeatureState({
            source: "cadastre-dvf",
            sourceLayer: "parcelles",
            id: numericId,
          });
        }
      } catch (e) {
        console.warn("Could not clear previous numeric selection:", e);
      }
    }

    // As a fallback, clear all feature states from the layer
    try {
      map.current.removeFeatureState({
        source: "cadastre-dvf",
        sourceLayer: "parcelles",
      });
    } catch (e) {
      console.warn("Could not clear all feature states:", e);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) {
      return;
    }

    // Create map instance
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "carto-light": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
              "https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: '© <a href="https://carto.com/attributions">CARTO</a>',
          },
          "cadastre-dvf": {
            type: "vector",
            tiles: [
              "https://openmaptiles.data.gouv.fr/data/cadastre-dvf/{z}/{x}/{y}.pbf",
            ],
            attribution: '© <a href="https://www.cadastre.gouv.fr/">DGFiP</a>',
            minzoom: 16,
            maxzoom: 16, // Server only provides tiles up to zoom 16
          },
        },
        layers: [
          // Base map layer
          {
            id: "carto-light",
            type: "raster",
            source: "carto-light",
            layout: {
              visibility: "visible",
            },
          },
          // Cadastre parcels layer
          {
            id: "cadastre-parcels",
            type: "fill",
            source: "cadastre-dvf",
            "source-layer": "parcelles", // This might need adjustment based on actual data structure
            minzoom: 16,
            maxzoom: 20, // Display up to zoom 20 using zoom 16 tiles
            paint: {
              "fill-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                "#3b82f6", // Blue color for selected parcel
                "#e74c3c", // Default red color
              ],
              "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                0.3, // Higher opacity for selected parcel
                0.1, // Default opacity
              ],
            },
          },
          // Cadastre parcel borders
          {
            id: "cadastre-borders",
            type: "line",
            source: "cadastre-dvf",
            "source-layer": "parcelles",
            minzoom: 16,
            maxzoom: 20, // Display up to zoom 20 using zoom 16 tiles
            paint: {
              "line-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                "#3b82f6", // Blue color for selected parcel
                "#e74c3c", // Default red color
              ],
              "line-width": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                2, // Thicker border for selected parcel
                1, // Default width
              ],
              "line-opacity": 0.8,
            },
          },
        ],
      },
      center: center,
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    const geolocateControl = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      fitBoundsOptions: { padding: 200 },
      trackUserLocation: true,
    });
    map.current.addControl(geolocateControl, "top-right");

    map.current.on("load", () => {
      geolocateControl.trigger();
    });
    // Add click events for cadastre parcels
    map.current.on("click", "cadastre-parcels", (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const properties = feature.properties;

        if (map.current) {
          clearParcelSelection();
        }

        const featureId = feature.id;
        if (featureId !== undefined && map.current) {
          try {
            map.current.setFeatureState(
              {
                source: "cadastre-dvf",
                sourceLayer: "parcelles",
                id: featureId,
              },
              { selected: true }
            );
            setSelectedParcelId(String(featureId));
          } catch (e) {
            console.warn("Could not set feature state:", e);
          }
        }

        // Set cadastre popover data
        const cadastreData = {
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
          properties,
        };
        // Create and show MapLibre popup
        showCadastrePopup(e.lngLat, cadastreData);

        // Prevent event from bubbling to map click
        e.preventDefault();
      }
    });

    // Add hover cursor for cadastre parcels
    map.current.on("mouseenter", "cadastre-parcels", () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = "pointer";
      }
    });

    map.current.on("mouseleave", "cadastre-parcels", () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = "";
      }
    });

    // Clear selection when clicking elsewhere on the map
    map.current.on("click", (e) => {
      // Check if click was not on a cadastre parcel
      const features = map.current?.queryRenderedFeatures(e.point, {
        layers: ["cadastre-parcels"],
      });

      if (!features || features.length === 0) {
        // Close any open popup
        if (cadastrePopupRef.current) {
          cadastrePopupRef.current.remove();
          cadastrePopupRef.current = null;
        }
        // Clear parcel selection
        clearParcelSelection();
      }
    });

    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, zoom]);

  // Update map center when user location changes
  useEffect(() => {
    if (!map.current || !mounted) {
      return;
    }

    // Smoothly pan to new center
    map.current.easeTo({
      center: [center[1], center[0]],
      duration: 1000,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Add property markers
  useEffect(() => {
    if (!map.current || !mounted) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll(".property-marker");
    existingMarkers.forEach((marker) => marker.remove());

    // Add new markers
    properties.forEach((property) => {
      // Create marker element
      const markerElement = document.createElement("div");
      markerElement.className = "property-marker";
      markerElement.innerHTML = propertyMarkerSVG;
      markerElement.style.cursor = "pointer";

      // Add click event
      markerElement.addEventListener("click", () => {
        onPropertyClick(property);
      });

      // Create MapLibre marker
      const marker = new maplibregl.Marker(markerElement)
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current!);

      // Add popup
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">${
              property.title
            }</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${
              property.address
            }</p>
            <p style="font-weight: bold; color: #10B981; font-size: 16px; margin-bottom: 8px;">
              ${new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(property.price)}
            </p>
            <div style="display: flex; gap: 8px; font-size: 12px; color: #666;">
              ${
                property.bedrooms ? `<span>${property.bedrooms} ch.</span>` : ""
              }
              ${
                property.bathrooms
                  ? `<span>${property.bathrooms} sdb.</span>`
                  : ""
              }
              ${property.area_sqm ? `<span>${property.area_sqm} m²</span>` : ""}
            </div>
            ${
              property.description
                ? `<p style="font-size: 12px; color: #333; margin-top: 8px; line-height: 1.4;">${property.description}</p>`
                : ""
            }
          </div>
        `);

      marker.setPopup(popup);
    });
  }, [properties, onPropertyClick, mounted]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Non disponible";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR");
    } catch {
      return "Non disponible";
    }
  };

  const showCadastrePopup = (
    lngLat: maplibregl.LngLat,
    data: CadastrePopoverData
  ) => {
    if (!map.current) return;

    // Close existing popup
    if (cadastrePopupRef.current) {
      cadastrePopupRef.current.remove();
    }

    // Create popup HTML with exact same styles
    const popupHTML = `
      <div class="bg-background rounded-lg shadow-lg border p-4 max-w-sm" style="font-family: inherit;">
        <button 
          id="close-cadastre-popup" 
          class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          style="position: absolute; top: 8px; right: 8px; background: none; border: none; font-size: 18px; cursor: pointer;"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
        </button>

        <div class="space-y-3 w-48">
          <div class="flex items-center gap-2" style="display: flex; align-items: center; gap: 8px;">
            <svg class="h-4 w-4 text-red-500" style="width: 16px; height: 16px; color: #ef4444;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <h4 class="font-semibold text-sm" style="font-weight: 600; font-size: 14px;">Parcelle Cadastrale</h4>
          </div>

          <div class="flex flex-col gap-1 text-sm text-muted-foreground">
            ${
              data.properties.updated
                ? `
              <div class="flex items-center gap-2">
                <svg class="h-3 w-3" style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Mis à jour: ${formatDate(data.properties.updated)}</span>
              </div>
            `
                : ""
            }
            
            ${
              !data.properties.updated && data.properties.created
                ? `
              <div class="flex items-center gap-2" style="display: flex; align-items: center; gap: 8px;">
                <svg class="h-3 w-3" style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Créé: ${formatDate(data.properties.created)}</span>
              </div>
            `
                : ""
            }

            ${
              data.properties.contenance
                ? `
              <div class="flex items-center gap-2" style="display: flex; align-items: center; gap: 8px;">
                <svg class="h-3 w-3" style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
                <span>Surface: ${Math.round(
                  data.properties.contenance
                )} m²</span>
              </div>
            `
                : ""
            }

            ${
              data.properties.commune
                ? `
              <p><strong>Commune:</strong> ${data.properties.commune}</p>
            `
                : ""
            }

            ${
              data.properties.section
                ? `
              <p><strong>Section:</strong> ${data.properties.section}</p>
            `
                : ""
            }
          </div>

          <button 
            id="create-property-btn"
            class="w-full relative h-10 px-4 py-2 [&_svg:not([class*='size-'])]:size-5 font-sans cursor-pointer inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all bg-slate-900 text-background shadow-[0_0_0_1px_var(--slate-900)] hover:bg-slate-800 hover:shadow-[0_0_0_1px_var(--slate-800)] disabled:shadow-border-disabled dark:bg-slate-50 dark:hover:bg-slate-100 dark:hover:shadow-[0_0_0_1px_var(--slate-100)]"
          >
            Créer un bien ici
          </button>
        </div>
      </div>
    `;

    // Create popup
    cadastrePopupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: [0, -10],
    })
      .setLngLat(lngLat)
      .setHTML(popupHTML)
      .addTo(map.current);

    // Add event listeners after popup is added to DOM

    const closeButton = document.getElementById("close-cadastre-popup");
    const createButton = document.getElementById("create-property-btn");

    if (closeButton) {
      closeButton.addEventListener("click", () => {
        if (cadastrePopupRef.current) {
          cadastrePopupRef.current.remove();
          cadastrePopupRef.current = null;
        }
        clearParcelSelection();
      });
    }

    if (createButton) {
      createButton.addEventListener("click", () => {
        handleCreateProperty(data);
      });
    }
  };

  const handleCreateProperty = (data: CadastrePopoverData) => {
    if (data && onMapClick) {
      onMapClick(data.lat, data.lng, data.properties);
    }
    // Close the popup
    if (cadastrePopupRef.current) {
      cadastrePopupRef.current.remove();
      cadastrePopupRef.current = null;
    }
    // Clear parcel selection
    clearParcelSelection();
  };

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
