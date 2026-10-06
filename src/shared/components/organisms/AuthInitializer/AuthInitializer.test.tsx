import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AuthInitializer } from './AuthInitializer';

const mockLoadFromStorage = vi.fn();

vi.mock('@/domains/auth/store', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      loadFromStorage: mockLoadFromStorage,
    })),
  },
}));

describe('AuthInitializer', () => {
  beforeEach(() => {
    mockLoadFromStorage.mockClear();
  });

  it('renders without error', () => {
    const { container } = render(<AuthInitializer />);
    expect(container).toBeInTheDocument();
  });

  it('returns null element', () => {
    const { container } = render(<AuthInitializer />);
    expect(container.firstChild).toBeNull();
  });

  it('calls loadFromStorage on mount', () => {
    render(<AuthInitializer />);
    expect(mockLoadFromStorage).toHaveBeenCalled();
  });

  it('calls loadFromStorage only once', () => {
    const { rerender } = render(<AuthInitializer />);
    expect(mockLoadFromStorage).toHaveBeenCalledTimes(1);

    rerender(<AuthInitializer />);
    expect(mockLoadFromStorage).toHaveBeenCalledTimes(1);
  });

  it('initializes auth state', () => {
    render(<AuthInitializer />);
    expect(mockLoadFromStorage).toHaveBeenCalled();
  });

  it('has no visible output', () => {
    const { container } = render(<AuthInitializer />);
    const html = container.innerHTML;
    expect(html).toBe('');
  });
});
