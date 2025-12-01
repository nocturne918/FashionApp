import type { Product, Outfit } from '@fashionapp/shared';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';

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
  category?: string | string[];
  department?: string; // Mapped to gender in backend
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
    if (filters.category) {
      if (Array.isArray(filters.category)) {
        for (const c of filters.category) {
          params.append('category', c);
        }
      } else {
        params.append('category', filters.category);
      }
    }
    // Department/gender filtering intentionally disabled — use category/parentCategory filters instead.
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.parentCategory) params.append('parentCategory', filters.parentCategory);

    const response = await this.fetch<PaginatedResponse<unknown>>(`/products?${params.toString()}`);

    const data = response.data.map(this.transformProduct);

    return { ...response, data };
  }

  // Fetch available filter values from backend
  async getFilters(): Promise<FiltersResponse> {
    if (this.latestFilters) return this.latestFilters;
    const res = await this.fetch<FiltersResponse>(`/products/filters`);
    this.latestFilters = res;
    return res;
  }

  async getProduct(id: string): Promise<Product> {
    const product = await this.fetch<unknown>(`/products/${id}`);
    return this.transformProduct(product);
  }

  // Outfits
  async getOutfits(): Promise<Outfit[]> {
    const outfits = await this.fetch<unknown[]>('/outfits');
    return outfits.map(this.transformOutfit);
  }

  async getOutfit(id: string): Promise<Outfit> {
    const outfit = await this.fetch<unknown>(`/outfits/${id}`);
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

    const newOutfit = await this.fetch<unknown>('/outfits', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return this.transformOutfit(newOutfit);
  }

  // Transformers
  private transformProduct(p: unknown): Product {
    const obj = (p as Record<string, unknown>) || {};
    const name = typeof obj.name === 'string' ? obj.name : (typeof obj.title === 'string' ? obj.title : '');
    const imageUrl = typeof obj.imageUrl === 'string' ? obj.imageUrl : (typeof obj.image_url === 'string' ? obj.image_url : '');
    const category = typeof obj.category === 'string' ? obj.category : '';

    // backend may send department (from toSharedProduct) or gender
    const rawDeptVal = obj.department ?? obj.gender ?? '';
    const rawDept = String(rawDeptVal).toLowerCase();
    const deptMap: Record<string, Product['department']> = {
      'men': 'MENS',
      'mens': 'MENS',
      'women': 'WOMENS',
      'womens': 'WOMENS',
      'kids': 'KIDS',
      'kid': 'KIDS',
      'unisex': 'UNISEX'
    } as const;

    const department = (deptMap[rawDept] || (rawDept.includes('men') ? 'MENS' : rawDept.includes('woman') ? 'WOMENS' : rawDept.includes('kid') ? 'KIDS' : 'UNISEX')) as Product['department'];

    return {
      id: String(obj.id ?? ''),
      name,
      brand: typeof obj.brand === 'string' ? obj.brand : '',
      price: typeof obj.lowestAsk === 'number' ? obj.lowestAsk : (typeof obj.retailPrice === 'number' ? obj.retailPrice : 0),
      category,
      parentCategory: typeof obj.parentCategory === 'string' ? obj.parentCategory : '',
      imageUrl,
      department,
      color: typeof obj.colorway === 'string' ? obj.colorway : (typeof obj.color === 'string' ? obj.color : 'Multi'),
      tags: []
    };
  }

  private transformOutfit(o: unknown): Outfit {
    const obj = (o as Record<string, unknown>) || {};
    const itemsRaw = Array.isArray(obj.items) ? obj.items as unknown[] : [];
    const items = itemsRaw.map(i => {
      const itemObj = (i as Record<string, unknown>) || {};
      return this.transformProduct(itemObj.product ?? itemObj);
    });

    return {
      id: String(obj.id ?? ''),
      name: typeof obj.title === 'string' ? obj.title : '',
      items,
      createdAt: obj.createdAt ? new Date(String(obj.createdAt)).getTime() : Date.now()
    };
  }
}

export const api = new ApiService();
