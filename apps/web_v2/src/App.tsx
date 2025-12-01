import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginView } from './components/LoginView';
import { Feed } from './pages/Feed';
import { Lab } from './pages/Lab';
import { Stash } from './pages/Stash';
import type { Product, Outfit, OutfitItem, User } from './types';

const AppContent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stashedProducts, setStashedProducts] = useState<Product[]>([]);
  const [currentOutfitItems, setCurrentOutfitItems] = useState<OutfitItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const navigate = useNavigate();

  // Load from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('fitted_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedStash = localStorage.getItem('fitted_stash');
    if (savedStash) setStashedProducts(JSON.parse(savedStash));
    
    const savedFits = localStorage.getItem('fitted_outfits');
    if (savedFits) setSavedOutfits(JSON.parse(savedFits));
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fitted_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fitted_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('fitted_stash', JSON.stringify(stashedProducts));
  }, [stashedProducts]);

  useEffect(() => {
    localStorage.setItem('fitted_outfits', JSON.stringify(savedOutfits));
  }, [savedOutfits]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

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

  const saveOutfit = () => {
    const newOutfit: Outfit = {
      id: Date.now().toString(),
      name: `Fit #${savedOutfits.length + 1}`,
      items: currentOutfitItems,
      createdAt: Date.now()
    };
    setSavedOutfits(prev => [newOutfit, ...prev]);
    setCurrentOutfitItems([]);
    alert('Outfit saved to Stash!');
    navigate('/stash');
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
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
            />
          } />
        </Route>
      </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
