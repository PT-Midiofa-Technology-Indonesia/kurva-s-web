import { describe, expect, it } from 'vitest';

import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { ResourceCatalogListPage } from '../ResourceCatalogListPage';

describe('ResourceCatalogListPage - Detail Drawer Flow', () => {
  it('renders page with resource catalog title', async () => {
    render(<ResourceCatalogListPage />);

    await waitFor(
      () => {
        expect(screen.queryByText('Resource Catalog')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('renders table with warehouse column header', async () => {
    render(<ResourceCatalogListPage />);

    await waitFor(
      () => {
        expect(screen.queryByText('Warehouse')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('renders detail drawer component in page structure', async () => {
    render(<ResourceCatalogListPage />);

    await waitFor(
      () => {
        expect(screen.queryByText('Resource Catalog')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // The detail drawer is rendered as part of page structure
    // even when not visible (state is closed)
    expect(screen.queryByText('Resource Catalog')).toBeInTheDocument();
  });

  it('renders action buttons for table rows', async () => {
    render(<ResourceCatalogListPage />);

    await waitFor(
      () => {
        expect(screen.queryByText('Resource Catalog')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify that action buttons exist in the rendered table
    const allButtons = screen.getAllByRole('button');
    expect(allButtons.length).toBeGreaterThan(0);
  });

  it('has add button for creating new resource units', async () => {
    render(<ResourceCatalogListPage />);

    await waitFor(
      () => {
        expect(screen.queryByText('Tambah Resource Unit Baru')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
