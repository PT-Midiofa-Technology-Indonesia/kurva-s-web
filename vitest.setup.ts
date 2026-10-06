import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from '@/mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  server.resetHandlers()
  cleanup()
})

afterAll(() => server.close())

import React from 'react'
// Mock radix-ui Portals
vi.mock('radix-ui', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    Popover: {
      ...actual.Popover,
      Portal: ({ children }: any) => React.createElement(React.Fragment, null, children),
    },
    Dialog: {
      ...actual.Dialog,
      Portal: ({ children }: any) => React.createElement(React.Fragment, null, children),
    },
    DropdownMenu: {
      ...actual.DropdownMenu,
      Portal: ({ children }: any) => React.createElement(React.Fragment, null, children),
    },
  };
});

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: any) {
    return React.createElement('img', props);
  },
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ id: '1' }),
}))

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock as any

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Polyfill setPointerCapture for vaul (Drawer) compatibility in jsdom
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn();
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn();
}
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = vi.fn(() => false);
}

// Mock toast to render messages in the DOM for easier testing
const toastText = (options: string | { title?: string }) =>
  typeof options === 'string' ? options : (options?.title ?? '');

const toastMock = {
  success: vi.fn((options) => {
    console.log('TOAST SUCCESS:', options);
    const el = document.createElement('div');
    el.textContent = toastText(options);
    document.body.appendChild(el);
  }),
  error: vi.fn((options) => {
    console.log('TOAST ERROR:', options);
    const el = document.createElement('div');
    el.textContent = toastText(options);
    document.body.appendChild(el);
  }),
  warning: vi.fn((options) => {
    const el = document.createElement('div');
    el.textContent = toastText(options);
    document.body.appendChild(el);
  }),
  info: vi.fn((options) => {
    const el = document.createElement('div');
    el.textContent = toastText(options);
    document.body.appendChild(el);
  }),
  loading: vi.fn(),
  progress: vi.fn(),
  dismiss: vi.fn(),
};

vi.mock('@/shared/lib/toast', () => ({ toast: toastMock }));
vi.mock('@/lib/toast', () => ({ toast: toastMock }));
