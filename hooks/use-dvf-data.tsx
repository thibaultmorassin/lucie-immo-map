import { CadastreProperties, DVFMutation } from "@/types";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useDVFData() {
  const [dvfHistory, setDvfHistory] = useState<Map<string, DVFMutation[]>>(
    new Map()
  );

  const fetchDVFData = useCallback(async (cadastre: CadastreProperties) => {
    if (!cadastre.commune || !cadastre.prefixe || !cadastre.section) {
      console.log("Informations cadastrales incomplètes.");
      return;
    }

    try {
      const response = await fetch(
        `https://dvf-api.data.gouv.fr/mutations/${cadastre.commune}/${cadastre.prefixe}${cadastre.section}`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération DVF");
      }

      const result = (await response.json()) as { data: DVFMutation[] };

      const newDvfHistory = new Map<string, DVFMutation[]>();

      result.data.forEach((mutation) => {
        const mutationId = mutation.id_parcelle;
        const existingMutations = newDvfHistory.get(mutationId) || [];
        newDvfHistory.set(mutationId, [...existingMutations, mutation]);
      });

      setDvfHistory((prev) => {
        const updatedMap = new Map(prev);
        newDvfHistory.forEach((mutations, parcelId) => {
          const existingMutations = updatedMap.get(parcelId) || [];
          updatedMap.set(parcelId, [...existingMutations, ...mutations]);
        });
        return updatedMap;
      });
    } catch (error) {
      console.error("Erreur DVF :", error);
      toast.error("Erreur lors de la récupération des données DVF.");
    }
  }, []);

  return {
    dvfHistory,
    fetchDVFData,
  };
}
