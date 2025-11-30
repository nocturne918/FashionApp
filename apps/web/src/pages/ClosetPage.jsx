import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClothingContext } from '../contexts/ClothingContext.jsx';
import fitted from '../assets/fitted.png';
import searchIcon from '../assets/search.png';
import favoriteIcon from '../assets/favorite.png';
import closetIcon from '../assets/closet.png';
import loginIcon from '../assets/login.png';
import '../css/ClosetPage.css';

function ClosetPage() {
    const { favorites, removeFromFavorites } = useClothingContext();
    const [showFavorites, setShowFavorites] = useState(true);

    const handleRemoveFavorite = (clothingId) => {
        removeFromFavorites(clothingId);
    };

    return (
        <div className="closet-page">
            {/* Main Display Area */}
            <div className="closet-main-area">
                {/* Logo */}
                <div className="closet-logo">
                    <Link to="/">
                        <img src={fitted} alt="Fitted" className="navbar-logo"/>
                    </Link>
                </div>

                {/* Separator Line */}
                <div className="closet-separator-line"></div>

                {/* Central Mannequin */}
                <div className="mannequin-container">
                    <div className="mannequin"></div>
                </div>

                {/* Right Side Navigation Buttons */}
                <div className='nav-right'>
                    <Link to="/search" aria-label="Search">
                        <img src={searchIcon} alt="Search" className="search-icon" />
                    </Link>
                    <Link to="/favorites" aria-label="Favorites">
                        <img src={favoriteIcon} alt="Favorites" className="favorite-icon" />
                    </Link>
                    <Link to="/closet" aria-label="Bag">
                        <img src={closetIcon} alt="Bag" className="closet-icon" />
                    </Link>
                    <Link to="/login" aria-label="Login">
                        <img src={loginIcon} alt="Login" className="login-icon" />
                    </Link>
                </div>
            </div>

            {/* Bottom Favorites Strip */}
            {showFavorites && favorites.length > 0 && (
                <div className="favorites-strip">
                    <button 
                        className="close-btn"
                        onClick={() => setShowFavorites(false)}
                    >
                        ✕
                    </button>
                    
                    <div className="favorites-thumbnails">
                        {favorites.map((clothing, index) => (
                            <div key={`${clothing.id}-${index}`} className="favorite-thumbnail">
                                <img 
                                    src={clothing.image_url || clothing.poster_path} 
                                    alt={clothing.title || clothing.tittle}
                                    className="thumbnail-image"
                                />
                                <button 
                                    className="thumbnail-heart-btn active"
                                    onClick={() => handleRemoveFavorite(clothing.id)}
                                    aria-label="Remove from favorites"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClosetPage;
