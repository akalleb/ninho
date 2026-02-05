'use client';

import { useEffect } from 'react';

/**
 * Prevents Flash of Unstyled Content (FOUC)
 * This component runs on the client side to show content once styles are loaded
 */
export default function PreventFOUC() {
  useEffect(() => {
    // Mark HTML as loaded once component mounts (styles should be loaded by then)
    document.documentElement.classList.add('loaded');
  }, []);

  return null;
}

