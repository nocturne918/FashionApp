import React from 'react';
import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  cartCount: number;
}

export const Layout: React.FC<LayoutProps> = ({ cartCount }) => {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar cartCount={cartCount} />
      <main className="mt-4">
        <Outlet />
      </main>
    </div>
  );
};
