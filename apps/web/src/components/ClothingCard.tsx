// Card used across pages to display a single product/movie item
import "../css/ClothingCard.css"


import { useClothingContext } from '../contexts/ClothingContext';
import type { ClothingItem } from '@fashionapp/shared';

interface ClothingCardProps {
  clothing: ClothingItem;
}

interface ClothingContextType {
  favorites: ClothingItem[];
  addToFavorites: (item: ClothingItem) => void;
  removeFromFavorites: (id: string | number) => void;
  isInFavorites: (id: string | number) => boolean;
}

export function ClothingCard({ clothing }: ClothingCardProps) {
    const { isInFavorites, addToFavorites, removeFromFavorites } = useClothingContext() as ClothingContextType;
    const favorite = isInFavorites(clothing.id);

    const onFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (favorite) {
            removeFromFavorites(clothing.id);
        } else {
            addToFavorites(clothing);
        }
    };

    if (!clothing) {
        console.error('ClothingCard received undefined clothing prop');
        return null;
    }

    console.log('Rendering ClothingCard for:', clothing.title || clothing.tittle);

    return (
        <div className="clothing-card">
            <div className="clothing-poster">
                <img src={clothing.image_url || clothing.poster_path} alt={clothing.title || clothing.tittle} />
                <button className={`favorite-btn ${favorite ? "active" : ""}`} onClick={onFavoriteClick}>
                    {favorite ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    )}
                </button>
                <div className="clothing-overlay"></div>
            </div>
            <div className="clothing-info">
                <h3>{clothing.title || clothing.tittle}</h3>
                {clothing.retail_price ? (
                    <span className="clothing-text">${clothing.retail_price}</span>
                ) : null}
            </div>
        </div>
    );
}

export default ClothingCard;