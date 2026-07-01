import axios from "axios";
import type {
  Page,
  Property,
  PropertyFilters,
  PropertyPayload,
} from "@/interfaces/Property";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getProperties(
  page = 0,
  size = 50,
  sortBy = "id",
  filters: PropertyFilters = {},
): Promise<Page<Property>> {
  const response = await api.get<Page<Property>>("/property/", {
    params: {
      page,
      size,
      sortBy,
      type: filters.type || undefined,
      minPrice: filters.minPrice ?? undefined,
      maxPrice: filters.maxPrice ?? undefined,
      rooms: filters.rooms ?? undefined,
      name: filters.name || undefined,
    },
  });
  return response.data;
}

export async function createProperty(
  payload: PropertyPayload,
): Promise<Property> {
  const response = await api.post<Property>("/property/", payload);
  return response.data;
}

export async function updateProperty(
  id: string,
  payload: PropertyPayload,
): Promise<Property> {
  const response = await api.put<Property>(`/property/${id}`, payload);
  return response.data;
}

export async function toggleActive(id: string): Promise<Property> {
  const response = await api.patch<Property>(`/property/${id}/toggle-active`);
  return response.data;
}

export async function findPropertyByName(name: string): Promise<Property> {
  const response = await api.get<Property>("/property/search", {
    params: { name },
  });
  return response.data;
}
