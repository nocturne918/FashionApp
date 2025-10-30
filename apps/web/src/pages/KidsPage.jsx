
import { useState, useEffect, useRef } from 'react';

import ClothingCard from '../components/ClothingCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { getProducts } from '../services/api.js';
import '../css/MenPage.css';

// category page for Kids
function KidsPage() {
    const [clothing, setClothing] = useState([]); 
    // fetch error state
    const [error, setError] = useState(null); 
    // loading flag
    const [loading, setLoading] = useState(true);
    // page index for pagination 
    const [page, setPage] = useState(1); 
    // whether more pages exist
    const [hasMore, setHasMore] = useState(true); 
    // grid container 
    const containerRef = useRef(null); 
    const observerRef = useRef(null); 
    const [selectedFilters, setSelectedFilters] = useState({ 
        suggestion: true,
        weather: true,
        trending: false,
        price: false
    });
    // initial load
    useEffect(() => { 
        const loadClothing = async () => {
            try {
                const products = await getProducts(50, 0);
                console.log('Loaded initial products:', products.length);
                setClothing(products);
            } catch (error) {
                setError("Failed to load movies. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        loadClothing();
    }, []);

    // Infinite scroll using Intersection Observer
    useEffect(() => {
        const loadMore = async () => { // fetch next page when sentinel appears
            if (!hasMore || loading) return;
            
            setLoading(true);
            try {
                let currentPage = page;
                let foundProducts = false;
                let attempts = 0;
                const maxAttempts = 5;
                
                while (!foundProducts && attempts < maxAttempts) {
                    const moreProducts = await getProducts(30, currentPage * 30);
                    console.log('Loading products, page:', currentPage + 1, 'Count:', moreProducts.length);
                    
                    if (moreProducts.length > 0) {
                        setClothing(prev => {
                            const newProducts = [...prev, ...moreProducts];
                            console.log('Total products now:', newProducts.length);
                            return newProducts;
                        });
                        setPage(prev => prev + 1);
                        foundProducts = true;
                    } else {
                        currentPage++;
                        attempts++;
                        console.log(`Page ${currentPage} was empty, trying next page...`);
                    }
                }
                
                if (!foundProducts) {
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

        const callback = (entries) => { // when intersecting, trigger load
            entries.forEach(entry => {
                if (entry.isIntersecting && !loading && hasMore) {
                    loadMore();
                }
            });
        };

        observerRef.current = new IntersectionObserver(callback, options); // create observer

        if (containerRef.current) {
            const sentinel = document.createElement('div');
            sentinel.className = 'scroll-sentinel';
            sentinel.style.height = '20px';
            containerRef.current.appendChild(sentinel);
            observerRef.current.observe(sentinel);
        }

        return () => { // cleanup on unmount
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [page, hasMore, loading]);

    const toggleFilter = (filterName) => { // flip one filter's active state
        setSelectedFilters(prev => ({
            ...prev,
            [filterName]: !prev[filterName]
        }));
    };

    return (
        <div className="men-page"> 
            {/* Hero Section with Graffiti Background */}
            <div className="hero-section">
                <div className="hero-content">
                    <div className="category-badge">Kids</div> 
                </div>
            </div>

            {/* Main Content Area */}
            <div className="main-content">
                {/* Filter Section  */}
                <div className="filter-section">
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
                <div className="product-grid-section"> 
                    <div className="grid-header">
                        <button className="sort-button">
                            Sort <span className="sort-arrow">▼</span>
                        </button>
                    </div>

                    {error && <ErrorMessage message={error} />} {/* show error if fetch fails */}

                    {loading && page === 1 ? (
                        <LoadingSpinner text="Loading products..." /> 
                    ) : (
                        <div ref={containerRef} className="product-grid"> 
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

export default KidsPage;
