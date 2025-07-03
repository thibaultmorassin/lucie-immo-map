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
