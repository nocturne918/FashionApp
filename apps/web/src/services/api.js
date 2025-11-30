const BASE_URL = 'http://localhost:3000/api';

// Helper function to format Backend products to our frontend format
const formatProduct = (product) => ({
    id: product.stockxId || product.id,
    title: product.title,
    retail_price: product.lowestAsk || product.retailPrice || 0,
    image_url: product.imageUrl || 'https://via.placeholder.com/300',
    brand: product.brand,
    release_date: product.releaseDate,
    vote_average: 0, // Not available
    style_id: product.urlKey,
    poster_path: product.imageUrl // Fallback
});

// Get products with pagination and optional category
export const getProducts = async (limit = 20, skip = 0, category = null) => {
    try {
        const page = Math.floor(skip / limit) + 1;
        let url = `${BASE_URL}/products?limit=${limit}&page=${page}`;

        if (category) {
            url += `&gender=${encodeURIComponent(category.toLowerCase())}`;
        }

        console.log(`Fetching products from Backend (page ${page}, category: ${category})...`);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Backend Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const products = data.data || [];

        // Format products to our schema
        const formattedProducts = products.map(formatProduct);

        console.log('Successfully fetched', formattedProducts.length, 'products from Backend');
        return formattedProducts;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

// Search products
export const searchProducts = async (query) => {
    try {
        console.log('Searching Backend for:', query);
        const response = await fetch(`${BASE_URL}/products?search=${encodeURIComponent(query)}&limit=20`);

        if (!response.ok) {
            throw new Error(`Backend Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const products = data.data || [];

        // Format products to our schema
        const formattedProducts = products.map(formatProduct);

        console.log('Found', formattedProducts.length, 'products from Backend');
        return formattedProducts;
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
};
