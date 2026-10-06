import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RouteLoader } from './RouteLoader';

vi.mock('nextjs-toploader', () => ({
  default: ({ color, height, zIndex, showSpinner }: any) => (
    <div
      data-testid="route-loader"
      data-color={color}
      data-height={height}
      data-z-index={zIndex}
      data-show-spinner={showSpinner}
    />
  ),
}));

describe('RouteLoader', () => {
  it('renders route loader component', () => {
    const { getByTestId } = render(<RouteLoader />);
    expect(getByTestId('route-loader')).toBeInTheDocument();
  });

  it('configures loader with correct color', () => {
    const { getByTestId } = render(<RouteLoader />);
    const loader = getByTestId('route-loader');
    expect(loader).toHaveAttribute('data-color', '#01aaa7');
  });

  it('configures loader with correct height', () => {
    const { getByTestId } = render(<RouteLoader />);
    const loader = getByTestId('route-loader');
    expect(loader).toHaveAttribute('data-height', '3');
  });

  it('configures loader with correct z-index', () => {
    const { getByTestId } = render(<RouteLoader />);
    const loader = getByTestId('route-loader');
    expect(loader).toHaveAttribute('data-z-index', '9999');
  });

  it('disables spinner in loader', () => {
    const { getByTestId } = render(<RouteLoader />);
    const loader = getByTestId('route-loader');
    expect(loader).toHaveAttribute('data-show-spinner', 'false');
  });
});
