import { ProductCategory } from './types';
import type { Product } from './types';

// Helper to generate mock images that look somewhat like clothes based on ID
const getImg = (id: number, type: string) => `https://picsum.photos/seed/${type}${id}/400/400`;

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Oversized Heavy Tee', brand: 'VOID', price: 45, category: ProductCategory.TOPS, imageUrl: getImg(1, 'shirt'), color: 'White' },
  { id: '2', name: 'Cargo Tech Pants', brand: 'FITTED LABS', price: 120, category: ProductCategory.BOTTOMS, imageUrl: getImg(2, 'pants'), color: 'Black' },
  { id: '3', name: 'Dunk Low Retro', brand: 'NIKE', price: 110, category: ProductCategory.SHOES, imageUrl: getImg(3, 'shoes'), color: 'Red' },
  { id: '4', name: 'Tactical Vest', brand: 'ROTHCO', price: 85, category: ProductCategory.OUTERWEAR, imageUrl: getImg(4, 'vest'), color: 'Black' },
  { id: '5', name: 'Bucket Hat', brand: 'STUSSY', price: 50, category: ProductCategory.ACCESSORIES, imageUrl: getImg(5, 'hat'), color: 'Beige' },
  { id: '6', name: 'Graphic Hoodie', brand: 'PALACE', price: 160, category: ProductCategory.TOPS, imageUrl: getImg(6, 'hoodie'), color: 'Grey' },
  { id: '7', name: 'Wide Leg Denim', brand: 'LEVIS', price: 98, category: ProductCategory.BOTTOMS, imageUrl: getImg(7, 'jeans'), color: 'Blue' },
  { id: '8', name: 'Silver Chain', brand: 'AMBUSH', price: 250, category: ProductCategory.ACCESSORIES, imageUrl: getImg(8, 'chain'), color: 'Silver' },
  { id: '9', name: 'Puffer Jacket', brand: 'NORTH FACE', price: 320, category: ProductCategory.OUTERWEAR, imageUrl: getImg(9, 'jacket'), color: 'Orange' },
  { id: '10', name: 'High Top Canvas', brand: 'CONVERSE', price: 75, category: ProductCategory.SHOES, imageUrl: getImg(10, 'sneaker'), color: 'Black' },
];

export const TRENDING_TAGS = ['#gorpcore', '#y2k', '#cyberpunk', '#vintage', '#blokecore'];
