import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { ProductCard } from '../components/ProductCard';
import { ProductCategory } from '../types';
import type { Product } from '../types';
import { MOCK_PRODUCTS, TRENDING_TAGS } from '../constants';

interface FeedProps {
  stashedProducts: Product[];
  toggleStash: (product: Product) => void;
  addToFit: (product: Product) => void;
}

export const Feed: React.FC<FeedProps> = ({ stashedProducts, toggleStash, addToFit }) => {
  const [filter, setFilter] = useState<ProductCategory | 'ALL'>('ALL');

  const filteredProducts = filter === 'ALL' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === filter);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="bg-black text-white p-8 md:p-12 relative overflow-hidden hard-shadow mb-8">
        <div className="relative z-10 max-w-2xl">
          <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.9] mb-4">
            Curate.<br/>Create.<br/><span className="text-blue-600">Conquer.</span>
          </h1>
          <p className="font-mono text-sm md:text-base mb-6 border-l-2 border-white pl-4">
            The streetwear archive is open. Build your rotation with FITTED.
          </p>
          <button 
            onClick={() => {
              const element = document.getElementById('shop-grid');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white text-black font-bold uppercase px-8 py-3 border-2 border-transparent hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
          >
            Start Digging <Icon icon="lucide:arrow-right" width="20" height="20" />
          </button>
        </div>
        {/* Abstract Deco */}
        <div className="absolute top-0 right-0 w-64 h-full bg-blue-600 opacity-20 transform skew-x-12 translate-x-12"></div>
      </section>

      {/* Trending Tags */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {TRENDING_TAGS.map(tag => (
          <span key={tag} className="flex-shrink-0 px-4 py-1 border-2 border-black bg-white font-mono text-sm uppercase hover:bg-black hover:text-white cursor-pointer transition-colors">
            {tag}
          </span>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4" id="shop-grid">
        {['ALL', ...Object.values(ProductCategory)].map(cat => (
           <button 
             key={cat}
             onClick={() => setFilter(cat as any)}
             className={`px-3 py-1 text-xs font-bold uppercase border-2 border-black transition-all
               ${filter === cat ? 'bg-blue-600 text-white' : 'bg-transparent hover:bg-gray-200'}
             `}
           >
             {cat}
           </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToStash={toggleStash}
            onAddToFit={addToFit}
            isStashed={!!stashedProducts.find(p => p.id === product.id)}
          />
        ))}
      </div>
    </div>
  );
};
