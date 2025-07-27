export interface Property {
  id: string;
  title: string;
  description?: string;
  address: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  property_type: string;
  latitude: number;
  longitude: number;
  user_id: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

type DVFMutation = {
  id_mutation: string;
  date_mutation: string;
  numero_disposition: number;
  nature_mutation: string;
  valeur_fonciere: number;
  adresse_numero: number;
  adresse_suffixe: string | null;
  adresse_nom_voie: string;
  adresse_code_voie: string;
  code_postal: string;
  code_commune: string;
  nom_commune: string;
  code_departement: string;
  ancien_code_commune: string | null;
  ancien_nom_commune: string | null;
  id_parcelle: string;
  ancien_id_parcelle: string | null;
  numero_volume: string | null;
  lot1_numero: string | null;
  lot1_surface_carrez: number | null;
  lot2_numero: string | null;
  lot2_surface_carrez: number | null;
  lot3_numero: string | null;
  lot3_surface_carrez: number | null;
  lot4_numero: string | null;
  lot4_surface_carrez: number | null;
  lot5_numero: string | null;
  lot5_surface_carrez: number | null;
  nombre_lots: number;
  code_type_local: string;
  type_local: string;
  surface_reelle_bati: number;
  nombre_pieces_principales: number;
  code_nature_culture: string;
  nature_culture: string;
  code_nature_culture_speciale: string | null;
  nature_culture_speciale: string | null;
  surface_terrain: number;
  longitude: number;
  latitude: number;
  section_prefixe: string;
};

type CadastreProperties = {
  id?: string;
  commune?: string;
  section?: string;
  prefixe?: string;
  numero?: string;
  contenance?: number;
  nature_culture?: string;
  code_insee?: string;
  updated?: string;
  created?: string;
};

type CadastrePopoverData = {
  lat: number;
  lng: number;
  properties: CadastreProperties;
};

export type { CadastrePopoverData, CadastreProperties, DVFMutation };
