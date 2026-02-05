'use client';

import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

/**
 * Hook to get the current authentication state
 * Uses Redux store and localStorage for client-side authentication
 * @returns {Object} Auth state with user data
 */
export function useAuthSession() {
  const reduxAuth = useSelector((state) => state.auth.login);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check localStorage first (for persistence)
    if (typeof window !== 'undefined') {
      try {
        const storedAuth = localStorage.getItem('isLoggedIn');
        const storedUser = localStorage.getItem('authUser');
        
        if (storedAuth === 'true') {
          setIsAuthenticated(true);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              // If parsing fails, use redux state
              setUser(typeof reduxAuth === 'object' ? reduxAuth : null);
            }
          }
        } else if (reduxAuth) {
          setIsAuthenticated(true);
          setUser(typeof reduxAuth === 'object' ? reduxAuth : null);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (e) {
        // localStorage not available, use Redux only
        setIsAuthenticated(!!reduxAuth);
        setUser(typeof reduxAuth === 'object' ? reduxAuth : null);
      }
    } else {
      // SSR - use Redux only
      setIsAuthenticated(!!reduxAuth);
      setUser(typeof reduxAuth === 'object' ? reduxAuth : null);
    }
    setIsLoading(false);
  }, [reduxAuth]);

  return {
    session: user ? { user } : null,
    status: isLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'unauthenticated',
    isLoading,
    isAuthenticated,
    user,
  };
}

