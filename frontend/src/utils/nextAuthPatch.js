/**
 * NextAuth Base Path Patch
 * 
 * This file patches NextAuth's client-side API calls to include the base path.
 * NextAuth v4 doesn't automatically detect Next.js basePath for client-side requests.
 * 
 * This patch intercepts fetch and XMLHttpRequest calls to add the base path
 * to any requests that go to /api/auth/*
 */

(function() {
  'use strict';
  
  if (typeof window === 'undefined') return;
  
  // Get base path from environment variable
  // NEXT_PUBLIC_* variables are available in browser
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const cleanBasePath = basePath && basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  
  // Skip patching if no base path is configured
  if (!cleanBasePath) {
    return;
  }
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[NextAuth Patch] Base path detected:', cleanBasePath);
  }

  /**
   * Helper function to add base path to a URL if needed
   */
  function addBasePathToUrl(url) {
    if (typeof url !== 'string') return url;
    
    // Check if this is a NextAuth API call
    if (url.includes('/api/auth/')) {
      // Handle relative URLs starting with /api/auth/
      if (url.startsWith('/api/auth/')) {
        return cleanBasePath + url;
      }
      
      // Handle absolute URLs
      try {
        // Check if URL is already absolute
        if (url.startsWith('http://') || url.startsWith('https://')) {
          const urlObj = new URL(url);
          const pathname = urlObj.pathname;
          // If pathname starts with /api/auth/ but not with basePath, add basePath
          if (pathname.startsWith('/api/auth/') && !pathname.startsWith(cleanBasePath + '/api/auth/')) {
            urlObj.pathname = cleanBasePath + pathname;
            return urlObj.toString();
          }
        } else {
          // Relative URL - construct full URL with base path
          const baseUrl = window.location.origin + cleanBasePath;
          if (url.startsWith('/api/auth/')) {
            return baseUrl + url;
          }
        }
      } catch (e) {
        // If URL parsing fails, fallback to simple string manipulation
        if (url.startsWith('/api/auth/')) {
          return cleanBasePath + url;
        }
      }
    }
    
    return url;
  }

  // Patch fetch to intercept NextAuth API calls
  const originalFetch = window.fetch;
  
  window.fetch = function(input, init = {}) {
    // Handle Request object or URL string
    let patchedInput = input;
    
    if (input instanceof Request) {
      const url = input.url;
        const patchedUrl = addBasePathToUrl(url);
        if (patchedUrl !== url) {
          // Create new Request with patched URL
          patchedInput = new Request(patchedUrl, input);
          // Only log in development mode
          // if (process.env.NODE_ENV === 'development') {
          //   console.log('[NextAuth Patch] Patched Request URL:', url, '->', patchedUrl);
          // }
        }
    } else if (typeof input === 'string') {
      const patchedUrl = addBasePathToUrl(input);
      if (patchedUrl !== input) {
        patchedInput = patchedUrl;
        // Only log in development mode
        // if (process.env.NODE_ENV === 'development') {
        //   console.log('[NextAuth Patch] Patched fetch URL:', input, '->', patchedUrl);
        // }
      }
    }
    
    return originalFetch.call(this, patchedInput, init);
  };
  
  // Patch applied successfully
  // Uncomment for debugging:
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('[NextAuth Patch] Fetch patched successfully');
  // }

  // Also patch XMLHttpRequest if NextAuth uses it
  const OriginalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new OriginalXHR();
    const originalOpen = xhr.open;
    
    xhr.open = function(method, url, ...args) {
      const patchedUrl = addBasePathToUrl(url);
      return originalOpen.call(this, method, patchedUrl, ...args);
    };
    
    return xhr;
  };
})();

