import React from 'react';
import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';
import type { User } from '@fashionapp/shared';

interface LayoutProps {
  cartCount: number;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ cartCount, user, onLogout }) => {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar cartCount={cartCount} user={user} onLogout={onLogout} />
      <main className="mt-4">
        <Outlet />
      </main>
    </div>
  );
};
