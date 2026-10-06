import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';

import { render, screen, waitFor } from '@/shared/utils/test-utils';

import { BOQTemplateDetailPage } from '../BOQTemplateDetailPage';

const mockPush = vi.fn();
const mockParams = { id: 'tmpl-001' };
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockParams,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('BOQTemplateDetailPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders template info card after loading', async () => {
    const user = userEvent.setup();
    render(<BOQTemplateDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Informasi Template')).toBeInTheDocument();
    });

    // Info card is collapsed by default — expand it to see the fields
    const toggleButton = screen
      .getByText('Informasi Template')
      .parentElement?.querySelector('button');
    if (!toggleButton) throw new Error('Info card toggle button not found');
    await user.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Office Building')).toBeInTheDocument();
    });
    expect(screen.getByText('High Rise Building')).toBeInTheDocument();
    expect(screen.getByText('Aktif')).toBeInTheDocument();
  });

  it('renders BOQ tree section', async () => {
    render(<BOQTemplateDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Set BoQ Template')).toBeInTheDocument();
    });
    // Root node should be visible
    expect(screen.getByText('Pekerjaan Beton')).toBeInTheDocument();
  });

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<BOQTemplateDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Pekerjaan Beton')).toBeInTheDocument();
    });

    // PageHeader renders a back button (ChevronLeft icon button)
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/project-control/boq-management');
  });

  it('opens cost dialog when eye icon is clicked on leaf node', async () => {
    const user = userEvent.setup();
    render(<BOQTemplateDetailPage />);

    // Wait for tree to load — tree is fully expanded by default
    await waitFor(() => {
      expect(screen.getByText('Pengadukan Semen dan Pasir')).toBeInTheDocument();
    });

    // Click the eye icon on the leaf node (aria-label="Lihat detail")
    const eyeButton = screen.getByRole('button', { name: 'Lihat detail' });
    await user.click(eyeButton);

    // Dialog should open showing the leaf node name in the dialog title
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    // Name appears both in table cell and dialog title — getAllByText returns 2+
    const instances = screen.getAllByText('Pengadukan Semen dan Pasir');
    expect(instances.length).toBeGreaterThanOrEqual(2);
    // The dialog title specifically
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Pengadukan Semen dan Pasir');
  });

  it('shows cost sections in dialog after opening', async () => {
    const user = userEvent.setup();
    render(<BOQTemplateDetailPage />);

    // Tree is fully expanded by default
    await waitFor(() => {
      expect(screen.getByText('Pengadukan Semen dan Pasir')).toBeInTheDocument();
    });

    const eyeButton = screen.getByRole('button', { name: 'Lihat detail' });
    await user.click(eyeButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Cost sections should be present as accordion triggers
    expect(screen.getByText('Material Cost')).toBeInTheDocument();
    expect(screen.getByText('Equipment Cost')).toBeInTheDocument();
  });

  it('shows cost items in dialog from API response', async () => {
    const user = userEvent.setup();
    render(<BOQTemplateDetailPage />);

    // Tree is fully expanded by default
    await waitFor(() => {
      expect(screen.getByText('Pengadukan Semen dan Pasir')).toBeInTheDocument();
    });

    const eyeButton = screen.getByRole('button', { name: 'Lihat detail' });
    await user.click(eyeButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Cost items from the API response (mockItemCosts) should appear
    await waitFor(() => {
      expect(screen.getByText('Semen')).toBeInTheDocument();
    });
    expect(screen.getByText('Bata Merah')).toBeInTheDocument();
  });

  it('refetches fresh cost items after save then reopen', { timeout: 20000 }, async () => {
    const user = userEvent.setup();
    let getCostCallCount = 0;

    server.use(
      http.get(getApiPath('/boq-templates/:templateId/items/:itemId'), () => {
        getCostCallCount += 1;

        return HttpResponse.json({
          success: true,
          message: 'Data biaya item BOQ template berhasil diambil.',
          data: {
            item: {
              id: 'leaf-1',
              name: 'Pengadukan Semen dan Pasir',
              jobItemType: { id: 'job-1', name: 'Job' },
              weight: '10',
              isFinalLevel: true,
              children: [],
            },
            costs: [
              {
                category: 'material_cost',
                categoryName: 'Material Cost',
                items:
                  getCostCallCount === 1
                    ? []
                    : [
                        {
                          id: 'cost-1',
                          costCategory: 'material_cost',
                          catalogId: 'catalog-1',
                          code: 'MAT-001',
                          name: 'Semen Baru',
                          catalog: {
                            id: 'catalog-1',
                            code: 'MAT-001',
                            name: 'Semen Baru',
                          },
                        },
                      ],
              },
              {
                category: 'equipment_cost',
                categoryName: 'Equipment Cost',
                items: [],
              },
              {
                category: 'man_power_cost',
                categoryName: 'Man Power Cost',
                items: [],
              },
              {
                category: 'transport_cost',
                categoryName: 'Transport Cost',
                items: [],
              },
              {
                category: 'preliminery_cost',
                categoryName: 'Preliminery Cost',
                items: [],
              },
            ],
          },
        });
      }),
      http.post(getApiPath('/boq-templates/:templateId/items/:itemId/costs/sync'), () =>
        HttpResponse.json({
          success: true,
          message: 'Biaya item BOQ template berhasil disinkronisasi.',
          data: null,
        })
      )
    );

    render(<BOQTemplateDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Pengadukan Semen dan Pasir')).toBeInTheDocument();
    });

    const eyeButton = screen.getByRole('button', { name: 'Lihat detail' });
    await user.click(eyeButton);

    const dialog = await screen.findByRole('dialog');

    expect(screen.queryByText('Semen Baru')).not.toBeInTheDocument();

    const materialSection = within(dialog).getByTestId('cost-section-material_cost');
    await user.click(within(materialSection).getByRole('button', { name: 'Tambah' }));

    const saveButton = within(dialog).getByRole('button', { name: 'Simpan' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Lihat detail' }));

    await waitFor(() => {
      expect(screen.getByText('Semen Baru')).toBeInTheDocument();
    });
    expect(getCostCallCount).toBeGreaterThanOrEqual(2);
  });

  // ── Local search in BOQ tree ───────────────────────────────────────────────

  it('search filters tree to show only matching nodes', async () => {
    const user = userEvent.setup();
    render(<BOQTemplateDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Pekerjaan Beton')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Pencarian');
    await user.type(searchInput, 'Pondasi');

    await waitFor(() => {
      expect(screen.getByText('Pondasi')).toBeInTheDocument();
    });
    // Non-matching sibling-level content should be absent
    expect(screen.queryByText('Pengadukan Semen dan Pasir')).not.toBeInTheDocument();
  });

  it('search preserves full ancestor chain for a matching leaf node', async () => {
    const user = userEvent.setup();
    render(<BOQTemplateDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Pengadukan Semen dan Pasir')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Pencarian');
    await user.type(searchInput, 'Pengadukan');

    await waitFor(() => {
      expect(screen.getByText('Pengadukan Semen dan Pasir')).toBeInTheDocument();
    });
    // Every ancestor in the chain must remain visible as context
    expect(screen.getByText('Pekerjaan Beton')).toBeInTheDocument();
    expect(screen.getByText('Pondasi')).toBeInTheDocument();
    expect(screen.getByText('Galian Pondasi')).toBeInTheDocument();
  });

  it('search with no match shows empty tree', async () => {
    const user = userEvent.setup();
    render(<BOQTemplateDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Pekerjaan Beton')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Pencarian');
    await user.type(searchInput, 'XYZNOTFOUND');

    await waitFor(() => {
      expect(screen.queryByText('Pekerjaan Beton')).not.toBeInTheDocument();
    });
  });

  it('clearing search restores full tree', async () => {
    const user = userEvent.setup();
    render(<BOQTemplateDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Pekerjaan Beton')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Pencarian');
    await user.type(searchInput, 'Pondasi');

    await waitFor(() => {
      expect(screen.queryByText('Pengadukan Semen dan Pasir')).not.toBeInTheDocument();
    });

    await user.clear(searchInput);

    await waitFor(() => {
      expect(screen.getByText('Pengadukan Semen dan Pasir')).toBeInTheDocument();
    });
    expect(screen.getByText('Pekerjaan Beton')).toBeInTheDocument();
  });

  it('opens delete confirmation dialog and navigates back after delete', async () => {
    const user = userEvent.setup();
    render(<BOQTemplateDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Pekerjaan Beton')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /hapus/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Hapus Template BOQ')).toBeInTheDocument();
    });
    expect(screen.getByText(/Apakah Anda yakin ingin menghapus template/)).toBeInTheDocument();

    // There are now 2 delete buttons: the header delete button + the dialog confirm button
    // We want to click the dialog one (the last one)
    const deleteButtons = screen.getAllByRole('button', { name: /hapus/i });
    await user.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/project-control/boq-management');
    });
  });
});
