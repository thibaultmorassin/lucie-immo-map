"use client";

import { Property } from "@/types";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import CadastreVectorTiles from "./cadastre-map";

// Custom property marker icon
const propertyIcon = new Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg width="25" height="35" viewBox="0 0 25 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 21.875 12.5 35 12.5 35C12.5 35 25 21.875 25 12.5C25 5.596 19.404 0 12.5 0Z" fill="#10B981"/>
      <circle cx="12.5" cy="12.5" r="5" fill="white"/>
      <circle cx="12.5" cy="12.5" r="3" fill="#10B981"/>
    </svg>
  `),
  iconSize: [25, 35],
  iconAnchor: [12.5, 35],
  popupAnchor: [0, -35],
});

interface MapProps {
  center: [number, number];
  zoom: number;
  properties: Property[];
  onPropertyClick: (property: Property) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

// Component to handle map events
function MapEvents({
  onMapClick,
}: {
  onMapClick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function Map({
  center,
  zoom,
  properties,
  onPropertyClick,
  onMapClick,
}: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  if (typeof window === "undefined") {
    return null;
  }
  if (!mounted) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full z-0 [&_path.leaflet-interactive]:stroke-[0.1px]"
      scrollWheelZoom={true}
    >
      <TileLayer
        maxZoom={20}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <CadastreVectorTiles />
      <MapEvents onMapClick={onMapClick} />
      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.latitude, property.longitude]}
          icon={propertyIcon}
          eventHandlers={{
            click: () => onPropertyClick(property),
          }}
        >
          <Popup>
            <div className="min-w-64 p-2">
              <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{property.address}</p>
              <p className="font-bold text-emerald-600 text-lg mb-2">
                {formatPrice(property.price)}
              </p>
              <div className="flex gap-2 text-sm text-gray-500">
                {property.bedrooms && <span>{property.bedrooms} ch.</span>}
                {property.bathrooms && <span>{property.bathrooms} sdb.</span>}
                {property.area_sqm && <span>{property.area_sqm} m²</span>}
              </div>
              {property.description && (
                <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                  {property.description}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
