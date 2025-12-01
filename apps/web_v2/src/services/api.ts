import type { Product, Outfit } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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

    const response = await this.fetch<PaginatedResponse<any>>(`/products?${params.toString()}`);

    const data = response.data.map(this.transformProduct);

    return { ...response, data };
  }

  async getProduct(id: string): Promise<Product> {
    const product = await this.fetch<any>(`/products/${id}`);
    return this.transformProduct(product);
  }

  // Outfits
  async getOutfits(): Promise<Outfit[]> {
    const outfits = await this.fetch<any[]>('/outfits');
    return outfits.map(this.transformOutfit);
  }

  async getOutfit(id: string): Promise<Outfit> {
    const outfit = await this.fetch<any>(`/outfits/${id}`);
    return this.transformOutfit(outfit);
  }

  async createOutfit(outfit: Partial<Outfit>): Promise<Outfit> {
    // Transform frontend outfit to backend payload
    const payload = {
      title: outfit.name,
      description: 'Created via FITTED Lab',
      isPublic: false,
      items: outfit.items?.map((item, index) => ({
        productId: item.id,
        slot: `slot_${index}` // Simple slot assignment
      }))
    };

    const newOutfit = await this.fetch<any>('/outfits', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return this.transformOutfit(newOutfit);
  }

  // Transformers
  private transformProduct(p: any): Product {
    return {
      id: p.id,
      name: p.title,
      brand: p.brand,
      price: p.lowestAsk || p.retailPrice || 0,
      category: p.category, // Ensure enum match or map
      imageUrl: p.imageUrl,
      department: (p.gender?.toUpperCase() as any) || 'UNISEX',
      color: p.colorway || 'Multi',
      tags: [] // Backend might not have tags yet
    };
  }

  private transformOutfit(o: any): Outfit {
    return {
      id: o.id,
      name: o.title,
      items: o.items?.map((i: any) => this.transformProduct(i.product)) || [],
      createdAt: new Date(o.createdAt).getTime()
    };
  }
}

export const api = new ApiService();
