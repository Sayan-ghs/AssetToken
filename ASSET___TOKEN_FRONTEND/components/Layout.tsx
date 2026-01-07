import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Wallet, DollarSign, Bell, Settings, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  action?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, showBack, action }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/marketplace', icon: Search, label: 'Browse' },
    { path: '/portfolio', icon: Wallet, label: 'Portfolio' },
    { path: '/income', icon: DollarSign, label: 'Income' },
  ];
  
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[rgb(var(--color-bg-dark))]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgb(var(--color-bg-dark))]/95 backdrop-blur-lg border-b border-[rgb(var(--color-border))]">
        <div className="flex items-center justify-between px-4 py-3">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="text-xl font-semibold">
              {title || 'AssetToken'}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {action}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      {!showBack && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[rgb(var(--color-bg-card))]/95 backdrop-blur-lg border-t border-[rgb(var(--color-border))]">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                    isActive
                      ? 'text-blue-500'
                      : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};
