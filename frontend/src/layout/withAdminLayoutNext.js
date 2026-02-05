'use client';

import React from 'react';
import withAdminLayout from './withAdminLayout';
import RouteLoader from '../components/route-loader/RouteLoader';

/**
 * Higher-order component that wraps a component with AdminLayout
 * Now uses Next.js routing exclusively - no React Router needed
 * Optimized for instant rendering without mounting delays
 * Includes RouteLoader for visual feedback during navigation
 */
export default function withAdminLayoutNext(WrappedComponent) {
  const ComponentWithLayout = withAdminLayout(WrappedComponent);
  
  return function LayoutWrappedComponent(props) {
    // Directly render - no mounting delay needed since we're client-side
    // Next.js handles hydration automatically
    return (
      <>
        <RouteLoader />
        <ComponentWithLayout {...props} />
      </>
    );
  };
}
