import React from 'react';
import { Icon } from '@iconify/react';
import { ProductCard } from '../components/ProductCard';
import type { Product, Outfit } from '../types';

interface StashProps {
  stashedProducts: Product[];
  savedOutfits: Outfit[];
  setSavedOutfits: React.Dispatch<React.SetStateAction<Outfit[]>>;
  toggleStash: (product: Product) => void;
  addToFit: (product: Product) => void;
}

export const Stash: React.FC<StashProps> = ({ stashedProducts, savedOutfits, setSavedOutfits, toggleStash, addToFit }) => {
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 border-b-2 border-black pb-4">
        <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-display text-2xl font-bold border-2 border-black hard-shadow">
          USR
        </div>
        <div>
          <h1 className="font-display text-2xl uppercase">Your Stash</h1>
          <p className="font-mono text-xs text-gray-500">Managing {stashedProducts.length} items & {savedOutfits.length} fits</p>
        </div>
      </div>

      {/* Saved Fits */}
      <section>
        <h2 className="font-bold uppercase text-lg mb-4 flex items-center gap-2">
          <Icon icon="lucide:sparkles" width="18" height="18" className="text-blue-600" /> Saved Rotations
        </h2>
        {savedOutfits.length === 0 ? (
           <div className="p-8 border-2 border-dashed border-gray-300 text-center font-mono text-gray-400">
             No fits saved yet. Hit The Lab.
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedOutfits.map(outfit => (
              <div key={outfit.id} className="border-2 border-black bg-white hard-shadow p-4 relative group">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold uppercase">{outfit.name}</h3>
                  <button onClick={() => setSavedOutfits(prev => prev.filter(o => o.id !== outfit.id))} className="text-gray-400 hover:text-red-500">
                    <Icon icon="lucide:trash-2" width="16" height="16" />
                  </button>
                </div>
                {/* Mini representation of outfit */}
                <div className="h-40 bg-gray-50 border border-gray-200 relative overflow-hidden mb-2">
                   {outfit.items.slice(0, 4).map((item, idx) => (
                     <img 
                      key={idx} 
                      src={item.imageUrl} 
                      className="absolute w-20 h-20 object-contain mix-blend-multiply"
                      style={{ top: `${idx * 10}%`, left: `${idx * 20}%` }} 
                     />
                   ))}
                </div>
                <div className="text-xs font-mono text-gray-500">
                  {outfit.items.length} items • {new Date(outfit.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Stashed Items (Reuse grid) */}
      <section>
        <h2 className="font-bold uppercase text-lg mb-4 mt-8">Saved Items</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
           {stashedProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToStash={toggleStash} 
                onAddToFit={addToFit}
                isStashed={true} 
              />
           ))}
        </div>
      </section>
    </div>
  );
};
