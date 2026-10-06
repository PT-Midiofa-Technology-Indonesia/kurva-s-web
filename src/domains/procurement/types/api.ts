// ── Step 1: Projects with Approved PRs ──
export interface PoDraftProject {
  id: string;
  code: string;
  name: string;
}

// ── Step 1: Purchase Request ──
export interface PurchaseRequest {
  id: string;
  code: string;
  projectId: string;
  projectName: string;
  notes: string | null;
  source: 'manual' | 'bundle';
  sourceLabel: string;
  type: 'materialTool' | 'serviceRental';
  status: string;
  statusLabel: string;
  date: string;
}

// ── Step 2: Approved PR Item ──
export interface ApprovedPrItem {
  id: string;
  purchaseRequestId: string;
  purchaseRequestCode: string;
  catalogName: string | null;
  description: string | null;
  code: string;
  quantity: number;
  remainingQuantity: number;
  uom: { code: string; name: string };
  remarks: string | null;
}

// ── Step 2: Create Draft Request / Response ──
export interface CreatePoDraftPayload {
  projectId: string;
  type: 'materialTool' | 'serviceRental';
  notes?: string;
  items: { purchaseRequestItemId: string; quantity: number }[];
}

export interface CreatePoDraftResponse {
  id: string;
  code: string;
  status: string;
  projectId: string;
  projectName: string;
  type: string;
  items: { id: string; quantity: number }[];
}

// ── Step 3: PO Draft Detail (full) ──
export interface PoDraftQuoteOfferingDocument {
  id: string;
  title: string;
  code: string;
  file: {
    id: string;
    fileName: string;
    url: string;
  };
}

export interface PoDraftQuote {
  id: string;
  vendor: { id: string; name: string; code?: string; address?: string | null };
  unitPrice: number;
  totalPrice: number;
  referencePrice: number;
  notes: string | null;
  offeringDocument?: PoDraftQuoteOfferingDocument | null;
  isWinning?: boolean;
  quotedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PurchaseRequestItem = {
  id: string;
  purchaseRequestId: string;
  purchaseRequestCode: string;

  boqItem: BoqItem;
  boqItemCost: BoqItemCost;

  costCategory: string;
  catalogType: string;
  catalogId: string;
  catalogName: string;

  quantity: number;
  remainingQuantity: number;

  uom: Uom;

  status: string;
  approvalRequestId: string | null;
  remarks: string | null;

  createdAt: string;
  updatedAt: string;
};

export type BoqItem = {
  id: string;
  boqId: string;
  parentId: string;

  sortOrder: number;
  level: number;

  code: string;
  name: string;

  isFinalLevel: boolean;

  weight: number | null;
  limitBudgetPercentage: string;

  volumeRab: string;
  volumeCco: string;
  volumeActual: number | null;

  uomId: string;

  unitPriceMaterialRab: number;
  unitPriceMaterialCco: number;
  unitPriceMaterialActual: number;

  unitPriceWorkRab: number;
  unitPriceWorkCco: number;
  unitPriceWorkActual: number;

  totalPriceMaterialRab: number;
  totalPriceMaterialCco: number;
  totalPriceMaterialActual: number;

  totalPriceWorkRab: number;
  totalPriceWorkCco: number;
  totalPriceWorkActual: number;

  totalAmountRab: number;
  totalAmountCco: number;
  totalAmountActual: number;

  amountAfterLimitRab: number;

  scheduleStartDate: string | null;
  scheduleEndDate: string | null;

  remarks: string | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  taskMonitoring: TaskMonitoring;
};

export type TaskMonitoring = {
  assignedEmployees: unknown[];
  manpowerTask: number;
  qcTask: number;
  totalScheduleDays: number | null;
  weightItem: number;
  totalTask: number;
  totalDoneTask: number;
  percentageDoneTask: number;
  status: string;
};

export type BoqItemCost = {
  id: string;
  boqItemId: string;

  costCategory: string;
  catalogType: string;
  catalogId: string;

  code: string;
  name: string;

  volumeRab: string;
  volumeCco: string;
  volumeActual: string | number | null;

  uomId: string;

  durationRab: number | null;
  durationCco: number | null;
  durationActual: number | null;
  durationUomId: string | null;

  unitPriceRab: number | null;
  unitPriceCco: number | null;
  unitPriceActual: number | null;

  remarks: string | null;

  createdAt: string;
  updatedAt: string;

  totalPriceRab: number;
  totalPriceCco: number;
  totalPriceActual: number | null;
};

export type Uom = {
  id: string;
  group: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// ── Step 5: Finalized PO (from API response) ──
export interface PoDraftPoVendor {
  id: string;
  code: string;
  name: string;
  address: string | null;
}

export interface PoDraftPoWarehouse {
  id: string;
  code: string;
  name: string;
  address?: string | null;
}

export interface PoDraftPoItem {
  id: string;
  draftItemId: string;
  purchaseRequestItemId: string;
  catalogName: string;
  quantity: number;
  uomCode: string;
  unitPrice: number;
  totalPrice: number;
}

export interface PoDraftPoPaymentMethod {
  id: string;
  code: string;
  name: string;
  amount: number;
  notes?: string | null;
  issueDate?: string | null;
  effectiveDate?: string | null;
  bankName?: string | null;
  checkNumber?: string | null;
}

export interface PoDraftPoTax {
  id?: string;
  /** snake_case mirror of taxTypeId, sent by backend alongside camelCase */
  tax_type_id?: string;
  taxTypeId?: string;
  name?: string;
  code?: string;
  rate?: number;
  taxRate?: number;
  amount?: number;
  taxAmount?: number;
  effect?: 'ADDITION' | 'DEDUCTION' | string;
}

export interface PoCostBreakdownRow {
  label: string;
  amount: number;
  effect: 'BASE' | 'ADDITION' | 'DEDUCTION' | string;
}

export interface PoCostBreakdown {
  title?: string;
  dpp?: number;
  taxAddition?: number;
  taxDeduction?: number;
  netTax?: number;
  totalPayable?: number;
  rows?: PoCostBreakdownRow[];
}

export interface PoDraftPo {
  id: string;
  vendor: PoDraftPoVendor;
  dueDate: string | null;
  warehouseId: string | null;
  warehouse: PoDraftPoWarehouse | null;
  paymentMethods: PoDraftPoPaymentMethod[];
  items: PoDraftPoItem[];
  taxes?: PoDraftPoTax[];
  costBreakdown?: PoCostBreakdown;
  subtotal?: number;
  subtotalAmount?: number;
  taxAddition?: number;
  taxDeduction?: number;
  taxAmount?: number;
  totalAmount: number;
  totalPrice?: number;
  totalPayable?: number;
  vendorPayableAmount?: number;
  grandTotal?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PoDraftDetailItem {
  id: string;
  purchaseRequestItem: PurchaseRequestItem;
  materialName: string;
  code: string;
  quantity: number;
  remainingQty: number;
  uom: string;
  quotes: PoDraftQuote[];
  selectedVendor: PoDraftPoVendor | null;
  createdAt: string;
  updatedAt: string;
}

export interface PoDraftDetail {
  id: string;
  code: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  projectWarehouse: PoDraftPoWarehouse | null;
  companyId: string;
  companyName: string;
  type: 'materialTool' | 'serviceRental';
  status: string;
  statusLabel: string;
  notes: string | null;
  offeringDocFileType: string | null;
  isVendorSelected: boolean;
  isActive: boolean;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  items: PoDraftDetailItem[];
  pos: PoDraftPo[];
  costBreakdown?: PoCostBreakdown;
  createdAt: string;
  updatedAt: string;
}

// ── Step 3: Upsert Quote ──
export interface UpsertQuotePayload {
  draftItemId: string;
  vendorId: string;
  unitPrice: number;
  notes?: string;
}

// ── Step 3: Upload Offering Document ──
export interface UploadOfferingDocPayload {
  vendorId: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  file: File;
  notes?: string;
}

// ── Step 4: Pick Winner ──
export interface PickWinnerPayload {
  vendorId: string;
}

// ── Step 5: Finalize ──
export interface FinalizePoPaymentMethod {
  payment_type_id: string;
  amount: number;
  issue_date?: string | null;
  effective_date?: string | null;
  bank_name?: string | null;
  check_number?: string | null;
  notes?: string | null;
}

export interface FinalizePoTax {
  tax_type_id: string;
  rate: number;
}

export interface FinalizePoPayload {
  vendor_id: string;
  due_date: string;
  warehouse_id: string;
  notes?: string;
  remarks?: string;
  taxes?: FinalizePoTax[];
  payment_methods: FinalizePoPaymentMethod[];
}

export interface FinalizePoDraftPayload {
  pos: FinalizePoPayload[];
}
