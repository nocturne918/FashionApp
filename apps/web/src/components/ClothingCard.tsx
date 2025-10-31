// Card used across pages to display a single product/movie item
import "../css/ClothingCard.css"
import { useClothingContext } from "../contexts/ClothingContext";

function ClothingCard({clothing}) {
    // Favorites API from context 
    const {isInFavorites, addToFavorites, removeFromFavorites} = useClothingContext(); 
    // Compute whether this item is currently in favorites
    const favorite = isInFavorites(clothing.id);
    
    // Toggle heart state without navigating the parent card
    const onFavoriteClick = (e) => {
        e.preventDefault();
        if(favorite) {
            removeFromFavorites(clothing.id);
        } else {
            addToFavorites(clothing);
        }
    };

    // avoid rendering if required data is missing
    if (!clothing) {
        console.error('ClothingCard received undefined clothing prop');
        return null;
    }

    // Helpful trace while developing
    console.log('Rendering ClothingCard for:', clothing.title || clothing.tittle);

    return (
    <div className="clothing-card">
        <div className="clothing-poster">
            {/* Prefer DummyJSON image_url; fall back to TMDB poster_path */}
            <img src={clothing.image_url || clothing.poster_path} alt={clothing.title || clothing.tittle}/>
            {/* filled heart  when favorite */}
            <button className={`favorite-btn ${favorite ? "active" : ""}`} onClick={onFavoriteClick}>
                {favorite ? (
                    //fill the heart when liked
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        {/* path to fill the heart */}
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                ) : (
                    //outline the heart when not liked
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {/* path to outline the heart */}
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                )}
            </button>
            <div className="clothing-overlay">
            </div>
        </div>
        <div className="clothing-info">
            {/* Title label  */}
            <h3>{clothing.title || clothing.tittle}</h3>
            {/* price when available. */}
            {clothing.retail_price ? (
                <span className="clothing-text">${clothing.retail_price}</span>
            ) : null}
        </div>
    </div>
    );
}

export default ClothingCard;