/**
 * Simple HTML sanitization utility
 * Removes potentially dangerous tags and attributes to prevent XSS attacks
 * 
 * NOTE: For production use, consider using a library like DOMPurify
 * This is a basic implementation for sanitizing tooltip content
 */

/**
 * Escape HTML special characters to prevent XSS
 */
export const escapeHtml = (text) => {
  if (!text) return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return String(text).replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Sanitize HTML content by escaping dangerous characters
 * Only allows safe HTML tags for tooltip formatting
 */
export const sanitizeTooltipContent = (htmlContent) => {
  if (!htmlContent) return '';
  
  // Escape all HTML to prevent XSS
  // For tooltips, we only need plain text with basic formatting
  return escapeHtml(htmlContent);
};

/**
 * Create safe HTML for tooltip using text content instead of innerHTML
 * Returns DOM nodes instead of HTML strings
 */
export const createSafeTooltipElement = (label, dataPoints) => {
  // Create container div
  const container = document.createElement('div');
  
  // Create label element
  const labelEl = document.createElement('div');
  labelEl.style.cssText = 'font-weight: 600; margin-bottom: 8px; color: #ffffff; font-size: 14px;';
  labelEl.textContent = label; // Use textContent instead of innerHTML
  container.appendChild(labelEl);
  
  // Create data point elements
  dataPoints.forEach((dataPoint) => {
    const { dataset, value, datasetLabel, color } = dataPoint;
    
    const pointContainer = document.createElement('div');
    pointContainer.style.cssText = 'display: flex; align-items: center; margin-bottom: 4px;';
    
    // Color indicator
    const colorDot = document.createElement('span');
    colorDot.style.cssText = `display: inline-block; width: 12px; height: 12px; background: ${escapeHtml(color)}; border-radius: 50%; margin-right: 8px; border: 1px solid rgba(255, 255, 255, 0.3);`;
    pointContainer.appendChild(colorDot);
    
    // Label and value text
    const textEl = document.createElement('span');
    textEl.style.cssText = 'color: #ffffff; font-size: 12px;';
    const strongEl = document.createElement('strong');
    strongEl.textContent = value; // Use textContent for safety
    textEl.textContent = `${datasetLabel}: `;
    textEl.appendChild(strongEl);
    pointContainer.appendChild(textEl);
    
    container.appendChild(pointContainer);
  });
  
  return container;
};

