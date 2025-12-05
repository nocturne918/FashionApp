import React, { useRef, useEffect, useState } from "react";
import type { OutfitItem, Product } from "@fashionapp/shared";
import { Icon } from "@iconify/react";

interface OutfitBuilderProps {
  items: OutfitItem[];
  setItems: React.Dispatch<React.SetStateAction<OutfitItem[]>>;
  onSaveOutfit: (
    imageUrl?: string,
    itemsToSave?: OutfitItem[],
    imageSource?: "components" | "canvas" | "edited"
  ) => void;
}

export const OutfitBuilder: React.FC<OutfitBuilderProps> = ({
  items,
  setItems,
  onSaveOutfit,
}) => {
  // Ensure items is always an array to prevent crashes
  const safeItems = Array.isArray(items) ? items : [];

  // If items is not an array, fix it
  useEffect(() => {
    if (!Array.isArray(items)) {
      console.warn("Items is not an array, resetting to empty array");
      setItems([]);
    }
  }, [items, setItems]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPersonImage, setSelectedPersonImage] =
    useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mouseDownPosition, setMouseDownPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showGeminiPrompt, setShowGeminiPrompt] = useState(false);
  const [geminiPrompt, setGeminiPrompt] = useState("");
  const [uploadedPersonImage, setUploadedPersonImage] = useState<string | null>(
    null
  );
  const [personImageItem, setPersonImageItem] = useState<{
    imageUrl: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    zIndex: number;
  } | null>(null);

  // Debug: Log when personImageItem changes
  useEffect(() => {
    console.log("personImageItem state changed:", {
      exists: !!personImageItem,
      hasImageUrl: !!personImageItem?.imageUrl,
      imageUrlLength: personImageItem?.imageUrl?.length,
      x: personImageItem?.x,
      y: personImageItem?.y,
    });
  }, [personImageItem]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);

  // Helper to check if there's a generated image (either in state or in personImageItem)
  const hasGeneratedImage = () => {
    try {
      // Check if generatedImage state exists
      if (generatedImage && typeof generatedImage === "string") return true;

      // Check if personImageItem has an image URL
      if (
        personImageItem &&
        personImageItem.imageUrl &&
        typeof personImageItem.imageUrl === "string"
      ) {
        // If we have an uploadedPersonImage, check if they're different
        if (uploadedPersonImage && typeof uploadedPersonImage === "string") {
          return personImageItem.imageUrl !== uploadedPersonImage;
        }
        // If no uploadedPersonImage but we have an imageUrl, it might be a generated image

        if (personImageItem.imageUrl.startsWith("data:image/")) {
          return true;
        }
        // If we have a saved generatedImage in localStorage, it is likely generated
        try {
          const savedGeneratedImage =
            localStorage.getItem("lab_generatedImage");
          if (
            savedGeneratedImage &&
            personImageItem.imageUrl === savedGeneratedImage
          ) {
            return true;
          }
        } catch (e) {
          // Ignore localStorage errors
        }
      }

      return false;
    } catch (error) {
      console.error("Error in hasGeneratedImage:", error);
      return false;
    }
  };

  // Load state from localStorage (only on mount)
  useEffect(() => {
    try {
      const savedPersonImage = localStorage.getItem("lab_personImageItem");
      const savedGeneratedImage = localStorage.getItem("lab_generatedImage");
      const savedUploadedPersonImage = localStorage.getItem(
        "lab_uploadedPersonImage"
      );

      if (savedPersonImage) {
        try {
          const parsed = JSON.parse(savedPersonImage);
          // Validate parsed object has required structure
          if (parsed && typeof parsed === "object" && parsed.imageUrl) {
            setPersonImageItem(parsed);
            // If we have a personImageItem loaded, check if it's a generated image
            if (parsed.imageUrl && typeof parsed.imageUrl === "string") {
              // If we have a saved generated image, use it
              if (savedGeneratedImage) {
                setGeneratedImage(savedGeneratedImage);
                // If the personImageItem URL matches the generated image, it's a generated image
                if (parsed.imageUrl === savedGeneratedImage) {
                } else if (
                  savedUploadedPersonImage &&
                  parsed.imageUrl !== savedUploadedPersonImage
                ) {
                  // Different from uploaded, so it's generated
                  setGeneratedImage(parsed.imageUrl);
                } else if (
                  !savedUploadedPersonImage &&
                  parsed.imageUrl.startsWith("data:image/")
                ) {
                  setGeneratedImage(parsed.imageUrl);
                }
              } else if (
                savedUploadedPersonImage &&
                parsed.imageUrl !== savedUploadedPersonImage
              ) {
                setGeneratedImage(parsed.imageUrl);
              } else if (
                !savedUploadedPersonImage &&
                parsed.imageUrl.startsWith("data:image/")
              ) {
                setGeneratedImage(parsed.imageUrl);
              }
            }
          }
        } catch (e) {
          console.error("Error parsing person image from localStorage:", e);
          // Clear corrupted data
          localStorage.removeItem("lab_personImageItem");
        }
      }

      if (savedGeneratedImage && typeof savedGeneratedImage === "string") {
        setGeneratedImage(savedGeneratedImage);
      }

      if (
        savedUploadedPersonImage &&
        typeof savedUploadedPersonImage === "string"
      ) {
        setUploadedPersonImage(savedUploadedPersonImage);
      }
    } catch (error) {
      console.error("Error loading state from localStorage:", error);
    }
  }, []);

  // Save personImageItem to localStorage whenever it changes

  useEffect(() => {
    if (personImageItem) {
      try {
        // Check if image URL is too large
        if (personImageItem.imageUrl) {
          const sizeInBytes = new Blob([personImageItem.imageUrl]).size;
          const sizeInMB = sizeInBytes / (1024 * 1024);

          // Only save if under 4MB
          if (sizeInMB < 4) {
            localStorage.setItem(
              "lab_personImageItem",
              JSON.stringify(personImageItem)
            );
          } else {
            console.warn(
              "Person image too large to save to localStorage:",
              sizeInMB.toFixed(2),
              "MB"
            );
            // Save without the image URL if it's too large
            const { imageUrl, ...itemWithoutImage } = personImageItem;
            localStorage.setItem(
              "lab_personImageItem",
              JSON.stringify(itemWithoutImage)
            );
          }
        } else {
          localStorage.setItem(
            "lab_personImageItem",
            JSON.stringify(personImageItem)
          );
        }
      } catch (error) {
        if (
          error instanceof Error &&
          (error.name === "QuotaExceededError" ||
            error.message.includes("quota"))
        ) {
          console.warn("Saving without image data.");
          // Save without the image URL
          const { imageUrl, ...itemWithoutImage } = personImageItem;
          try {
            localStorage.setItem(
              "lab_personImageItem",
              JSON.stringify(itemWithoutImage)
            );
          } catch (e) {
            console.error("Could not save person image item:", e);
          }
        } else {
          console.error("Error saving person image item:", error);
        }
      }
    } else {
      localStorage.removeItem("lab_personImageItem");
    }
  }, [personImageItem]);

  // Save generatedImage to localStorage whenever it changes

  useEffect(() => {
    if (generatedImage) {
      try {
        // Check if image is too large
        const sizeInBytes = new Blob([generatedImage]).size;
        const sizeInMB = sizeInBytes / (1024 * 1024);

        // Only save if under 4MB to leave room for other data
        if (sizeInMB < 4) {
          localStorage.setItem("lab_generatedImage", generatedImage);
        } else {
          console.warn(
            "Generated image too large to save to localStorage:",
            sizeInMB.toFixed(2),
            "MB"
          );

          localStorage.removeItem("lab_generatedImage");
        }
      } catch (error) {
        // Handle  storage errors
        if (
          error instanceof Error &&
          (error.name === "QuotaExceededError" ||
            error.message.includes("quota"))
        ) {
          console.warn(" Image will not persist across reloads.");
          localStorage.removeItem("lab_generatedImage");
        } else {
          console.error("Error saving generated image:", error);
        }
      }
    } else {
      localStorage.removeItem("lab_generatedImage");
    }
  }, [generatedImage]);

  // Save uploadedPersonImage to localStorage whenever it changes

  useEffect(() => {
    if (uploadedPersonImage) {
      try {
        // Check if image is too large
        const sizeInBytes = new Blob([uploadedPersonImage]).size;
        const sizeInMB = sizeInBytes / (1024 * 1024);

        // Only save if under 4MB
        if (sizeInMB < 4) {
          localStorage.setItem("lab_uploadedPersonImage", uploadedPersonImage);
        } else {
          console.warn(
            "Uploaded person image too large to save to localStorage:",
            sizeInMB.toFixed(2),
            "MB"
          );
          localStorage.removeItem("lab_uploadedPersonImage");
        }
      } catch (error) {
        if (
          error instanceof Error &&
          (error.name === "QuotaExceededError" ||
            error.message.includes("quota"))
        ) {
          console.warn(
            "localStorage quota exceeded for uploaded person image. Image will not persist across reloads."
          );
          localStorage.removeItem("lab_uploadedPersonImage");
        } else {
          console.error("Error saving uploaded person image:", error);
        }
      }
    } else {
      localStorage.removeItem("lab_uploadedPersonImage");
    }
  }, [uploadedPersonImage]);

  // Initialize items with random positions if not set
  useEffect(() => {
    if (!items || !Array.isArray(items)) {
      return;
    }

    const needsUpdate = items.some(
      (item) => item != null && (item.x === undefined || item.y === undefined)
    );
    if (!needsUpdate) {
      return;
    }

    setItems((prev) => {
      if (!prev || !Array.isArray(prev)) {
        return [];
      }
      return (
        prev
          // Filter out undefined items first
          .filter((item) => item != null)
          .map((item) => {
            // Only set position if item doesn't have one
            if (item.x === undefined || item.y === undefined) {
              return {
                ...item,
                x: item.x ?? Math.random() * 200,
                y: item.y ?? Math.random() * 200,
                scale: item.scale ?? 1,
                rotation: item.rotation ?? (Math.random() - 0.5) * 20,
                zIndex: item.zIndex ?? 1,
              };
            }
            return item;
          })
      );
    });
  }, [safeItems.length, setItems]);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Always select the item on mouse down
    setSelectedId(id);
    setSelectedPersonImage(false);
    setMouseDownPosition({ x: e.clientX, y: e.clientY });

    const item = safeItems.find((i) => i.id === id);
    if (item && item.x !== undefined && item.y !== undefined) {
      setDragOffset({
        x: e.clientX - item.x,
        y: e.clientY - item.y,
      });
    }
  };

  const handlePersonImageMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPersonImage(true);
    setSelectedId(null);
    if (personImageItem) {
      setMouseDownPosition({ x: e.clientX, y: e.clientY });
      setDragOffset({
        x: e.clientX - personImageItem.x,
        y: e.clientY - personImageItem.y,
      });
    }
  };

  const handleItemClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Ensure item is selected on click
    setSelectedId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseDownPosition) {
      const deltaX = Math.abs(e.clientX - mouseDownPosition.x);
      const deltaY = Math.abs(e.clientY - mouseDownPosition.y);

      if (deltaX > 5 || deltaY > 5) {
        setIsDragging(true);
      }

      if (isDragging) {
        if (selectedId) {
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
        } else if (selectedPersonImage && personImageItem) {
          setPersonImageItem({
            ...personImageItem,
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y,
          });
        }
      }
    }
  };

  const handleMouseUp = () => {
    // select person image
    if (mouseDownPosition && selectedPersonImage && !isDragging) {
      setSelectedPersonImage(true);
    }
    setIsDragging(false);
    setMouseDownPosition(null);
  };

  const updateItem = (id: string, updates: Partial<OutfitItem>) => {
    setItems((prev) => {
      if (!prev || !Array.isArray(prev)) {
        return [];
      }
      return (
        prev
          // Filter out null items
          .filter((item) => item != null)
          .map((item) => {
            if (item && item.id === id) {
              return { ...item, ...updates };
            }
            return item;
          })
      );
    });
  };

  const updatePersonImage = (updates: Partial<typeof personImageItem>) => {
    if (personImageItem) {
      setPersonImageItem({ ...personImageItem, ...updates });
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      if (!prev || !Array.isArray(prev)) {
        return [];
      }
      return prev.filter((i) => i != null && i.id !== id);
    });
    setSelectedId(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;

          // Get canvas dimensions to center the image
          const canvas = canvasRef.current;
          let centerX = 400;
          let centerY = 300;

          if (canvas) {
            const canvasRect = canvas.getBoundingClientRect();
            // Center the image on the canvas
            centerX = canvasRect.width / 2 - 100;
            centerY = canvasRect.height / 2 - 100;
          }

          // the first upload as the person image
          if (index === 0) {
            // Create a person image item that can be manipulated
            const canvas = canvasRef.current;
            let centerX = 400;
            let centerY = 300;

            if (canvas) {
              const canvasRect = canvas.getBoundingClientRect();
              centerX = canvasRect.width / 2 - 200;
              centerY = canvasRect.height / 2 - 300;
            }

            // Set both states to ensure the image appears
            const newPersonImageItem = {
              imageUrl: imageUrl,
              x: centerX,
              y: centerY,
              scale: 1,
              rotation: 0,
              zIndex: 0, // Changed from -1 to 0 to ensure visibility
            };

            // Update state - use React 18 automatic batching to ensure updates happen together
            console.log("Setting person image item:", {
              imageUrl: imageUrl.substring(0, 50) + "...",
              x: centerX,
              y: centerY,
              canvasExists: !!canvas,
              imageUrlLength: imageUrl.length,
            });

            // Batch state updates
            setUploadedPersonImage(imageUrl);
            setPersonImageItem(newPersonImageItem);
            setSelectedPersonImage(true);
            setSelectedId(null);

            console.log(
              "State updates queued, person image should appear shortly"
            );
          } else {
            // Create a new OutfitItem from the uploaded image
            // Remove extension
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            const newItem: OutfitItem = {
              id: `upload-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 11)}`,
              name: fileName,
              brand: "Uploaded",
              price: 0,
              category: "ACCESSORIES",
              imageUrl: imageUrl,
              department: "UNISEX",
              color: "Multi",
              // Center the image with slight offset for multiple uploads
              x: centerX + index * 30,
              y: centerY + index * 30,
              scale: 1,
              rotation: 0,
              zIndex: items.length + index + 1,
            };

            setItems((prev) => [...prev, newItem]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle drag and drop from stash
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only update state if we're actually leaving the canvas
    const target = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;

    // Check if relatedTarget is null or outside the canvas
    if (!relatedTarget || !target.contains(relatedTarget)) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    console.log("Drop event fired");
    const productData = e.dataTransfer.getData("application/json");
    console.log("Product data:", productData);

    if (!productData) {
      console.log("No product data found");
      return;
    }

    try {
      const product: Product = JSON.parse(productData);
      console.log("Parsed product:", product);

      // Get drop position on canvas
      const canvas = canvasRef.current;
      if (!canvas) {
        console.log("Canvas ref not found");
        return;
      }

      const canvasRect = canvas.getBoundingClientRect();
      const dropX = e.clientX - canvasRect.left;
      const dropY = e.clientY - canvasRect.top;

      console.log("Drop position:", dropX, dropY);

      // Position items relative to uploaded person image if it exists
      let finalX = dropX - 100;
      let finalY = dropY - 100;

      if (uploadedPersonImage && canvasRef.current) {
        // Position items near the person image
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const centerX = canvasRect.width / 2;
        const centerY = canvasRect.height / 2;
        // Offset items slightly to the right of center
        finalX = centerX - 50 + safeItems.length * 30;
        finalY = centerY - 50;
      }

      //  add the item to canvas
      addProductToCanvas(product, finalX + 100, finalY + 100);
    } catch (error) {
      console.error("Error parsing dropped product:", error);
    }
  };

  const addProductToCanvas = (product: Product, x: number, y: number) => {
    const newItem: OutfitItem = {
      ...product,
      x: x - 100,
      y: y - 100,
      scale: 1,
      rotation: 0,
      zIndex: safeItems.length + 1,
    };

    setItems((prev) => [...prev, newItem]);
  };

  // Handle text suggestions button click
  const handleGetSuggestions = async () => {
    const currentGeneratedImage =
      generatedImage ||
      (personImageItem?.imageUrl &&
      uploadedPersonImage &&
      personImageItem.imageUrl !== uploadedPersonImage
        ? personImageItem.imageUrl
        : null);

    if (!currentGeneratedImage && safeItems.length === 0) {
      alert("Please add items to the canvas or generate an image first");
      return;
    }

    setGeminiLoading(true);
    // Show suggestions panel
    setShowGeminiPrompt(true);

    let prompt = "";
    let imageUrls: string[] = [];

    if (currentGeneratedImage) {
      // Analyze the generated/edited try-on image
      imageUrls = [currentGeneratedImage];
      prompt = `Analyze this fashion outfit image where a person is wearing the clothing items. Provide detailed styling suggestions based on what you see in the image.

Please provide:
1. Overall outfit assessment and style analysis based on the image
2. Styling suggestions and improvements for this specific outfit
3. Color coordination analysis of the colors visible in the image
4. Occasion appropriateness for this outfit
5. Accessories or additional items that would complement this look
6. Overall fashion advice and tips for this specific outfit

Be specific and creative. Focus on what you actually see in the image.`;
    } else {
      // Analyze items on canvas
      imageUrls = safeItems.map((item) => item?.imageUrl).filter((url) => url);
      prompt = `Analyze these fashion items and create a virtual try-on suggestion. 
      
Items to analyze:
${safeItems
  .map(
    (item, idx) =>
      `${idx + 1}. ${item?.name || "Unknown"} by ${
        item?.brand || "Unknown"
      } - ${item?.category || "Unknown"} in ${item?.color || "Unknown"}`
  )
  .join("\n")}

Please provide:
1. How these items would look together as an outfit
2. Styling suggestions and combinations
3. Color coordination analysis
4. Overall fashion advice for this combination

Be specific and creative.`;
    }

    try {
      console.log("Getting Gemini suggestions...");
      console.log("Image URLs count:", imageUrls.length);
      console.log("Prompt:", prompt.substring(0, 100) + "...");

      const { getGeminiResponse } = await import("../services/gemini");
      const response = await getGeminiResponse(prompt, imageUrls);
      console.log("Received suggestions");
      setGeminiPrompt(response);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      let userFriendlyMessage = "";

      if (errorMsg.includes("quota") || errorMsg.includes("429")) {
        userFriendlyMessage = ` You've reached the free tier limit for Gemini API.`;
      } else if (errorMsg.includes("API key")) {
        userFriendlyMessage = "Invalid API key. ";
      } else {
        userFriendlyMessage = `Error: ${errorMsg.substring(0, 200)}...`;
      }
      setGeminiPrompt(userFriendlyMessage);
      alert(userFriendlyMessage);
    } finally {
      setGeminiLoading(false);
    }
  };

  // Handle image editing button click
  const handleEditImage = async () => {
    // Use generated image if available, otherwise use uploaded person image
    const baseImage = generatedImage || uploadedPersonImage;

    if (!baseImage) {
      alert("Please upload a person image first using the Upload Image button");
      return;
    }

    if (safeItems.length === 0) {
      alert("Please add clothing items to the canvas first");
      return;
    }

    setGeminiLoading(true);
    setGeneratedImage(null);

    const clothingImages = safeItems
      .map((item) => item?.imageUrl)
      .filter((url) => url);

    const prompt = `Generate an image showing the person in the first image wearing all the clothing items shown in the other images. 

Clothing items to add to the person:
${safeItems
  .map(
    (item, idx) =>
      `${idx + 1}. ${item?.name || "Unknown"} by ${
        item?.brand || "Unknown"
      } - ${item?.category || "Unknown"} in ${item?.color || "Unknown"} color`
  )
  .join("\n")}

Instructions:
- Show the person wearing all these items together as a complete outfit
- Make it look realistic, natural, and well-fitted
- Maintain the person's original appearance, pose, and background
- Ensure proper placement and fit of each clothing item
- The final image should show a complete, styled outfit

Generate the edited image showing the person wearing these items.`;

    try {
      const { getGeminiImageEdit } = await import("../services/gemini");
      const editedImage = await getGeminiImageEdit(
        baseImage,
        clothingImages,
        prompt
      );
      // Set the generated image first
      setGeneratedImage(editedImage);

      // Replace the person image with the generated image in the same position
      if (personImageItem) {
        // Keep existing position and properties, just update the image URL
        setPersonImageItem({
          ...personImageItem,
          imageUrl: editedImage,
        });
        setUploadedPersonImage(editedImage);
      } else {
        // If no personImageItem exists, create one with the generated image
        const canvas = canvasRef.current;
        let centerX = 400;
        let centerY = 300;
        if (canvas) {
          const canvasRect = canvas.getBoundingClientRect();
          centerX = canvasRect.width / 2 - 200;
          centerY = canvasRect.height / 2 - 300;
        }
        setPersonImageItem({
          imageUrl: editedImage,
          x: centerX,
          y: centerY,
          scale: 1,
          rotation: 0,
          zIndex: 0, // Set to 0 instead of -1 to ensure visibility
        });
        setUploadedPersonImage(editedImage);
      }

      // Remove all clothing items from canvas since they're now part of the generated image
      setItems([]);

      // Ensure person image is selected so it's visible - use setTimeout to ensure state updates complete
      setTimeout(() => {
        setSelectedPersonImage(true);
        setSelectedId(null);
      }, 100);
    } catch (error) {
      console.error("Error generating try-on image:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      let userFriendlyMessage = `Error generating image: ${errorMsg}`;

      if (errorMsg.includes("model") || errorMsg.includes("not found")) {
        userFriendlyMessage = "The image generation model is not available";
      } else if (errorMsg.includes("quota") || errorMsg.includes("429")) {
        userFriendlyMessage = " Please check your Gemini API usage limits.";
      } else if (errorMsg.includes("API key")) {
        userFriendlyMessage = "Invalid API key";
      }

      setGeminiPrompt(userFriendlyMessage);
      setShowGeminiPrompt(true);
      alert(userFriendlyMessage);
    } finally {
      setGeminiLoading(false);
    }
  };

  const selectedItem =
    safeItems.find((i) => i != null && i.id === selectedId) || null;

  // if component receives invalid props, return error message
  if (!setItems || typeof setItems !== "function") {
    console.error("OutfitBuilder: setItems is not a function");
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <p className="text-red-600 font-bold">Error: Invalid props</p>
          <p className="text-sm text-gray-500 mt-2">Please refresh the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="p-2 border-b-2 border-black flex justify-between items-center bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                const imageToSave =
                  generatedImage ||
                  (personImageItem?.imageUrl &&
                  uploadedPersonImage &&
                  personImageItem.imageUrl !== uploadedPersonImage
                    ? personImageItem.imageUrl
                    : undefined);
                // Save Fit always saves as "edited" to appear in Saved Outfits section
                // This includes both edited images and canvas items
                const source = "edited";
                onSaveOutfit(imageToSave, undefined, source);
              } catch (error) {
                console.error("Error in save button:", error);
                alert("Error saving outfit. Please try again.");
              }
            }}
            disabled={!hasGeneratedImage() && safeItems.length === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 font-bold uppercase text-sm border-2 border-black hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon icon="lucide:save" width="16" height="16" /> Save Fit
          </button>

          {/* Text Suggestions Button */}
          <button
            onClick={handleGetSuggestions}
            disabled={
              (!hasGeneratedImage() && safeItems.length === 0) || geminiLoading
            }
            className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 font-bold uppercase text-xs border-2 border-black hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Get styling suggestions for items on canvas or generated image"
          >
            <Icon icon="lucide:sparkles" width="14" height="14" /> Suggestions
          </button>

          {/* Image Editing Button */}
          <button
            onClick={handleEditImage}
            disabled={
              (!generatedImage && !uploadedPersonImage) || geminiLoading
            }
            className={`flex items-center gap-2 px-3 py-2 font-bold uppercase text-xs border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed ${
              geminiLoading
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
            title="Edit image with clothing items"
          >
            <Icon icon="lucide:wand-2" width="14" height="14" /> Edit Image
          </button>

          <div className="text-xs font-mono flex items-center px-2 text-gray-500">
            {safeItems.length} items
          </div>
        </div>

        {!selectedId && !selectedPersonImage && (
          <div className="flex gap-2">
            <button
              onClick={handleUploadClick}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 font-bold uppercase text-sm border-2 border-black hover:bg-blue-700"
            >
              <Icon icon="lucide:upload" width="16" height="16" /> Upload Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {selectedItem && selectedItem.id && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!selectedItem || !selectedItem.id) return;
                updateItem(selectedItem.id, {
                  rotation: (selectedItem.rotation || 0) + 45,
                });
              }}
              className="p-2 border-2 border-black bg-white hover:bg-gray-100"
              title="Rotate"
            >
              <Icon icon="lucide:rotate-cw" width="16" height="16" />
            </button>
            <button
              onClick={() => {
                if (!selectedItem || !selectedItem.id) return;
                updateItem(selectedItem.id, {
                  scale: (selectedItem.scale || 1) + 0.1,
                });
              }}
              className="p-2 border-2 border-black bg-white hover:bg-gray-100"
              title="Zoom In"
            >
              <Icon icon="lucide:zoom-in" width="16" height="16" />
            </button>
            <button
              onClick={() => {
                if (!selectedItem || !selectedItem.id) return;
                updateItem(selectedItem.id, {
                  scale: Math.max(0.2, (selectedItem.scale || 1) - 0.1),
                });
              }}
              className="p-2 border-2 border-black bg-white hover:bg-gray-100"
              title="Zoom Out"
            >
              <Icon icon="lucide:zoom-out" width="16" height="16" />
            </button>
            <button
              onClick={() => {
                if (!selectedItem || !selectedItem.id) return;
                updateItem(selectedItem.id, {
                  zIndex: (selectedItem.zIndex || 1) + 1,
                });
              }}
              className="p-2 border-2 border-black bg-white hover:bg-gray-100"
              title="Bring Forward"
            >
              <Icon icon="lucide:move" width="16" height="16" />
            </button>
            <button
              onClick={() => {
                if (!selectedItem || !selectedItem.id) return;
                removeItem(selectedItem.id);
              }}
              className="p-2 border-2 border-black bg-red-100 hover:bg-red-200 text-red-600"
              title="Remove"
            >
              <Icon icon="lucide:trash-2" width="16" height="16" />
            </button>
          </div>
        )}

        {selectedPersonImage && personImageItem && !selectedItem && (
          <div className="flex gap-2">
            <button
              onClick={() =>
                updatePersonImage({
                  rotation: personImageItem.rotation + 45,
                })
              }
              className="p-2 border-2 border-black bg-white hover:bg-gray-100"
              title="Rotate"
            >
              <Icon icon="lucide:rotate-cw" width="16" height="16" />
            </button>
            <button
              onClick={() =>
                updatePersonImage({
                  scale: personImageItem.scale + 0.1,
                })
              }
              className="p-2 border-2 border-black bg-white hover:bg-gray-100"
              title="Zoom In"
            >
              <Icon icon="lucide:zoom-in" width="16" height="16" />
            </button>
            <button
              onClick={() =>
                updatePersonImage({
                  scale: Math.max(0.1, personImageItem.scale - 0.1),
                })
              }
              className="p-2 border-2 border-black bg-white hover:bg-gray-100"
              title="Zoom Out"
            >
              <Icon icon="lucide:zoom-out" width="16" height="16" />
            </button>
            <button
              onClick={() =>
                updatePersonImage({
                  zIndex: personImageItem.zIndex + 1,
                })
              }
              className="p-2 border-2 border-black bg-white hover:bg-gray-100"
              title="Bring Forward"
            >
              <Icon icon="lucide:move" width="16" height="16" />
            </button>
            <button
              onClick={() => {
                setPersonImageItem(null);
                setUploadedPersonImage(null);
                setSelectedPersonImage(false);
              }}
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
        className={`flex-grow relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-gray-50 ${
          isDraggingOver ? "ring-4 ring-blue-500 ring-offset-2" : ""
        }`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => {
          // Only deselect if clicking directly on canvas background

          const target = e.target as HTMLElement;
          // Check if clicked directly on canvas or empty space (not on an item)
          if (target === canvasRef.current) {
            setSelectedId(null);
            setSelectedPersonImage(false);
          }
        }}
      >
        {/* Display uploaded person image as interactive element */}
        {personImageItem && personImageItem.imageUrl && (
          <div
            key={`person-image-${personImageItem.imageUrl.length}-${personImageItem.x}-${personImageItem.y}`} // Force re-render when image URL or position changes
            className={`absolute cursor-move select-none ${
              selectedPersonImage ? "ring-2 ring-blue-600 ring-offset-2" : ""
            }`}
            style={{
              left: `${personImageItem.x ?? 0}px`,
              top: `${personImageItem.y ?? 0}px`,
              transform: `scale(${personImageItem.scale ?? 1}) rotate(${
                personImageItem.rotation ?? 0
              }deg)`,
              transformOrigin: "center center",
              zIndex: Math.max(0, personImageItem.zIndex ?? 0), // Ensure zIndex is at least 0 for visibility
              backgroundColor: "transparent", // Ensure background doesn't hide content
            }}
            onMouseDown={handlePersonImageMouseDown}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPersonImage(true);
              setSelectedId(null);
            }}
          >
            <img
              src={personImageItem.imageUrl}
              alt="Person"
              className="max-w-md max-h-md object-contain"
              style={{
                pointerEvents: "none",
                display: "block", // Ensure image is displayed
                maxWidth: "500px",
                maxHeight: "500px",
              }}
              onLoad={() => {
                console.log("Person image loaded successfully:", {
                  width: "loaded",
                  x: personImageItem.x,
                  y: personImageItem.y,
                });
              }}
              onError={(e) => {
                console.error(
                  "Error loading person image:",
                  personImageItem.imageUrl?.substring(0, 50)
                );
                // Don't hide on error, show a placeholder instead
                e.currentTarget.style.backgroundColor = "#ff0000";
                e.currentTarget.style.width = "200px";
                e.currentTarget.style.height = "200px";
              }}
            />
          </div>
        )}

        {safeItems.length === 0 && !uploadedPersonImage && (
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

        {safeItems.map((item) => {
          if (!item || !item.id) return null;
          return (
            <div
              key={item.id}
              className={`absolute cursor-move select-none ${
                selectedId === item.id
                  ? "ring-2 ring-blue-600 ring-offset-2"
                  : ""
              }`}
              style={{
                transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg) scale(${item.scale})`,
                zIndex: item.zIndex,
                width: "200px",
              }}
              onMouseDown={(e) => handleMouseDown(e, item.id)}
              onClick={(e) => handleItemClick(e, item.id)}
              onDragOver={(e) => e.preventDefault()} // Prevent items from blocking drag
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-auto pointer-events-none mix-blend-multiply"
              />
            </div>
          );
        })}

        {/* Gemini Suggestions Side Panel */}
        {showGeminiPrompt && (
          <div
            className="absolute right-0 top-0 bottom-0 w-96 bg-white border-l-4 border-black z-50 flex flex-col hard-shadow"
            style={{ maxHeight: "100vh" }}
          >
            {/* Header with close button */}
            <div className="p-4 border-b-2 border-black flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold uppercase">
                {generatedImage ? "Outfit Suggestions" : "Styling Suggestions"}
              </h3>
              <button
                onClick={() => {
                  setShowGeminiPrompt(false);
                  setGeminiPrompt("");
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Close suggestions"
              >
                <Icon icon="lucide:x" width="20" height="20" />
              </button>
            </div>

            {/* Suggestions content */}
            <div className="flex-1 overflow-y-auto p-4">
              {geminiLoading ? (
                <div className="bg-gray-50 border-2 border-black p-4">
                  <p className="text-sm font-mono">Generating suggestions...</p>
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-black p-4">
                  <p className="text-sm font-mono whitespace-pre-wrap">
                    {geminiPrompt || "Loading..."}
                  </p>
                </div>
              )}
            </div>

            {/* Footer with save button if generated image exists */}
            {generatedImage && (
              <div className="p-4 border-t-2 border-black bg-gray-50">
                <button
                  onClick={() => {
                    // This is from Edit Image
                    onSaveOutfit(generatedImage, undefined, "edited");
                    setShowGeminiPrompt(false);
                    setGeminiPrompt("");
                  }}
                  disabled={geminiLoading}
                  className="w-full px-4 py-2 border-2 border-black bg-blue-600 text-white hover:bg-blue-700 font-bold uppercase text-sm disabled:opacity-50"
                >
                  Save Fit
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
