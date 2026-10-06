import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { VENDOR_CATALOG_LABELS } from '../../constants';
import { useItemCatalogImportExport } from '../../hooks/use-item-catalog-import-export';
import { useVendorItemCatalogPage } from '../../hooks/use-vendor-item-catalog-page';
import { VendorItemCatalogList } from '../VendorItemCatalogList';

vi.mock('../../hooks/use-vendor-item-catalog-page', () => ({
  useVendorItemCatalogPage: vi.fn(),
}));

vi.mock('../../hooks/use-item-catalog-import-export', () => ({
  useItemCatalogImportExport: vi.fn(),
}));

const mockRows = [
  {
    __draftId: '1',
    id: '1',
    itemCatalogId: 'ic1',
    price: 100000,
    isActive: true,
    code: 'IC001',
    name: 'Item 1',
    uomName: 'PCS',
    isNew: false,
    isDirty: false,
    isDeleted: false,
  },
  {
    __draftId: '2',
    id: '2',
    itemCatalogId: 'ic2',
    price: 250000,
    isActive: false,
    code: 'IC002',
    name: 'Item 2',
    uomName: 'KG',
    isNew: false,
    isDirty: false,
    isDeleted: false,
  },
];

const mockUseVendorItemCatalogPage = vi.mocked(useVendorItemCatalogPage);
const mockUseItemCatalogImportExport = vi.mocked(useItemCatalogImportExport);

const fileInputRef = { current: null };

function setupMocks(pageOverrides = {}, importExportOverrides = {}) {
  mockUseVendorItemCatalogPage.mockReturnValue({
    rows: mockRows,
    isLoading: false,
    isError: false,
    isDirty: false,
    isSaving: false,
    hasMore: false,
    isFetchingMore: false,
    loadMore: vi.fn(),
    itemCatalogOptions: [],
    itemCatalogHasMore: false,
    loadMoreItemCatalogs: vi.fn(),
    setItemCatalogSearch: vi.fn(),
    hasInvalidRows: false,
    addRow: vi.fn(),
    handleCellEdit: vi.fn(),
    handleDeleteRow: vi.fn(),
    handleRestoreRow: vi.fn(),
    handleSave: vi.fn(),
    handleCancel: vi.fn(),
    ...pageOverrides,
  } as unknown as ReturnType<typeof useVendorItemCatalogPage>);

  mockUseItemCatalogImportExport.mockReturnValue({
    fileInputRef,
    isDownloading: false,
    isImporting: false,
    handleDownloadTemplate: vi.fn(),
    handleImport: vi.fn(),
    ...importExportOverrides,
  } as unknown as ReturnType<typeof useItemCatalogImportExport>);
}

describe('VendorItemCatalogList Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders section title', () => {
    render(<VendorItemCatalogList vendorId="v1" />);
    expect(screen.getByText(VENDOR_CATALOG_LABELS.ITEM_CATALOG.TITLE)).toBeInTheDocument();
  });

  it('renders add row button when not dirty', () => {
    render(<VendorItemCatalogList vendorId="v1" />);
    expect(
      screen.getByRole('button', { name: VENDOR_CATALOG_LABELS.ITEM_CATALOG.BUTTONS.ADD_ROW })
    ).toBeInTheDocument();
  });

  it('renders save button when dirty', () => {
    setupMocks({ isDirty: true });
    render(<VendorItemCatalogList vendorId="v1" />);
    expect(
      screen.getByRole('button', { name: VENDOR_CATALOG_LABELS.ITEM_CATALOG.BUTTONS.SAVE_ALL })
    ).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<VendorItemCatalogList vendorId="v1" />);
    expect(screen.getByText(VENDOR_CATALOG_LABELS.ITEM_CATALOG.COLUMNS.CODE)).toBeInTheDocument();
    expect(screen.getByText(VENDOR_CATALOG_LABELS.ITEM_CATALOG.COLUMNS.NAME)).toBeInTheDocument();
    expect(screen.getByText(VENDOR_CATALOG_LABELS.ITEM_CATALOG.COLUMNS.PRICE)).toBeInTheDocument();
    expect(screen.getByText(VENDOR_CATALOG_LABELS.ITEM_CATALOG.COLUMNS.STATUS)).toBeInTheDocument();
  });

  it('renders item catalog data rows', async () => {
    render(<VendorItemCatalogList vendorId="v1" />);
    await waitFor(() => {
      expect(screen.getByText('IC001')).toBeInTheDocument();
      expect(screen.getByText('IC002')).toBeInTheDocument();
    });
  });

  it('renders empty message when no rows', () => {
    setupMocks({ rows: [] });
    render(<VendorItemCatalogList vendorId="v1" />);
    expect(screen.getByText(VENDOR_CATALOG_LABELS.ITEM_CATALOG.EMPTY)).toBeInTheDocument();
  });

  it('renders load more button when hasMore is true', () => {
    setupMocks({ hasMore: true });
    render(<VendorItemCatalogList vendorId="v1" />);
    expect(
      screen.getByRole('button', { name: VENDOR_CATALOG_LABELS.ITEM_CATALOG.BUTTONS.LOAD_MORE })
    ).toBeInTheDocument();
  });

  it('calls loadMore when load more button is clicked', async () => {
    const loadMore = vi.fn();
    setupMocks({ hasMore: true, loadMore });
    render(<VendorItemCatalogList vendorId="v1" />);

    await userEvent.click(
      screen.getByRole('button', { name: VENDOR_CATALOG_LABELS.ITEM_CATALOG.BUTTONS.LOAD_MORE })
    );
    expect(loadMore).toHaveBeenCalledOnce();
  });

  describe('import/export dropdown', () => {
    it('renders download template menu item', async () => {
      render(<VendorItemCatalogList vendorId="v1" />);
      // Open the MoreVertical dropdown
      const buttons = screen.getAllByRole('button');
      // The overflow menu button has no text — it's the last button in the action bar
      const overflowBtn = buttons.find((b) => !b.textContent?.trim());
      if (overflowBtn) await userEvent.click(overflowBtn);

      await waitFor(() => {
        expect(
          screen.getByText(VENDOR_CATALOG_LABELS.ITEM_CATALOG.BUTTONS.DOWNLOAD_TEMPLATE)
        ).toBeInTheDocument();
      });
    });

    it('calls handleDownloadTemplate when download template is clicked', async () => {
      const handleDownloadTemplate = vi.fn();
      setupMocks({}, { handleDownloadTemplate });
      render(<VendorItemCatalogList vendorId="v1" />);

      const buttons = screen.getAllByRole('button');
      const overflowBtn = buttons.find((b) => !b.textContent?.trim());
      if (overflowBtn) await userEvent.click(overflowBtn);

      await waitFor(() =>
        screen.getByText(VENDOR_CATALOG_LABELS.ITEM_CATALOG.BUTTONS.DOWNLOAD_TEMPLATE)
      );
      await userEvent.click(
        screen.getByText(VENDOR_CATALOG_LABELS.ITEM_CATALOG.BUTTONS.DOWNLOAD_TEMPLATE)
      );

      expect(handleDownloadTemplate).toHaveBeenCalledOnce();
    });

    it('renders import menu item', async () => {
      render(<VendorItemCatalogList vendorId="v1" />);

      const buttons = screen.getAllByRole('button');
      const overflowBtn = buttons.find((b) => !b.textContent?.trim());
      if (overflowBtn) await userEvent.click(overflowBtn);

      await waitFor(() => {
        expect(
          screen.getByText(VENDOR_CATALOG_LABELS.ITEM_CATALOG.BUTTONS.IMPORT)
        ).toBeInTheDocument();
      });
    });
  });

  it('calls handleImport when file is selected via hidden input', async () => {
    const handleImport = vi.fn();
    const ref = { current: document.createElement('input') };
    setupMocks({}, { handleImport, fileInputRef: ref });
    render(<VendorItemCatalogList vendorId="v1" />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'catalog.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    await userEvent.upload(fileInput, file);

    expect(handleImport).toHaveBeenCalledWith(file);
  });

  it('disables overflow menu button while downloading', () => {
    setupMocks({}, { isDownloading: true });
    render(<VendorItemCatalogList vendorId="v1" />);

    const buttons = screen.getAllByRole('button');
    const overflowBtn = buttons.find((b) => !b.textContent?.trim());
    expect(overflowBtn).toBeDisabled();
  });

  it('disables overflow menu button while importing', () => {
    setupMocks({}, { isImporting: true });
    render(<VendorItemCatalogList vendorId="v1" />);

    const buttons = screen.getAllByRole('button');
    const overflowBtn = buttons.find((b) => !b.textContent?.trim());
    expect(overflowBtn).toBeDisabled();
  });
});
