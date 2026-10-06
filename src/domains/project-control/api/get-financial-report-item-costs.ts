import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import {
  type FinancialReportItem,
  type FinancialReportItemRaw,
  mapFinancialReportItem,
} from './get-financial-report';

export interface FinancialReportCostItem {
  id: string;
  code: string;
  name: string;
  unitPriceRab: number;
  amountRab: number;
  costUsed: number;
  budgetRemaining: number;
  isOverbudget: boolean;
}

/** Raw shape from the backend — numeric fields sometimes arrive as strings (matches ProjectBOQItem convention). */
interface FinancialReportCostItemRaw {
  id: string;
  code: string;
  name: string;
  unitPriceRab: number | string | null;
  totalPriceRab: number | string | null;
  totalPriceActual: number | string | null;
  budgetRemainingRab: number | string | null;
  isOverbudgetRab: boolean;
}

function mapFinancialReportCostItem(raw: FinancialReportCostItemRaw): FinancialReportCostItem {
  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    unitPriceRab: Number(raw.unitPriceRab ?? 0),
    amountRab: Number(raw.totalPriceRab ?? 0),
    costUsed: Number(raw.totalPriceActual ?? 0),
    budgetRemaining: Number(raw.budgetRemainingRab ?? 0),
    isOverbudget: raw.isOverbudgetRab,
  };
}

export interface FinancialReportCostCategory {
  category: string;
  categoryName: string;
  items: FinancialReportCostItem[];
}

interface RawFinancialReportCostCategory {
  category: string;
  categoryName: string;
  items: FinancialReportCostItemRaw[];
}

export interface GetFinancialReportItemCostsResponse {
  item: FinancialReportItem;
  costs: FinancialReportCostCategory[];
}

interface RawGetFinancialReportItemCostsData {
  item: FinancialReportItemRaw;
  costs: RawFinancialReportCostCategory[];
}

export async function getFinancialReportItemCosts(
  projectId: string,
  itemId: string
): Promise<GetFinancialReportItemCostsResponse> {
  try {
    const { data } = await api.get<ApiSuccessResponse<RawGetFinancialReportItemCostsData>>(
      getApiPath(`/projects/${projectId}/financial-report/items/${itemId}`)
    );
    return {
      item: mapFinancialReportItem(data.data.item),
      costs: data.data.costs.map((category) => ({
        category: category.category,
        categoryName: category.categoryName,
        items: category.items.map(mapFinancialReportCostItem),
      })),
    };
  } catch (error: unknown) {
    handleApiError(error);
  }
}
