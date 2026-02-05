/**
 * Get base path from environment variable
 * This ensures consistent basePath access throughout the application
 * @returns {string} Base path from NEXT_PUBLIC_BASE_PATH or empty string
 */
export function getBasePath() {
  // Always read from environment variable
  // NEXT_PUBLIC_* variables are available in both client and server
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  // Ensure base path doesn't end with slash
  return basePath && basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
}

/**
 * Get base path with leading slash
 * @returns {string} Base path with leading slash (or empty string if no basePath)
 */
export function getBasePathWithSlash() {
  const basePath = getBasePath();
  return basePath ? `${basePath}` : '';
}

/**
 * Add base path to a URL path
 * @param {string} path - Path to add base path to
 * @returns {string} Full path with base path
 */
export function addBasePath(path) {
  const basePath = getBasePath();
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Return combined path
  return basePath ? `${basePath}${cleanPath}` : cleanPath;
}

