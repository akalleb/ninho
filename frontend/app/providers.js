'use client';

// IMPORTANT: Import NextAuth patch BEFORE any NextAuth imports
// This patches fetch/XMLHttpRequest to include base path for NextAuth API calls
import '../src/utils/nextAuthPatch';

import React, { useState, useEffect, useMemo } from 'react';
import { Provider, useSelector } from 'react-redux';
import { ConfigProvider, theme as antdTheme, App as AntApp } from 'antd';
import { ThemeProvider } from 'styled-components';
// SessionProvider removed - using client-side authentication instead of NextAuth
// import { SessionProvider } from 'next-auth/react';
import store from '../src/redux/store';
import config from '../src/config/config';

/**
 * Get base path for NextAuth API calls
 * NextAuth client needs to know the base path to make correct API calls
 */
function getNextAuthBasePath() {
  if (typeof window === 'undefined') return '';
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return basePath && basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
}

const { theme } = config;

// Suppress findDOMNode warnings from third-party libraries (Ant Design, react-custom-scrollbars, etc.)
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  // Helper function to check if a warning should be suppressed
  const shouldSuppressWarning = (arg) => {
    // Convert argument to string for checking
    let argString = '';
    if (typeof arg === 'string') {
      argString = arg;
    } else if (arg && typeof arg === 'object') {
      // Check various properties that might contain the message
      // For Redux selector warnings, check if object has selector-related properties
      if (arg.state || arg.selected || arg.selected2) {
        // This looks like a Redux selector warning object
        argString = 'selector returned a different result';
      } else {
        argString = arg.message || arg.toString?.() || JSON.stringify(arg) || '';
      }
    }
    
    if (!argString) return false;
    
    const lowerArg = argString.toLowerCase();
    
    // Suppress findDOMNode deprecation warnings (all variations)
    if (lowerArg.includes('finddomnode') || 
        lowerArg.includes('finddomnode is deprecated') || 
        lowerArg.includes('finddomnode was passed') ||
        lowerArg.includes('warning: finddomnode')) {
      return true;
    }
    
    // Suppress DomWrapper findDOMNode warnings
    if (lowerArg.includes('domwrapper') && lowerArg.includes('finddomnode')) {
      return true;
    }
    
    // Suppress Ant Design Menu children deprecation (all variations)
    if ((lowerArg.includes('[antd: menu]') || 
         lowerArg.includes('antd: menu') || 
         lowerArg.includes('antd') && lowerArg.includes('menu')) && 
        (lowerArg.includes('children') || lowerArg.includes('`children`')) && 
        (lowerArg.includes('deprecated') || lowerArg.includes('use `items`') || lowerArg.includes('please use'))) {
      return true;
    }
    
    // Suppress React Router future flag warnings
    if (lowerArg.includes('react router future flag warning') || 
        lowerArg.includes('v7_starttransition') ||
        lowerArg.includes('v7_relativesplatpath') ||
        lowerArg.includes('react router will begin')) {
      return true;
    }
    
    // Suppress Redux selector warnings (optimization suggestions, not errors)
    if (lowerArg.includes('selector') && 
        (lowerArg.includes('returned a different result') || 
         lowerArg.includes('should be memoized') ||
         lowerArg.includes('unnecessary rerenders'))) {
      return true;
    }
    
    // Suppress defaultProps deprecation warnings (backward compatible, non-critical)
    if (lowerArg.includes('defaultprops') && 
        (lowerArg.includes('will be removed') || 
         lowerArg.includes('use javascript default parameters'))) {
      return true;
    }
    
    // Suppress Chart.js defaultProps warnings specifically
    if (lowerArg.includes('chart') && 
        lowerArg.includes('defaultprops') && 
        lowerArg.includes('will be removed')) {
      return true;
    }
    
    // Suppress moment.js deprecation warnings
    if (lowerArg.includes('deprecation warning') && 
        (lowerArg.includes('moment') || lowerArg.includes('rfc2822') || lowerArg.includes('iso format'))) {
      return true;
    }
    
    // Suppress moment.js js Date() fallback warnings
    if (lowerArg.includes('moment') && 
        (lowerArg.includes('falls back to js date') || 
         lowerArg.includes('not in a recognized') ||
         lowerArg.includes('rfc2822') ||
         lowerArg.includes('iso format'))) {
      return true;
    }
    
    // Suppress Next.js auto-scroll warnings (from preloader or other fixed/sticky elements)
    if (lowerArg.includes('skipping auto-scroll') || 
        (lowerArg.includes('auto-scroll') && lowerArg.includes('position'))) {
      return true;
    }
    
    // Suppress Ant Design Modal visible prop deprecation
    if ((lowerArg.includes('[antd: modal]') || lowerArg.includes('[antd:modal]')) && 
        lowerArg.includes('visible') && 
        (lowerArg.includes('deprecated') || lowerArg.includes('use `open`') || lowerArg.includes('please use'))) {
      return true;
    }
    
    // Suppress React Router "No routes matched" warnings (expected for some route setups)
    if (lowerArg.includes('no routes matched') || 
        lowerArg.includes('no routes matched location')) {
      return true;
    }
    
    // Suppress styled-components SVG component selector warnings
    if ((lowerArg.includes('svgarrowleft') || lowerArg.includes('svgarrowright')) &&
        (lowerArg.includes('is not a styled component') ||
         lowerArg.includes('cannot be referred to via component selector') ||
         lowerArg.includes('referring to other components'))) {
      return true;
    }
    
    // Suppress React lifecycle deprecation warnings (from third-party libraries)
    if (lowerArg.includes('unsafe_componentwillmount') ||
        lowerArg.includes('using unsafe_componentwillmount') ||
        lowerArg.includes('componentwillmount') ||
        lowerArg.includes('componentwillupdate') ||
        lowerArg.includes('has been renamed') ||
        (lowerArg.includes('unsafe') && lowerArg.includes('component'))) {
      return true;
    }
    
    // Suppress lifecycle method warnings
    if ((lowerArg.includes('componentwillmount') || 
         lowerArg.includes('componentwillupdate') ||
         lowerArg.includes('move code with side effects') ||
         lowerArg.includes('move data fetching code')) &&
        (lowerArg.includes('strict mode') || 
         lowerArg.includes('not recommended') ||
         lowerArg.includes('deprecated'))) {
      return true;
    }
    
    // Suppress React string ref warnings (from react-rte and other third-party libraries)
    if ((lowerArg.includes('string ref') || 
         lowerArg.includes('stringref') ||
         lowerArg.includes('contains the string ref')) &&
        (lowerArg.includes('will be removed') || 
         lowerArg.includes('use useref') ||
         lowerArg.includes('use createref') ||
         lowerArg.includes('editorcontainer') ||
         lowerArg.includes('leaf'))) {
      return true;
    }
    
    return false;
  };
  
  // Suppress warnings
  console.warn = (...args) => {
    // Check all arguments and also check the combined string representation
    const combinedString = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg && typeof arg === 'object') {
        return arg.message || arg.toString?.() || JSON.stringify(arg) || '';
      }
      return String(arg);
    }).join(' ');
    
    if (args.some(shouldSuppressWarning) || shouldSuppressWarning(combinedString)) {
      return;
    }
    originalWarn.apply(console, args);
  };
  
  // Suppress errors (findDOMNode warnings come through console.error in StrictMode)
  console.error = (...args) => {
    // Check all arguments and also check the combined string representation
    const combinedString = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg && typeof arg === 'object') {
        return arg.message || arg.toString?.() || JSON.stringify(arg) || '';
      }
      return String(arg);
    }).join(' ');
    
    if (args.some(shouldSuppressWarning) || shouldSuppressWarning(combinedString)) {
      return;
    }
    originalError.apply(console, args);
  };
}

function ThemeWrapper({ children }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get state from Redux store (client-side only)
  const state = mounted ? store.getState() : {};
  const layoutState = state.ChangeLayoutMode || {};

  const rtlValue = layoutState.rtlData || false;
  const darkModeValue = layoutState.data || false;
  const topMenuValue = layoutState.topMenu || false;

  // Memoize theme configuration to avoid recreating on every render
  const antdThemeConfig = useMemo(() => ({
    algorithm: darkModeValue ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      // Primary colors
      colorPrimary: theme['primary-color'],
      colorSuccess: theme['success-color'],
      colorWarning: theme['warning-color'],
      colorError: theme['error-color'],
      colorInfo: theme['info-color'],
      
      // Text colors
      colorText: theme['text-color'],
      colorTextSecondary: theme['text-color-secondary'],
      colorTextTertiary: theme['gray-color'],
      colorTextQuaternary: theme['light-color'],
      
      // Background colors
      colorBgContainer: theme['card-background'],
      colorBgLayout: theme['layout-body-background'],
      colorBgElevated: theme['card-background'],
      colorBgSpotlight: theme['bg-color-light'],
      
      // Border colors
      colorBorder: theme['border-color-base'],
      colorBorderSecondary: theme['border-color-light'],
      colorBorderTertiary: theme['border-color-normal'],
      
      // Fill colors
      colorFill: theme['bg-color-light'],
      colorFillSecondary: theme['bg-color-light'],
      colorFillTertiary: theme['bg-color-normal'],
      colorFillQuaternary: theme['bg-color-deep'],
      
      // Typography
      fontFamily: theme['font-family'],
      fontSize: parseInt(theme['font-size-base'].replace('px', '')),
      fontSizeHeading1: 38,
      fontSizeHeading2: 30,
      fontSizeHeading3: 24,
      fontSizeHeading4: 20,
      fontSizeHeading5: 16,
      fontSizeLG: 16,
      fontSizeSM: 12,
      fontSizeXL: 20,
      
      // Border radius
      borderRadius: parseInt(theme['border-radius-base'].replace('px', '')),
      borderRadiusLG: parseInt(theme['card-radius'].replace('px', '')),
      borderRadiusSM: 2,
      borderRadiusXS: 1,
      
      // Spacing
      padding: 16,
      paddingLG: 24,
      paddingSM: 12,
      paddingXS: 8,
      margin: 16,
      marginLG: 24,
      marginSM: 12,
      marginXS: 8,
      
      // Control heights
      controlHeight: parseInt(theme['input-height-base'].replace('px', '')),
      controlHeightSM: parseInt(theme['input-height-sm'].replace('px', '')),
      controlHeightLG: parseInt(theme['input-height-lg'].replace('px', '')),
      
      // Box shadows
      boxShadow: theme['box-shadow-base'],
      boxShadowSecondary: theme['card-shadow'],
      
      // Link colors
      colorLink: theme['link-color'],
      colorLinkHover: theme['link-hover'],
      colorLinkActive: theme['primary-color'],
    },
    components: {
      Button: {
        controlHeight: parseInt(theme['btn-height-large'].replace('px', '')),
        controlHeightSM: parseInt(theme['btn-height-small'].replace('px', '')),
        controlHeightXS: parseInt(theme['btn-height-extra-small'].replace('px', '')),
        colorPrimary: theme['primary-color'],
        colorPrimaryHover: theme['primary-hover'],
        colorText: theme['btn-default-color'],
        borderRadius: parseInt(theme['border-radius-base'].replace('px', '')),
        fontWeight: 500,
      },
      Card: {
        borderRadiusLG: parseInt(theme['card-radius'].replace('px', '')),
        boxShadow: theme['card-shadow'],
        colorBgContainer: theme['card-background'],
        colorBorderSecondary: theme['border-color-light'],
        paddingLG: parseInt(theme['card-padding-base'].replace('px', '')),
        headerBg: theme['card-head-background'],
      },
      Input: {
        controlHeight: parseInt(theme['input-height-base'].replace('px', '')),
        controlHeightSM: parseInt(theme['input-height-sm'].replace('px', '')),
        controlHeightLG: parseInt(theme['input-height-lg'].replace('px', '')),
        colorBorder: theme['input-border-color'],
        colorText: theme['text-color'],
        colorTextPlaceholder: theme['light-color'],
        borderRadius: parseInt(theme['border-radius-base'].replace('px', '')),
      },
      Layout: {
        bodyBg: theme['layout-body-background'],
        headerBg: theme['layout-header-background'],
        footerBg: theme['layout-footer-background'],
        siderBg: theme['layout-sider-background'],
        headerHeight: parseInt(theme['layout-header-height'].replace('px', '')),
        headerPadding: theme['layout-header-padding'],
        footerPadding: theme['layout-footer-padding'],
      },
      Menu: {
        colorBgContainer: theme['card-background'],
        colorText: theme['text-color'],
        colorTextSecondary: theme['text-color-secondary'],
        colorPrimary: theme['primary-color'],
        itemBg: theme['card-background'],
        itemSelectedBg: `${theme['primary-color']}10`,
        itemHoverBg: theme['bg-color-light'],
        itemColor: theme['text-color'],
        itemSelectedColor: theme['primary-color'],
        itemHoverColor: theme['primary-color'],
        borderRadius: parseInt(theme['border-radius-base'].replace('px', '')),
      },
    },
  }), [darkModeValue]);

  return (
    <ConfigProvider 
      direction={rtlValue ? 'rtl' : 'ltr'}
      theme={antdThemeConfig}
    >
      <AntApp>
        <ThemeProvider theme={{ ...theme, rtl: rtlValue, topMenu: topMenuValue, darkMode: darkModeValue }}>
          {children}
        </ThemeProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export function Providers({ children }) {
  // Using client-side authentication with Redux + localStorage
  // No NextAuth SessionProvider needed
  return (
    <Provider store={store}>
      <ThemeWrapper>{children}</ThemeWrapper>
    </Provider>
  );
}
