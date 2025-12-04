import type { Product, Outfit, PaginatedResponse } from "@fashionapp/shared";
import { env } from "../env";

const API_BASE_URL = env.VITE_API_URL + "/api";

interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string | string[];
  department?: string;
  parentCategory?: string;
  brand?: string;
}

interface FiltersResponse {
  genders: string[];
  categories: string[];
  parentCategories: string[];
  topCategories?: string[];
}

class ApiService {
  private latestFilters?: FiltersResponse;

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Products
  async getProducts(
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.category) {
      if (Array.isArray(filters.category)) {
        for (const c of filters.category) {
          params.append("category", c);
        }
      } else {
        params.append("category", filters.category);
      }
    }
    if (filters.brand) params.append("brand", filters.brand);
    if (filters.parentCategory)
      params.append("parentCategory", filters.parentCategory);

    return this.fetch<PaginatedResponse<Product>>(
      `/products?${params.toString()}`
    );
  }

  // Fetch available filter values from backend
  async getFilters(): Promise<FiltersResponse> {
    if (this.latestFilters) return this.latestFilters;
    const res = await this.fetch<FiltersResponse>(`/products/filters`);
    this.latestFilters = res;
    return res;
  }

  async getProduct(id: string): Promise<Product> {
    return this.fetch<Product>(`/products/${id}`);
  }

  // Outfits
  async getOutfits(): Promise<Outfit[]> {
    return this.fetch<Outfit[]>("/outfits");
  }

  async getOutfit(id: string): Promise<Outfit> {
    return this.fetch<Outfit>(`/outfits/${id}`);
  }

  async createOutfit(outfit: Partial<Outfit>): Promise<Outfit> {
    const payload = {
      title: outfit.name,
      description: "Created via FITTED Lab",
      isPublic: false,
      items: outfit.items?.map((item, index) => ({
        productId: item.id,
        slot: `slot_${index}`,
      })),
    };

    return this.fetch<Outfit>("/outfits", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiService();
