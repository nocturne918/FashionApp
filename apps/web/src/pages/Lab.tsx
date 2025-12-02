import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { OutfitBuilder } from "../components/OutfitBuilder";
import type { Product, Outfit, OutfitItem } from "@fashionapp/shared";

interface LabProps {
  stashedProducts: Product[];
  savedOutfits: Outfit[];
  setSavedOutfits: React.Dispatch<React.SetStateAction<Outfit[]>>;
  toggleStash: (product: Product) => void;
  addToFit: (product: Product) => void;
  // Incoming from App to allow building fits from the lab page
  currentOutfitItems: OutfitItem[];
  setCurrentOutfitItems: React.Dispatch<React.SetStateAction<OutfitItem[]>>;
  saveOutfit: (
    imageUrl?: string,
    itemsToSave?: OutfitItem[],
    imageSource?: "components" | "canvas" | "edited"
  ) => void;
}

const SLOTS = ["TOP", "BOTTOM", "SHOES", "ACCESSORIES"] as const;

const SLOT_POSITIONS_PERC: Record<
  (typeof SLOTS)[number],
  { x: number; y: number }
> = {
  TOP: { x: 0.5, y: 0.15 },
  BOTTOM: { x: 0.5, y: 0.45 },
  SHOES: { x: 0.5, y: 0.75 },
  ACCESSORIES: { x: 0.78, y: 0.25 },
};

const leftRef = React.createRef<HTMLDivElement>();

export const Lab: React.FC<LabProps> = ({
  stashedProducts,
  savedOutfits,
  setSavedOutfits,
  toggleStash: _toggleStash,
  addToFit,
  currentOutfitItems,
  setCurrentOutfitItems,
  saveOutfit,
}) => {
  // ensure we have valid arrays before proceeding
  if (
    !Array.isArray(stashedProducts) ||
    !Array.isArray(savedOutfits) ||
    !Array.isArray(currentOutfitItems)
  ) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  // Initialize indices state
  const [indices, setIndices] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("lab_indices");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore errors
    }
    return {
      TOP: 0,
      BOTTOM: 0,
      SHOES: 0,
      ACCESSORIES: 0,
    };
  });

  const grouped = useMemo(() => {
    const groups: Record<string, Product[]> = {
      TOP: [],
      BOTTOM: [],
      SHOES: [],
      ACCESSORIES: [],
    };

    // Safely iterate over stashedProducts
    if (!Array.isArray(stashedProducts) || stashedProducts.length === 0) {
      return groups;
    }

    for (const p of stashedProducts) {
      // Skip invalid products
      if (!p || !p.id) continue;
      const parentRaw =
        ((p as unknown as Record<string, unknown>).parentCategory as string) ||
        "";
      const parent = String(parentRaw).toLowerCase();
      const slugCategory = (p.category || "").toLowerCase();
      const name = ((p.name || "") as string).toLowerCase();

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
      const accessoryKeywords = [
        "bag",
        "handbag",
        "purse",
        "backpack",
        "crossbody",
        "satchel",
        "tote",
        "belt",
        "cap",
        "hat",
        "watch",
        "sunglass",
        "glasses",
        "beanie",
        "scarf",
        "gloves",
      ];
      const bottomKeywords = [
        "pants",
        "jeans",
        "shorts",
        "sweatpants",
        "joggers",
        "trousers",
        "chinos",
        "leggings",
        "skirt",
      ];
      const topKeywords = [
        "shirt",
        "t-shirt",
        "tee",
        "hoodie",
        "sweater",
        "jumper",
        "top",
        "blouse",
        "jacket",
        "coat",
      ];

      const anyMatch = (arr: string[], ...sources: string[]) =>
        arr.some((k) => sources.some((s) => s.includes(k)));

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

      // Tops
      if (anyMatch(topKeywords, parent, slugCategory, name)) {
        groups.TOP.push(p);
        continue;
      }

      // if category mentions bag or shoe  still treat appropriately
      if (slugCategory.includes("bag") || slugCategory.includes("handbag")) {
        groups.ACCESSORIES.push(p);
        continue;
      }

      if (slugCategory.includes("shoe") || slugCategory.includes("sneaker")) {
        groups.SHOES.push(p);
        continue;
      }

      // Default to TOP for now
      groups.TOP.push(p);
    }
    return groups;
  }, [stashedProducts]);

  // Reset indices if they become invalid (e.g., when items are removed from stash)
  React.useEffect(() => {
    setIndices((prev) => {
      const next = { ...prev };
      let changed = false;

      SLOTS.forEach((slot) => {
        const items = grouped[slot];
        const currentIdx = prev[slot] ?? 0;
        if (items.length === 0) {
          if (currentIdx !== 0) {
            next[slot] = 0;
            changed = true;
          }
        } else if (currentIdx >= items.length) {
          next[slot] = Math.max(0, items.length - 1);
          changed = true;
        }
      });

      if (changed) {
        try {
          localStorage.setItem("lab_indices", JSON.stringify(next));
        } catch {
          // Ignore localStorage errors
        }
      }

      return changed ? next : prev;
    });
  }, [grouped]);

  const cycle = (slot: (typeof SLOTS)[number], dir: 1 | -1) => {
    const items = grouped[slot];
    if (!items || items.length === 0) return;
    setIndices((prev) => {
      const current = prev[slot] ?? 0;
      const next = (current + dir + items.length) % items.length;
      return { ...prev, [slot]: next };
    });
  };

  const placeSelected = (slot: (typeof SLOTS)[number]) => {
    const items = grouped[slot];
    if (!items || items.length === 0) return;
    const idx = indices[slot] ?? 0;
    const selected = items[idx];
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

  // Function to capture the components section as an image - creates a combined image of all products from Components
  const captureComponentsAsImage = async (): Promise<string | undefined> => {
    // Get items from the Components section (grouped by slot)
    const itemsToCapture: Product[] = [];

    // Collect items from each slot that has a selected item
    SLOTS.forEach((slot) => {
      const items = grouped[slot];
      const idx = indices[slot] ?? 0;
      if (items && items.length > 0 && items[idx]) {
        itemsToCapture.push(items[idx]);
      }
    });

    if (itemsToCapture.length === 0) {
      console.warn("No items selected in Components section");
      return undefined;
    }

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return undefined;

      // Set canvas size for a nice combined image
      const canvasWidth = 800;
      const canvasHeight = 600;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Fill with white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      console.log(
        `Capturing ${itemsToCapture.length} items from Components section`
      );

      // Calculate layout - arrange items in a grid
      const itemsPerRow = Math.ceil(Math.sqrt(itemsToCapture.length));
      const itemSize = Math.min(
        canvasWidth / (itemsPerRow + 1),
        canvasHeight / (Math.ceil(itemsToCapture.length / itemsPerRow) + 1)
      );
      const padding = 20;

      // Draw each item on the canvas
      const imagePromises = itemsToCapture.map((item, index) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            // Calculate position in grid layout
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            const x = padding + col * (itemSize + padding);
            const y = padding + row * (itemSize + padding);

            // Center the image in its grid cell
            const imgAspect = img.width / img.height;
            let drawWidth = itemSize;
            let drawHeight = itemSize;

            if (imgAspect > 1) {
              // Wider than tall
              drawHeight = itemSize / imgAspect;
            } else {
              // Taller than wide
              drawWidth = itemSize * imgAspect;
            }

            const centerX = x + itemSize * 0.5;
            const centerY = y + itemSize * 0.5;

            // Draw the image centered in its cell
            ctx.drawImage(
              img,
              centerX - drawWidth * 0.5,
              centerY - drawHeight * 0.5,
              drawWidth,
              drawHeight
            );

            resolve();
          };
          img.onerror = () => {
            console.warn("Failed to load image for item:", item.imageUrl);
            resolve();
          };
          img.src = item.imageUrl;
        });
      });

      await Promise.all(imagePromises);

      // Convert canvas to data URL
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error capturing canvas:", error);
      return undefined;
    }
  };

  const handleSaveFromComponents = async () => {
    try {
      console.log("Starting to capture Components section image...");
      const imageUrl = await captureComponentsAsImage();
      console.log("Captured image:", imageUrl ? "Success" : "Failed");

      if (!imageUrl) {
        alert(
          "Failed to create image. Please make sure you have items selected in the Components section."
        );
        return;
      }

      // Get items from Components section to save
      const componentsItems: OutfitItem[] = [];
      SLOTS.forEach((slot) => {
        const items = grouped[slot];
        const idx = indices[slot] ?? 0;
        if (items && items.length > 0 && items[idx]) {
          componentsItems.push(items[idx] as OutfitItem);
        }
      });

      console.log("Saving outfit with image from Components section...");
      // Pass the components items directly to saveOutfit with 'components' source
      saveOutfit(imageUrl, componentsItems, "components");

      console.log("Outfit saved successfully!");
    } catch (error) {
      console.error("Error in handleSaveFromComponents:", error);
      alert("Error saving outfit. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-in slide-in-from-right duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        <div
          className="lg:col-span-2 border-2 border-black hard-shadow bg-white overflow-hidden"
          ref={leftRef}
        >
          <div className="h-full">
            <OutfitBuilder
              items={currentOutfitItems}
              setItems={setCurrentOutfitItems}
              onSaveOutfit={saveOutfit}
            />
          </div>
        </div>

        <div className="lg:col-span-1 border-2 border-black bg-white flex flex-col hard-shadow overflow-hidden">
          <div className="p-3 bg-gray-100 border-b-2 border-black font-bold uppercase text-sm flex items-center justify-between">
            <div>Components</div>
            <button
              onClick={handleSaveFromComponents}
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

      {/* Saved Fits */}
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
        {(() => {
          // Only show outfits with imageSource === 'components'
          const componentsOutfits = savedOutfits.filter(
            (outfit) => outfit.imageSource === "components"
          );
          return componentsOutfits.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-gray-300 text-center font-mono text-gray-400">
              No rotations saved yet. Use the Save button in Components to
              create a rotation.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {componentsOutfits.map((outfit) => (
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
                            style={{
                              top: `${idx * 10}%`,
                              left: `${idx * 20}%`,
                            }}
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
          );
        })()}
      </section>
    </div>
  );
};
