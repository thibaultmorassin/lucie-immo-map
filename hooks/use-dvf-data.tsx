import { CadastreProperties, DVFMutation } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface DVFDataResponse {
  data: DVFMutation[];
}

export function useDVFData(cadastre?: CadastreProperties) {
  const queryKey =
    cadastre?.commune && cadastre?.prefixe && cadastre?.section
      ? `${cadastre.commune}/${cadastre.prefixe}${cadastre.section}`
      : null;

  const {
    data: dvfData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dvf-data", queryKey],
    queryFn: async (): Promise<DVFDataResponse> => {
      if (!cadastre?.commune || !cadastre?.prefixe || !cadastre?.section) {
        throw new Error("Informations cadastrales incomplètes.");
      }

      const response = await fetch(
        `https://dvf-api.data.gouv.fr/mutations/${cadastre.commune}/${cadastre.prefixe}${cadastre.section}`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération DVF");
      }

      return response.json();
    },
    enabled: !!queryKey,
    retry: 1,
    // 6 months cache is already configured globally in QueryClient
  });

  // Handle errors with toast
  if (error) {
    console.error("Erreur DVF :", error);
    toast.error("Erreur lors de la récupération des données DVF.");
  }

  // Process the data to group by parcel ID like the original implementation
  const dvfHistory = new Map<string, DVFMutation[]>();

  if (dvfData?.data) {
    dvfData.data.forEach((mutation) => {
      const mutationId = mutation.id_parcelle;
      const existingMutations = dvfHistory.get(mutationId) || [];
      dvfHistory.set(mutationId, [...existingMutations, mutation]);
    });
  }

  return {
    dvfHistory,
    isLoading,
    error,
    refetch,
    // Keep compatibility with existing fetchDVFData function signature
    fetchDVFData: refetch,
  };
}
