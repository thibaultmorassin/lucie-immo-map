"use client";

import { DVFMutationsDialog } from "@/components/map/dvf-mutations-dialog";
import { CadastrePopoverData, CadastreProperties } from "@/types";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDVFData } from "./use-dvf-data";

interface UseCadastreInteractionProps {
  map: maplibregl.Map | null;
  mounted: boolean;
  onMapClick?: (
    lat: number,
    lng: number,
    cadastreData?: CadastreProperties
  ) => void;
}

// Helper functions for formatting
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
  });
};

export function useCadastreInteraction({
  map,
  mounted,
  onMapClick,
}: UseCadastreInteractionProps) {
  const cadastrePopupRef = useRef<maplibregl.Popup | null>(null);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<
    string | number | null
  >(null);
  const [selectedCadastre, setSelectedCadastre] =
    useState<CadastreProperties | null>(null);
  const [showMutationsDialog, setShowMutationsDialog] = useState(false);

  // Track DVF data for all visible parcels
  const dvfDataByParcelRef = useRef<Map<string, boolean>>(new Map());
  const isLoadingDVFDataRef = useRef<boolean>(false);
  const [isLoadingDVFData, setIsLoadingDVFData] = useState<boolean>(false);

  // Use the new DVF data hook with React Query
  const { dvfHistory, isLoading: isDVFLoading } = useDVFData(
    selectedCadastre || undefined
  );

  // Function to load DVF data for the current map bounds
  const loadDVFDataForBounds = useCallback(async () => {
    if (!map || !mounted || isLoadingDVFDataRef.current) {
      return;
    }

    isLoadingDVFDataRef.current = true;
    setIsLoadingDVFData(true);

    try {
      // Query visible parcels
      const features = map.queryRenderedFeatures(undefined, {
        layers: ["cadastre-parcels"],
      });

      if (features.length === 0) {
        isLoadingDVFDataRef.current = false;
        setIsLoadingDVFData(false);
        return;
      }

      // Group parcels by section (commune/prefixe/section)
      const sectionGroups = new Map<
        string,
        {
          features: maplibregl.MapGeoJSONFeature[];
          cadastreProps: CadastreProperties;
        }
      >();

      features.forEach((feature) => {
        const props = feature.properties;
        if (props?.commune && props?.prefixe && props?.section) {
          const sectionKey = `${props.commune}/${props.prefixe}${props.section}`;
          if (!sectionGroups.has(sectionKey)) {
            sectionGroups.set(sectionKey, {
              features: [],
              cadastreProps: props as CadastreProperties,
            });
          }
          sectionGroups.get(sectionKey)!.features.push(feature);
        }
      });

      // Load DVF data for each section
      const dvfPromises = Array.from(sectionGroups.entries()).map(
        async ([sectionKey, { features, cadastreProps }]) => {
          try {
            const response = await fetch(
              `https://dvf-api.data.gouv.fr/mutations/${cadastreProps.commune}/${cadastreProps.prefixe}${cadastreProps.section}`
            );

            if (!response.ok) {
              // Mark all parcels in this section as having no DVF data
              features.forEach((feature) => {
                if (feature.properties?.id) {
                  dvfDataByParcelRef.current.set(feature.properties.id, false);
                }
              });
              return;
            }

            const data = await response.json();
            const dvfParcelIds = new Set(
              data.data?.map(
                (mutation: { id_parcelle: string }) => mutation.id_parcelle
              ) || []
            );

            // Update feature states for all parcels in this section
            features.forEach((feature) => {
              const parcelId = feature.properties?.id;
              if (parcelId) {
                const hasDVF = dvfParcelIds.has(parcelId);
                dvfDataByParcelRef.current.set(parcelId, hasDVF);

                // Update MapLibre feature state
                try {
                  map.setFeatureState(
                    {
                      source: "cadastre-dvf",
                      sourceLayer: "parcelles",
                      id: feature.id,
                    },
                    { hasDVF }
                  );
                } catch {
                  // Try with feature.properties.id if feature.id fails
                  try {
                    map.setFeatureState(
                      {
                        source: "cadastre-dvf",
                        sourceLayer: "parcelles",
                        id: parcelId,
                      },
                      { hasDVF }
                    );
                  } catch (error) {
                    console.warn(
                      "Could not set feature state for parcel:",
                      parcelId,
                      error
                    );
                  }
                }
              }
            });
          } catch (error) {
            console.warn(
              `Error loading DVF data for section ${sectionKey}:`,
              error
            );
            // Mark all parcels in this section as having no DVF data
            features.forEach((feature) => {
              if (feature.properties?.id) {
                dvfDataByParcelRef.current.set(feature.properties.id, false);
              }
            });
          }
        }
      );

      await Promise.all(dvfPromises);
    } catch (error) {
      console.warn("Error loading DVF data for bounds:", error);
    } finally {
      isLoadingDVFDataRef.current = false;
      setIsLoadingDVFData(false);
    }
  }, [map, mounted]);

  // Load DVF data when map moves or zooms (with debouncing)
  useEffect(() => {
    if (!map || !mounted) {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const handleMapUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        loadDVFDataForBounds();
      }, 1000);
    };

    map.on("moveend", handleMapUpdate);
    map.on("zoomend", handleMapUpdate);

    // Initial load
    handleMapUpdate();

    return () => {
      clearTimeout(timeoutId);
      map.off("moveend", handleMapUpdate);
      map.off("zoomend", handleMapUpdate);
    };
  }, [map, mounted, loadDVFDataForBounds]);

  const clearParcelSelection = useCallback(() => {
    if (!map) {
      return;
    }

    // Clear the selected feature using the MapLibre feature ID
    if (selectedFeatureId !== null) {
      try {
        // Get the current DVF state for this parcel
        const hasDVF = selectedParcelId
          ? dvfDataByParcelRef.current.get(selectedParcelId) || false
          : false;

        map.removeFeatureState({
          source: "cadastre-dvf",
          sourceLayer: "parcelles",
          id: selectedFeatureId,
        });

        // Restore DVF state without selection
        map.setFeatureState(
          {
            source: "cadastre-dvf",
            sourceLayer: "parcelles",
            id: selectedFeatureId,
          },
          { hasDVF }
        );
      } catch (e) {
        console.warn("Could not clear feature selection:", e);
      }
    }

    setSelectedParcelId(null);
    setSelectedFeatureId(null);
    setSelectedCadastre(null);
  }, [map, selectedFeatureId, selectedParcelId]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map]
  );

  // Update DVF history in popup when data is loaded
  useEffect(() => {
    if (!selectedParcelId || !selectedCadastre) {
      return;
    }

    const dvfHistoryElement = document.getElementById("dvf-history");
    if (!dvfHistoryElement) {
      return;
    }

    if (isDVFLoading) {
      dvfHistoryElement.innerHTML = `<div class="text-xs text-muted-foreground">Chargement des données DVF...</div>`;
      return;
    }

    const mutations = dvfHistory.get(selectedParcelId);

    if (!mutations || mutations.length === 0) {
      dvfHistoryElement.innerHTML = `<h5 class="font-medium text-sm">Aucune transaction récente</h5>`;
      return;
    }

    // Sort mutations by date (most recent first)
    const sortedMutations = [...mutations].sort(
      (a, b) =>
        new Date(b.date_mutation).getTime() -
        new Date(a.date_mutation).getTime()
    );

    // Show up to 3 most recent transactions
    const recentMutations = sortedMutations.slice(0, 1);

    let historyHTML = `<div class="space-y-2">`;
    historyHTML += `<h5 class="font-medium text-sm">Transactions récentes:</h5>`;

    recentMutations.forEach((mutation) => {
      historyHTML += `
        <div class="bg-muted/50 rounded p-2 text-xs">
          <div class="flex justify-between items-center">
            <span class="font-medium">${formatPrice(
              mutation.valeur_fonciere
            )}</span>
            <span class="text-muted-foreground">${formatDateShort(
              mutation.date_mutation
            )}</span>
          </div>
          <div class="text-muted-foreground mt-1">${mutation.type_local}</div>
        </div>
      `;
    });

    // Always show the "voir plus" button to open the modal
    historyHTML += `
      <button 
        id="see-more-dvf-btn"
        class="w-full text-xs text-primary hover:text-primary/80 underline mt-2"
      >
        Voir ${mutations.length > 1 ? "toutes les" : "la"} ${
      mutations.length
    } transaction${mutations.length > 1 ? "s" : ""}
      </button>
    `;

    historyHTML += `</div>`;
    dvfHistoryElement.innerHTML = historyHTML;

    // Add event listener for "see more" button
    const seeMoreButton = document.getElementById("see-more-dvf-btn");
    if (seeMoreButton) {
      seeMoreButton.addEventListener("click", () => {
        setShowMutationsDialog(true);
      });
    }
  }, [selectedParcelId, selectedCadastre, dvfHistory, isDVFLoading]);

  // Set up map event listeners
  useEffect(() => {
    if (!map || !mounted) return;

    // Add click events for cadastre parcels
    const handleParcelClick = (e: maplibregl.MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const properties = feature.properties;

        // Clear previous selection
        if (map) {
          clearParcelSelection();
        }

        const featureId = feature.id;

        if (featureId !== undefined && map) {
          try {
            // Set the new selection
            setSelectedParcelId(String(properties.id));
            setSelectedFeatureId(featureId);
            setSelectedCadastre(properties);

            // Update feature state for selection
            const parcelId = properties.id;
            const hasDVF =
              parcelId && dvfDataByParcelRef.current.has(parcelId)
                ? dvfDataByParcelRef.current.get(parcelId)
                : false;

            map.setFeatureState(
              {
                source: "cadastre-dvf",
                sourceLayer: "parcelles",
                id: featureId,
              },
              {
                selected: true,
                hasDVF: hasDVF,
              }
            );
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

  // Get mutations for the selected parcel for the dialog
  const selectedMutations = selectedParcelId
    ? dvfHistory.get(selectedParcelId) || []
    : [];

  return {
    selectedParcelId,
    clearParcelSelection,
    showMutationsDialog,
    setShowMutationsDialog,
    selectedMutations,
    isLoadingDVFData,
    // Return the dialog component
    MutationsDialog: selectedParcelId ? (
      <DVFMutationsDialog
        open={showMutationsDialog}
        onOpenChange={setShowMutationsDialog}
        mutations={selectedMutations}
        parcelId={selectedParcelId}
      />
    ) : null,
  };
}
