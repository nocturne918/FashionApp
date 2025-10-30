import { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom'; 
import ClothingCard from '../components/ClothingCard.jsx'; 
import SearchBar from '../components/SearchBar.jsx'; 
import ClothingList from '../components/ClothingList.jsx'; 
import LoadingSpinner from '../components/LoadingSpinner.jsx'; 
import ErrorMessage from '../components/ErrorMessage.jsx'; 
import { getProducts, searchProducts } from '../services/api.js'; 
import '../css/Search.css'; 
import fitted from '../assets/fitted.png'; 
import searchIcon from '../assets/search.png'; 
import favoriteIcon from '../assets/favorite.png'; 
import closetIcon from '../assets/closet.png'; 
import loginIcon from '../assets/login.png'; 
import graffiti from '../assets/graffiti.jpg'; 

function Search() { // Main Search page component
    // Current search text
    const [searchQuery, setSearchQuery] = useState(""); 
    // Full dataset loaded
    const [clothing, setClothing] = useState([]); 
    // Filtered results to render
    const [filteredClothing, setFilteredClothing] = useState([]); 
    const [error, setError] = useState(null); 
    const [loading, setLoading] = useState(true); 

    useEffect(() => { 
        const loadClothing = async () => { // Async fetch wrapper
            try { // Try to fetch products
                const popularProducts = await getProducts(); 
                console.log('Loaded products:', popularProducts.length); 
                console.log('Sample product:', popularProducts[0]); 
                setClothing(popularProducts); 
                setFilteredClothing(popularProducts); 
            } catch (error) { // On failure
                console.error('Error loading movies:', error); // Log error
                setError("Failed to load movies. Please try again later."); 
            } finally { 
                setLoading(false); // Stop loading spinner
            }
        };
        loadClothing(); 
    }, []); 

    // Filter list when query or data changes
    useEffect(() => { // Recompute filtered list
        console.log('Search query changed:', searchQuery); 
        console.log('Available clothing count:', clothing.length); 
        
        if (searchQuery.trim() === '') { // Empty query
            setFilteredClothing(clothing); 
        } else { // Non-empty query
            const filtered = clothing.filter(clothing => { // Perform case-insensitive match
                const titleMatch = clothing.title?.toLowerCase().includes(searchQuery.toLowerCase()); // title
                const tittleMatch = clothing.tittle?.toLowerCase().includes(searchQuery.toLowerCase()); // legacy tittle
                const originalTitleMatch = clothing.original_title?.toLowerCase().includes(searchQuery.toLowerCase()); // original title
                const nameMatch = clothing.name?.toLowerCase().includes(searchQuery.toLowerCase()); // name
                
                return titleMatch || tittleMatch || originalTitleMatch || nameMatch; // any match qualifies
            });
            
            console.log('Filtered results count:', filtered.length); 
            console.log('First few filtered clothing:', filtered.slice(0, 3)); 
            setFilteredClothing(filtered);
        }
    }, [searchQuery, clothing]); 

    return ( 
        <div className="search-page"> {/* Page wrapper */}
            {/* Custom NavBar for Search Page */}
            <header className='nav search-nav'> 
                <nav className="nav-inner search-nav-inner"> 
                    {/* Logo on the left */}
                    <div className="search-nav-left"> 
                        <Link to="/"> 
                            <img src={fitted} alt="Fitted" className="navbar-logo"/> 
                        </Link>
                    </div>
                    
                    {/* Search bar in the center */}
                    <SearchBar 
                        placeholder="Search for products..." 
                        onSearch={setSearchQuery} 
                        value={searchQuery}
                        className="navbar-search-bar" 
                    />
                    
                    {/* Right side navigation buttons */}
                    <div className='nav-right'> 
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
                </nav>
            </header>

            {/* Search Content */}
            <div className="search-content"> 
                {error && <ErrorMessage message={error} />} 

                {loading ? ( // While loading
                    <LoadingSpinner text="Loading movies..." /> 
                ) : ( // After loading
                    <div className="clothing-container"> 
                        {searchQuery.trim() === '' ? ( 
                            <>
                                <div className="clothing-section"> 
                                    <h2 className="section-title">Recently Viewed</h2> 
                                    <div className="clothing-list-horizontal"> 
                                        {[...clothing.slice(0, Math.ceil(clothing.length / 2)), ...clothing.slice(0, Math.ceil(clothing.length / 2))].map((clothing, index)=>( // Duplicate half to extend
                                            <ClothingCard key={`recent-${clothing.id}-${index}`} clothing={clothing}/> // Card item
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="clothing-section"> {/* Recommended row */}
                                    <h2 className="section-title">Recommended for You</h2> 
                                    <div className="clothing-list-horizontal"> {/* Horizontal scroller */}
                                        {[...clothing.slice(Math.ceil(clothing.length / 2)), ...clothing.slice(Math.ceil(clothing.length / 2))].map((clothing, index)=>( // Duplicate other half
                                            <ClothingCard key={`recommended-${clothing.id}-${index}`} clothing={clothing}/> // Card item
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : ( // Has query → show results
                            <div className="clothing-section"> {/* Results section */}
                                <h2 className="section-title">Search Results ({filteredClothing.length} found)</h2> 
                                <div className="clothing-list-horizontal"> 
                                    {filteredClothing.map((clothing, index)=>( // Render filtered cards
                                        <ClothingCard key={`search-${clothing.id}-${index}`} clothing={clothing}/> // Card item
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Graffiti Image at the bottom */}
            <div className="graffiti-section"> 
                <img src={graffiti} alt="Graffiti" className="search-graffiti-image" />
            </div>
        </div>
    );
}

export default Search; 
