'use client';

import { useEffect, useRef } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';
import { getBasePath } from '../../utility/getBasePath';

/**
 * Syncs React Router navigation with Next.js router
 * Intercepts all link clicks and uses Next.js router to navigate immediately
 * Optimized for instant navigation without delays
 */
export default function NavigationSync() {
  const nextRouter = useNextRouter();
  const basePath = getBasePath();
  const isNavigatingRef = useRef(false);
  const navigationQueueRef = useRef(null);
  
  // Intercept all clicks on anchor tags within the router context
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleClick = (e) => {
      // Fast path: Check target directly first (most common case)
      const target = e.target;
      if (!target || target.tagName !== 'A') {
        // Quick check: if target is not an anchor, check if it's inside a Next.js Link
        const closestLink = target?.closest?.('a[data-nextjs-link-wrapper], a.__next-link, [data-nextjs-link-wrapper] a, .nextjs-link-wrapper a');
        if (closestLink) {
          return; // Let Next.js handle it
        }
      }
      
      // Use composedPath only if needed (optimized check)
      const path = e.composedPath && e.composedPath() || [];
      
      // Fast check: if target or immediate parent has Next.js link marker, skip
      if (target?.closest?.('[data-nextjs-link-wrapper]') || 
          target?.closest?.('.__next-link') ||
          target?.closest?.('.nextjs-link-wrapper')) {
        return;
      }
      
      // First, check if any element in the path is a Next.js Link wrapper (optimized loop)
      let isNextLink = false;
      for (let i = 0; i < Math.min(path.length, 8); i++) { // Reduced from 15 to 8
        const element = path[i];
        if (element?.nodeType === 1) { // Element node
          // Fast attribute check
          if (element.hasAttribute?.('data-nextjs-link-wrapper') || 
              element.hasAttribute?.('data-nextjs-link') ||
              element.classList?.contains('nextjs-link-wrapper') ||
              element.classList?.contains('__next-link')) {
            isNextLink = true;
            break;
          }
        }
      }
      
      // If it's a Next.js Link, let it handle navigation naturally - DO NOT INTERCEPT
      if (isNextLink) {
        return;
      }
      
      // Find the clicked anchor element (optimized - use closest for faster lookup)
      const link = e.target?.closest?.('a');
      if (!link || link.tagName !== 'A') return;
      
      // Fast check: if link is inside MemoryRouter context (optimized)
      const isInsideMemoryRouter = link.closest?.('[data-react-router-context], [data-react-router], .profileTab-menu, .cart-wrapper');
      if (isInsideMemoryRouter) {
        return; // Let React Router handle it
      }
      
      const href = link.getAttribute('href');
      
      // Skip external links, anchors, and special links
      if (!href || 
          href === '#' || 
          href.startsWith('http') || 
          href.startsWith('mailto:') || 
          href.startsWith('tel:') ||
          link.hasAttribute('target') ||
          link.hasAttribute('download') ||
          link.getAttribute('data-external') === 'true') {
        return;
      }
      
      // Only handle admin routes or relative paths (for React Router Links outside MemoryRouter)
      // Next.js Links and MemoryRouter NavLinks are already handled above
      if (href.startsWith('/admin') || (href.startsWith('/') && !href.startsWith('//'))) {
        // Prevent default navigation immediately
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Cancel any pending navigation
        if (navigationQueueRef.current) {
          clearTimeout(navigationQueueRef.current);
          navigationQueueRef.current = null;
        }
        
        // Remove basePath from href if it exists
        let cleanHref = href;
        if (basePath && href.startsWith(basePath)) {
          cleanHref = href.replace(basePath, '');
        }
        
        // If already navigating, queue this one or replace
        if (isNavigatingRef.current) {
          // Just replace the current navigation
          nextRouter.push(cleanHref);
          return;
        }
        
        // Mark as navigating
        isNavigatingRef.current = true;
        
        // Navigate immediately - no delay
        try {
          nextRouter.push(cleanHref);
        } catch (error) {
          console.error('Navigation error:', error);
        }
        
        // Reset flag immediately after push (Next.js handles async navigation)
        // Use microtask to reset without blocking
        Promise.resolve().then(() => {
          isNavigatingRef.current = false;
        });
        
        // Clear any pending timeout
        if (navigationQueueRef.current) {
          clearTimeout(navigationQueueRef.current);
          navigationQueueRef.current = null;
        }
      }
    };
    
    // Use capture phase with highest priority to intercept before React Router
    // Priority: capture phase at document level, non-passive to allow preventDefault
    const options = { capture: true, passive: false };
    
    // Add listener with highest priority
    document.addEventListener('click', handleClick, options);
    
    return () => {
      document.removeEventListener('click', handleClick, options);
      if (navigationQueueRef.current) {
        clearTimeout(navigationQueueRef.current);
      }
    };
  }, [nextRouter, basePath]);
  
  return null;
}

