import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/shared/lib/axios';
import { getAssetCategories } from '../get-asset-categories';
import { getRegisterableUnits } from '../get-registerable-units';

vi.mock('@/shared/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe('Asset Management API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('serializes asset category active filter as numeric boolean query param', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'OK',
        data: [],
        meta: { currentPage: 1, perPage: 20, total: 0, lastPage: 1, from: null, to: null },
        links: { first: '', last: '', prev: null, next: null },
      },
    });

    await getAssetCategories({
      page: 1,
      perPage: 20,
      search: 'fur',
      isActive: true,
      depreciationMethod: 'straight_line',
      sortBy: 'name',
      sortOrder: 'asc',
    });

    expect(mockedApi.get).toHaveBeenCalledWith('/v1/asset-categories', {
      params: {
        page: 1,
        perPage: 20,
        search: 'fur',
        isActive: 1,
        depreciationMethod: 'straight_line',
        sortBy: 'name',
        sortOrder: 'asc',
      },
    });
  });

  it('serializes registerable unit showAll filter as numeric boolean query param', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'OK',
        data: [],
      },
    });

    await getRegisterableUnits({
      companyId: 'company-1',
      search: 'laptop',
      showAll: false,
      warehouseId: 'in_project',
    });

    expect(mockedApi.get).toHaveBeenCalledWith('/v1/asset-registrations/registerable-units', {
      params: {
        search: 'laptop',
        showAll: 0,
        warehouseId: 'in_project',
      },
      headers: { 'X-Company-Id': 'company-1' },
    });
  });
});
