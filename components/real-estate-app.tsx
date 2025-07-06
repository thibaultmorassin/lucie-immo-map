"use client";

import { Property } from "@/types";
import { Loader2, MapPin, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import AddPropertyModalForm from "./map/add-property-modal-form";
import MapLibreMap from "./map/maplibre-map";
import { PropertyModal } from "./map/property-modal";

interface UserLocation {
  latitude: number;
  longitude: number;
}

// Default location for Pessac
const DEFAULT_LOCATION = {
  latitude: 44.8067,
  longitude: -0.6311,
};

export function RealEstateApp() {
  const [properties] = useState<Property[]>([]);
  // TODO: setProperties will be used to update the properties list when creating new ones
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [mapClickLocation, setMapClickLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const setPessacLocationAsDefault = () => {
    setUserLocation({
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
    });
  };

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to Paris coordinates
          setPessacLocationAsDefault();
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    } else {
      setPessacLocationAsDefault();
      setIsLoadingLocation(false);
    }
  }, []);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsPropertyModalOpen(true);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMapClickLocation({ lat, lng });
    setIsAddModalOpen(true);
  };

  if (isLoadingLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600">Localisation en cours...</p>
          <p className="text-sm text-gray-500 mt-1">
            Nous cherchons votre position pour afficher les biens immobiliers à
            proximité
          </p>
        </div>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MapPin className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">
            Impossible d&apos;obtenir votre localisation
          </p>
          <p className="text-sm text-gray-500 mt-1">
            L&apos;application affichera les biens immobiliers autour de Pessac
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-var(--header-height))]">
      <MapLibreMap
        center={[userLocation.latitude, userLocation.longitude]}
        zoom={17}
        properties={properties}
        onPropertyClick={handlePropertyClick}
        onMapClick={handleMapClick}
      />

      {properties.length > 0 && (
        <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-xs rounded-lg p-4 shadow-lg max-w-sm">
          <h3 className="font-semibold text-gray-800 mb-2">
            {properties.length} bien{properties.length > 1 ? "s" : ""} trouvé
            {properties.length > 1 ? "s" : ""}
          </h3>
          <p className="text-sm text-gray-600">
            Cliquez sur un marqueur pour voir les détails d&apos;un bien
            immobilier
          </p>
          {mapClickLocation && (
            <p className="text-xs text-emerald-600 mt-2">
              📍 Position sélectionnée: {mapClickLocation.lat.toFixed(4)},{" "}
              {mapClickLocation.lng.toFixed(4)}
            </p>
          )}
        </div>
      )}

      {/* Property Detail Modal */}
      <PropertyModal
        property={selectedProperty}
        isOpen={isPropertyModalOpen}
        onClose={() => {
          setIsPropertyModalOpen(false);
          setSelectedProperty(null);
        }}
      />

      {/* Add Property Modal - from button click */}
      <AddPropertyModalForm
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        className="fixed right-2 bottom-10 lg:right-10 z-10 size-12 group rounded-full"
        presetCoordinates={mapClickLocation || undefined}
      >
        <PlusIcon className="group-hover:rotate-180 size-6 transition-transform duration-300" />
      </AddPropertyModalForm>
    </div>
  );
}
