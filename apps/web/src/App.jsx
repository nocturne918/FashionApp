
import './css/App.css'
import Home from './pages/Home';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Favorites from './pages/Favorites';
import Search from './pages/Search';
import MenPage from './pages/MenPage';
import WomenPage from './pages/WomenPage';
import KidsPage from './pages/KidsPage';
import BrandsPage from './pages/BrandsPage';
import ClosetPage from './pages/ClosetPage';
import Login from './pages/Login';
import AuthCallback from './components/AuthCallback';
import NavBar from './components/NavBar.jsx';
import { ClothingProvider } from './contexts/ClothingContext.jsx';
import graffiti from './assets/graffiti.jpg';
import { useState } from 'react';

function App() {
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';
  const isClosetPage = location.pathname === '/closet';
  const isFavoritesPage = location.pathname === '/favorites';
  const isLoginPage = location.pathname === '/login';

  return (
    <ClothingProvider> 
      {!isSearchPage && !isClosetPage && !isFavoritesPage && !isLoginPage && <NavBar />}
      {!isSearchPage && !isClosetPage && !isFavoritesPage && !isLoginPage && location.pathname !== '/men' && location.pathname !== '/women' && location.pathname !== '/kids' && location.pathname !== '/brands' && (
        <div className="graffiti-section">
          <img src={graffiti} alt="Graffiti" className="graffiti-image" />
        </div>
      )}
      <main className={`main-content ${isClosetPage ? 'closet-main' : ''}`}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/favorites' element={<Favorites />} />
          <Route path='/men' element={<MenPage />} />
          <Route path='/women' element={<WomenPage />} />
          <Route path='/kids' element={<KidsPage />} />
          <Route path='/brands' element={<BrandsPage />} />
          <Route path='/closet' element={<ClosetPage />} />
          <Route path='/profile' element={<div className="page-placeholder"><h1>Profile Page</h1><p>User profile and settings will appear here.</p></div>} />
          <Route path='/login' element={<Login />} />
          <Route path='/auth/callback' element={<AuthCallback />} />
          <Route path='/search' element={<Search />} />
        </Routes>
      </main>
    </ClothingProvider>
  );
}



export default App
