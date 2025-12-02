import type { Product, Outfit, PaginatedResponse } from '@fashionapp/shared';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';

interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  department?: string; // Mapped to gender in backend
  brand?: string;
}

class ApiService {
  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Products
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.department && filters.department !== 'ALL') {
      params.append('gender', filters.department.toLowerCase());
    }
    if (filters.brand) params.append('brand', filters.brand);

    return this.fetch<PaginatedResponse<Product>>(`/products?${params.toString()}`);
  }

  async getProduct(id: string): Promise<Product> {
    return this.fetch<Product>(`/products/${id}`);
  }

  // Outfits
  async getOutfits(): Promise<Outfit[]> {
    return this.fetch<Outfit[]>('/outfits');
  }

  async getOutfit(id: string): Promise<Outfit> {
    return this.fetch<Outfit>(`/outfits/${id}`);
  }

  async createOutfit(outfit: Partial<Outfit>): Promise<Outfit> {
    const payload = {
      title: outfit.name,
      description: 'Created via FITTED Lab',
      isPublic: false,
      items: outfit.items?.map((item, index) => ({
        productId: item.id,
        slot: `slot_${index}`
      }))
    };

    return this.fetch<Outfit>('/outfits', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiService();
