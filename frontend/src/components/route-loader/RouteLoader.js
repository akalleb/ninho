'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Styled from 'styled-components';
import config from '../../config/config';
import { useSelector } from 'react-redux';

const { theme } = config;

const RouteLoaderWrapper = Styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: ${props => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  background: ${({ darkMode }) => 
    darkMode ? 'rgba(26, 29, 41, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
  margin: 0;
  padding: 0;
  z-index: 99998;
  overflow: hidden;
  box-sizing: border-box;
  backdrop-filter: blur(2px);
  transition: opacity 0.2s ease-in-out;
  opacity: ${props => props.show ? 1 : 0};
  pointer-events: ${props => props.show ? 'auto' : 'none'};
  
  .route-loader-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin: 0;
    padding: 0;
    
    .route-loader-spinner {
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .ant-spin-dot-item {
        background-color: ${theme['primary-color'] || '#5F63F2'};
      }
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

/**
 * Route Loader Component
 * Shows a loading indicator during route transitions
 * Optimized to wait for actual content render, not just timeout
 */
export default function RouteLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const prevPathnameRef = useRef(pathname);
  const timerRef = useRef(null);
  const contentCheckTimerRef = useRef(null);
  const darkMode = useSelector((state) => state?.ChangeLayoutMode?.data || false);

  useEffect(() => {
    // Listen for navigation start events from NextLink
    const handleNavigationStart = () => {
      setIsLoading(true);
      // Clear any existing timers
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (contentCheckTimerRef.current) {
        clearTimeout(contentCheckTimerRef.current);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('route-navigation-start', handleNavigationStart);
    }
    
    // Show loader when pathname changes (but not on initial mount)
    if (pathname !== prevPathnameRef.current && prevPathnameRef.current !== null) {
      setIsLoading(true);
      
      // Clear any existing timers
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (contentCheckTimerRef.current) {
        clearTimeout(contentCheckTimerRef.current);
      }
      
      // Check if content is actually rendered by looking for main content area
      // This is more reliable than just using a timeout
      const checkContentReady = () => {
        // Check for main content elements that indicate page is ready
        const mainContent = document.querySelector('.atbd-main-layout, [data-main-content], main, .main-content');
        const hasContent = mainContent && mainContent.children.length > 0;
        
        // Also check if route loader is still showing (means page hasn't changed yet)
        const routeLoader = document.querySelector('[data-route-loader]');
        
        if (hasContent || pathname === prevPathnameRef.current) {
          // Content is ready or pathname changed, hide loader
          setIsLoading(false);
          if (contentCheckTimerRef.current) {
            clearTimeout(contentCheckTimerRef.current);
            contentCheckTimerRef.current = null;
          }
        } else {
          // Keep checking
          contentCheckTimerRef.current = setTimeout(checkContentReady, 50);
        }
      };
      
      // Start checking for content after a short delay
      contentCheckTimerRef.current = setTimeout(checkContentReady, 100);
      
      // Fallback: hide loader after max delay (500ms) even if content check fails
      timerRef.current = setTimeout(() => {
        setIsLoading(false);
        timerRef.current = null;
        if (contentCheckTimerRef.current) {
          clearTimeout(contentCheckTimerRef.current);
          contentCheckTimerRef.current = null;
        }
      }, 500); // Maximum wait time
      
      // Update ref
      prevPathnameRef.current = pathname;
    } else if (prevPathnameRef.current === null) {
      // Initial mount - just set the ref
      prevPathnameRef.current = pathname;
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (contentCheckTimerRef.current) {
        clearTimeout(contentCheckTimerRef.current);
        contentCheckTimerRef.current = null;
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('route-navigation-start', handleNavigationStart);
      }
    };
  }, [pathname]);

  const primaryColor = theme['primary-color'] || '#5F63F2';
  const antIcon = <LoadingOutlined style={{ fontSize: 40, color: primaryColor }} spin />;

  return (
    <RouteLoaderWrapper show={isLoading} darkMode={darkMode} data-route-loader>
      <div className="route-loader-content">
        <Spin 
          className="route-loader-spinner" 
          size="large" 
          indicator={antIcon}
          tip={null}
        />
      </div>
    </RouteLoaderWrapper>
  );
}
