'use client';

/**
 * Next.js compatible router hooks to replace React Router hooks
 * Use these hooks for components that need to work with Next.js routing
 */

import { useRouter, usePathname, useSearchParams, useParams as useNextParamsRaw } from 'next/navigation';
import { getBasePath } from '../utility/getBasePath';

export function useNextNavigate() {
  const router = useRouter();
  const basePath = getBasePath();
  
  return {
    push: (to) => {
      let path = to;
      // Remove basePath if present (Next.js router handles it automatically)
      if (basePath && typeof to === 'string' && to.startsWith(basePath)) {
        path = to.replace(basePath, '');
      }
      router.push(path);
    },
    replace: (to) => {
      let path = to;
      if (basePath && typeof to === 'string' && to.startsWith(basePath)) {
        path = to.replace(basePath, '');
      }
      router.replace(path);
    },
    back: () => router.back(),
    forward: () => router.forward(),
    go: (delta) => {
      // Next.js doesn't have router.go, simulate with back/forward
      if (delta < 0) {
        for (let i = 0; i < Math.abs(delta); i++) router.back();
      } else if (delta > 0) {
        for (let i = 0; i < delta; i++) router.forward();
      }
    }
  };
}

export function useNextLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = getBasePath();
  
  let currentPath = pathname || '/';
  if (basePath && pathname?.startsWith(basePath)) {
    currentPath = pathname.replace(basePath, '');
  }
  
  return {
    pathname: currentPath,
    search: searchParams ? `?${searchParams.toString()}` : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state: null, // Next.js doesn't use location state
  };
}

export function useNextParamsHook() {
  const params = useNextParamsRaw();
  return params || {};
}

/**
 * Alias for useNextNavigate (matches React Router API)
 */
export const useNavigate = useNextNavigate;

/**
 * Alias for useNextLocation (matches React Router API)
 */
export const useLocation = useNextLocation;

/**
 * Alias for useNextParams (matches React Router API)
 */
export { useNextParamsHook as useParams };

