/**
 * NextAuth Client Configuration
 * This ensures NextAuth client-side code uses the correct base path
 */

/**
 * Get the base path for NextAuth API calls
 * This is used by NextAuth's client-side code to make API requests
 */
export function getNextAuthBasePath() {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable
    return process.env.NEXT_PUBLIC_BASE_PATH || '';
  }
  
  // Client-side: use environment variable or detect from window location
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  // If basePath is set and current path includes it, use it
  if (basePath && window.location.pathname.startsWith(basePath)) {
    return basePath;
  }
  
  return basePath;
}

/**
 * Get the full API URL for NextAuth
 */
export function getNextAuthApiUrl() {
  const basePath = getNextAuthBasePath();
  const cleanBasePath = basePath && basePath.endsWith('/') 
    ? basePath.slice(0, -1) 
    : basePath;
  
  return cleanBasePath ? `${cleanBasePath}/api/auth` : '/api/auth';
}

