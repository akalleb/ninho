import { getBasePath } from './getBasePath';

/**
 * Get image URL with base path support for Next.js
 * @param {string} imgPath - Image path relative to public/static
 * @returns {string} Full image URL with base path
 */
export function getImageUrl(imgPath) {
  // Remove leading slash if present
  const cleanPath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
  
  // Get base path from environment variable
  const basePath = getBasePath();
  
  // Ensure image path starts with static/ if it doesn't already
  let finalPath = cleanPath;
  if (!finalPath.startsWith('static/') && !finalPath.startsWith('/static/')) {
    finalPath = `static/${finalPath}`;
  }
  
  // Remove leading slash from final path
  finalPath = finalPath.startsWith('/') ? finalPath.slice(1) : finalPath;
  
  // Construct full URL - if no basePath, just return path with leading /
  return basePath ? `${basePath}/${finalPath}` : `/${finalPath}`;
}
