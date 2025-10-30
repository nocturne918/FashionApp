
// Fetches products, shows horizontal filters, and a grid with infinite scroll.

import { useState, useEffect, useRef } from 'react';
// Reusable product card
import ClothingCard from '../components/ClothingCard.jsx';
// Simple spinner for loading states
import LoadingSpinner from '../components/LoadingSpinner.jsx';
// Error banner if data fetching fails
import ErrorMessage from '../components/ErrorMessage.jsx';
// API function to fetch products
import { getProducts } from '../services/api.js';
// Reuse MenPage styles for category layout
import '../css/MenPage.css';

// Page component for the Brands category
function BrandsPage() { 
    // product list
    const [clothing, setClothing] = useState([]); 
    // error message state
    const [error, setError] = useState(null); 
    // initial loading flag
    const [loading, setLoading] = useState(true); 
    // pagination page index
    const [page, setPage] = useState(1); 
    // whether more pages exist
    const [hasMore, setHasMore] = useState(true); 
    // container that holds the grid
    const containerRef = useRef(null); 
    const observerRef = useRef(null); 
    // simple visual filter state
    const [selectedFilters, setSelectedFilters] = useState({ 
        suggestion: true,
        weather: true,
        trending: false,
        price: false
    });
// run once on mount
    useEffect(() => { 
        // fetch initial page
        const loadClothing = async () => { 
            try {
                // 50 items, skip 0
                const products = await getProducts(50, 0); 
                console.log('Loaded initial products:', products.length);
                setClothing(products); 
            } catch (error) {
                setError("Failed to load movies. Please try again later."); 
            } finally {
                // end initial loading
                setLoading(false);
            }
        };
        loadClothing(); 
    }, []);

    // Infinite scroll using IntersectionObserver
    useEffect(() => {
        // fetch subsequent pages
        const loadMore = async () => { 
            if (!hasMore || loading) return; 
            setLoading(true);
            try {
                let currentPage = page; 
                let foundProducts = false;
                let attempts = 0;
                const maxAttempts = 5; 

                while (!foundProducts && attempts < maxAttempts) { 
                    const moreProducts = await getProducts(30, currentPage * 30); // 30 per page
                    console.log('Loading products, page:', currentPage + 1, 'Count:', moreProducts.length);

                    if (moreProducts.length > 0) { 
                        setClothing(prev => {
                            const newProducts = [...prev, ...moreProducts];
                            console.log('Total products now:', newProducts.length);
                            return newProducts;
                        });
                        setPage(prev => prev + 1);
                        foundProducts = true;
                    } else { // try next page
                        currentPage++;
                        attempts++;
                        console.log(`Page ${currentPage} was empty, trying next page...`);
                    }
                }

                if (!foundProducts) { // no more content
                    console.log('No more products to load after trying multiple pages');
                    setHasMore(false);
                }
            } catch (error) {
                console.error('Error loading more products:', error);
            } finally {
                setLoading(false);
            }
        };

        const options = { 
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        };

        const callback = (entries) => { // when sentinel intersects, load more
            entries.forEach(entry => {
                if (entry.isIntersecting && !loading && hasMore) {
                    loadMore();
                }
            });
        };

        observerRef.current = new IntersectionObserver(callback, options); // create observer

        if (containerRef.current) { // append and observe sentinel
            const sentinel = document.createElement('div');
            sentinel.className = 'scroll-sentinel';
            sentinel.style.height = '20px';
            containerRef.current.appendChild(sentinel);
            observerRef.current.observe(sentinel);
        }

        return () => { 
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [page, hasMore, loading]);

    const toggleFilter = (filterName) => { 
        setSelectedFilters(prev => ({
            ...prev,
            [filterName]: !prev[filterName]
        }));
    };

    return (
        <div className="men-page"> {/* wrapper matching MenPage styles */}
            {/* Hero Section with Graffiti Background */}
            <div className="hero-section"> {/* graffiti background hero */}
                <div className="hero-content">
                    <div className="category-badge">Brands</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="main-content"> {/* filters + grid area */}
                {/* Filter Section - Now Horizontal */}
                <div className="filter-section"> {/* horizontal filter buttons */}
                    <button 
                        className={`filter-button ${selectedFilters.suggestion ? 'active' : ''}`}
                        onClick={() => toggleFilter('suggestion')}
                    >
                        Suggestion
                    </button>

                    <button 
                        className={`filter-button ${selectedFilters.weather ? 'active' : ''}`}
                        onClick={() => toggleFilter('weather')}
                    >
                        Weather
                    </button>

                    <button 
                        className={`filter-button ${selectedFilters.trending ? 'active' : ''}`}
                        onClick={() => toggleFilter('trending')}
                    >
                        Trending
                    </button>

                    <button 
                        className={`filter-button ${selectedFilters.price ? 'active' : ''}`}
                        onClick={() => toggleFilter('price')}
                    >
                        Price
                    </button>
                </div>

                {/* Product Grid */}
                <div className="product-grid-section"> {/* grid wrapper */}
                    <div className="grid-header">
                        <button className="sort-button">
                            Sort <span className="sort-arrow">▼</span>
                        </button>
                    </div>

                    {error && <ErrorMessage message={error} />}

                    {loading && page === 1 ? (
                        <LoadingSpinner text="Loading products..." />
                    ) : (
                        <div ref={containerRef} className="product-grid"> {/* infinite grid */}
                            {clothing.map((item, index) => (
                                <ClothingCard key={`${item.id}-${index}`} clothing={item} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BrandsPage;
