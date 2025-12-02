import React, { useRef, useEffect, useState } from "react";
import type { OutfitItem } from "@fashionapp/shared";
import { Icon } from "@iconify/react";

interface OutfitBuilderProps {
  items: OutfitItem[];
  setItems: React.Dispatch<React.SetStateAction<OutfitItem[]>>;
  onSaveOutfit: () => void;
}

export const OutfitBuilder: React.FC<OutfitBuilderProps> = ({
  items,
  setItems,
  onSaveOutfit,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Initialize items with random positions if not set
  useEffect(() => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.x === undefined) {
          return {
            ...item,
            x: Math.random() * 200,
            y: Math.random() * 200,
            scale: 1,
            rotation: (Math.random() - 0.5) * 20,
            zIndex: 1,
          };
        }
        return item;
      })
    );
  }, [items.length, setItems]);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);

    const item = items.find((i) => i.id === id);
    if (item && item.x !== undefined && item.y !== undefined) {
      setDragOffset({
        x: e.clientX - item.x,
        y: e.clientY - item.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedId) {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === selectedId) {
            return {
              ...item,
              x: e.clientX - dragOffset.x,
              y: e.clientY - dragOffset.y,
            };
          }
          return item;
        })
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateItem = (id: string, updates: Partial<OutfitItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) return { ...item, ...updates };
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedId(null);
  };

  const selectedItem = items.find((i) => i.id === selectedId);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="p-2 border-b-2 border-black flex justify-between items-center bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={onSaveOutfit}
            disabled={items.length === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 font-bold uppercase text-sm border-2 border-black hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon icon="lucide:save" width="16" height="16" /> Save Fit
          </button>
          <div className="text-xs font-mono flex items-center px-2 text-gray-500">
            {items.length} items
          </div>
        </div>

        {selectedItem && (
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateItem(selectedItem.id, {
                  rotation: (selectedItem.rotation || 0) + 45,
                })
              }
              className="p-2 border-2 border-black bg-white hover:bg-gray-100"
              title="Rotate"
            >
              <Icon icon="lucide:rotate-cw" width="16" height="16" />
            </button>
            <button
              onClick={() =>
                updateItem(selectedItem.id, {
                  scale: (selectedItem.scale || 1) + 0.1,
                })
              }
              className="p-2 border-2 border-black bg-white hover:bg-gray-100"
              title="Zoom In"
            >
              <Icon icon="lucide:zoom-in" width="16" height="16" />
            </button>
            <button
              onClick={() =>
                updateItem(selectedItem.id, {
                  scale: Math.max(0.2, (selectedItem.scale || 1) - 0.1),
                })
              }
              className="p-2 border-2 border-black bg-white hover:bg-gray-100"
              title="Zoom Out"
            >
              <Icon icon="lucide:zoom-out" width="16" height="16" />
            </button>
            <button
              onClick={() =>
                updateItem(selectedItem.id, {
                  zIndex: (selectedItem.zIndex || 1) + 1,
                })
              }
              className="p-2 border-2 border-black bg-white hover:bg-gray-100"
              title="Bring Forward"
            >
              <Icon icon="lucide:move" width="16" height="16" />
            </button>
            <button
              onClick={() => removeItem(selectedItem.id)}
              className="p-2 border-2 border-black bg-red-100 hover:bg-red-200 text-red-600"
              title="Remove"
            >
              <Icon icon="lucide:trash-2" width="16" height="16" />
            </button>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-grow relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-gray-50"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => setSelectedId(null)}
      >
        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <h2 className="font-display text-4xl text-gray-400 uppercase text-center">
              The Lab is Empty
              <br />
              <span className="text-lg font-mono">
                Add items from your stash
              </span>
            </h2>
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className={`absolute cursor-move select-none ${
              selectedId === item.id ? "ring-2 ring-blue-600 ring-offset-2" : ""
            }`}
            style={{
              transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg) scale(${item.scale})`,
              zIndex: item.zIndex,
              width: "200px",
            }}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-auto pointer-events-none mix-blend-multiply"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
