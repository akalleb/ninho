'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getBasePath } from '../../utility/getBasePath';

/**
 * Next.js compatible Link component that replaces React Router's Link/NavLink
 * Provides the same API as React Router NavLink for easy migration
 */
export const NextLink = React.forwardRef(({
  to,
  href,
  children,
  className = '',
  activeClassName = 'active',
  exact = false,
  onClick,
  ...props
}, ref) => {
  const pathname = usePathname();
  const router = useRouter();
  const basePath = getBasePath();

  // Use 'to' prop (React Router style) or 'href' prop (Next.js style)
  // Ensure it's always a string (prevent [object Object] issues)
  let linkPath = to || href || '#';
  
  // Convert to string if it's not already (handles edge cases where object might be passed)
  if (typeof linkPath !== 'string') {
    if (linkPath && typeof linkPath === 'object') {
      // If it's an object with a pathname, use that (like Next.js router location object)
      linkPath = linkPath.pathname || linkPath.href || '#';
    } else {
      linkPath = String(linkPath);
    }
  }
  
  // Final safety check - ensure it's a valid string
  if (typeof linkPath !== 'string' || linkPath === '[object Object]') {
    console.warn('NextLink received invalid path:', to || href);
    linkPath = '#';
  }

  // Get current pathname without basePath
  let currentPath = pathname;
  if (basePath && pathname?.startsWith(basePath)) {
    currentPath = pathname.replace(basePath, '');
  }

  // Check if link is active (for NavLink compatibility) - optimized
  const isActive = React.useMemo(() => {
    if (!linkPath || linkPath === '#' || !currentPath) return false;
    
    // Fast path: if paths don't match at all, skip expensive operations
    if (!linkPath.startsWith('/') && !linkPath.startsWith(basePath)) {
      return false;
    }
    
    const cleanLinkPath = basePath && linkPath.startsWith(basePath)
      ? linkPath.replace(basePath, '')
      : linkPath;
    
    if (exact) {
      return currentPath === cleanLinkPath;
    }
    
    return currentPath.startsWith(cleanLinkPath);
  }, [currentPath, linkPath, basePath, exact]);

  // Build className with active state
  const finalClassName = React.useMemo(() => {
    if (isActive && activeClassName) {
      return className ? `${className} ${activeClassName}` : activeClassName;
    }
    return className;
  }, [className, activeClassName, isActive]);

  // Handle click events - optimize for instant navigation
  const handleClick = (e) => {
    // Dispatch custom event for route loader to detect navigation start
    // This provides immediate visual feedback when menu items are clicked
    if (typeof window !== 'undefined' && linkPath && linkPath !== '#' && !linkPath.startsWith('http') && !linkPath.startsWith('mailto:') && !linkPath.startsWith('tel:')) {
      window.dispatchEvent(new CustomEvent('route-navigation-start', { 
        detail: { href: linkPath } 
      }));
    }
    
    if (onClick) {
      // Execute onClick in next tick to not block navigation
      // This allows Next.js Link to navigate immediately
      requestAnimationFrame(() => {
        onClick(e);
      });
    }
  };

  // If it's an external link or special link, use regular anchor
  if (linkPath.startsWith('http') || 
      linkPath.startsWith('mailto:') || 
      linkPath.startsWith('tel:') ||
      linkPath === '#' ||
      props.target === '_blank') {
    return (
      <a
        ref={ref}
        href={linkPath}
        className={finalClassName}
        onClick={handleClick}
        {...props}
      >
        {children}
      </a>
    );
  }

  // Clean the path (remove basePath if present, Next.js Link handles basePath automatically)
  let cleanPath = linkPath;
  if (basePath && linkPath.startsWith(basePath)) {
    cleanPath = linkPath.replace(basePath, '');
  }

  // Use Next.js Link for internal navigation
  // Wrap in inline element to mark as Next.js link (NavigationSync will skip these)
  // Using inline to avoid breaking layout
  // Prefetch is enabled by default in Next.js Link (speeds up navigation)
  return (
    <span className="nextjs-link-wrapper" data-nextjs-link-wrapper="true" style={{ display: 'contents' }}>
      <Link
        ref={ref}
        href={cleanPath}
        className={finalClassName}
        onClick={handleClick}
        prefetch={props.prefetch !== undefined ? props.prefetch : true} // Enable prefetch by default for faster navigation
        {...props}
      >
        {children}
      </Link>
    </span>
  );
});

NextLink.displayName = 'NextLink';

/**
 * NavLink component for compatibility with React Router NavLink API
 */
export const NextNavLink = React.forwardRef((props, ref) => {
  return <NextLink {...props} ref={ref} />;
});

NextNavLink.displayName = 'NextNavLink';

export default NextLink;

