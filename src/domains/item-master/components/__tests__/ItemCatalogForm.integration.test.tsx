import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { ITEM_CATALOG_LABELS } from '../../constants';
import { ItemCatalogForm } from '../ItemCatalogForm';

describe('ItemCatalogForm Integration', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders all required form fields', async () => {
    render(<ItemCatalogForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Kode Item Catalog/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nama Item Catalog/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Item Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Item Category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/UoM/i)).toBeInTheDocument();
    });
  });

  it('renders boolean fields as select dropdowns', async () => {
    render(<ItemCatalogForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Item Dapat Dialokasikan/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Item Aset/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Kelola Item Sebagai Stok/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Item Sensitif/i)).toBeInTheDocument();
    });
  });

  it('displays create mode button text', async () => {
    render(<ItemCatalogForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: ITEM_CATALOG_LABELS.FORM.BUTTONS.SAVE })
      ).toBeInTheDocument();
    });
  });

  it('displays edit mode button text', async () => {
    render(<ItemCatalogForm mode="edit" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: ITEM_CATALOG_LABELS.FORM.BUTTONS.SAVE_CHANGE })
      ).toBeInTheDocument();
    });
  });

  it('calls onCancel when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<ItemCatalogForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const backButton = await screen.findByRole('button', {
      name: ITEM_CATALOG_LABELS.FORM.BUTTONS.BACK,
    });
    await user.click(backButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('submit button is disabled when form is invalid', async () => {
    render(<ItemCatalogForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const submitButton = await screen.findByRole('button', {
      name: ITEM_CATALOG_LABELS.FORM.BUTTONS.SAVE,
    });

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('submit button is disabled when submitting', async () => {
    render(
      <ItemCatalogForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    const submitButton = await screen.findByRole('button', {
      name: ITEM_CATALOG_LABELS.FORM.BUTTONS.SAVING,
    });

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('back button is disabled when submitting', async () => {
    render(
      <ItemCatalogForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    const backButton = await screen.findByRole('button', {
      name: ITEM_CATALOG_LABELS.FORM.BUTTONS.BACK,
    });

    await waitFor(() => {
      expect(backButton).toBeDisabled();
    });
  });

  it('item category field is disabled when item type is not selected', async () => {
    render(<ItemCatalogForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      const itemCategory = screen.getByLabelText(/Item Category/i);
      expect(itemCategory).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('item category field is enabled when item type is pre-filled in edit mode', async () => {
    render(
      <ItemCatalogForm
        mode="edit"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        itemCatalog={
          {
            id: 'ic1',
            itemTypeId: 'type-1',
            itemCategoryId: 'cat-1',
            uomId: 'uom-1',
            code: 'IC001',
            name: 'Batu Bata',
            description: '',
            isAllocatable: true,
            isAsset: false,
            isStock: true,
            isSensitive: false,
            isActive: true,
            itemType: { id: 'type-1', name: 'Material' },
            itemCategory: { id: 'cat-1', name: 'Bata' },
            uom: { id: 'uom-1', name: 'Pcs' },
          } as any
        }
      />
    );

    await waitFor(() => {
      const itemCategory = screen.getByLabelText(/Item Category/i);
      expect(itemCategory).toHaveAttribute('aria-disabled', 'false');
    });
  });
});
