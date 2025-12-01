import React from 'react';
import { OutfitBuilder } from '../components/OutfitBuilder';
import type { Product, OutfitItem } from '../types';

interface LabProps {
  stashedProducts: Product[];
  currentOutfitItems: OutfitItem[];
  setCurrentOutfitItems: React.Dispatch<React.SetStateAction<OutfitItem[]>>;
  addToFit: (product: Product) => void;
  saveOutfit: () => void;
}

export const Lab: React.FC<LabProps> = ({ stashedProducts, currentOutfitItems, setCurrentOutfitItems, addToFit, saveOutfit }) => {
  return (
    <div className="max-w-7xl mx-auto p-4 h-[calc(100vh-80px)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        {/* Source Panel (Stash) */}
        <div className="lg:col-span-1 border-2 border-black bg-white flex flex-col hard-shadow overflow-hidden">
          <div className="p-3 bg-gray-100 border-b-2 border-black font-bold uppercase text-sm">
            From Stash ({stashedProducts.length})
          </div>
          <div className="flex-grow overflow-y-auto p-2 grid grid-cols-2 gap-2 content-start">
            {stashedProducts.length === 0 ? (
              <div className="col-span-2 text-center p-8 opacity-50 font-mono text-xs">
                Your stash is empty. Go to The Drop to add heat.
              </div>
            ) : (
              stashedProducts.map(p => (
                <div key={p.id} className="border border-black p-2 cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => addToFit(p)}>
                  <img src={p.imageUrl} className="w-full h-24 object-contain mix-blend-multiply" />
                  <p className="text-[10px] truncate font-bold mt-1">{p.brand}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Builder Canvas */}
        <div className="lg:col-span-2 border-2 border-black hard-shadow bg-white overflow-hidden">
          <OutfitBuilder 
            items={currentOutfitItems} 
            setItems={setCurrentOutfitItems} 
            onSaveOutfit={saveOutfit}
          />
        </div>
      </div>
    </div>
  );
};
