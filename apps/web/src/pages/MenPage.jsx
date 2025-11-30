import { useState, useEffect, useRef } from 'react';
import ClothingCard from '../components/ClothingCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { getProducts } from '../services/api.js';
import '../css/MenPage.css';

// Men category page
function MenPage() {
    const [clothing, setClothing] = useState([]);
    const [error, setError] = useState(null);
    // loading flag
    const [loading, setLoading] = useState(true);
    // current page index 
    const [page, setPage] = useState(1);
    // more pages available
    const [hasMore, setHasMore] = useState(true);
    // grid container (for sentinel)
    const containerRef = useRef(null);
    const observerRef = useRef(null);
    const [selectedFilters, setSelectedFilters] = useState({
        suggestion: true,
        weather: true,
        trending: false,
        price: false
    });
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [sortBy, setSortBy] = useState(null);
    const sortDropdownRef = useRef(null);
    const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
    const [filters, setFilters] = useState({
        suggestions: false,
        productType: false,
        size: false,
        weather: false
    });
    const [expandedFilters, setExpandedFilters] = useState({
        productType: false,
        size: false,
        weather: false,
        suggestions: false
    });
    const [productTypeOptions, setProductTypeOptions] = useState({
        top: false,
        bottom: false,
        footwear: false
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setSortDropdownOpen(false);
            }
        };

        if (sortDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sortDropdownOpen]);

    useEffect(() => { // initial load
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
        const loadMore = async () => { // fetch next page when sentinel intersects
            if (!hasMore || loading) return;

            setLoading(true);
            try {
                let currentPage = page;
                let foundProducts = false;
                let attempts = 0;
                const maxAttempts = 5;

                while (!foundProducts && attempts < maxAttempts) {
                    const moreProducts = await getProducts(30, currentPage * 30, 'Men');
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

        // trigger load when intersecting
        const callback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !loading && hasMore) {
                    loadMore();
                }
            });
        };

        observerRef.current = new IntersectionObserver(callback, options);

        if (containerRef.current) {
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

    const toggleFilterOption = (filterName) => {
        setFilters(prev => {
            const newValue = !prev[filterName];
            // If turning on productType, also expand it
            if (filterName === 'productType' && newValue) {
                setExpandedFilters(prevExpanded => ({
                    ...prevExpanded,
                    productType: true
                }));
            }
            return {
                ...prev,
                [filterName]: newValue
            };
        });
    };

    const toggleExpanded = (filterName) => {
        setExpandedFilters(prev => ({
            ...prev,
            [filterName]: !prev[filterName]
        }));
    };

    const toggleProductTypeOption = (optionName) => {
        setProductTypeOptions(prev => ({
            ...prev,
            [optionName]: !prev[optionName]
        }));
    };

    const clearAllFilters = () => {
        setFilters({
            suggestions: false,
            productType: false,
            size: false,
            weather: false
        });
        setProductTypeOptions({
            top: false,
            bottom: false,
            footwear: false
        });
        setExpandedFilters({
            productType: false,
            size: false,
            weather: false,
            suggestions: false
        });
    };

    const handleSort = (sortOption) => {
        setSortBy(sortOption);
        setSortDropdownOpen(false);

        const sortedClothing = [...clothing];
        switch (sortOption) {
            case 'name-asc':
                sortedClothing.sort((a, b) => {
                    const nameA = (a.title || a.tittle || '').toLowerCase();
                    const nameB = (b.title || b.tittle || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                break;
            case 'name-desc':
                sortedClothing.sort((a, b) => {
                    const nameA = (a.title || a.tittle || '').toLowerCase();
                    const nameB = (b.title || b.tittle || '').toLowerCase();
                    return nameB.localeCompare(nameA);
                });
                break;
            case 'price-low':
                sortedClothing.sort((a, b) => {
                    const priceA = a.retail_price || 0;
                    const priceB = b.retail_price || 0;
                    return priceA - priceB;
                });
                break;
            case 'price-high':
                sortedClothing.sort((a, b) => {
                    const priceA = a.retail_price || 0;
                    const priceB = b.retail_price || 0;
                    return priceB - priceA;
                });
                break;
            default:
                break;
        }
        setClothing(sortedClothing);
    };

    return (
        <div className="men-page"> {/* wrapper matching shared styles */}
            {/* Filter Sidebar */}
            {filterSidebarOpen && (
                <>
                    <div
                        className="filter-sidebar-overlay"
                        onClick={() => setFilterSidebarOpen(false)}
                    ></div>
                    <div className="filter-sidebar">
                        <button
                            className="filter-sidebar-close"
                            onClick={() => setFilterSidebarOpen(false)}
                        >
                            ×
                        </button>
                        <h2 className="filter-sidebar-title">
                            FILTERS ({Object.values(filters).filter(Boolean).length})
                        </h2>

                        <div className="filter-options">
                            <div className="filter-option-item-simple">
                                <span className="filter-option-name">SUGGESTIONS</span>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={filters.suggestions}
                                        onChange={() => toggleFilterOption('suggestions')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="filter-option-item">
                                <div className="filter-option-header" onClick={() => filters.productType && toggleExpanded('productType')}>
                                    <span className="filter-option-name">
                                        PRODUCT TYPE
                                    </span>
                                    <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={filters.productType}
                                            onChange={() => toggleFilterOption('productType')}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                {filters.productType && expandedFilters.productType && (
                                    <div className="filter-sub-options">
                                        <button
                                            className={`filter-sub-option ${productTypeOptions.top ? 'active' : ''}`}
                                            onClick={() => toggleProductTypeOption('top')}
                                        >
                                            TOP
                                        </button>
                                        <button
                                            className={`filter-sub-option ${productTypeOptions.bottom ? 'active' : ''}`}
                                            onClick={() => toggleProductTypeOption('bottom')}
                                        >
                                            BOTTOM
                                        </button>
                                        <button
                                            className={`filter-sub-option ${productTypeOptions.footwear ? 'active' : ''}`}
                                            onClick={() => toggleProductTypeOption('footwear')}
                                        >
                                            FOOTWEAR
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="filter-option-item-simple">
                                <span className="filter-option-name">SIZE</span>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={filters.size}
                                        onChange={() => toggleFilterOption('size')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="filter-option-item-simple">
                                <span className="filter-option-name">WEATHER</span>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={filters.weather}
                                        onChange={() => toggleFilterOption('weather')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <button className="filter-view-results-btn" onClick={() => setFilterSidebarOpen(false)}>
                            VIEW RESULTS
                        </button>
                        <button className="filter-clear-all-btn" onClick={clearAllFilters}>
                            CLEAR ALL FILTERS
                        </button>
                    </div>
                </>
            )}

            {/* Hero Section with Graffiti Background */}
            <div className="hero-section">
                <div className="hero-content">
                    <div className="category-badge">Men</div>
                    {/* Filter and Sort Buttons */}
                    <div className="filter-sort-buttons">
                        <button
                            className="filter-btn"
                            onClick={() => setFilterSidebarOpen(true)}
                        >
                            FILTER <span className="chevron">▼</span>
                        </button>
                        <div className="sort-dropdown-wrapper" ref={sortDropdownRef}>
                            <button
                                className="sort-btn"
                                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                            >
                                SORT BY <span className="chevron">▼</span>
                            </button>
                            {sortDropdownOpen && (
                                <div className="sort-dropdown">
                                    <button
                                        className={`sort-option ${sortBy === 'name-asc' ? 'active' : ''}`}
                                        onClick={() => handleSort('name-asc')}
                                    >
                                        Name: A to Z
                                    </button>
                                    <button
                                        className={`sort-option ${sortBy === 'name-desc' ? 'active' : ''}`}
                                        onClick={() => handleSort('name-desc')}
                                    >
                                        Name: Z to A
                                    </button>
                                    <button
                                        className={`sort-option ${sortBy === 'price-low' ? 'active' : ''}`}
                                        onClick={() => handleSort('price-low')}
                                    >
                                        Price: low to high
                                    </button>
                                    <button
                                        className={`sort-option ${sortBy === 'price-high' ? 'active' : ''}`}
                                        onClick={() => handleSort('price-high')}
                                    >
                                        Price: high to low
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="main-content">
                {/* Filter Section - Now Horizontal */}
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

export default MenPage;
