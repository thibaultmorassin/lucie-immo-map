import { CadastrePopoverData, CadastreProperties, DVFMutation } from "@/types";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseCadastreInteractionProps {
  map: maplibregl.Map | null;
  mounted: boolean;
  onMapClick?: (
    lat: number,
    lng: number,
    cadastreData?: CadastreProperties
  ) => void;
  onFetchDVF: (cadastre: CadastreProperties) => void;
  dvfHistory: Map<string, DVFMutation[]>;
}

export function useCadastreInteraction({
  map,
  mounted,
  onMapClick,
  onFetchDVF,
  dvfHistory,
}: UseCadastreInteractionProps) {
  const cadastrePopupRef = useRef<maplibregl.Popup | null>(null);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);

  const clearParcelSelection = useCallback(() => {
    if (!map) {
      return;
    }
    // If we have a specific parcel selected, try to clear it
    if (selectedParcelId) {
      try {
        map.removeFeatureState({
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
          map.removeFeatureState({
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
      map.removeFeatureState({
        source: "cadastre-dvf",
        sourceLayer: "parcelles",
      });
    } catch (e) {
      console.warn("Could not clear all feature states:", e);
    }
  }, [map, selectedParcelId]);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "Non disponible";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR");
    } catch {
      return "Non disponible";
    }
  }, []);

  const handleCreateProperty = useCallback(
    (data: CadastrePopoverData) => {
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
    },
    [onMapClick, clearParcelSelection]
  );

  const showCadastrePopup = useCallback(
    (lngLat: maplibregl.LngLat, data: CadastrePopoverData) => {
      if (!map) return;

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
              <h4 class="font-semibold text-sm" style="font-weight: 600; font-size: 14px;">Parcelle ${
                data.properties.id
              }</h4>
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
                  <span>Mis à jour: ${formatDate(
                    data.properties.updated
                  )}</span>
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

            <div class="flex flex-col gap-2"> 
              <button 
                id="create-property-btn"
                class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5"
              >
                Créer un bien ici
              </button>
              <div id="dvf-history">
              </div>
            </div>
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
        .addTo(map);

      // Add event listeners after popup is added to DOM
      const closeButton = document.getElementById("close-cadastre-popup");
      const createButton = document.getElementById("create-property-btn");
      onFetchDVF(data.properties);

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
    },
    [map, formatDate, onFetchDVF, clearParcelSelection, handleCreateProperty]
  );

  // Update DVF history in popup
  useEffect(() => {
    if (!selectedParcelId) {
      return;
    }

    const dvfHistoryElement = document.getElementById("dvf-history");
    if (!dvfHistoryElement) {
      return;
    }

    const mutations = dvfHistory.get(selectedParcelId);

    if (!mutations) {
      dvfHistoryElement.innerHTML = `<code class="text-xs text-muted-foreground">Aucune transaction récente</code>`;
      return;
    }

    mutations.forEach((mutation) => {
      console.log(mutation);
      dvfHistoryElement.innerHTML += `<li>${mutation.date_mutation}</li>`;
    });
  }, [selectedParcelId, dvfHistory]);

  // Set up map event listeners
  useEffect(() => {
    if (!map || !mounted) return;

    // Add click events for cadastre parcels
    const handleParcelClick = (e: maplibregl.MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const properties = feature.properties;

        if (map) {
          clearParcelSelection();
        }

        const featureId = feature.id;

        if (featureId !== undefined && map) {
          try {
            map.setFeatureState(
              {
                source: "cadastre-dvf",
                sourceLayer: "parcelles",
                id: featureId,
              },
              { selected: true }
            );
            setSelectedParcelId(String(properties.id));
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
    };

    // Clear selection when clicking elsewhere on the map
    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      // Check if click was not on a cadastre parcel
      const features = map.queryRenderedFeatures(e.point, {
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
    };

    map.on("click", "cadastre-parcels", handleParcelClick);
    map.on("click", handleMapClick);

    return () => {
      map.off("click", "cadastre-parcels", handleParcelClick);
      map.off("click", handleMapClick);
    };
  }, [map, mounted, clearParcelSelection, showCadastrePopup]);

  return {
    selectedParcelId,
    clearParcelSelection,
  };
}
