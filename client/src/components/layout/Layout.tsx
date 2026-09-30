import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { GlobalOmnibar } from '../search/GlobalOmnibar';
import { ToastContainer } from '../common/ToastContainer';
import { useTheme } from '../../context/ThemeContext';

export const Layout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { theme } = useTheme();

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'dark bg-dark-bg text-dark-text ambient-waves-dark' : 'bg-light-bg text-light-text ambient-waves-light'}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleSidebar={() => setIsOpenMobile(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Global Omnibar Search (⌘K) */}
      <GlobalOmnibar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Live Toast Alerts */}
      <ToastContainer />
    </div>
  );
};
