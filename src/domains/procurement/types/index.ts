export interface PurchaseRequestRequestedBy {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  userType: string;
}

export interface PurchaseRequestItem {
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
  requestedBy: PurchaseRequestRequestedBy;
  status: string;
  statusLabel: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type {
  PurchaseOrderRatingCategory,
  PurchaseOrderRatingCategoryScoreInput,
  PurchaseOrderRatingEnvelope,
  PurchaseOrderRatingPayload,
  PurchaseOrderRatingRater,
  PurchaseOrderRatingRecord,
  PurchaseOrderRatingScore,
  PurchaseOrderRatingSource,
  PurchaseOrderRatingVendor,
} from './purchase-order-rating';
