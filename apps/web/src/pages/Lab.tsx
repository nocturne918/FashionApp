import React, { useMemo, useState } from "react";
import type { Product, OutfitItem } from "@fashionapp/shared";
import { OutfitBuilder } from "../components/OutfitBuilder";

interface LabProps {
  stashedProducts: Product[];
  currentOutfitItems: OutfitItem[];
  setCurrentOutfitItems: React.Dispatch<React.SetStateAction<OutfitItem[]>>;
  addToFit: (product: Product) => void;
  saveOutfit: () => void;
}

const SLOTS = ["TOP", "BOTTOM", "SHOES", "ACCESSORIES"] as const;

// Default placement positions as percentages (0..1) of the canvas for responsive placement
const SLOT_POSITIONS_PERC: Record<
  (typeof SLOTS)[number],
  { x: number; y: number }
> = {
  TOP: { x: 0.5, y: 0.15 },
  BOTTOM: { x: 0.5, y: 0.45 },
  SHOES: { x: 0.5, y: 0.75 },
  ACCESSORIES: { x: 0.78, y: 0.25 },
};

// ref to left canvas container so we can compute pixel coordinates from percentages
const leftRef = React.createRef<HTMLDivElement>();

export const Lab: React.FC<LabProps> = ({
  stashedProducts,
  currentOutfitItems,
  setCurrentOutfitItems,
  addToFit,
  saveOutfit,
}) => {
  // Maintain an index per slot into the available stash items for that slot
  const [indices, setIndices] = useState<Record<string, number>>({
    TOP: 0,
    BOTTOM: 0,
    SHOES: 0,
    ACCESSORIES: 0,
  });

  // Group stash items by parentCategory for simple slot filtering
  const grouped = useMemo(() => {
    const groups: Record<string, Product[]> = {
      TOP: [],
      BOTTOM: [],
      SHOES: [],
      ACCESSORIES: [],
    };
    for (const p of stashedProducts) {
      const parent =
        ((p as unknown as Record<string, unknown>).parentCategory as string) ||
        "";
      const slugCategory = (p.category || "").toLowerCase();
      // Prefer explicit shoe/footwear detection first (covers many category names)
      const shoeKeywords = [
        "sneaker",
        "sneakers",
        "shoe",
        "shoes",
        "footwear",
        "boot",
        "boots",
        "trainer",
        "trainers",
        "sandal",
        "sandals",
        "loafer",
        "oxford",
        "derby",
        "cleat",
        "slipper",
        "moccasin",
      ];
      const name = ((p.name || "") as string).toLowerCase();
      const isShoe = shoeKeywords.some(
        (k) =>
          parent.toLowerCase().includes(k) ||
          slugCategory.includes(k) ||
          name.includes(k)
      );
      if (isShoe) {
        groups.SHOES.push(p);
        continue;
      }

      // Accessories
      if (
        parent.toLowerCase().includes("accessories") ||
        slugCategory.includes("bag") ||
        slugCategory.includes("belt") ||
        slugCategory.includes("cap") ||
        slugCategory.includes("hat") ||
        slugCategory.includes("watch") ||
        slugCategory.includes("sunglass")
      ) {
        groups.ACCESSORIES.push(p);
        continue;
      }

      // Clothing/apparel -> decide TOP vs BOTTOM
      if (
        parent.toLowerCase().includes("apparel") ||
        slugCategory.includes("shirt") ||
        slugCategory.includes("t-shirt") ||
        slugCategory.includes("hoodie") ||
        slugCategory.includes("tops") ||
        slugCategory.includes("pants") ||
        slugCategory.includes("jeans")
      ) {
        if (
          slugCategory.includes("pants") ||
          slugCategory.includes("shorts") ||
          slugCategory.includes("jeans") ||
          slugCategory.includes("sweatpants") ||
          slugCategory.includes("leggings")
        ) {
          groups.BOTTOM.push(p);
        } else {
          groups.TOP.push(p);
        }
        continue;
      }

      // fallback push to TOP
      groups.TOP.push(p);
    }
    return groups;
  }, [stashedProducts]);

  const cycle = (slot: (typeof SLOTS)[number], dir: 1 | -1) => {
    const items = grouped[slot];
    if (!items || items.length === 0) return;
    setIndices((prev) => {
      const current = prev[slot] ?? 0;
      const next = (current + dir + items.length) % items.length;
      const nextMap = { ...prev, [slot]: next };

      // Update currentOutfitItems: place selected item at slot index (slot order)
      const slotIdx = SLOTS.indexOf(slot);
      const selected = items[next] as OutfitItem;
      const container = leftRef.current;
      let x = 300,
        y = 120;
      if (container) {
        const perc = SLOT_POSITIONS_PERC[slot];
        x = Math.round(container.clientWidth * perc.x);
        y = Math.round(container.clientHeight * perc.y);
      }
      const positioned: OutfitItem = {
        ...selected,
        x,
        y,
        scale: 1,
        rotation: 0,
        zIndex: 1,
        placed: true,
      } as OutfitItem;
      setCurrentOutfitItems((prevItems) => {
        const copy = [...prevItems];
        copy[slotIdx] = positioned;
        return copy;
      });

      return nextMap;
    });
  };

  const placeSelected = (slot: (typeof SLOTS)[number]) => {
    const items = grouped[slot];
    if (!items || items.length === 0) return;
    const idx = indices[slot] ?? 0;
    const selected = items[idx];
    // Add to outfit (ensures it's in the array at slot position)
    const slotIdx = SLOTS.indexOf(slot);
    const container = leftRef.current;
    let x = 300,
      y = 120;
    if (container) {
      const perc = SLOT_POSITIONS_PERC[slot];
      x = Math.round(container.clientWidth * perc.x);
      y = Math.round(container.clientHeight * perc.y);
    }
    const positioned: OutfitItem = {
      ...(selected as OutfitItem),
      x,
      y,
      scale: 1,
      rotation: 0,
      zIndex: 1,
      placed: true,
    };
    setCurrentOutfitItems((prev) => {
      const copy = [...prev];
      copy[slotIdx] = positioned;
      return copy;
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 h-[calc(100vh-80px)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        {/* Left: Outfit Builder (large) */}
        <div className="lg:col-span-2 border-2 border-black hard-shadow bg-white overflow-hidden">
          <div className="h-full">
            {/* Insert the actual OutfitBuilder component here */}
            <OutfitBuilder
              items={currentOutfitItems}
              setItems={setCurrentOutfitItems}
              onSaveOutfit={saveOutfit}
            />
          </div>
        </div>

        {/* Right: Components / Carousel + Stash */}
        <div className="lg:col-span-1 border-2 border-black bg-white flex flex-col hard-shadow overflow-hidden">
          <div className="p-3 bg-gray-100 border-b-2 border-black font-bold uppercase text-sm flex items-center justify-between">
            <div>Components</div>
            <button
              onClick={saveOutfit}
              className="text-xs px-2 py-1 border border-black"
            >
              Save
            </button>
          </div>
          <div className="grow overflow-y-auto p-4 space-y-4">
            {SLOTS.map((slot) => {
              const items = grouped[slot];
              const idx = indices[slot] ?? 0;
              const current = items && items.length > 0 ? items[idx] : null;
              return (
                <div key={slot} className="border p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-mono text-xs uppercase">{slot}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => cycle(slot, -1)}
                        className="px-2 py-1 border"
                      >
                        ◀
                      </button>
                      <button
                        onClick={() => placeSelected(slot)}
                        className="px-2 py-1 border"
                      >
                        Place
                      </button>
                      <button
                        onClick={() => cycle(slot, 1)}
                        className="px-2 py-1 border"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                  <div className="h-36 flex items-center justify-center bg-gray-50">
                    {current ? (
                      <img
                        src={current.imageUrl}
                        className="max-h-32 object-contain"
                      />
                    ) : (
                      <div className="text-xs opacity-50">No items</div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="border p-3">
              <div className="font-mono text-xs uppercase mb-2">
                From Stash ({stashedProducts.length})
              </div>
              <div className="grid grid-cols-2 gap-2">
                {stashedProducts.length === 0 ? (
                  <div className="col-span-2 text-center p-4 opacity-50 text-xs">
                    Your stash is empty.
                  </div>
                ) : (
                  stashedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="border p-2 cursor-pointer"
                      onClick={() => addToFit(p)}
                    >
                      <img
                        src={p.imageUrl}
                        className="w-full h-20 object-contain"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
