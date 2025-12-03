import React, { useMemo, useState } from "react";
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
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [detectedColors, setDetectedColors] = useState<string | null>(null);
  const [analyzingColors, setAnalyzingColors] = useState(false);
  const [detectedStyles, setDetectedStyles] = useState<string | null>(null);
  const [analyzingStyles, setAnalyzingStyles] = useState(false);
  const [previewOutfit, setPreviewOutfit] = useState<Outfit | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [outfitDetectedColors, setOutfitDetectedColors] = useState<
    string | null
  >(null);
  const [outfitAnalyzingColors, setOutfitAnalyzingColors] = useState(false);
  const [outfitDetectedStyles, setOutfitDetectedStyles] = useState<
    string | null
  >(null);
  const [outfitAnalyzingStyles, setOutfitAnalyzingStyles] = useState(false);
  const [previewEditedOutfit, setPreviewEditedOutfit] = useState<Outfit | null>(
    null
  );

  // Analyze image colors and styles using Gemini when preview opens
  React.useEffect(() => {
    if (previewProduct && previewProduct.imageUrl) {
      setAnalyzingColors(true);
      setDetectedColors(null);
      setAnalyzingStyles(true);
      setDetectedStyles(null);

      const analyzeImageColors = async () => {
        try {
          const { getGeminiResponse } = await import("../services/gemini");
          const prompt = `Analyze this fashion product image and identify the main colors present. List the colors in a simple, comma-separated format. Only return the color names, nothing else. For example: "Black, White, Red" or "Navy Blue, Gray".`;

          const response = await getGeminiResponse(prompt, [
            previewProduct.imageUrl,
          ]);
          setDetectedColors(response.trim());
        } catch (error) {
          console.error("Error analyzing image colors:", error);
          // Fallback to product color if analysis fails
          setDetectedColors(previewProduct.color);
        } finally {
          setAnalyzingColors(false);
        }
      };

      const analyzeImageStyles = async () => {
        try {
          const { getGeminiResponse } = await import("../services/gemini");
          const prompt = `Analyze this fashion product image and identify the style categories that this item fits into. List the styles in a simple, comma-separated format. Only return the style names, nothing else. Examples of styles: Y2K, Streetwear, Minimalist, Vintage, Grunge, Preppy, Athleisure, Bohemian, Punk, etc. Return 2-4 relevant style categories.`;

          const response = await getGeminiResponse(prompt, [
            previewProduct.imageUrl,
          ]);
          setDetectedStyles(response.trim());
        } catch (error) {
          console.error("Error analyzing image styles:", error);
          setDetectedStyles(null);
        } finally {
          setAnalyzingStyles(false);
        }
      };

      analyzeImageColors();
      analyzeImageStyles();
    } else {
      setDetectedColors(null);
      setDetectedStyles(null);
    }
  }, [previewProduct]);

  // Analyze outfit item colors and styles when preview opens or item changes
  React.useEffect(() => {
    if (
      previewOutfit &&
      previewOutfit.items &&
      previewOutfit.items.length > 0
    ) {
      const currentItem = previewOutfit.items[currentItemIndex];
      if (currentItem && currentItem.imageUrl) {
        setOutfitAnalyzingColors(true);
        setOutfitDetectedColors(null);
        setOutfitAnalyzingStyles(true);
        setOutfitDetectedStyles(null);

        const analyzeItemColors = async () => {
          try {
            const { getGeminiResponse } = await import("../services/gemini");
            const prompt = `Analyze this fashion product image and identify the main colors present. List the colors in a simple, comma-separated format. Only return the color names, nothing else. For example: "Black, White, Red" or "Navy Blue, Gray".`;

            const response = await getGeminiResponse(prompt, [
              currentItem.imageUrl,
            ]);
            setOutfitDetectedColors(response.trim());
          } catch (error) {
            console.error("Error analyzing item colors:", error);
            setOutfitDetectedColors(currentItem.color);
          } finally {
            setOutfitAnalyzingColors(false);
          }
        };

        const analyzeItemStyles = async () => {
          try {
            const { getGeminiResponse } = await import("../services/gemini");
            const prompt = `Analyze this fashion product image and identify the style categories that this item fits into. List the styles in a simple, comma-separated format. Only return the style names, nothing else. Examples of styles: Y2K, Streetwear, Minimalist, Vintage, Grunge, Preppy, Athleisure, Bohemian, Punk, etc. Return 2-4 relevant style categories.`;

            const response = await getGeminiResponse(prompt, [
              currentItem.imageUrl,
            ]);
            setOutfitDetectedStyles(response.trim());
          } catch (error) {
            console.error("Error analyzing item styles:", error);
            setOutfitDetectedStyles(null);
          } finally {
            setOutfitAnalyzingStyles(false);
          }
        };

        analyzeItemColors();
        analyzeItemStyles();
      }
    } else {
      setOutfitDetectedColors(null);
      setOutfitDetectedStyles(null);
    }
  }, [previewOutfit, currentItemIndex]);

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
                className="border-2 border-black bg-white hard-shadow p-4 relative group cursor-pointer"
                onClick={() => {
                  setPreviewOutfit(outfit);
                  setCurrentItemIndex(0);
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold uppercase">{outfit.name}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSavedOutfits((prev) =>
                        prev.filter((o) => o.id !== outfit.id)
                      );
                    }}
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
                className="border-2 border-black bg-white hard-shadow p-4 relative group cursor-pointer"
                onClick={() => {
                  setPreviewEditedOutfit(outfit);
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold uppercase">{outfit.name}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSavedOutfits((prev) =>
                        prev.filter((o) => o.id !== outfit.id)
                      );
                    }}
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
                className="border-2 border-black bg-white hard-shadow p-3 relative group cursor-pointer"
                onClick={() => setPreviewProduct(product)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm uppercase truncate">
                    {product.brand}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStash(product);
                    }}
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

      {/* Product Preview Modal */}
      {previewProduct && (
        <div
          className="fixed inset-0 bg-white bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewProduct(null)}
        >
          <div
            className="bg-white border-4 border-black hard-shadow max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col md:flex-row">
              {/* Image Section - Left Side */}
              <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-8 min-h-[400px]">
                <img
                  src={previewProduct.imageUrl}
                  alt={previewProduct.name}
                  className="max-w-full max-h-[600px] object-contain"
                />
              </div>

              {/* Details Section - Right Side */}
              <div className="md:w-1/2 p-8 flex flex-col relative">
                <button
                  onClick={() => setPreviewProduct(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-black z-10"
                >
                  <Icon icon="lucide:x" width="24" height="24" />
                </button>
                <div className="space-y-4 mt-4">
                  <div>
                    <h2 className="font-bold text-2xl uppercase mb-2">
                      {previewProduct.brand}
                    </h2>
                    <h3 className="text-lg font-mono">{previewProduct.name}</h3>
                  </div>
                  <div className="pt-4 border-t-2 border-black">
                    <p className="text-sm font-mono font-bold text-black uppercase mb-2">
                      Colors
                    </p>
                    {analyzingColors ? (
                      <p className="text-lg font-mono text-gray-400">
                        Analyzing image...
                      </p>
                    ) : detectedColors ? (
                      <p className="text-lg font-normal">{detectedColors}</p>
                    ) : (
                      <p className="text-lg font-normal">
                        {previewProduct.color}
                      </p>
                    )}
                  </div>
                  <div className="pt-4 border-t-2 border-black">
                    <p className="text-sm font-mono font-bold text-black uppercase mb-2">
                      Styles
                    </p>
                    {analyzingStyles ? (
                      <p className="text-lg font-mono text-gray-400">
                        Analyzing image...
                      </p>
                    ) : detectedStyles ? (
                      <p className="text-lg font-normal">{detectedStyles}</p>
                    ) : (
                      <p className="text-lg font-mono text-gray-400">
                        No styles detected
                      </p>
                    )}
                  </div>
                  <div className="pt-4 border-t-2 border-black">
                    <p className="text-2xl font-bold">
                      ${previewProduct.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outfit Preview Modal */}
      {previewOutfit &&
        previewOutfit.items &&
        previewOutfit.items.length > 0 && (
          <div
            className="fixed inset-0 bg-white bg-opacity-95 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setPreviewOutfit(null);
              setCurrentItemIndex(0);
            }}
          >
            <div
              className="bg-white border-4 border-black hard-shadow max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col md:flex-row relative">
                {/* Image Section - Left Side */}
                <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-8 min-h-[400px] relative">
                  {/* Navigation Arrows */}
                  {previewOutfit.items.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentItemIndex((prev) =>
                            prev === 0
                              ? previewOutfit.items.length - 1
                              : prev - 1
                          );
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white border-2 border-black p-2 hover:bg-gray-100 z-10"
                      >
                        <Icon
                          icon="lucide:chevron-left"
                          width="24"
                          height="24"
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentItemIndex((prev) =>
                            prev === previewOutfit.items.length - 1
                              ? 0
                              : prev + 1
                          );
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white border-2 border-black p-2 hover:bg-gray-100 z-10"
                      >
                        <Icon
                          icon="lucide:chevron-right"
                          width="24"
                          height="24"
                        />
                      </button>
                    </>
                  )}
                  {previewOutfit.items[currentItemIndex] && (
                    <img
                      src={previewOutfit.items[currentItemIndex].imageUrl}
                      alt={previewOutfit.items[currentItemIndex].name}
                      className="max-w-full max-h-[600px] object-contain"
                    />
                  )}
                </div>

                {/* Details Section - Right Side */}
                {previewOutfit.items[currentItemIndex] && (
                  <div className="md:w-1/2 p-8 flex flex-col relative">
                    <button
                      onClick={() => {
                        setPreviewOutfit(null);
                        setCurrentItemIndex(0);
                      }}
                      className="absolute top-4 right-4 text-gray-400 hover:text-black z-10"
                    >
                      <Icon icon="lucide:x" width="24" height="24" />
                    </button>
                    <div className="space-y-4 mt-4">
                      <div>
                        <h2 className="font-bold text-2xl uppercase mb-2">
                          {previewOutfit.items[currentItemIndex].brand}
                        </h2>
                        <h3 className="text-lg font-mono">
                          {previewOutfit.items[currentItemIndex].name}
                        </h3>
                      </div>
                      <div className="pt-4 border-t-2 border-black">
                        <p className="text-sm font-mono font-bold text-black uppercase mb-2">
                          Colors
                        </p>
                        {outfitAnalyzingColors ? (
                          <p className="text-lg font-mono text-gray-400">
                            Analyzing image...
                          </p>
                        ) : outfitDetectedColors ? (
                          <p className="text-lg font-normal">
                            {outfitDetectedColors}
                          </p>
                        ) : (
                          <p className="text-lg font-normal">
                            {previewOutfit.items[currentItemIndex].color}
                          </p>
                        )}
                      </div>
                      <div className="pt-4 border-t-2 border-black">
                        <p className="text-sm font-mono font-bold text-black uppercase mb-2">
                          Styles
                        </p>
                        {outfitAnalyzingStyles ? (
                          <p className="text-lg font-mono text-gray-400">
                            Analyzing image...
                          </p>
                        ) : outfitDetectedStyles ? (
                          <p className="text-lg font-normal">
                            {outfitDetectedStyles}
                          </p>
                        ) : (
                          <p className="text-lg font-mono text-gray-400">
                            No styles detected
                          </p>
                        )}
                      </div>
                      <div className="pt-4 border-t-2 border-black">
                        <p className="text-2xl font-bold">
                          $
                          {previewOutfit.items[currentItemIndex].price.toFixed(
                            2
                          )}
                        </p>
                      </div>
                      {/* Item counter */}
                      {previewOutfit.items.length > 1 && (
                        <div className="pt-4 border-t-2 border-black">
                          <p className="text-sm font-mono text-gray-500">
                            Item {currentItemIndex + 1} of{" "}
                            {previewOutfit.items.length}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Edited Outfit Preview Modal */}
      {previewEditedOutfit && (
        <div
          className="fixed inset-0 bg-white bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setPreviewEditedOutfit(null);
          }}
        >
          <div
            className="bg-white border-4 border-black hard-shadow max-w-5xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col md:flex-row relative">
              {/* Image Section - Left Side - Made Bigger */}
              <div className="md:w-3/5 bg-gray-50 flex items-center justify-center p-8 min-h-[500px] relative">
                {previewEditedOutfit.imageUrl ? (
                  <img
                    src={previewEditedOutfit.imageUrl}
                    alt={previewEditedOutfit.name}
                    className="max-w-full max-h-[700px] w-full h-auto object-contain"
                  />
                ) : (
                  <div className="text-gray-400">No image available</div>
                )}
              </div>

              {/* Details Section - Right Side */}
              <div className="md:w-2/5 p-8 flex flex-col relative">
                <button
                  onClick={() => {
                    setPreviewEditedOutfit(null);
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-black z-10"
                >
                  <Icon icon="lucide:x" width="24" height="24" />
                </button>
                <div className="space-y-4 mt-4">
                  <div>
                    <h2 className="font-bold text-2xl uppercase mb-2">
                      {previewEditedOutfit.name}
                    </h2>
                    <p className="text-sm font-mono text-gray-500">
                      Generated Outfit
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
