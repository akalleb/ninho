'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Preloader from '../src/components/preloader/Preloader';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const reduxAuth = useSelector((state) => state?.auth?.login || false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // Check localStorage on mount (for persistence across reloads)
    if (typeof window !== 'undefined') {
      try {
        const storedAuth = localStorage.getItem('isLoggedIn');
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && typeof parsedUser === 'object') {
              setRole(parsedUser.role || null);
            }
          } catch (e) {
            setRole(null);
          }
        } else if (typeof reduxAuth === 'object' && reduxAuth) {
          setRole(reduxAuth.role || null);
        } else {
          setRole(null);
        }
        if (storedAuth === 'true') {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(!!reduxAuth);
        }
      } catch (e) {
        // localStorage not available, use Redux only
        setIsLoggedIn(!!reduxAuth);
        setRole(typeof reduxAuth === 'object' && reduxAuth ? reduxAuth.role || null : null);
      }
    } else {
      setIsLoggedIn(!!reduxAuth);
      setRole(typeof reduxAuth === 'object' && reduxAuth ? reduxAuth.role || null : null);
    }
    setIsChecking(false);
  }, [reduxAuth]);

  useEffect(() => {
    if (mounted && !isChecking) {
      // Next.js router automatically handles basePath from next.config.js
      if (isLoggedIn) {
        if (role === 'health') {
          router.push('/cuidados');
        } else if (role) {
          router.push('/admin/dashboard');
        }
      } else {
        router.push('/auth');
      }
    }
  }, [isLoggedIn, isChecking, router, mounted, role]);

  // Show preloader while checking auth
  if (!mounted) {
    return <Preloader />;
  }

  return null;
}
