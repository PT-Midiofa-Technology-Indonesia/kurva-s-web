import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { ITEM_CATALOG_LABELS, ITEM_CATEGORY_LABELS, ITEM_MASTER_TABS } from '../../constants';
import { EditItemCatalogPage } from '../EditItemCatalogPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/master-data/item-master/1/edit',
  useSearchParams: () => new URLSearchParams(`tab=${ITEM_MASTER_TABS.ITEM_CATALOG}`),
  useParams: () => ({ id: '1' }),
}));

const mockItemTypes = [
  {
    id: '019e3f6a-4173-705c-aa00-4ff62c419fc9',
    code: 'MTL',
    name: 'Material',
    description: 'Material type',
    isActive: true,
    createdAt: '2026-05-19T08:46:28.000000Z',
    updatedAt: '2026-05-19T08:46:28.000000Z',
  },
];

const mockItemCategories = [
  {
    id: '019e3f6e-983c-722e-8a0d-be2f8c33231a',
    groupId: null,
    group: null,
    itemTypeId: mockItemTypes[0].id,
    itemType: { id: mockItemTypes[0].id, name: mockItemTypes[0].name },
    parentId: null,
    parent: null,
    code: 'CAT-001',
    name: 'Bahan Bangunan',
    description: '',
    isActive: true,
    createdAt: '2026-05-20T00:00:00.000000Z',
    updatedAt: '2026-05-20T00:00:00.000000Z',
  },
];

// Page 1 of the UoM list deliberately EXCLUDES the catalog's current UoM
// ('Zak Semen 50 Kg') so the selected value is not among the loaded options.
const mockUoms = Array.from({ length: 10 }, (_, i) => ({
  id: `019e3f70-0000-7000-8000-0000000000${String(i + 1).padStart(2, '0')}`,
  group: 'Unit',
  code: `UOM-${String(i + 1).padStart(2, '0')}`,
  name: `UoM ${String(i + 1).padStart(2, '0')}`,
  description: null,
  isActive: true,
  createdAt: '2026-05-19T08:46:28.000000Z',
  updatedAt: '2026-05-19T08:46:28.000000Z',
}));

const currentUom = {
  id: '019e3f70-9999-7000-8000-000000000099',
  name: 'Zak Semen 50 Kg',
  code: 'ZAK',
};

const mockItemCatalog = {
  id: '019e3f71-0000-7000-8000-000000000001',
  groupId: null,
  group: null,
  itemTypeId: mockItemTypes[0].id,
  itemType: { id: mockItemTypes[0].id, name: mockItemTypes[0].name },
  itemCategoryId: mockItemCategories[0].id,
  itemCategory: { id: mockItemCategories[0].id, name: mockItemCategories[0].name },
  uomId: currentUom.id,
  uom: currentUom,
  code: 'ICT-001',
  name: 'Semen 50kg',
  description: 'Semen portland 50 kg per sak',
  isAllocatable: true,
  isAsset: false,
  isStock: true,
  isSensitive: false,
  defaultPrice: 65000,
  isActive: true,
  createdAt: '2026-05-21T00:00:00.000000Z',
  updatedAt: '2026-05-21T00:00:00.000000Z',
};

const paginated = (data: unknown[]) => ({
  success: true,
  message: 'OK',
  data,
  meta: { currentPage: 1, perPage: 10, total: data.length, lastPage: 1, from: 1, to: data.length },
  links: { first: null, last: null, prev: null, next: null },
});

describe('EditItemCatalogPage Integration', () => {
  beforeEach(() => {
    mockPush.mockClear();
    server.use(
      http.get(getApiPath('/item-catalogs/:id'), () => {
        return HttpResponse.json({
          success: true,
          message: 'Item catalog berhasil diambil.',
          data: mockItemCatalog,
        });
      }),
      http.get(getApiPath('/item-types'), () => {
        return HttpResponse.json(paginated(mockItemTypes));
      }),
      http.get(getApiPath('/item-categories'), () => {
        return HttpResponse.json(paginated(mockItemCategories));
      }),
      http.get(getApiPath('/uoms'), () => {
        return HttpResponse.json({
          success: true,
          message: 'OK',
          data: mockUoms,
          meta: { currentPage: 1, perPage: 10, total: 11, lastPage: 2, from: 1, to: 10 },
          links: { first: null, last: null, prev: null, next: null },
        });
      })
    );
  });

  it('renders the item catalog edit form when tab is item-catalog', async () => {
    render(<EditItemCatalogPage itemCatalogId="1" />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: ITEM_CATALOG_LABELS.FORM.EDIT_TITLE })
      ).toBeInTheDocument();
    });
    expect(screen.getByText(ITEM_CATALOG_LABELS.FORM.FIELDS.NAME)).toBeInTheDocument();
  });

  it('does not render the item category edit content for the catalog tab', async () => {
    render(<EditItemCatalogPage itemCatalogId="1" />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: ITEM_CATALOG_LABELS.FORM.EDIT_TITLE })
      ).toBeInTheDocument();
    });
    expect(screen.queryByText(ITEM_CATEGORY_LABELS.FORM.EDIT_TITLE)).not.toBeInTheDocument();
  });

  it('shows the current uom in the UoM field even when it is not in the first loaded page', async () => {
    render(<EditItemCatalogPage itemCatalogId="1" />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: ITEM_CATALOG_LABELS.FORM.EDIT_TITLE })
      ).toBeInTheDocument();
    });
    expect(await screen.findByText(currentUom.name)).toBeInTheDocument();
  });
});
