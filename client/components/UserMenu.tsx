'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthModal from './AuthModal';

export default function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    }

    // Listen for storage changes to update user state
    const handleStorageChange = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event for same-tab updates
    window.addEventListener('userUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowMenu(false);
    // Dispatch custom event to update other components
    window.dispatchEvent(new Event('userUpdated'));
    router.push('/');
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
    // Refresh user state after auth modal closes
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
      window.dispatchEvent(new Event('userUpdated'));
    }
  };

  if (user) {
    return (
      <>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors"
          >
            <span className="font-semibold">{user.userName}</span>
            <svg
              className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black rounded-lg shadow-lg z-20">
              <div className="p-2">
                <div className="px-3 py-2 text-sm text-gray-600 border-b border-gray-200">
                  {user.userEmail}
                </div>
                <Link
                  href="/my-reviews"
                  className="block w-full text-left px-3 py-2 text-sm text-black hover:bg-gray-100 rounded transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  My Reviews
                </Link>
                <Link
                  href="/my-library"
                  className="block w-full text-left px-3 py-2 text-sm text-black hover:bg-gray-100 rounded transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  My Library
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  Logout
                </button>
              </div>
              </div>
            </>
          )}
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleCloseAuth}
          initialMode={authMode}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleOpenAuth('login')}
          className="px-4 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors"
        >
          Login
        </button>
        <button
          onClick={() => handleOpenAuth('signup')}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg border-2 border-black hover:bg-red-700 transition-colors"
        >
          Sign Up
        </button>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuth}
        initialMode={authMode}
      />
    </>
  );
}

