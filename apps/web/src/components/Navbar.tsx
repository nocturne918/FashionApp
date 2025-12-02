import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import fittedLogo from '/assets/fitted.png';
import type { User } from '@fashionapp/shared';

interface NavbarProps {
  cartCount: number;
  user: User | null;
  onLogout: () => void;
}

interface NavItemProps {
  to: string;
  id: string;
  label: string;
  icon: string;
  activeTab: string;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, id, label, icon, activeTab, onClick }) => {
  const isActive = activeTab === id || (id === 'feed' && activeTab === '');
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 text-lg font-bold uppercase tracking-wide px-4 py-2 border-2 transition-all no-underline
        ${isActive ? 'bg-black text-white border-black hard-shadow' : 'border-transparent hover:border-black hover:bg-white'}
      `}
    >
      <Icon icon={icon} width="20" height="20" />
      {label}
    </Link>
  );
};

export const Navbar: React.FC<NavbarProps> = ({ cartCount, user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || 'feed';

  return (
    <nav className="sticky top-0 z-50 bg-[#f8f8f8] border-b-2 border-black px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <Icon icon="lucide:x" width="28" height="28" /> : <Icon icon="lucide:menu" width="28" height="28" />}
        </button>

        <Link to="/" className="block">
           <img src={fittedLogo} alt="FITTED" className="h-12 object-contain" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-4">
          <NavItem to="/" id="feed" label="The Drop" icon="lucide:search" activeTab={activeTab} onClick={() => setMenuOpen(false)} />
          <NavItem to="/lab" id="lab" label="The Lab" icon="lucide:shopping-bag" activeTab={activeTab} onClick={() => setMenuOpen(false)} />
          <NavItem to="/stash" id="stash" label="Stash" icon="lucide:user" activeTab={activeTab} onClick={() => setMenuOpen(false)} />
        </div>

        {/* User Status / Mini Cart */}
        <div className="flex items-center gap-4">
          <Link to="/lab" className="relative cursor-pointer">
            <Icon icon="lucide:shopping-bag" width="24" height="24" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center border-2 border-black">
                {cartCount}
              </span>
            )}
          </Link>
          
          {user && (
            <div className="hidden md:flex items-center gap-3 pl-4 border-l-2 border-gray-300">
               <span className="font-mono text-xs font-bold truncate max-w-[100px]">{user.name}</span>
               <button onClick={onLogout} className="text-gray-500 hover:text-red-500" title="Sign Out">
                 <Icon icon="lucide:log-out" width="20" height="20" />
               </button>
            </div>
          )}
        </div>
      </div>

      

      {/* Mobile Nav Drawer */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#f8f8f8] border-b-2 border-black p-4 flex flex-col gap-2 hard-shadow">
          <NavItem to="/" id="feed" label="The Drop" icon="lucide:search" activeTab={activeTab} onClick={() => setMenuOpen(false)} />
          <NavItem to="/lab" id="lab" label="The Lab" icon="lucide:shopping-bag" activeTab={activeTab} onClick={() => setMenuOpen(false)} />
          <NavItem to="/stash" id="stash" label="Stash" icon="lucide:user" activeTab={activeTab} onClick={() => setMenuOpen(false)} />
          {user && (
             <div className="flex items-center justify-between border-t-2 border-gray-200 pt-4 mt-2">
               <span className="font-mono text-xs font-bold">{user.name}</span>
               <button onClick={onLogout} className="flex items-center gap-2 text-red-500 font-bold uppercase text-xs">
                 <Icon icon="lucide:log-out" width="20" height="20" /> Sign Out
               </button>
             </div>
          )}
        </div>
      )}
    </nav>
  );
};
