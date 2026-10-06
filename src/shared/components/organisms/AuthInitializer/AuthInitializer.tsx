'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/domains/auth/store';

// Initialize auth state from sessionStorage/cookies synchronously on mount
// This must run before any API calls, so they have access to the token
export function AuthInitializer() {
  useEffect(() => {
    // Load tokens from sessionStorage into Zustand state
    // This happens immediately on mount, before child components render
    useAuthStore.getState().loadFromStorage();
  }, []);

  return null;
}
