import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClothingContext } from '../contexts/ClothingContext.jsx';
import fitted from '../assets/fitted.png';
import searchIcon from '../assets/search.png';
import favoriteIcon from '../assets/favorite.png';
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
                                    className="thumbnail-heart-btn"
                                    onClick={() => handleRemoveFavorite(clothing.id)}
                                    aria-label="Remove from favorites"
                                >
                                    ♥
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
