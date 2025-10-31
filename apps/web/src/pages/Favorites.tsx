import { useState } from 'react'; 
import { Link } from 'react-router-dom';
import { useClothingContext } from '../contexts/ClothingContext'; 
import fitted from '../assets/fitted.png'; 
import favoriteIcon from '../assets/favorite.png'; 
import closetIcon from '../assets/closet.png'; 
import loginIcon from '../assets/login.png'; 
import '../css/Favorites.css'; 

function Favorites() { 
    const { favorites, removeFromFavorites } = useClothingContext(); 
    const [selectedCategory, setSelectedCategory] = useState('TOP'); 
    const [showFavorites, setShowFavorites] = useState(true); 

     // remove item from favorites
    const handleRemoveFavorite = (movieId) => {
        removeFromFavorites(movieId);
    }
    
    // placeholder sidebar categories
    const categories = ['TOP', 'BOTTOM', 'SNEAKERS']; 

    return (
        <div className="favorites-page"> 
            {/* Header */}
            <header className="favorites-header"> 
                <div className="header-content"> 
                    <div className="header-logo"> 
                        <Link to="/">
                            <img src={fitted} alt="Fitted" className="navbar-logo"/>
                        </Link>
                    </div>
                    
                    <div className="header-icons"> {/* right-side action icons */}
                        <Link to="/favorites" aria-label="Favorites">
                            <img src={favoriteIcon} alt="Favorites" className="favorite-icon" />
                        </Link>
                        <Link to="/closet" aria-label="Closet">
                            <img src={closetIcon} alt="Closet" className="closet-icon" />
                        </Link>
                        <Link to="/login" aria-label="Login">
                            <img src={loginIcon} alt="Login" className="login-icon" />
                        </Link>
                    </div>
                </div>
            </header>

            <div className="favorites-main"> {/* header below*/}
                {/* Left Sidebar */}
                <div className="favorites-sidebar"> 
                    <div className="category-buttons"> 
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="favorites-content"> 
                    <div className="content-placeholder"> 
                        <h2>Your Favorites</h2>
                        <p>Select a category to view your favorite items</p>
                        {!showFavorites && favorites.length > 0 && (
                            <button 
                                className="show-favorites-btn"
                                onClick={() => setShowFavorites(true)}
                            >
                                Show Favorites List
                            </button>
                        )}
                    </div>
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
                        {favorites.map((movie, index) => (
                            <div key={`${movie.id}-${index}`} className="favorite-thumbnail">
                                <img 
                                    src={movie.image_url || movie.poster_path} 
                                    alt={movie.title || movie.tittle}
                                    className="thumbnail-image"
                                />
                                <button 
                                    className="thumbnail-heart-btn active"
                                    onClick={() => handleRemoveFavorite(movie.id)}
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

export default Favorites;