"use client";

import { Property } from "@/types";
import { Loader2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingAddButton } from "./floating-add-button";
import { AddPropertyModal, PropertyFormData } from "./map/add-property-modal";
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
  const [properties, setProperties] = useState<Property[]>([]);
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

  const handleAddProperty = async (propertyData: PropertyFormData) => {
    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        throw new Error("Failed to add property");
      }

      const data = await response.json();

      // Add the new property to the list
      setProperties((prev) => [data.property, ...prev]);

      // Reset map click location
      setMapClickLocation(null);
    } catch (error) {
      console.error("Error adding property:", error);
      throw error; // Re-throw to handle in the modal
    }
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setMapClickLocation(null);
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
    <div className="relative w-full h-screen">
      {true && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            <span className="text-sm text-gray-700">
              Chargement des biens...
            </span>
          </div>
        </div>
      )}

      {/* Map - Zoom 17 shows ~100m radius around user */}
      <MapLibreMap
        center={[userLocation.latitude, userLocation.longitude]}
        zoom={17}
        properties={properties}
        onPropertyClick={handlePropertyClick}
      />

      {/* Add Property Button */}
      <FloatingAddButton onClick={openAddModal} />

      {/* Property Information Panel */}
      {properties.length > 0 && (
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
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

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSubmit={handleAddProperty}
        defaultLocation={
          mapClickLocation ||
          (userLocation
            ? { lat: userLocation.latitude, lng: userLocation.longitude }
            : undefined)
        }
      />
    </div>
  );
}
