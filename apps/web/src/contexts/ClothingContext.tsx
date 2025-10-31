// Global context for favorites (liked clothing) 

import type { ReactNode } from 'react';
import { createContext, useState, useContext, useEffect } from "react";
import type { ClothingItem } from '@fashionapp/shared';

export interface ClothingContextType {
  favorites: ClothingItem[];
  addToFavorites: (item: ClothingItem) => void;
  removeFromFavorites: (id: string | number) => void;
  isInFavorites: (id: string | number) => boolean;
}

const ClothingContext = createContext<ClothingContextType | undefined>(undefined);
export const useClothingContext = () => {
  const ctx = useContext(ClothingContext);
  if (!ctx) throw new Error('useClothingContext must be used within a ClothingProvider');
  return ctx;
};

interface ClothingProviderProps {
  children: ReactNode;
}

export const ClothingProvider = ({ children }: ClothingProviderProps) => {
    const [favorites, setFavorites] = useState<ClothingItem[]>(() => {
        try {
            const storedFavorites = localStorage.getItem("favorites");
            if (storedFavorites) {
                return JSON.parse(storedFavorites);
            }
        } catch (error) {
            console.error("Error reading from localStorage:", error);
        }
        return [];
    });
    
    // Persist favorites whenever they change
    useEffect(() => {
        try {
            localStorage.setItem("favorites", JSON.stringify(favorites))
        } catch (error) {
            console.error("Error saving to localStorage:", error)
        }
    }, [favorites])
    const addToFavorites = (clothing: ClothingItem) => {
        setFavorites((prevFavorites) => [...prevFavorites, clothing]);
    };
    const removeFromFavorites = (clothingId: string | number) => {
        setFavorites((prevFavorites) => prevFavorites.filter(clothing => clothing.id !== clothingId));
    };
    const isInFavorites = (clothingId: string | number) => {
        return favorites.some(clothing => clothing.id === clothingId);
    };

    const value: ClothingContextType = {
        favorites,
        addToFavorites,
        removeFromFavorites,
        isInFavorites,
    };

    return (
        <ClothingContext.Provider value={value}>
            {children}
        </ClothingContext.Provider>
    );
};

export default ClothingContext;