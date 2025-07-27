import { Property } from "@/types";
import maplibregl from "maplibre-gl";
import { useEffect } from "react";

// Custom property marker icon SVG
const propertyMarkerSVG = `
<svg width="25" height="35" viewBox="0 0 25 35" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 21.875 12.5 35 12.5 35C12.5 35 25 21.875 25 12.5C25 5.596 19.404 0 12.5 0Z" fill="#10B981"/>
  <circle cx="12.5" cy="12.5" r="5" fill="white"/>
  <circle cx="12.5" cy="12.5" r="3" fill="#10B981"/>
</svg>
`;

interface UsePropertyMarkersProps {
  map: maplibregl.Map | null;
  mounted: boolean;
  properties: Property[];
  onPropertyClick: (property: Property) => void;
}

export function usePropertyMarkers({
  map,
  mounted,
  properties,
  onPropertyClick,
}: UsePropertyMarkersProps) {
  useEffect(() => {
    if (!map || !mounted) return;

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
        .addTo(map);

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
  }, [map, mounted, properties, onPropertyClick]);
}
