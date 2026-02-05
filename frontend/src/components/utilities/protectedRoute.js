'use client';

import React, { useState, useEffect } from 'react';
import propTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { getBasePath } from '../../utility/getBasePath';

function ProtectedRoute({ children }) {
  const router = useRouter();
  const basePath = getBasePath();
  const reduxAuth = useSelector(state => state.auth.login);
  const [isLoggedIn, setIsLoggedIn] = useState(reduxAuth || false);
  const [isChecking, setIsChecking] = useState(true);
  
  // Check localStorage on mount (for hydration/persistence)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedAuth = localStorage.getItem('isLoggedIn');
        if (storedAuth === 'true') {
          setIsLoggedIn(true);
        } else if (!reduxAuth) {
          setIsLoggedIn(false);
        }
      } catch (e) {
        // localStorage not available
        setIsLoggedIn(!!reduxAuth);
      }
    }
    setIsChecking(false);
  }, [reduxAuth]);
  
  useEffect(() => {
    if (!isChecking && !isLoggedIn) {
      const authPath = basePath ? `${basePath}/auth` : '/auth';
      router.replace(authPath);
    }
  }, [isLoggedIn, isChecking, router, basePath]);
  
  if (isChecking || !isLoggedIn) {
    return null; // Will redirect via useEffect
  }
  
  return children;
}

ProtectedRoute.propTypes = {
  children: propTypes.node.isRequired,
};

export default ProtectedRoute;
