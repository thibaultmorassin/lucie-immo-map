"use client";

import { useState } from "react";
import { X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (propertyData: PropertyFormData) => Promise<void>;
  defaultLocation?: { lat: number; lng: number };
}

export interface PropertyFormData {
  title: string;
  description: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  property_type: string;
  latitude: number;
  longitude: number;
  images: string[];
}

export function AddPropertyModal({
  isOpen,
  onClose,
  onSubmit,
  defaultLocation,
}: AddPropertyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    address: "",
    price: 0,
    bedrooms: 1,
    bathrooms: 1,
    area_sqm: 0,
    property_type: "apartment",
    latitude: defaultLocation?.lat || 48.8566,
    longitude: defaultLocation?.lng || 2.3522,
    images: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        title: "",
        description: "",
        address: "",
        price: 0,
        bedrooms: 1,
        bathrooms: 1,
        area_sqm: 0,
        property_type: "apartment",
        latitude: defaultLocation?.lat || 48.8566,
        longitude: defaultLocation?.lng || 2.3522,
        images: [],
      });
      onClose();
    } catch (error) {
      console.error("Error submitting property:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof PropertyFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Ajouter un bien immobilier</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Informations générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Titre du bien *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ex: Bel appartement 3 pièces"
                  required
                />
              </div>

              <div>
                <Label htmlFor="property_type">Type de bien *</Label>
                <select
                  id="property_type"
                  value={formData.property_type}
                  onChange={(e) =>
                    handleInputChange("property_type", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="apartment">Appartement</option>
                  <option value="house">Maison</option>
                  <option value="commercial">Commercial</option>
                  <option value="land">Terrain</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    handleInputChange("price", parseFloat(e.target.value) || 0)
                  }
                  placeholder="350000"
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Décrivez votre bien..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-24 resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Property Details */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Caractéristiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedrooms">Chambres</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) =>
                    handleInputChange("bedrooms", parseInt(e.target.value) || 0)
                  }
                  min="0"
                  max="20"
                />
              </div>

              <div>
                <Label htmlFor="bathrooms">Salles de bain</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) =>
                    handleInputChange(
                      "bathrooms",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min="0"
                  max="10"
                />
              </div>

              <div>
                <Label htmlFor="area_sqm">Surface (m²)</Label>
                <Input
                  id="area_sqm"
                  type="number"
                  value={formData.area_sqm}
                  onChange={(e) =>
                    handleInputChange(
                      "area_sqm",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="75"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Localisation</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Rue de la Paix, 75001 Paris"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    value={formData.latitude}
                    onChange={(e) =>
                      handleInputChange(
                        "latitude",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    step="0.000001"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    value={formData.longitude}
                    onChange={(e) =>
                      handleInputChange(
                        "longitude",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    step="0.000001"
                    required
                  />
                </div>
              </div>

              <div className="text-sm text-gray-500 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  Cliquez sur la carte pour sélectionner automatiquement les
                  coordonnées
                </span>
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Ajout en cours..." : "Ajouter le bien"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
