import React, { useMemo } from "react";
import { Icon } from "@iconify/react";
import type { Product, Outfit, OutfitItem } from "@fashionapp/shared";

interface StashProps {
  stashedProducts: Product[];
  savedOutfits: Outfit[];
  setSavedOutfits: React.Dispatch<React.SetStateAction<Outfit[]>>;
  toggleStash: (product: Product) => void;
  addToFit: (product: Product) => void;
  // Incoming from App to allow building fits from the stash page
  currentOutfitItems: OutfitItem[];
  setCurrentOutfitItems: React.Dispatch<React.SetStateAction<OutfitItem[]>>;
  saveOutfit: (
    imageUrl?: string,
    itemsToSave?: OutfitItem[],
    imageSource?: "components" | "canvas" | "edited"
  ) => void;
}

export const Stash: React.FC<StashProps> = ({
  stashedProducts,
  savedOutfits,
  setSavedOutfits,
  toggleStash,
}) => {
  //  Only show outfits with imageSource === 'components'
  const rotationsFromComponents = useMemo(
    () => savedOutfits.filter((outfit) => outfit.imageSource === "components"),
    [savedOutfits]
  );

  //Only show outfits with imageSource === 'edited'
  const outfitsWithEditedImages = useMemo(
    () => savedOutfits.filter((outfit) => outfit.imageSource === "edited"),
    [savedOutfits]
  );

  // Ensure we have valid state before rendering
  if (!stashedProducts || !savedOutfits) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 border-b-2 border-black pb-4">
        <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-display text-2xl font-bold border-2 border-black hard-shadow">
          USR
        </div>
        <div>
          <h1 className="font-display text-2xl uppercase">Your Stash</h1>
          <p className="font-mono text-xs text-gray-500">
            Managing {stashedProducts.length} items & {savedOutfits.length} fits
          </p>
        </div>
      </div>

      {/* Saved Rotations */}
      <section>
        <h2 className="font-bold uppercase text-lg mb-4 flex items-center gap-2">
          <Icon
            icon="lucide:sparkles"
            width="18"
            height="18"
            className="text-blue-600"
          />{" "}
          Saved Rotations
        </h2>
        {rotationsFromComponents.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-gray-300 text-center font-mono text-gray-400">
            No rotations saved yet. Use the Save button in Components to create
            a rotation.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rotationsFromComponents.map((outfit) => (
              <div
                key={outfit.id}
                className="border-2 border-black bg-white hard-shadow p-4 relative group"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold uppercase">{outfit.name}</h3>
                  <button
                    onClick={() =>
                      setSavedOutfits((prev) =>
                        prev.filter((o) => o.id !== outfit.id)
                      )
                    }
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Icon icon="lucide:trash-2" width="16" height="16" />
                  </button>
                </div>
                {/* Show captured image if available, otherwise show items */}
                <div className="h-40 bg-gray-50 border border-gray-200 relative overflow-hidden mb-2">
                  {outfit.imageUrl ? (
                    <img
                      src={outfit.imageUrl}
                      alt={outfit.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // If image fails to load, show items instead
                        console.warn(
                          `Image for ${outfit.name} failed to load, showing items instead`
                        );
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : outfit.items && outfit.items.length > 0 ? (
                    outfit.items
                      .slice(0, 4)
                      .map((item: OutfitItem, idx: number) => (
                        <img
                          key={idx}
                          src={item.imageUrl}
                          className="absolute w-20 h-20 object-contain mix-blend-multiply"
                          style={{ top: `${idx * 10}%`, left: `${idx * 20}%` }}
                          alt={item.name}
                        />
                      ))
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No items
                    </div>
                  )}
                </div>
                <div className="text-xs font-mono text-gray-500">
                  {outfit.items.length} items •{" "}
                  {new Date(outfit.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Saved Outfits */}
      <section>
        <h2 className="font-bold uppercase text-lg mb-4 flex items-center gap-2">
          <Icon
            icon="lucide:shirt"
            width="18"
            height="18"
            className="text-blue-600"
          />{" "}
          Saved Outfits
        </h2>
        {outfitsWithEditedImages.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-gray-300 text-center font-mono text-gray-400">
            No outfits with edited images saved yet. Use the Edit Image button
            to create an edited outfit.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outfitsWithEditedImages.map((outfit) => (
              <div
                key={outfit.id}
                className="border-2 border-black bg-white hard-shadow p-4 relative group"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold uppercase">{outfit.name}</h3>
                  <button
                    onClick={() =>
                      setSavedOutfits((prev) =>
                        prev.filter((o) => o.id !== outfit.id)
                      )
                    }
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Icon icon="lucide:trash-2" width="16" height="16" />
                  </button>
                </div>
                {/* Display generated image if available, otherwise show mini items */}
                <div className="h-40 bg-gray-50 border border-gray-200 relative overflow-hidden mb-2">
                  {outfit.imageUrl ? (
                    <img
                      src={outfit.imageUrl}
                      alt={outfit.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.warn(
                          `Image for ${outfit.name} failed to load, showing items instead`
                        );
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : outfit.items && outfit.items.length > 0 ? (
                    outfit.items
                      .slice(0, 4)
                      .map((item: OutfitItem, idx: number) => (
                        <img
                          key={idx}
                          src={item.imageUrl}
                          className="absolute w-20 h-20 object-contain mix-blend-multiply"
                          style={{ top: `${idx * 10}%`, left: `${idx * 20}%` }}
                          alt={item.name}
                        />
                      ))
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                </div>
                <div className="text-xs font-mono text-gray-500">
                  {outfit.items.length} items •{" "}
                  {new Date(outfit.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Saved Items */}
      <section>
        <h2 className="font-bold uppercase text-lg mb-4 flex items-center gap-2">
          <Icon
            icon="lucide:package"
            width="18"
            height="18"
            className="text-blue-600"
          />{" "}
          Saved Items
        </h2>
        {stashedProducts.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-gray-300 text-center font-mono text-gray-400">
            No items saved yet. Go to The Drop to add items to your stash.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {stashedProducts.map((product) => (
              <div
                key={product.id}
                className="border-2 border-black bg-white hard-shadow p-3 relative group"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm uppercase truncate">
                    {product.brand}
                  </h3>
                  <button
                    onClick={() => toggleStash(product)}
                    className="text-gray-400 hover:text-red-500 ml-2"
                  >
                    <Icon icon="lucide:trash-2" width="16" height="16" />
                  </button>
                </div>
                <div className="h-48 bg-gray-50 border border-gray-200 flex items-center justify-center">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
