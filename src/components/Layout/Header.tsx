import React from 'react';
import { Bell, User, Menu, X, LogOut } from 'lucide-react';
import { User as UserType } from '../../types';

interface HeaderProps {
  currentUser: UserType;
  activeTab: string;
  onTabChange: (tab: string) => void;
  notificationCount: number;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  notificationCount,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onLogout
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Accueil' },
    { id: 'tontines', label: 'Tontines' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'profile', label: 'Profil' },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="bg-green-800 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold">TontineManager</h1>
              </div>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === item.id
                      ? 'bg-green-700 text-white'
                      : 'text-green-100 hover:text-white hover:bg-green-700'
                  }`}
                >
                  {item.label}
                  {item.id === 'notifications' && notificationCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                      {notificationCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">{currentUser?.name}</span>
                <button
                  onClick={onLogout}
                  className="p-2 hover:bg-green-700 rounded-lg transition-colors duration-200"
                  title="Se déconnecter"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-green-100 hover:text-white hover:bg-green-700 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-green-700">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      activeTab === item.id
                        ? 'bg-green-700 text-white'
                        : 'text-green-100 hover:text-white hover:bg-green-700'
                    }`}
                  >
                    {item.label}
                    {item.id === 'notifications' && notificationCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                        {notificationCount}
                      </span>
                    )}
                  </button>
                ))}
                <div className="mt-4 pt-4 border-t border-green-700">
                  <div className="flex items-center justify-between px-3 text-sm">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {currentUser?.name}
                    </div>
                    <button
                      onClick={onLogout}
                      className="p-2 hover:bg-green-700 rounded-lg transition-colors duration-200"
                      title="Se déconnecter"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors duration-200 ${
                activeTab === item.id
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-green-600'
              }`}
            >
              {item.id === 'dashboard' && <User className="h-5 w-5" />}
              {item.id === 'tontines' && <User className="h-5 w-5" />}
              {item.id === 'notifications' && (
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </div>
              )}
              {item.id === 'profile' && <User className="h-5 w-5" />}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};