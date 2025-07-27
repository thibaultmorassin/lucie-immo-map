import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

interface UseMapInstanceProps {
  center: [number, number];
  zoom: number;
}

export function useMapInstance({ center, zoom }: UseMapInstanceProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mounted, setMounted] = useState(false);

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
            "source-layer": "parcelles",
            minzoom: 16,
            maxzoom: 20,
            paint: {
              "fill-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                "#3b82f6", // Blue color for selected parcel
                ["boolean", ["feature-state", "hasDVF"], false],
                "#e74c3c", // Red color for parcels with DVF data
                "transparent", // Transparent for parcels without DVF data
              ],
              "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                0.3, // Higher opacity for selected parcel
                ["boolean", ["feature-state", "hasDVF"], false],
                0.2, // Medium opacity for parcels with DVF data
                0.0, // No opacity for transparent parcels
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
            maxzoom: 20,
            paint: {
              "line-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                "#3b82f6", // Blue color for selected parcel
                ["boolean", ["feature-state", "hasDVF"], false],
                "#e74c3c", // Red color for parcels with DVF data
                "#cccccc", // Light gray for parcels without DVF data
              ],
              "line-width": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                2, // Thicker border for selected parcel
                1, // Default width
              ],
              "line-opacity": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                0.8, // Higher opacity for selected parcel
                ["boolean", ["feature-state", "hasDVF"], false],
                0.6, // Medium opacity for parcels with DVF data
                0.3, // Lower opacity for parcels without DVF data
              ],
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

    setMounted(true);
  }, [center, zoom]);

  // Update map center when location changes
  useEffect(() => {
    if (!map.current || !mounted) {
      return;
    }

    // Smoothly pan to new center
    map.current.easeTo({
      center: [center[1], center[0]],
      duration: 1000,
    });
  }, [mounted, center]);

  return {
    mapContainer,
    map: map.current,
    mounted,
  };
}
