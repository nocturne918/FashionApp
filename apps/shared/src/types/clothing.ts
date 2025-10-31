export interface ClothingItem {
  id: string | number;
  image_url?: string;
  poster_path?: string;
  title?: string;
  tittle?: string; // Note: 'tittle' seems to be a typo, but we'll include it for backward compatibility
  [key: string]: any; // For any additional properties
}

export interface ClothingContextType {
  favorites: ClothingItem[];
  addToFavorites: (item: ClothingItem) => void;
  removeFromFavorites: (id: string | number) => void;
  isInFavorites: (id: string | number) => boolean;
}
