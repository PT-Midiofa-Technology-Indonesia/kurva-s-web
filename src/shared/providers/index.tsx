'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

import { queryClient } from '@/lib/query-client';
import { reportWebVitals } from '@/lib/web-vitals';
import { RouteLoader } from '../components/atoms';
import { AuthInitializer, NetworkStatusNotifier } from '../components/organisms';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    reportWebVitals();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      queryClient.invalidateQueries();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <NetworkStatusNotifier />
      <RouteLoader />
      <Toaster position="bottom-right" richColors closeButton theme="light" visibleToasts={5} />
      {children}
    </QueryClientProvider>
  );
}
