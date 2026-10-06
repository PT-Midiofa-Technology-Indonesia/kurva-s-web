import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPurchaseRequestCostRows } from '../get-purchase-request-cost-rows';

vi.mock('@/shared/lib/axios', () => ({
  default: { get: vi.fn() },
}));

const { default: mockAxios } = await import('@/shared/lib/axios');

describe('getPurchaseRequestCostRows API', () => {
  beforeEach(() => {
    vi.mocked(mockAxios.get).mockReset();
  });

  it('calls the cost-rows endpoint for the given boqItemId', async () => {
    vi.mocked(mockAxios.get).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: [] },
    });

    await getPurchaseRequestCostRows('item-1');

    expect(mockAxios.get).toHaveBeenCalledWith(
      '/v1/procurement/purchase-requests/cost-rows/item-1'
    );
  });

  it('maps the real backend response (array of type/label/items groups) into material/equipment/manpower sections', async () => {
    vi.mocked(mockAxios.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Data berhasil diambil.',
        data: [
          {
            type: 'material_tool',
            label: 'Material & Tools',
            items: [
              {
                id: 'item-mat-1',
                costCategory: 'material_cost',
                catalogType: 'App\\Models\\ItemCatalog',
                catalogId: 'cat-1',
                code: 'C',
                name: 'Cat',
                uom: { id: 'uom-1', code: 'M3', name: 'Meter Kubik' },
                volumeRab: 1,
                volumeCco: 2,
                existingPrQty: 0,
                maxQty: 1,
                remainingQty: 1,
                remarks: 'Cat putih',
              },
            ],
          },
          {
            type: 'service_rental',
            label: 'Service & Rental',
            items: [
              {
                id: 'item-equip-1',
                costCategory: 'equipment_cost',
                catalogType: 'App\\Models\\ItemCatalog',
                catalogId: 'cat-2',
                code: 'BT',
                name: 'Beton',
                uom: { id: 'uom-2', code: 'pcs', name: 'Pieces' },
                volumeRab: 1,
                volumeCco: 0,
                existingPrQty: 1,
                maxQty: 1,
                remainingQty: 0,
                remarks: null,
              },
              {
                id: 'item-manpower-1',
                costCategory: 'manpower_cost',
                catalogType: 'App\\Models\\ItemCatalog',
                catalogId: 'cat-3',
                code: 'TK',
                name: 'Tukang',
                uom: { id: 'uom-3', code: 'org', name: 'Orang' },
                volumeRab: 2,
                volumeCco: 0,
                existingPrQty: 0,
                maxQty: 2,
                remainingQty: 2,
                remarks: 'Shift malam',
              },
            ],
          },
        ],
      },
    });

    const result = await getPurchaseRequestCostRows('item-1');

    expect(result.sections).toEqual([
      {
        type: 'material_tool',
        label: 'Material & Tools',
        rows: [
          {
            id: 'item-mat-1',
            code: 'C',
            name: 'Cat',
            volumeRab: 1,
            cco: 2,
            existingPr: 0,
            remainingQty: 1,
            max: 1,
            vol: 0,
            volumeAct: 0,
            uom: 'Meter Kubik',
            remarks: 'Cat putih',
            disabled: false,
            disabledReason: undefined,
          },
        ],
      },
      {
        type: 'service_rental',
        label: 'Service & Rental',
        rows: [
          {
            id: 'item-equip-1',
            code: 'BT',
            name: 'Beton',
            volumeRab: 1,
            cco: 0,
            existingPr: 1,
            remainingQty: 0,
            max: 1,
            vol: 0,
            volumeAct: 0,
            uom: 'Pieces',
            remarks: '',
            disabled: false,
            disabledReason: undefined,
          },
          {
            id: 'item-manpower-1',
            code: 'TK',
            name: 'Tukang',
            volumeRab: 2,
            cco: 0,
            existingPr: 0,
            remainingQty: 2,
            max: 2,
            vol: 0,
            volumeAct: 0,
            uom: 'Orang',
            remarks: 'Shift malam',
            disabled: false,
            disabledReason: undefined,
          },
        ],
      },
    ]);
  });
});
