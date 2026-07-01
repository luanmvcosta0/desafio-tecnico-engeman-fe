export type PropertyType = "CONDOMINIUM" | "HOUSE" | "BUILDING";

export interface Property {
  id: string;
  name: string;
  rooms: number;
  price: number;
  type: PropertyType;
  active: boolean;
}

export interface PropertyPayload {
  name: string;
  rooms: number;
  price: number;
  type: PropertyType;
}

export interface PropertyFilters {
  type?: PropertyType | "";
  minPrice?: number | "";
  maxPrice?: number | "";
  rooms?: number | "";
  name?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
