import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/shared/lib/axios';
import { getTaxTypes } from '../get-tax-types';

vi.mock('@/shared/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe('getTaxTypes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests tax type dropdown options from shared endpoint', async () => {
    const response = {
      data: {
        success: true,
        message: 'Data berhasil diambil.',
        data: [{ id: 'tax-type-1', code: 'PPN', name: 'PPN', category: 'vat' }],
      },
    } as const;

    mockedApi.get.mockResolvedValueOnce(response);

    const result = await getTaxTypes();

    expect(mockedApi.get).toHaveBeenCalledWith('/v1/tax-types');
    expect(result).toEqual(response.data);
  });
});
