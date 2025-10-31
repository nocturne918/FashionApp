import type { Product } from '@fashionapp/shared';

const BASE_URL = 'https://dummyjson.com';

interface DummyProduct {
    id: number;
    title: string;
    price: number;
    images: string[];
    brand: string;
    rating: number;
}

const formatProduct = (product: DummyProduct): Product => ({
    id: product.id,
    title: product.title,
    price: product.price,
    image_url: product.images?.[0] || 'https://via.placeholder.com/300',
    brand: product.brand,
    release_date: new Date().toISOString(),
    vote_average: (product.rating * 2).toFixed(1),
    style_id: `DN-${product.id}`,
    poster_path: product.images?.[0] || 'https://via.placeholder.com/300'
});

export const getProducts = async (limit = 20, skip = 0): Promise<Product[]> => {
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

export const searchProducts = async (query: string): Promise<Product[]> => {
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
