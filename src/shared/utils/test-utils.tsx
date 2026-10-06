import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  RenderOptions,
  render as rtlRender,
  screen,
  waitFor,
} from '@testing-library/react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import React, { ReactElement } from 'react';

import { Toaster } from 'sonner';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  const testQueryClient = createTestQueryClient();
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      <Toaster />
      <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
    </QueryClientProvider>
  );
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// re-export everything explicitly for better type support
// override render method
export { fireEvent, renderWithProviders as render, rtlRender, screen, waitFor };
