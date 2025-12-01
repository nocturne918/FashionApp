import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginView } from './components/LoginView';
import { SignupView } from './components/SignupView';
import { Feed } from './pages/Feed';
import { Lab } from './pages/Lab';
import { Stash } from './pages/Stash';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { authClient } from './lib/auth-client';
import { api } from './services/api';
import type { Product, Outfit, OutfitItem } from '@fashionapp/shared';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [stashedProducts, setStashedProducts] = useState<Product[]>([]);
  const [currentOutfitItems, setCurrentOutfitItems] = useState<OutfitItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authClient.signOut();
    // Context will update automatically
  };

  // Load from local storage on mount
  useEffect(() => {
    const savedStash = localStorage.getItem('fitted_stash');
    if (savedStash) {
      try {
        setStashedProducts(JSON.parse(savedStash));
      } catch (err) {
        console.warn('Could not parse fitted_stash from localStorage, clearing corrupt value', err);
        localStorage.removeItem('fitted_stash');
        setStashedProducts([]);
      }
    }

    const savedFits = localStorage.getItem('fitted_outfits');
    if (savedFits) {
      try {
        setSavedOutfits(JSON.parse(savedFits));
      } catch (err) {
        console.warn('Could not parse fitted_outfits from localStorage, clearing corrupt value', err);
        localStorage.removeItem('fitted_outfits');
        setSavedOutfits([]);
      }
    }
  }, []);

  // When user is present, prefer server-side saved outfits (merge/replace local)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      try {
        const serverOutfits = await api.getOutfits();
        if (!mounted) return;
        if (serverOutfits && serverOutfits.length > 0) {
          // Merge server outfits with any local-only outfits (keep server as source-of-truth, but preserve local uniques)
          setSavedOutfits(prevLocal => {
            const serverMap = new Map(serverOutfits.map(o => [o.id, o]));
            const merged = [...serverOutfits];
            for (const local of prevLocal) {
              if (!serverMap.has(local.id)) merged.push(local);
            }
            try { localStorage.setItem('fitted_outfits', JSON.stringify(merged)); } catch {}
            return merged;
          });
        } else {
          // Server returned no outfits — do not overwrite local saved outfits (preserve local optimistic saves)
        }
      } catch (e) {
        // Not authenticated or API unavailable — keep local outfits
        console.warn('Could not fetch server outfits, falling back to local', e);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    localStorage.setItem('fitted_stash', JSON.stringify(stashedProducts));
  }, [stashedProducts]);

  useEffect(() => {
    localStorage.setItem('fitted_outfits', JSON.stringify(savedOutfits));
  }, [savedOutfits]);

  const toggleStash = (product: Product) => {
    if (stashedProducts.find(p => p.id === product.id)) {
      setStashedProducts(prev => prev.filter(p => p.id !== product.id));
    } else {
      setStashedProducts(prev => [...prev, product]);
    }
  };

  const addToFit = (product: Product) => {
    // Basic deduplication for demo
    if (currentOutfitItems.find(i => i.id === product.id)) return;
    
    // Random slight position offset
    const newItem: OutfitItem = { ...product };
    setCurrentOutfitItems(prev => [...prev, newItem]);
    navigate('/lab');
  };

  const saveOutfit = async () => {
    const tempId = Date.now().toString();
    const newOutfit: Outfit = {
      id: tempId,
      name: `Fit #${savedOutfits.length + 1}`,
      items: currentOutfitItems,
      createdAt: Date.now()
    };

    // Ensure all items in the outfit are present in the stash (union by id)
    setStashedProducts(prev => {
      const existingById = new Map(prev.map(p => [p.id, p]));
      for (const it of currentOutfitItems) {
        if (!existingById.has(it.id)) existingById.set(it.id, it as unknown as Product);
      }
      const next = Array.from(existingById.values());
      try { localStorage.setItem('fitted_stash', JSON.stringify(next)); } catch {}
      return next;
    });

    // Optimistically save locally so UI updates immediately (also write to localStorage immediately)
    setSavedOutfits(prev => {
      const next = [newOutfit, ...prev];
      try { localStorage.setItem('fitted_outfits', JSON.stringify(next)); } catch {}
      return next;
    });
    setCurrentOutfitItems([]);

    try {
      // Try to persist to backend if available
      const created = await api.createOutfit(newOutfit);
      // If the server returned no items (products not present server-side), merge optimistic items
      const merged = { ...created, items: (created.items && created.items.length > 0) ? created.items : newOutfit.items };
      // Replace the optimistic entry (match by tempId)
      setSavedOutfits(prev => [merged, ...prev.filter(o => o.id !== tempId)]);
      alert('Outfit saved to server and Stash!');
    } catch (e) {
      // Fallback to local-only persistence
      console.warn('Failed to save outfit to server, kept locally', e);
      alert('Outfit saved locally (offline mode).');
    }

    navigate('/stash');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-black text-white">Loading...</div>;
  }

  if (!user) {
    if (authMode === 'signup') {
      return <SignupView onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginView onSwitchToSignup={() => setAuthMode('signup')} />;
  }

  return (
      <Routes>
        <Route path="/" element={<Layout cartCount={currentOutfitItems.length} user={user} onLogout={handleLogout} />}>
          <Route index element={
            <Feed 
              stashedProducts={stashedProducts} 
              toggleStash={toggleStash} 
              addToFit={addToFit} 
            />
          } />
          <Route path="lab" element={
            <Lab 
              stashedProducts={stashedProducts} 
              currentOutfitItems={currentOutfitItems} 
              setCurrentOutfitItems={setCurrentOutfitItems} 
              addToFit={addToFit} 
              saveOutfit={saveOutfit} 
            />
          } />
          <Route path="stash" element={
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
          } />
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
