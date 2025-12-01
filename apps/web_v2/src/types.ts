export const ProductCategory = {
  TOPS: 'TOPS',
  BOTTOMS: 'BOTTOMS',
  SHOES: 'SHOES',
  ACCESSORIES: 'ACCESSORIES',
  OUTERWEAR: 'OUTERWEAR'
} as const;

export type ProductCategory = typeof ProductCategory[keyof typeof ProductCategory];

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  color: string;
}

export interface OutfitItem extends Product {
  x?: number; // For canvas positioning
  y?: number;
  scale?: number;
  rotation?: number;
  zIndex?: number;
}

export interface Outfit {
  id: string;
  name: string;
  items: OutfitItem[];
  createdAt: number;
}

export interface User {
  username: string;
  email: string;
}
