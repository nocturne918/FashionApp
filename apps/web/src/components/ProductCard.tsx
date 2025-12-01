import React from 'react';
import type { Product } from '@fashionapp/shared';
import { Icon } from '@iconify/react';

interface ProductCardProps {
  product: Product;
  onAddToStash: (p: Product) => void;
  onAddToFit: (p: Product) => void;
  isStashed?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToStash, onAddToFit, isStashed }) => {
  return (
    <div className="group relative bg-white border-2 border-black flex flex-col hard-shadow transition-all duration-200">
      {/* Image Area - Pure White Background */}
      <div className="aspect-square bg-white border-b-2 border-black p-4 flex items-center justify-center overflow-hidden relative">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-contain mix-blend-multiply"
        />
        
        {/* Quick Action Overlay */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToStash(product); }}
            className={`p-2 border-2 border-black ${isStashed ? 'bg-red-500 text-white' : 'bg-white hover:bg-gray-100'} transition-colors`}
          >
            <Icon icon={isStashed ? "lucide:heart" : "lucide:heart"} width="16" height="16" className={isStashed ? "text-white fill-current" : ""} />
          </button>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-3 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-sm uppercase leading-tight truncate pr-2">{product.brand}</h3>
            <span className="font-mono text-xs bg-black text-white px-1">${product.price}</span>
          </div>
          <p className="text-xs text-gray-600 mt-1 truncate">{product.name}</p>
        </div>

        <button 
          onClick={() => onAddToFit(product)}
          className="mt-3 w-full border-2 border-black bg-blue-600 text-white font-bold text-xs py-2 uppercase hover:bg-blue-700 active:bg-black transition-colors flex items-center justify-center gap-2"
        >
          <Icon icon="lucide:plus" width="14" height="14" /> Add to Fit
        </button>
      </div>
    </div>
  );
};
