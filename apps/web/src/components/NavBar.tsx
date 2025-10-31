// Main site navigation bar used across pages.

import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import '../css/NavBar.css';
import '../css/ProfileHoverCard.css';
import ProfileHoverCard from './ProfileHoverCard';
import fitted from '../assets/fitted.png';
import searchIcon from '../assets/search.png';
import favoriteIcon from '../assets/favorite.png';
import closetIcon from '../assets/closet.png';
import loginIcon from '../assets/login.png';

function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isHovering, setIsHovering] = useState(false);
    return(
        <header className='nav'>
         <nav className="nav-inner">
        {/* Left: category navigation */}
        <ul className=' nav-left'>
            <li><Link to="/men"> MEN</Link></li>
            <li><Link to="/women"> WOMEN</Link></li>
            <li><Link to="/kids"> KIDS</Link></li>
            <li><Link to="/brands"> BRANDS</Link></li>
        </ul>
        
        {/* Center: logo (links to home) */}
         <div className="nav-center">
            <Link to="/">
            <img src={fitted} alt="Fitted" className="navbar-logo"/>
            </Link>
            </div>
        
        {/* Right: action icons */}
        <div className='nav-right'>
          <Link to="/search" aria-label="Search">
            <img src={searchIcon} alt="Search" className="search-icon" />
          </Link>
          <Link to="/favorites" aria-label="Favorites">
            <img src={favoriteIcon} alt="Favorites" className="favorite-icon" />
          </Link>
          <Link to="/closet" aria-label="Bag">
            <img src={closetIcon} alt="Bag" className="closet-icon" />
          </Link>
          {isAuthenticated && user ? (
            <div 
              className="user-menu"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <img 
                src={user.avatar || `https://avatar.vercel.sh/${user.email}.png`} 
                alt="User Avatar" 
                className="login-icon" 
                onError={(e) => {
                  // Fallback to default avatar if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = `https://avatar.vercel.sh/${user.email}.png`;
                }}
              />
              {isHovering && <ProfileHoverCard user={user} onLogout={logout} />}
            </div>
          ) : (
            <Link to="/login" aria-label="Login">
              <img src={loginIcon} alt="Login" className="login-icon" />
            </Link>
          )}
        </div>
    </nav>
    </header>
    )
}
export default NavBar;