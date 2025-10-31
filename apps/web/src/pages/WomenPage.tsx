import { useState, useEffect, useRef } from "react";

import ClothingCard from "../components/ClothingCard.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import ErrorMessage from "../components/ErrorMessage.js";
import { getProducts } from "../services/api.js";
import type { Product } from '@fashionapp/shared';
import "../css/MenPage.css";

// category page for Women
function WomenPage() {
  const [clothing, setClothing] = useState<Product[]>([]);
  // fetch error state
  const [error, setError] = useState<string | null>(null);
  // loading flag
  const [loading, setLoading] = useState(true);
  // page index for pagination
  const [page, setPage] = useState(1);
  // whether more pages exist
  const [hasMore, setHasMore] = useState(true);
  // grid container
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<{
    suggestion: boolean;
    weather: boolean;
    trending: boolean;
    price: boolean;
  }>({
    suggestion: true,
    weather: true,
    trending: false,
    price: false,
  });
  // initial load
  useEffect(() => {
    const loadClothing = async () => {
      try {
        const products = await getProducts(50, 0);
        console.log("Loaded initial products:", products.length);
        setClothing(products);
      } catch (error) {
  setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadClothing();
  }, []);

  // Infinite scroll using Intersection Observer
  useEffect(() => {
    const loadMore = async () => {
      // fetch next page when sentinel appears
      if (!hasMore || loading) return;

      setLoading(true);
      try {
        let currentPage = page;
        let foundProducts = false;
        let attempts = 0;
        const maxAttempts = 5;

        while (!foundProducts && attempts < maxAttempts) {
          const moreProducts = await getProducts(30, currentPage * 30);
          console.log(
            "Loading products, page:",
            currentPage + 1,
            "Count:",
            moreProducts.length
          );

          if (moreProducts.length > 0) {
            setClothing((prev) => {
              const newProducts = [...prev, ...moreProducts];
              console.log("Total products now:", newProducts.length);
              return newProducts;
            });
            setPage((prev) => prev + 1);
            foundProducts = true;
          } else {
            currentPage++;
            attempts++;
            console.log(`Page ${currentPage} was empty, trying next page...`);
          }
        }

        if (!foundProducts) {
          console.log("No more products to load after trying multiple pages");
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error loading more products:", error);
      } finally {
        setLoading(false);
      }
    };

    const options = {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    };


    const callback = (entries: IntersectionObserverEntry[]) => {
      // when intersecting, trigger load
      entries.forEach((entry: IntersectionObserverEntry) => {
        if (entry.isIntersecting && !loading && hasMore) {
          loadMore();
        }
      });
    };

    observerRef.current = new IntersectionObserver(callback, options); // create observer

    if (containerRef.current) {
      const sentinel = document.createElement("div");
      sentinel.className = "scroll-sentinel";
      sentinel.style.height = "20px";
      (containerRef.current as HTMLDivElement).appendChild(sentinel);
      observerRef.current.observe(sentinel);
    }

    return () => {
      // cleanup on unmount
      observerRef.current?.disconnect();
    };
  }, [page, hasMore, loading]);

  const toggleFilter = (filterName: keyof typeof selectedFilters) => {
    // flip one filter's active state
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  return (
    <div className="men-page">
      {/* Hero Section with Graffiti Background */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="category-badge">Women</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Filter Section  */}
        <div className="filter-section">
          <button
            className={`filter-button ${
              selectedFilters.suggestion ? "active" : ""
            }`}
            onClick={() => toggleFilter("suggestion")}
          >
            Suggestion
          </button>

          <button
            className={`filter-button ${
              selectedFilters.weather ? "active" : ""
            }`}
            onClick={() => toggleFilter("weather")}
          >
            Weather
          </button>

          <button
            className={`filter-button ${
              selectedFilters.trending ? "active" : ""
            }`}
            onClick={() => toggleFilter("trending")}
          >
            Trending
          </button>

          <button
            className={`filter-button ${selectedFilters.price ? "active" : ""}`}
            onClick={() => toggleFilter("price")}
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
          {error && <ErrorMessage message={error} />}{" "}
          {/* show error if fetch fails */}
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
