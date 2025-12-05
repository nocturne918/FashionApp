import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { LoginView } from "./components/LoginView";
import { SignupView } from "./components/SignupView";
import { Feed } from "./pages/Feed";
import { Lab } from "./pages/Lab";
import { Stash } from "./pages/Stash";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { authClient } from "./lib/auth-client";
import { api } from "./services/api";
import type { Product, Outfit, OutfitItem } from "@fashionapp/shared";

const AppContent = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isLoaded, setIsLoaded] = useState(false);
  const [stashedProducts, setStashedProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("fitted_stash");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem("fitted_stash");
        return [];
      }
    }
    return [];
  });
  const [currentOutfitItems, setCurrentOutfitItems] = useState<OutfitItem[]>(
    () => {
      const saved = localStorage.getItem("fitted_currentOutfitItems");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          localStorage.removeItem("fitted_currentOutfitItems");
          return [];
        }
      }
      return [];
    }
  );
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>(() => {
    const saved = localStorage.getItem("fitted_outfits");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem("fitted_outfits");
        return [];
      }
    }
    return [];
  });
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Clear guest mode if it exists
    localStorage.removeItem("fitted_guest_mode");
    localStorage.removeItem("fitted_guest_user");
    await authClient.signOut();
  };

  // When user is present, prefer server-side saved outfits (merge/replace local)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      try {
        const serverOutfits = await api.getOutfits();
        if (!mounted) return;
        if (serverOutfits && serverOutfits.length > 0) {
          setSavedOutfits((prevLocal) => {
            const serverMap = new Map(serverOutfits.map((o) => [o.id, o]));
            const merged = [...serverOutfits];
            for (const local of prevLocal) {
              if (!serverMap.has(local.id)) merged.push(local);
            }
            try {
              localStorage.setItem("fitted_outfits", JSON.stringify(merged));
            } catch {
              // Ignore localStorage errors
            }
            return merged;
          });
        }
      } catch (e) {
        console.warn(
          "Could not fetch server outfits, falling back to local",
          e
        );
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  // Mark as loaded after initial mount to prevent overwriting localStorage
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Persist to local storage on changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("fitted_stash", JSON.stringify(stashedProducts));
    } catch (e) {
      console.warn("Failed to save stash to localStorage:", e);
    }
  }, [stashedProducts, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        "fitted_currentOutfitItems",
        JSON.stringify(currentOutfitItems)
      );
    } catch (e) {
      console.warn("Failed to save currentOutfitItems to localStorage:", e);
    }
  }, [currentOutfitItems, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("fitted_outfits", JSON.stringify(savedOutfits));
    } catch (e) {
      console.warn("Failed to save outfits to localStorage:", e);
    }
  }, [savedOutfits, isLoaded]);

  const toggleStash = (product: Product) => {
    setStashedProducts((prev) => {
      const isStashed = prev.find((p) => p.id === product.id);
      const next = isStashed
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product];

      // Persist to localStorage immediately
      try {
        localStorage.setItem("fitted_stash", JSON.stringify(next));
      } catch (e) {
        console.warn("Failed to save stash to localStorage:", e);
      }

      return next;
    });
  };

  const addToFit = (product: Product) => {
    if (currentOutfitItems.find((i) => i.id === product.id)) return;
    const newItem: OutfitItem = { ...product };
    setCurrentOutfitItems((prev) => [...prev, newItem]);
    navigate("/lab");
  };

  const saveOutfit = async (
    imageUrl?: string,
    itemsToSave?: OutfitItem[],
    imageSource?: "components" | "canvas" | "edited"
  ) => {
    try {
      // Use provided items or fall back to currentOutfitItems
      const items = itemsToSave || currentOutfitItems;

      // Always compress images to ensure they fit in localStorage
      let finalImageUrl: string | undefined = imageUrl;
      if (imageUrl && imageUrl.startsWith("data:image/")) {
        try {
          const sizeInBytes = new Blob([imageUrl]).size;
          const sizeInMB = sizeInBytes / (1024 * 1024);

          // Compress if image is >1MB to ensure it fits in localStorage

          if (sizeInMB > 1) {
            console.log(
              `Compressing image (${sizeInMB.toFixed(2)}MB) before saving...`
            );
            // Try to compress the image
            const compressed = await compressImage(imageUrl, 800, 0.6);
            if (compressed) {
              const compressedSize =
                new Blob([compressed]).size / (1024 * 1024);
              console.log(`Compressed to ${compressedSize.toFixed(2)}MB`);
              finalImageUrl = compressed;
            } else {
              console.warn(
                "Could not compress image, saving outfit without image"
              );
              finalImageUrl = undefined;
            }
          } else {
            console.log(`Image is ${sizeInMB.toFixed(2)}MB, saving as-is`);
          }
        } catch (e) {
          console.error("Error processing image:", e);
          // If compression fails, don't save the image to prevent errors
          finalImageUrl = undefined;
        }
      }

      // Ensure items is a valid array
      const validItems = Array.isArray(items) && items.length > 0 ? items : [];

      const newOutfit: Outfit = {
        id: Date.now().toString(),
        name: `Fit #${savedOutfits.length + 1}`,
        items: validItems,
        createdAt: Date.now(),
        imageUrl: finalImageUrl,
        imageSource: imageSource || "edited", // Default to "edited" if not provided
      };

      console.log("Saving outfit:", {
        name: newOutfit.name,
        itemsCount: newOutfit.items.length,
        hasImage: !!newOutfit.imageUrl,
        imageSource: newOutfit.imageSource,
      });

      // Log what we're saving
      if (finalImageUrl) {
        const savedSize = new Blob([finalImageUrl]).size / (1024 * 1024);
        console.log(
          `Saving outfit "${newOutfit.name}" with image (${savedSize.toFixed(
            2
          )}MB)`
        );
      } else {
        console.log(`Saving outfit "${newOutfit.name}" without image`);
      }

      // Ensure all items in the outfit are present in the stash
      setStashedProducts((prev) => {
        const existingById = new Map(prev.map((p) => [p.id, p]));
        for (const it of items) {
          if (!existingById.has(it.id))
            existingById.set(it.id, it as unknown as Product);
        }
        const next = Array.from(existingById.values());
        try {
          localStorage.setItem("fitted_stash", JSON.stringify(next));
        } catch {
          // Ignore localStorage errors
        }
        return next;
      });

      // save locally FIRST to ensure it's saved even if server save fails
      setSavedOutfits((prev) => {
        const next = [newOutfit, ...prev];
        try {
          localStorage.setItem("fitted_outfits", JSON.stringify(next));
          console.log("Saved outfit to localStorage:", {
            outfitId: newOutfit.id,
            imageSource: newOutfit.imageSource,
            itemsCount: newOutfit.items.length,
            totalOutfits: next.length,
          });
        } catch (e) {
          console.error("Failed to save to localStorage:", e);
          // Don't ignore - this is critical
        }
        return next;
      });
      setCurrentOutfitItems([]);

      try {
        const created = await api.createOutfit(newOutfit);
        // Always preserve items and imageSource from the local outfit
        // Server might not return items or imageSource in the format we need
        const merged: Outfit = {
          ...created,
          items:
            newOutfit.items.length > 0 ? newOutfit.items : created.items || [],
          imageUrl: finalImageUrl || created.imageUrl || newOutfit.imageUrl,
          imageSource: newOutfit.imageSource, // Always preserve imageSource from local outfit
        };
        setSavedOutfits((prev) => {
          // Remove the temporary local outfit and add the merged one
          const filtered = prev.filter((o) => o.id !== newOutfit.id);
          return [merged, ...filtered];
        });
        // Also update localStorage with the merged outfit
        try {
          const current = JSON.parse(
            localStorage.getItem("fitted_outfits") || "[]"
          );
          const updated = [
            merged,
            ...current.filter((o: Outfit) => o.id !== newOutfit.id),
          ];
          localStorage.setItem("fitted_outfits", JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed to update localStorage:", e);
        }
        alert("Outfit saved to server and Stash!");
      } catch (e) {
        console.warn("Failed to save outfit to server, kept locally", e);
        alert("Outfit saved locally (offline mode).");
      }

      // Don't navigate
    } catch (error) {
      console.error("Error saving outfit:", error);
      alert("Error saving outfit. Please try again.");
    }
  };

  // Helper function to compress images
  const compressImage = (
    dataUrl: string,
    maxWidth = 800,
    quality = 0.7
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressed = canvas.toDataURL("image/jpeg", quality);
          const compressedSize = new Blob([compressed]).size / (1024 * 1024);
          console.log(
            `Compressed image from ${
              new Blob([dataUrl]).size / (1024 * 1024)
            }MB to ${compressedSize.toFixed(2)}MB`
          );
          resolve(compressed);
        } catch (e) {
          console.error("Error compressing image:", e);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    if (authMode === "signup") {
      return <SignupView onSwitchToLogin={() => setAuthMode("login")} />;
    }
    return <LoginView onSwitchToSignup={() => setAuthMode("signup")} />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout
            cartCount={currentOutfitItems.length}
            user={user}
            onLogout={handleLogout}
          />
        }
      >
        <Route
          index
          element={
            <Feed
              stashedProducts={stashedProducts}
              toggleStash={toggleStash}
              addToFit={addToFit}
            />
          }
        />
        <Route
          path="lab"
          element={
            <Lab
              stashedProducts={stashedProducts}
              savedOutfits={savedOutfits}
              setSavedOutfits={setSavedOutfits}
              toggleStash={toggleStash}
              addToFit={addToFit}
              currentOutfitItems={currentOutfitItems}
              setCurrentOutfitItems={setCurrentOutfitItems}
              saveOutfit={saveOutfit}
            />
          }
        />
        <Route
          path="stash"
          element={
            <Stash
              stashedProducts={stashedProducts}
              savedOutfits={savedOutfits}
              setSavedOutfits={setSavedOutfits}
              toggleStash={toggleStash}
              addToFit={addToFit}
              currentOutfitItems={currentOutfitItems}
              setCurrentOutfitItems={setCurrentOutfitItems}
              saveOutfit={saveOutfit}
            />
          }
        />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
