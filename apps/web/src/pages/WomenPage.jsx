import { useState, useEffect, useRef } from 'react';
import ClothingCard from '../components/ClothingCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { getProducts } from '../services/api.js';
import '../css/MenPage.css';

// Women category page component
function WomenPage() {
    // List of products currently displayed
    const [clothing, setClothing] = useState([]);
    // Holds any error message generated during fetching
    const [error, setError] = useState(null);
    // Indicates whether a fetch is in progress
    const [loading, setLoading] = useState(true);
    // Current pagination index for infinite scrolling
    const [page, setPage] = useState(1);
    // Whether more products are available to load
    const [hasMore, setHasMore] = useState(true);
    // Ref to the container that will hold the scroll sentinel
    const containerRef = useRef(null);
    // Stores the IntersectionObserver instance so we can clean it up
    const observerRef = useRef(null);
    // Visual-only filter button state (no backend filtering yet)
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
    // Load the initial batch of products on mount
    useEffect(() => {
        // Wrapper to fetch first page of products
        const loadClothing = async () => {
            try {
                // Fetch 50 products starting at offset 0
                const products = await getProducts(50, 0);
                // Log how many items arrived (debug aid)
                console.log('Loaded initial products:', products.length);
                // Save products into local state
                setClothing(products);
            } catch (error) {
                // Store a user-facing error message
                setError("Failed to load movies. Please try again later.");
            } finally {
                // Stop showing the loading spinner
                setLoading(false);
            }
        };
        
        loadClothing();
    }, []);

    // Set up infinite scrolling with an IntersectionObserver
    useEffect(() => {
        // Fetch the next page of products when the sentinel becomes visible
        const loadMore = async () => {
            if (!hasMore || loading) return;
            
            setLoading(true);
            try {
                let currentPage = page;
                let foundProducts = false;
                let attempts = 0;
                const maxAttempts = 5;
                
                // Try up to maxAttempts pages until one returns data
                while (!foundProducts && attempts < maxAttempts) {
                    const moreProducts = await getProducts(30, currentPage * 30);
                    console.log('Loading products, page:', currentPage + 1, 'Count:', moreProducts.length);
                    
                    if (moreProducts.length > 0) {
                        // Append new products to the existing list
                        setClothing(prev => {
                            const newProducts = [...prev, ...moreProducts];
                            console.log('Total products now:', newProducts.length);
                            return newProducts;
                        });
                        // Advance to the next page
                        setPage(prev => prev + 1);
                        foundProducts = true;
                    } else {
                        currentPage++;
                        attempts++;
                        console.log(`Page ${currentPage} was empty, trying next page...`);
                    }
                }
                
                // If no products were found after several attempts, stop fetching
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

        // Observer callback: load more when sentinel is visible
        const callback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !loading && hasMore) {
                    loadMore();
                }
            });
        };

        // Create the observer instance
        observerRef.current = new IntersectionObserver(callback, options);

        // Create and observe a sentinel element at the end of the grid
        if (containerRef.current) {
            const sentinel = document.createElement('div');
            sentinel.className = 'scroll-sentinel';
            sentinel.style.height = '20px';
            containerRef.current.appendChild(sentinel);
            observerRef.current.observe(sentinel);
        }

        // Cleanup: disconnect observer on unmount or dependency change
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [page, hasMore, loading]);

    // Toggle a filter button's active state (visual only)
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
        switch(sortOption) {
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

    // Render the page UI
    return (
        <div className="men-page">
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
                    <div className="category-badge">Women</div>
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

                    {/* Show error banner if something went wrong */}
                    {error && <ErrorMessage message={error} />}

                    {/* Initial load shows spinner; subsequent loads append silently */}
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

export default WomenPage;
