// DummyJSON API - Free JSON API with products

const BASE_URL = 'https://dummyjson.com';

// Helper function to format DummyJSON products to our format
const formatProduct = (product) => ({
    id: product.id,
    title: product.title,
    retail_price: product.price,
    image_url: product.images?.[0] || 'https://via.placeholder.com/300',
    brand: product.brand,
    release_date: new Date().toISOString(),
    vote_average: (product.rating * 2).toFixed(1),
    style_id: `DN-${product.id}`,
    poster_path: product.images?.[0] || 'https://via.placeholder.com/300'
});

// Get products with pagination
export const getProducts = async (limit = 20, skip = 0) => {
    try {
        console.log('Fetching products from DummyJSON...');
        const response = await fetch(`${BASE_URL}/products?limit=${limit}&skip=${skip}`);
        
        if (!response.ok) {
            throw new Error(`DummyJSON Error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        const products = data.products || [];
        
        // Format products to our schema
        const formattedProducts = products.map(formatProduct);
        
        console.log('Successfully fetched', formattedProducts.length, 'products from DummyJSON');
        return formattedProducts;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

// Search products
export const searchProducts = async (query) => {
    try {
        console.log('Searching DummyJSON for:', query);
        const response = await fetch(`${BASE_URL}/products/search?q=${encodeURIComponent(query)}&limit=20`);
        
        if (!response.ok) {
            throw new Error(`DummyJSON Error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        const products = data.products || [];
        
        // Format products to our schema
        const formattedProducts = products.map(formatProduct);
        
        console.log('Found', formattedProducts.length, 'products from DummyJSON');
        return formattedProducts;
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
};
