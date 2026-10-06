import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type {
  PurchaseRequestCostRow,
  PurchaseRequestCostRowsData,
  PurchaseRequestCostSection,
} from '../types/purchase-request-cost-rows';

interface RawCostRowItem {
  id: string;
  costCategory: string;
  catalogType: string;
  catalogId: string;
  code: string;
  name: string;
  uom: { id: string; code: string; name: string } | null;
  volumeRab: number | null;
  volumeCco: number | null;
  volumeActual: number | null;
  volumeAct: number | null;
  existingPrQty: number | null;
  maxQty: number | null;
  remainingQty: number | null;
  remarks: string | null;
}

interface RawCostRowGroup {
  type: string;
  label: string;
  items: RawCostRowItem[];
}

function mapCostRowsResponse(groups: RawCostRowGroup[]): PurchaseRequestCostRowsData {
  const sections: PurchaseRequestCostSection[] = [];

  for (const group of groups) {
    const rows: PurchaseRequestCostRow[] = [];

    for (const item of group.items) {
      const max = item.maxQty ?? 0;
      const existingPr = item.existingPrQty ?? 0;
      const remaining = item.remainingQty ?? max - existingPr;
      rows.push({
        id: item.id,
        code: item.code,
        name: item.name,
        volumeRab: item.volumeRab ?? 0,
        cco: item.volumeCco ?? 0,
        volumeAct: item.volumeAct ?? 0,
        existingPr,
        remainingQty: remaining,
        max,
        vol: 0,
        uom: item.uom?.name ?? '',
        remarks: item.remarks ?? '',
        disabled: false,
        disabledReason: undefined,
      });
    }

    sections.push({
      type: group.type,
      label: group.label,
      rows,
    });
  }

  return { sections };
}

export async function getPurchaseRequestCostRows(
  boqItemId: string
): Promise<PurchaseRequestCostRowsData> {
  try {
    const { data } = await api.get<ApiSuccessResponse<RawCostRowGroup[]>>(
      getApiPath(`/procurement/purchase-requests/cost-rows/${boqItemId}`)
    );
    return mapCostRowsResponse(data.data);
  } catch (error: unknown) {
    handleApiError(error);
  }
}
