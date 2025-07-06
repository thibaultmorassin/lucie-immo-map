import { Button } from "@/components/ui/button";
import type { Property } from "@/types";
import { Bath, Bed, Calendar, MapPin, Square, X } from "lucide-react";

interface PropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyModal({
  property,
  isOpen,
  onClose,
}: PropertyModalProps) {
  if (!isOpen || !property) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      house: "Maison",
      apartment: "Appartement",
      commercial: "Commercial",
      land: "Terrain",
      other: "Autre",
    };
    return types[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{property.title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Images */}
          {property.images && property.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className="aspect-video bg-gray-100 rounded-lg overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`${property.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Price and Type */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-3xl font-bold text-emerald-600">
              {formatPrice(property.price)}
            </div>
            <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
              {getPropertyTypeLabel(property.property_type)}
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-gray-900">{property.address}</p>
              <p className="text-sm text-gray-500">
                {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {property.bedrooms && (
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">{property.bedrooms}</p>
                  <p className="text-sm text-gray-500">
                    Chambre{property.bedrooms > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">{property.bathrooms}</p>
                  <p className="text-sm text-gray-500">
                    Salle{property.bathrooms > 1 ? "s" : ""} de bain
                  </p>
                </div>
              </div>
            )}
            {property.area_sqm && (
              <div className="flex items-center gap-2">
                <Square className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">{property.area_sqm} m²</p>
                  <p className="text-sm text-gray-500">Surface</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-sm">
                  {formatDate(property.created_at)}
                </p>
                <p className="text-sm text-gray-500">Publié</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1">Contacter le vendeur</Button>
            <Button variant="outline" className="flex-1">
              Ajouter aux favoris
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
