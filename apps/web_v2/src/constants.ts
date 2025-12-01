import { ProductCategory, Department } from './types';
import type { Product } from './types';

// Helper to generate mock images that look somewhat like clothes based on ID
const getImg = (id: number, type: string) => `https://picsum.photos/seed/${type}${id}/400/400`;

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Oversized Heavy Tee', brand: 'VOID', price: 45, category: ProductCategory.TOPS, department: Department.UNISEX, imageUrl: getImg(1, 'shirt'), color: 'White', tags: ['streetwear', 'basics', 'oversized'] },
  { id: '2', name: 'Cargo Tech Pants', brand: 'FITTED LABS', price: 120, category: ProductCategory.BOTTOMS, department: Department.MENS, imageUrl: getImg(2, 'pants'), color: 'Black', tags: ['techwear', 'utility', 'cargo'] },
  { id: '3', name: 'Dunk Low Retro', brand: 'NIKE', price: 110, category: ProductCategory.SHOES, department: Department.UNISEX, imageUrl: getImg(3, 'shoes'), color: 'Red', tags: ['sneakers', 'classic', 'lowtop'] },
  { id: '4', name: 'Tactical Vest', brand: 'ROTHCO', price: 85, category: ProductCategory.OUTERWEAR, department: Department.MENS, imageUrl: getImg(4, 'vest'), color: 'Black', tags: ['tactical', 'layering', 'vest'] },
  { id: '5', name: 'Bucket Hat', brand: 'STUSSY', price: 50, category: ProductCategory.ACCESSORIES, department: Department.UNISEX, imageUrl: getImg(5, 'hat'), color: 'Beige', tags: ['summer', 'accessories', 'headwear'] },
  { id: '6', name: 'Graphic Hoodie', brand: 'PALACE', price: 160, category: ProductCategory.TOPS, department: Department.MENS, imageUrl: getImg(6, 'hoodie'), color: 'Grey', tags: ['skate', 'graphic', 'hoodie'] },
  { id: '7', name: 'Wide Leg Denim', brand: 'LEVIS', price: 98, category: ProductCategory.BOTTOMS, department: Department.WOMENS, imageUrl: getImg(7, 'jeans'), color: 'Blue', tags: ['denim', 'vintage', 'wideleg'] },
  { id: '8', name: 'Silver Chain', brand: 'AMBUSH', price: 250, category: ProductCategory.ACCESSORIES, department: Department.UNISEX, imageUrl: getImg(8, 'chain'), color: 'Silver', tags: ['jewelry', 'luxury', 'silver'] },
  { id: '9', name: 'Puffer Jacket', brand: 'NORTH FACE', price: 320, category: ProductCategory.OUTERWEAR, department: Department.UNISEX, imageUrl: getImg(9, 'jacket'), color: 'Orange', tags: ['winter', 'outerwear', 'puffer'] },
  { id: '10', name: 'High Top Canvas', brand: 'CONVERSE', price: 75, category: ProductCategory.SHOES, department: Department.UNISEX, imageUrl: getImg(10, 'sneaker'), color: 'Black', tags: ['classic', 'canvas', 'hightop'] },
  { id: '11', name: 'Cropped Baby Tee', brand: 'SKIMS', price: 48, category: ProductCategory.TOPS, department: Department.WOMENS, imageUrl: getImg(11, 'top'), color: 'Pink', tags: ['y2k', 'fitted', 'basics'] },
  { id: '12', name: 'Pleated Mini Skirt', brand: 'MIU MIU', price: 850, category: ProductCategory.BOTTOMS, department: Department.WOMENS, imageUrl: getImg(12, 'skirt'), color: 'Beige', tags: ['preppy', 'luxury', 'skirt'] },
  { id: '13', name: 'Kids Graphic Tee', brand: 'GAP', price: 25, category: ProductCategory.TOPS, department: Department.KIDS, imageUrl: getImg(13, 'kidstee'), color: 'Blue', tags: ['kids', 'graphic', 'cotton'] },
  { id: '14', name: 'Kids Joggers', brand: 'NIKE', price: 40, category: ProductCategory.BOTTOMS, department: Department.KIDS, imageUrl: getImg(14, 'kidspants'), color: 'Grey', tags: ['kids', 'sport', 'comfy'] },
];

export const TRENDING_TAGS = ['#gorpcore', '#y2k', '#cyberpunk', '#vintage', '#blokecore'];
