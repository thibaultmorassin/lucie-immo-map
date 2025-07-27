"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { DVFMutation } from "@/types";

interface DVFMutationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mutations: DVFMutation[];
  parcelId: string;
}

export function DVFMutationsDialog({
  open,
  onOpenChange,
  mutations,
  parcelId,
}: DVFMutationsDialogProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Sort mutations by date (most recent first)
  const sortedMutations = [...mutations].sort(
    (a, b) =>
      new Date(b.date_mutation).getTime() - new Date(a.date_mutation).getTime()
  );

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col lg:max-h-[80vh] tabular-nums">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            Historique des transactions DVF
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Parcelle: {parcelId} • {mutations.length} transaction
            {mutations.length > 1 ? "s" : ""} trouvée
            {mutations.length > 1 ? "s" : ""}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="grid gap-6 pb-6 max-h-[70vh] overflow-y-auto p-2 lg:p-0">
          {sortedMutations.map((mutation, index) => (
            <Card key={`${mutation.id_mutation}-${index}`} className="w-full">
              <CardHeader className="pb-3 relative">
                <Badge
                  variant="outline"
                  className="absolute -top-2 left-4 bg-background"
                >
                  {mutation.nature_mutation}
                </Badge>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {formatDate(mutation.date_mutation)}
                  </CardTitle>

                  <Badge variant="secondary" className="text-lg font-semibold">
                    {formatPrice(mutation.valeur_fonciere)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Adresse</p>
                    <p>
                      {mutation.adresse_numero} {mutation.adresse_nom_voie}
                      <br />
                      {mutation.code_postal} {mutation.nom_commune}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-muted-foreground">
                      Type de local
                    </p>
                    <p>{mutation.type_local}</p>
                  </div>

                  <div>
                    <p className="font-medium text-muted-foreground">Surface</p>
                    <p>
                      {mutation.surface_reelle_bati > 0 &&
                        `Bâti: ${mutation.surface_reelle_bati} m²`}
                      {mutation.surface_reelle_bati > 0 &&
                        mutation.surface_terrain > 0 && <br />}
                      {mutation.surface_terrain > 0 &&
                        `Terrain: ${mutation.surface_terrain} m²`}
                    </p>
                  </div>

                  {mutation.nombre_pieces_principales > 0 && (
                    <div>
                      <p className="font-medium text-muted-foreground">
                        Pièces
                      </p>
                      <p>
                        {mutation.nombre_pieces_principales} pièce
                        {mutation.nombre_pieces_principales > 1 ? "s" : ""}
                      </p>
                    </div>
                  )}

                  {mutation.nombre_lots > 0 && (
                    <div>
                      <p className="font-medium text-muted-foreground">Lots</p>
                      <p>
                        {mutation.nombre_lots} lot
                        {mutation.nombre_lots > 1 ? "s" : ""}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="font-medium text-muted-foreground">
                      Nature culture
                    </p>
                    <p className="first-letter:uppercase">
                      {mutation.nature_culture}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
