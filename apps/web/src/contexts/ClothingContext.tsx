// Global context for favorites (liked clothing) 

import { createContext, useState, useContext, useEffect } from "react";

// Create the context container
const ClothingContext = createContext();
// to access the context anywhere in the component 
export const useClothingContext = () => useContext(ClothingContext);

// wraps the app and exposes favorites + helpers
export const ClothingProvider = ({children}) => {
    // Initialize favorites 
    const [favorites, setFavorites] = useState(() => {
        try {
            const storedFavorites = localStorage.getItem("favorites")
            if(storedFavorites) {
                return JSON.parse(storedFavorites)
            }
        } catch (error) {
            console.error("Error reading from localStorage:", error)
        }
        return []
    })
    
    // Persist favorites whenever they change
    useEffect(() => {
        try {
            localStorage.setItem("favorites", JSON.stringify(favorites))
        } catch (error) {
            console.error("Error saving to localStorage:", error)
        }
    }, [favorites])
    // Add an item to favorites
    const addToFavorites = (clothing) => {
        setFavorites((prevFavorites) => [...prevFavorites, clothing])
    }
    // Remove an item by id
    const removeFromFavorites = (clothingId) => {
        setFavorites((prevFavorites) => prevFavorites.filter(clothing => clothing.id !== clothingId))
    }
    // Check if an id is currently favorited
    const isInFavorites = (clothingId) => {
        return favorites.some(clothing => clothing.id === clothingId)
    }

 
    const value={
        favorites,
        addToFavorites,
        removeFromFavorites,
        isInFavorites,
    }


    // Provide state
    return <ClothingContext.Provider value={value}>
        {children}
    </ClothingContext.Provider>
    
}
export default ClothingContext;