import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AssetCatalogRoute from '../../../../../app/(protected)/asset-management/asset-catalog/page';
import AssetCategoryRoute from '../../../../../app/(protected)/asset-management/asset-category/page';
import AssetManagementRoute from '../../../../../app/(protected)/asset-management/page';

const { mockRedirect } = vi.hoisted(() => ({
  mockRedirect: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

vi.mock('@/domains/asset-management', () => ({
  ASSET_MANAGEMENT_ROUTES: {
    ASSET_CATALOG: '/asset-management/asset-catalog',
  },
  AssetCatalogPage: () => <div>Asset Catalog Route Content</div>,
  AssetCategoryPage: () => <div>Asset Category Route Content</div>,
}));

describe('Asset Management routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects the parent route to Asset Catalog', () => {
    AssetManagementRoute();

    expect(mockRedirect).toHaveBeenCalledWith('/asset-management/asset-catalog');
  });

  it('renders only Asset Catalog content on the catalog route', () => {
    render(<AssetCatalogRoute />);

    expect(screen.getByText('Asset Catalog Route Content')).toBeInTheDocument();
    expect(screen.queryByText('Asset Category Route Content')).not.toBeInTheDocument();
  });

  it('renders only Asset Category content on the category route', () => {
    render(<AssetCategoryRoute />);

    expect(screen.getByText('Asset Category Route Content')).toBeInTheDocument();
    expect(screen.queryByText('Asset Catalog Route Content')).not.toBeInTheDocument();
  });
});
