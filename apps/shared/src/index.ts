export const ProductCategory = {
  TOPS: 'TOPS',
  BOTTOMS: 'BOTTOMS',
  SHOES: 'SHOES',
  ACCESSORIES: 'ACCESSORIES',
  OUTERWEAR: 'OUTERWEAR'
} as const;

export type ProductCategory = typeof ProductCategory[keyof typeof ProductCategory];

export const Department = {
  MENS: 'MENS',
  WOMENS: 'WOMENS',
  KIDS: 'KIDS',
  UNISEX: 'UNISEX'
} as const;

export type Department = 'MENS' | 'WOMENS' | 'KIDS' | 'UNISEX' | 'ALL';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  parentCategory?: string;
  imageUrl: string;
  department: Department;
  color: string;
  tags?: string[];
}

export interface OutfitItem extends Product {
  x?: number;
  y?: number;
  rotation?: number;
  scale?: number;
  zIndex?: number;
}

export interface Outfit {
  id: string;
  name: string;
  items: OutfitItem[];
  createdAt: number;
}

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}