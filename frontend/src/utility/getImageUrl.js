import { getBasePath } from './getBasePath';

/**
 * Get image URL with base path support for Next.js
 * @param {string} imgPath - Image path relative to public/static
 * @returns {string} Full image URL with base path
 */
export function getImageUrl(imgPath) {
  if (!imgPath) return '';

  // Se for uma URL completa, retorna ela mesma
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
    return imgPath;
  }

  // Se for um caminho de media do backend (/media/...), adiciona o host da API
  if (imgPath.startsWith('/media/')) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    // Remove trailing slash from API URL if present
    const cleanApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    return `${cleanApiUrl}${imgPath}`;
  }

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
