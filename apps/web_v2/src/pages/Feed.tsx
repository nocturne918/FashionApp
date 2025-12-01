import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { ProductCard } from '../components/ProductCard';
import { ProductCategory, Department } from '../types';
import type { Product } from '../types';
import { TRENDING_TAGS } from '../constants';
import { useProducts } from '../hooks/useProducts';

interface FeedProps {
  stashedProducts: Product[];
  toggleStash: (product: Product) => void;
  addToFit: (product: Product) => void;
}

export const Feed: React.FC<FeedProps> = ({ stashedProducts, toggleStash, addToFit }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department | 'ALL'>('ALL');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Use custom hook for data fetching
  const { products, loading, error, hasMore, loadMore, total } = useProducts({
    search: searchQuery,
    department: selectedDept,
    category: selectedCategories.length > 0 ? selectedCategories[0] : undefined, // API currently supports single category filter
    limit: 20
  });

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(prev => prev.filter(c => c !== cat));
    } else {
      // For now, single select for API compatibility, but UI supports multi-select structure
      setSelectedCategories([cat]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 min-h-screen">
      
      {/* Search Header */}
      <div className="mb-8 relative">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Icon icon="lucide:search" width={24} height={24} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="SEARCH ARCHIVE: 'VINTAGE TEE', 'BAGGY DENIM', 'NIKE'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-black py-4 pl-12 pr-4 font-mono text-sm uppercase placeholder:text-gray-400 focus:outline-none focus:bg-gray-50 hard-shadow transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-black"
            >
              <Icon icon="lucide:x" width={20} height={20} />
            </button>
          )}
        </div>
        
        {/* Trending Tags */}
        <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
          {TRENDING_TAGS.map(tag => (
            <button 
              key={tag} 
              onClick={() => setSearchQuery(tag.replace('#', ''))}
              className="flex-shrink-0 px-3 py-1 border border-black bg-white font-mono text-xs text-black-200 uppercase hover:border-black transition-colors hover:bg-black hover:text-white"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Mobile Filter Toggle */}
        <button 
          className="md:hidden flex items-center gap-2 font-bold uppercase border-2 border-black p-2 justify-center hover:bg-gray-100 w-full mb-4"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <Icon icon="lucide:sliders-horizontal" width={18} height={18} /> Filters
        </button>

        {/* Desktop Filter Sidebar (The Rig) */}
        <aside className={`md:w-64 flex-shrink-0 space-y-8 ${showMobileFilters ? 'block' : 'hidden md:block'} md:sticky md:top-24`}>
           <div className="border-2 border-black p-5 hard-shadow bg-white">
             <div className="flex justify-between items-end mb-6">
                <h2 className="font-display font-black text-2xl uppercase tracking-tighter leading-none">Filter Rig</h2>
                {(selectedCategories.length > 0 || selectedDept !== 'ALL') && (
                  <button 
                    onClick={() => { setSelectedDept('ALL'); setSelectedCategories([]); }}
                    className="text-[10px] font-mono underline hover:text-red-600 mb-1"
                  >
                    RESET
                  </button>
                )}
             </div>
             
             {/* Department */}
             <div className="mb-8">
               <h3 className="font-bold uppercase border-b-2 border-black mb-4 pb-1 text-base">Department</h3>
               <div className="flex flex-col gap-3">
                 {['ALL', 'MENS', 'WOMENS', 'KIDS'].map(dept => (
                   <label key={dept} className="flex items-center gap-3 cursor-pointer group select-none">
                     <div className={`w-5 h-5 border-2 border-black flex items-center justify-center transition-all ${selectedDept === dept ? 'bg-black' : 'bg-white group-hover:bg-gray-100'}`}>
                       {selectedDept === dept && <Icon icon="lucide:check" className="text-white" width="16" />}
                     </div>
                     <span className={`uppercase ${selectedDept === dept ? 'font-bold' : ''}`}>{dept}</span>
                     <input 
                       type="radio" 
                       name="department"
                       className="hidden"
                       checked={selectedDept === dept}
                       onChange={() => setSelectedDept(dept as any)}
                     />
                   </label>
                 ))}
               </div>
             </div>

             {/* Categories */}
             <div>
               <h3 className="font-bold uppercase border-b-2 border-black mb-4 pb-1 text-base">Category</h3>
               <div className="flex flex-col gap-3">
                 {Object.values(ProductCategory).map(cat => (
                   <label key={cat} className="flex items-center gap-3 cursor-pointer group select-none">
                     <div className={`w-5 h-5 border-2 border-black flex items-center justify-center transition-all ${selectedCategories.includes(cat) ? 'bg-black' : 'bg-white group-hover:bg-gray-100'}`}>
                       {selectedCategories.includes(cat) && <Icon icon="lucide:check" className="text-white" width="16" />}
                     </div>
                     <span className={`uppercase ${selectedCategories.includes(cat) ? 'font-bold' : ''}`}>{cat}</span>
                     <input 
                       type="checkbox" 
                       className="hidden"
                       checked={selectedCategories.includes(cat)}
                       onChange={() => toggleCategory(cat)}
                     />
                   </label>
                 ))}
               </div>
             </div>
           </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-grow w-full">
          <div className="mb-4 flex justify-between items-center">
            <span className="font-mono text-xs font-bold bg-black text-white px-2 py-1">
              RESULTS: {total}
            </span>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToStash={toggleStash}
                    onAddToFit={addToFit}
                    isStashed={!!stashedProducts.find(p => p.id === product.id)}
                  />
                ))}
              </div>
              
              {/* Load More */}
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={loadMore}
                    disabled={loading}
                    className="bg-white border-2 border-black px-6 py-3 font-bold uppercase hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          ) : (
            !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                <Icon icon="lucide:search-x" width="48" height="48" className="mb-4" />
                <p className="font-mono text-lg uppercase">No signals found.</p>
                <p className="text-sm">Try adjusting your filters or search query.</p>
              </div>
            )
          )}
          
          {loading && products.length === 0 && (
             <div className="flex justify-center py-20">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

