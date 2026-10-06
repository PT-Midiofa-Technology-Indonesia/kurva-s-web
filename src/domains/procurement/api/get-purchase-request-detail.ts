import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type {
  PurchaseRequestDetail,
  PurchaseRequestDetailItem,
} from '../types/purchase-request-detail';

// ── Raw API types ──

interface RawUom {
  id: string;
  group: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RawRequestedBy {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  userType: string;
  companies: Array<{ id: string; name: string; isActive: boolean }>;
  roles: Array<{ id: number; name: string; permissions: string[] }>;
  permissions: string[];
  createdAt: string;
}

interface RawBoqItemCost {
  id: string;
  boqItemId: string;
  costCategory: string;
  catalogType: string;
  catalogId: string;
  code: string;
  name: string;
  volumeRab: string;
  volumeCco: string;
  volumeActual: number | null;
  uomId: string;
  durationRab: string | null;
  durationCco: string | null;
  durationActual: string | null;
  durationUomId: string | null;
  unitPriceRab: string | null;
  unitPriceCco: string | null;
  unitPriceActual: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  totalPriceRab: number;
  totalPriceCco: number;
  totalPriceActual: number | null;
}

interface RawBoqItem {
  id: string;
  boqId: string;
  code: string;
  name: string;
  level: number;
  isFinalLevel: boolean;
  [key: string]: unknown;
}

interface RawPurchaseRequestItem {
  id: string;
  purchaseRequestId: string;
  purchaseRequestCode: string;
  boqItem: RawBoqItem | null;
  boqItemCost: RawBoqItemCost | null;
  costCategory: string;
  catalogType: string;
  catalogId: string;
  catalogName: string;
  quantity: number;
  remainingQuantity: number;
  uom: RawUom;
  status: string;
  approvalRequestId: string | null;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

interface RawPurchaseRequestDetail {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  companyId: string;
  companyName: string;
  code: string;
  type: string;
  typeLabel: string;
  source: string;
  sourceLabel: string;
  dateRequest: string;
  dateRequired: string;
  requestedBy: RawRequestedBy;
  status: string;
  statusLabel: string;
  notes: string | null;
  isActive: boolean;
  items: RawPurchaseRequestItem[];
  createdAt: string;
  updatedAt: string;
}

// ── Status label lookup ──

const ITEM_STATUS_LABELS: Record<string, string> = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
  draft: 'Draft',
  waiting_approval: 'Waiting Approval',
};

// ── Mapper ──

function mapItem(raw: RawPurchaseRequestItem): PurchaseRequestDetailItem {
  return {
    id: raw.id,
    code: raw.boqItem?.code ?? raw.boqItemCost?.code ?? '',
    materialName: raw.catalogName,
    quantity: raw.quantity,
    remainingQuantity: raw.remainingQuantity,
    uom: raw.uom?.name ?? '',
    status: raw.status,
    statusLabel: ITEM_STATUS_LABELS[raw.status] ?? raw.status,
    remarks: raw.remarks,
  };
}

function mapDetail(raw: RawPurchaseRequestDetail): PurchaseRequestDetail {
  return {
    id: raw.id,
    code: raw.code,
    projectId: raw.projectId,
    projectCode: raw.projectCode,
    projectName: raw.projectName,
    companyId: raw.companyId,
    companyName: raw.companyName,
    type: raw.type,
    typeLabel: raw.typeLabel,
    source: raw.source,
    sourceLabel: raw.sourceLabel,
    dateRequest: raw.dateRequest,
    dateRequired: raw.dateRequired,
    requestedBy: {
      id: raw.requestedBy.id,
      name: raw.requestedBy.name,
      email: raw.requestedBy.email,
      phoneNumber: raw.requestedBy.phoneNumber,
    },
    status: raw.status,
    statusLabel: raw.statusLabel,
    notes: raw.notes,
    items: raw.items.map(mapItem),
  };
}

// ── API call ──

export async function getPurchaseRequestDetail(
  id: string,
  companyId?: string
): Promise<PurchaseRequestDetail> {
  try {
    const { data } = await api.get<ApiSuccessResponse<RawPurchaseRequestDetail>>(
      getApiPath(`/procurement/purchase-requests/${id}`),
      {
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return mapDetail(data.data);
  } catch (error: unknown) {
    handleApiError(error);
  }
}
