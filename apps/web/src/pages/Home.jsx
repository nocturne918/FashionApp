import ClothingCard from '../components/ClothingCard.jsx'
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api.js';
import '../css/Home.css';
import graffiti from '../assets/graffiti.jpg';
import Footer from '../components/Footer.jsx';

function Home(){
    const [clothing, setClothing]=useState([]);
    const [error, setError]=useState(null);
    const [loading, setLoading]=useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const containerRef = useRef(null);
    const observerRef = useRef(null);
    const [infiniteProducts, setInfiniteProducts] = useState([]);
    const enableHomeInfinite = false;
    

    useEffect(()=>{
        const loadClothing =async()=>{
            try{
                console.log('Loading products from DummyJSON...');
                const products = await getProducts(20, 0);
                console.log('Products loaded:', products);
                setClothing(products);
                // Ensure brand rows render immediately without needing to scroll
                setInfiniteProducts(products);
            } catch (error){
                console.error('Error loading products:', error);
                setError("Failed to load products. Please try again later."); 
            }
            finally{
                setLoading(false);
            }
        }
        loadClothing();
            
        },[])

   

    // Infinite scroll using Intersection Observer
    useEffect(() => {
        if (!enableHomeInfinite) {
            return; // skip setting up infinite scroll on homepage
        }
        const loadMore = async () => {
            if (!hasMore || loading) return;
            
            setLoading(true);
            try {
                let currentPage = page;
                let foundProducts = false;
                let attempts = 0;
                const maxAttempts = 5; // Try up to 5 empty pages before giving up
                
                while (!foundProducts && attempts < maxAttempts) {
                    const moreProducts = await getProducts(20, currentPage * 20);
                    console.log('Loading products, page:', currentPage + 1, 'Count:', moreProducts.length);
                    
                    if (moreProducts.length > 0) {
                        setInfiniteProducts(prev => {
                            const newProducts = [...prev, ...moreProducts];
                            console.log('Total infinite products now:', newProducts.length);
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

    return <div className="home">
    {error && <div className="error-message">{error}</div>}

        {loading && page === 1 ?(
            <div className='loading'>Loading...</div>
        ) : (
        <div ref={containerRef} className="clothing-container">
                <>
                    <div className="clothing-section">
                        <h2 className="brand-title">RECENTLY VIEWED</h2>
                        <div className="clothing-list-horizontal">
                            {[...clothing.slice(0, Math.ceil(clothing.length / 2)), ...clothing.slice(0, Math.ceil(clothing.length / 2))].map((clothing, index)=>(
                                <ClothingCard key={`recent-${clothing.id}-${index}`} clothing={clothing}/>
                            ))}
                        </div>
                    </div>
                    
                    <div className="clothing-section">
                        <h2 className="brand-title">RECOMMENDED FOR YOU</h2>
                        <div className="clothing-list-horizontal">
                            {[...clothing.slice(Math.ceil(clothing.length / 2)), ...clothing.slice(Math.ceil(clothing.length / 2))].map((clothing, index)=>(
                                <ClothingCard key={`recommended-${clothing.id}-${index}`} clothing={clothing}/>
                            ))}
                        </div>
                    </div>
                    
                    {/* Graffiti Banner */}
                    <div className="home-graffiti-wrapper second-banner">
                        <img src={graffiti} alt="Graffiti" className="home-graffiti-image" />
                    </div>

                    {/* NIKE horizontal strip using the same products shown vertically */}
                    {infiniteProducts.length > 0 && (
                        <div className="brand-section">
                            <div className="brand-header">
                                <h2 className="brand-title">NIKE</h2>
                                <Link to="/search" className="brand-view-all">VIEW ALL</Link>
                            </div>
                            <div className="clothing-list-horizontal">
                                {infiniteProducts.map((product, index) => (
                                    <ClothingCard key={`nike-strip-${product.id}-${index}`} clothing={product} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Second Graffiti Banner */}
                    <div className="home-graffiti-wrapper">
                        <img src={graffiti} alt="Graffiti" className="home-graffiti-image" />
                    </div>

                    {/* ADIDAS horizontal strip using same products */}
                    {infiniteProducts.length > 0 && (
                        <div className="brand-section">
                            <div className="brand-header">
                                <h2 className="brand-title">ADIDAS</h2>
                                <Link to="/search" className="brand-view-all">VIEW ALL</Link>
                            </div>
                            <div className="clothing-list-horizontal">
                                {infiniteProducts.map((product, index) => (
                                    <ClothingCard key={`adidas-strip-${product.id}-${index}`} clothing={product} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Third Graffiti Banner */}
                    <div className="home-graffiti-wrapper">
                        <img src={graffiti} alt="Graffiti" className="home-graffiti-image" />
                    </div>

                    {/* JORDAN horizontal strip using same products */}
                    {infiniteProducts.length > 0 && (
                        <div className="brand-section">
                            <div className="brand-header">
                                <h2 className="brand-title">JORDAN</h2>
                                <Link to="/search" className="brand-view-all">VIEW ALL</Link>
                            </div>
                            <div className="clothing-list-horizontal">
                                {infiniteProducts.map((product, index) => (
                                    <ClothingCard key={`jordan-strip-${product.id}-${index}`} clothing={product} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Fourth Graffiti Banner */}
                    <div className="home-graffiti-wrapper">
                        <img src={graffiti} alt="Graffiti" className="home-graffiti-image" />
                    </div>

                    {/* NEW BALANCE horizontal strip using same products */}
                    {infiniteProducts.length > 0 && (
                        <div className="brand-section">
                            <div className="brand-header">
                                <h2 className="brand-title">NEW BALANCE</h2>
                                <Link to="/search" className="brand-view-all">VIEW ALL</Link>
                            </div>
                            <div className="clothing-list-horizontal">
                                {infiniteProducts.map((product, index) => (
                                    <ClothingCard key={`newbalance-strip-${product.id}-${index}`} clothing={product} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ASICS horizontal strip using same products */}
                    {infiniteProducts.length > 0 && (
                        <div className="brand-section">
                            <div className="brand-header">
                                <h2 className="brand-title">ASICS</h2>
                                <Link to="/search" className="brand-view-all">VIEW ALL</Link>
                            </div>
                            <div className="clothing-list-horizontal">
                                {infiniteProducts.map((product, index) => (
                                    <ClothingCard key={`asics-strip-${product.id}-${index}`} clothing={product} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Final Graffiti Banner */}
                    <div className="home-graffiti-wrapper">
                        <img src={graffiti} alt="Graffiti" className="home-graffiti-image" />
                    </div>

                    {/* Shared Footer component */}
                    <Footer />
                </>
        </div>
        )}
    </div>
}

export default Home;