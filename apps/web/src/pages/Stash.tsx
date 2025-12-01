import React, { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { ProductCard } from '../components/ProductCard';
import { OutfitBuilder } from '../components/OutfitBuilder';
import type { Product, Outfit, OutfitItem } from '@fashionapp/shared';

interface StashProps {
  stashedProducts: Product[];
  savedOutfits: Outfit[];
  setSavedOutfits: React.Dispatch<React.SetStateAction<Outfit[]>>;
  toggleStash: (product: Product) => void;
  addToFit: (product: Product) => void;
  // Incoming from App to allow building/saving fits from the stash page
  currentOutfitItems: OutfitItem[];
  setCurrentOutfitItems: React.Dispatch<React.SetStateAction<OutfitItem[]>>;
  saveOutfit: () => void;
}

const SLOTS = ['TOP', 'BOTTOM', 'SHOES', 'ACCESSORIES'] as const;

const SLOT_POSITIONS_PERC: Record<typeof SLOTS[number], { x: number; y: number }> = {
  TOP: { x: 0.5, y: 0.15 },
  BOTTOM: { x: 0.5, y: 0.45 },
  SHOES: { x: 0.5, y: 0.75 },
  ACCESSORIES: { x: 0.78, y: 0.25 }
};

const leftRef = React.createRef<HTMLDivElement>();

export const Stash: React.FC<StashProps> = ({ stashedProducts, savedOutfits, setSavedOutfits, toggleStash, addToFit, currentOutfitItems, setCurrentOutfitItems, saveOutfit }) => {
  const [indices, setIndices] = useState<Record<string, number>>({ TOP: 0, BOTTOM: 0, SHOES: 0, ACCESSORIES: 0 });

  const grouped = useMemo(() => {
    const groups: Record<string, Product[]> = { TOP: [], BOTTOM: [], SHOES: [], ACCESSORIES: [] };
    for (const p of stashedProducts) {
      const parentRaw = (p as any).parentCategory || '';
      const parent = String(parentRaw).toLowerCase();
      const slugCategory = (p.category || '').toLowerCase();
      const name = ((p.name || '') as string).toLowerCase();

      const shoeKeywords = ['sneaker', 'sneakers', 'shoe', 'shoes', 'footwear', 'boot', 'boots', 'trainer', 'trainers', 'sandal', 'sandals', 'loafer', 'oxford', 'derby', 'cleat', 'slipper', 'moccasin'];
      const accessoryKeywords = ['bag', 'handbag', 'purse', 'backpack', 'crossbody', 'satchel', 'tote', 'belt', 'cap', 'hat', 'watch', 'sunglass', 'glasses', 'beanie', 'scarf', 'gloves'];
      const bottomKeywords = ['pants', 'jeans', 'shorts', 'sweatpants', 'joggers', 'trousers', 'chinos', 'leggings', 'skirt'];
      const topKeywords = ['shirt', 't-shirt', 'tee', 'hoodie', 'sweater', 'jumper', 'top', 'blouse', 'jacket', 'coat'];

      const anyMatch = (arr: string[], ...sources: string[]) => arr.some(k => sources.some(s => s.includes(k)));

      // Shoes first
      if (anyMatch(shoeKeywords, parent, slugCategory, name)) {
        groups.SHOES.push(p);
        continue;
      }

      // Accessories next
      if (anyMatch(accessoryKeywords, parent, slugCategory, name)) {
        groups.ACCESSORIES.push(p);
        continue;
      }

      // Bottoms
      if (anyMatch(bottomKeywords, parent, slugCategory, name)) {
        groups.BOTTOM.push(p);
        continue;
      }

      // Tops (includes jackets/outer layers)
      if (anyMatch(topKeywords, parent, slugCategory, name)) {
        groups.TOP.push(p);
        continue;
      }

      // Fallback: if category mentions 'bag' or 'shoe' still treat appropriately
      if (slugCategory.includes('bag') || slugCategory.includes('handbag')) {
        groups.ACCESSORIES.push(p);
        continue;
      }

      if (slugCategory.includes('shoe') || slugCategory.includes('sneaker')) {
        groups.SHOES.push(p);
        continue;
      }

      // Default to TOP for now
      groups.TOP.push(p);
    }
    return groups;
  }, [stashedProducts]);

  const cycle = (slot: typeof SLOTS[number], dir: 1 | -1) => {
    const items = grouped[slot];
    if (!items || items.length === 0) return;
    setIndices(prev => {
      const current = prev[slot] ?? 0;
      const next = (current + dir + items.length) % items.length;
      const nextMap = { ...prev, [slot]: next };

      const slotIdx = SLOTS.indexOf(slot);
      const selected = items[next] as OutfitItem;
      const container = leftRef.current;
      let x = 300, y = 120;
      if (container) {
        const perc = SLOT_POSITIONS_PERC[slot];
        x = Math.round(container.clientWidth * perc.x);
        y = Math.round(container.clientHeight * perc.y);
      }
      const positioned: OutfitItem = { ...selected, x, y, scale: 1, rotation: 0, zIndex: 1, placed: true } as OutfitItem;
      setCurrentOutfitItems(prevItems => {
        const copy = [...prevItems];
        copy[slotIdx] = positioned;
        return copy;
      });

      return nextMap;
    });
  };

  const placeSelected = (slot: typeof SLOTS[number]) => {
    const items = grouped[slot];
    if (!items || items.length === 0) return;
    const idx = indices[slot] ?? 0;
    const selected = items[idx];
    const slotIdx = SLOTS.indexOf(slot);
    const container = leftRef.current;
    let x = 300, y = 120;
    if (container) {
      const perc = SLOT_POSITIONS_PERC[slot];
      x = Math.round(container.clientWidth * perc.x);
      y = Math.round(container.clientHeight * perc.y);
    }
    const positioned: OutfitItem = { ...(selected as OutfitItem), x, y, scale: 1, rotation: 0, zIndex: 1, placed: true };
    setCurrentOutfitItems(prev => {
      const copy = [...prev];
      copy[slotIdx] = positioned;
      return copy;
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 border-b-2 border-black pb-4">
        <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-display text-2xl font-bold border-2 border-black hard-shadow">USR</div>
        <div>
          <h1 className="font-display text-2xl uppercase">Your Stash & Lab</h1>
          <p className="font-mono text-xs text-gray-500">Managing {stashedProducts.length} items & {savedOutfits.length} fits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        <div className="lg:col-span-2 border-2 border-black hard-shadow bg-white overflow-hidden" ref={leftRef}>
          <div className="h-full">
            <OutfitBuilder items={currentOutfitItems} setItems={setCurrentOutfitItems} onSaveOutfit={saveOutfit} />
          </div>
        </div>

        <div className="lg:col-span-1 border-2 border-black bg-white flex flex-col hard-shadow overflow-hidden">
          <div className="p-3 bg-gray-100 border-b-2 border-black font-bold uppercase text-sm flex items-center justify-between">
            <div>Components</div>
            <button onClick={saveOutfit} className="text-xs px-2 py-1 border border-black">Save</button>
          </div>
          <div className="grow overflow-y-auto p-4 space-y-4">
            {SLOTS.map(slot => {
              const items = grouped[slot];
              const idx = indices[slot] ?? 0;
              const current = items && items.length > 0 ? items[idx] : null;
              return (
                <div key={slot} className="border p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-mono text-xs uppercase">{slot}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => cycle(slot, -1)} className="px-2 py-1 border">◀</button>
                      <button onClick={() => placeSelected(slot)} className="px-2 py-1 border">Place</button>
                      <button onClick={() => cycle(slot, 1)} className="px-2 py-1 border">▶</button>
                    </div>
                  </div>
                  <div className="h-36 flex items-center justify-center bg-gray-50">
                    {current ? <img src={current.imageUrl} className="max-h-32 object-contain" /> : <div className="text-xs opacity-50">No items</div>}
                  </div>
                </div>
              );
            })}

            <div className="border p-3">
              <div className="font-mono text-xs uppercase mb-2">From Stash ({stashedProducts.length})</div>
              <div className="grid grid-cols-2 gap-2">
                {stashedProducts.length === 0 ? (
                  <div className="col-span-2 text-center p-4 opacity-50 text-xs">Your stash is empty.</div>
                ) : (
                  stashedProducts.map(p => (
                    <div key={p.id} className="border p-2 cursor-pointer" onClick={() => addToFit(p)}>
                      <img src={p.imageUrl} className="w-full h-20 object-contain" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Fits */}
      <section>
        <h2 className="font-bold uppercase text-lg mb-4 flex items-center gap-2">
          <Icon icon="lucide:sparkles" width="18" height="18" className="text-blue-600" /> Saved Rotations
        </h2>
        {savedOutfits.length === 0 ? (
           <div className="p-8 border-2 border-dashed border-gray-300 text-center font-mono text-gray-400">
             No fits saved yet. Use the Lab on this page.
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
    </div>
  );
};
