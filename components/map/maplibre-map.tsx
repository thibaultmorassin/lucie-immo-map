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

// User location marker icon SVG
const userLocationMarkerSVG = `
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
  <circle cx="10" cy="10" r="4" fill="white"/>
</svg>
`;

interface MapProps {
  center: [number, number];
  zoom: number;
  properties: Property[];
  onPropertyClick: (property: Property) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

export default function MapLibreMap({
  center,
  zoom,
  properties,
  onPropertyClick,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mounted, setMounted] = useState(false);
  const userLocationMarker = useRef<maplibregl.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

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
              "fill-color": "#e74c3c",
              "fill-opacity": 0.1,
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
              "line-color": "#e74c3c",
              "line-width": 1,
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

    // Add click events for cadastre parcels
    map.current.on("click", "cadastre-parcels", (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const properties = feature.properties;

        // Create popup with parcel information
        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `
            <div style="padding: 8px; min-width: 200px;">
              <h4 style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">Parcelle Cadastrale</h4>
              <div style="font-size: 12px; line-height: 1.4;">
                ${
                  properties.commune
                    ? `<p><strong>Commune:</strong> ${properties.commune}</p>`
                    : ""
                }
                ${
                  properties.section
                    ? `<p><strong>Section:</strong> ${properties.section}</p>`
                    : ""
                }
                ${
                  properties.numero
                    ? `<p><strong>Numéro:</strong> ${properties.numero}</p>`
                    : ""
                }
                ${
                  properties.contenance
                    ? `<p><strong>Surface:</strong> ${Math.round(
                        properties.contenance
                      )} m²</p>`
                    : ""
                }
                ${
                  properties.nature_culture
                    ? `<p><strong>Nature:</strong> ${properties.nature_culture}</p>`
                    : ""
                }
                ${
                  properties.code_insee
                    ? `<p><strong>Code INSEE:</strong> ${properties.code_insee}</p>`
                    : ""
                }
              </div>
            </div>
            `
          )
          .addTo(map.current!);
      }
    });

    setMounted(true);
  }, [center, zoom]);

  // Update map center when user location changes
  useEffect(() => {
    if (!map.current || !mounted) return;

    // Smoothly pan to new center
    map.current.easeTo({
      center: [center[1], center[0]], // MapLibre uses [lng, lat] format
      duration: 1000,
    });
  }, [center, mounted]);

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

  // Add user location marker
  useEffect(() => {
    if (!map.current || !mounted) return;

    // Remove existing user location marker
    if (userLocationMarker.current) {
      userLocationMarker.current.remove();
    }

    // Create user location marker element
    const userMarkerElement = document.createElement("div");
    userMarkerElement.className = "user-location-marker";
    userMarkerElement.innerHTML = userLocationMarkerSVG;
    userMarkerElement.style.cursor = "pointer";
    userMarkerElement.title = "Votre position";

    // Create MapLibre marker for user location
    userLocationMarker.current = new maplibregl.Marker(userMarkerElement)
      .setLngLat([center[1], center[0]]) // Note: MapLibre uses [lng, lat] format
      .addTo(map.current);

    // Add popup for user location
    const userPopup = new maplibregl.Popup({ offset: 10, closeButton: false })
      .setHTML(`
        <div style="padding: 6px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #3B82F6; font-weight: 500;">📍 Votre position</p>
        </div>
      `);

    userLocationMarker.current.setPopup(userPopup);

    // Cleanup on unmount
    return () => {
      if (userLocationMarker.current) {
        userLocationMarker.current.remove();
        userLocationMarker.current = null;
      }
    };
  }, [center, mounted]);

  if (typeof window === "undefined") {
    return null;
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
