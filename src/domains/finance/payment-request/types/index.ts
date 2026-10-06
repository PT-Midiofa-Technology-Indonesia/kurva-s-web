// ============================================================================
// Payment Request Types
// ============================================================================

export type PaymentRequestSourceType = 'cost_request' | 'purchase_order' | 'payroll';

export type PaymentRequestStatus =
  | 'pending'
  | 'approved'
  | 'processing'
  | 'paid'
  | 'partial_paid'
  | 'cancelled'
  | 'rejected';

export const PAYMENT_REQUEST_STATUS_LABELS: Record<PaymentRequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  processing: 'Processing',
  paid: 'Paid',
  partial_paid: 'Partial Paid',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

export const PAYMENT_REQUEST_SOURCE_TYPE_LABELS: Record<PaymentRequestSourceType, string> = {
  cost_request: 'Cost Request',
  purchase_order: 'Purchase Order',
  payroll: 'Payroll',
};

// ============================================================================
// Nested Entities
// ============================================================================

export interface PaymentRequestCreatedBy {
  id: string;
  name: string;
}

export interface PaymentRequestPurchaseRequestItem {
  id: string;
  purchaseRequestId: string;
  purchaseRequestCode: string;
  costCategory: string;
  catalogType: string;
  catalogId: string;
  catalogName: string;
  quantity: number;
  remainingQuantity: number;
  status: string;
  approvalRequestId: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequestSourceItemDetail {
  id: string;
  payrollComponentId?: string;
  payrollComponentCode?: string;
  componentName: string;
  componentCategory?: string | null;
  componentCategoryLabel?: string | null;
  amount: number;
  signedAmount?: number;
  referenceCount?: number | null;
  notes?: string | null;
  isDeduction?: boolean;
  sortOrder?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRequestSourceItem {
  id: string;
  purchaseOrderId?: string;
  catalog?: string;
  catalogName?: string;
  receiptNumber?: string;
  description?: string;
  purchaseRequestItem?: PaymentRequestPurchaseRequestItem;
  quantity?: number;
  unitPrice?: number;
  amount: number;
  remarks?: string | null;
  notes?: string | null;
  proofs?: PaymentRequestEventDocument[];
  employeeId?: string;
  employeeName?: string;
  employeeCode?: string | null;
  employeeGrade?: string | null;
  employeePosition?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  grossAmount?: number;
  deductionAmount?: number;
  netAmount?: number;
  itemsDetail?: PaymentRequestSourceItemDetail[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRequestSource {
  id: string;
  code: string;
  totalAmount: number;
  paymentMethod: string | null;
  paymentMethodLabel: string | null;
  periodType?: string | null;
  periodTypeLabel?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  items: PaymentRequestSourceItem[];
}

// ============================================================================
// Payment Request Event (payment history)
// ============================================================================

export interface PaymentRequestEventDocument {
  id: string;
  fileName: string;
  fileSize: number;
  url: string;
}

export interface PaymentRequestUploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  url: string;
  createdAt?: string;
}

export interface PaymentRequestEventPaidByUser {
  id: string;
  name: string;
}

export type PaymentRequestEventStatus = 'paid' | 'pending_clearance' | 'cleared';

export const PAYMENT_REQUEST_EVENT_STATUS_LABELS: Record<PaymentRequestEventStatus, string> = {
  paid: 'Paid',
  pending_clearance: 'Pending Clearance',
  cleared: 'Cleared',
};

export interface PaymentRequestEvent {
  id: string;
  paymentRequestId: string;
  amount: number;
  paymentMethod: string;
  paymentMethodLabel: string;
  status: PaymentRequestEventStatus;
  statusLabel: string;
  paidAt: string;
  paidBy: string;
  paidByName: string;
  paidByUser: PaymentRequestEventPaidByUser;
  clearedAt: string | null;
  clearedBy: string | null;
  clearedByName: string | null;
  checkNumber: string | null;
  checkIssueDate: string | null;
  checkEffectiveDate: string | null;
  isOverdueClearance: boolean;
  canMarkCleared: boolean;
  notes: string | null;
  isActive: boolean;
  documents: PaymentRequestEventDocument[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// List Item
// ============================================================================

export interface PaymentRequestCompany {
  id: string;
  name: string;
}

export interface PaymentRequestSummaryItem {
  total: number;
  amount: number;
}

export interface PaymentRequestSummary {
  pending: PaymentRequestSummaryItem;
  paid: PaymentRequestSummaryItem;
  overdue: PaymentRequestSummaryItem;
}

export interface PaymentRequest {
  id: string;
  code: string;
  companyId: string;
  companyName: string;
  company: PaymentRequestCompany;
  sourceType: PaymentRequestSourceType;
  sourceTypeLabel: string;
  sourceId: string;
  amount: number;
  dueDate: string;
  status: PaymentRequestStatus;
  statusLabel: string;
  isOverdue?: boolean;
  recipient?: string | null;
  recipientName?: string | null;
  description?: string | null;
  paidAmount: number;
  remainingAmount: number;
  totalAmount: number;
  notes: string | null;
  canPay: boolean;
  canCancel: boolean;
  isReadOnly: boolean;
  recommendedPaymentMethod?: string | null;
  recommendedPaymentMethodLabel?: string | null;
  source: Omit<PaymentRequestSource, 'items'>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Payment Document
// ============================================================================

export interface PaymentRequestDocument {
  id: string;
  documentTypeId: string;
  documentTypeName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: PaymentRequestCreatedBy;
  uploadedAt: string;
}

// ============================================================================
// Payment Method for payment action
// ============================================================================

export type PaymentMethodType = 'transfer' | 'giro' | 'cash';

export interface PaymentMethodPayload {
  id: string;
  order: number;
  paymentMethodType: PaymentMethodType;
  paymentMethodLabel: string;
  amount: number;
  notes?: string | null;
  issueDate?: string | null;
  effectiveDate?: string | null;
  bankName?: string | null;
  checkNumber?: string | null;
  documents?: PaymentRequestDocument[];
}

// ============================================================================
// Document Requirement
// ============================================================================

export interface PaymentRequestDocumentRequirement {
  id: string;
  documentTypeId: string;
  documentTypeName: string;
  documentTypeCode: string;
  allowedFileTypes: string | null;
  allowedMaxSize: number | null;
  isMandatory: boolean;
  isUploaded: boolean;
  uploadedDocuments: PaymentRequestUploadedDocument[];
}

export interface PaymentRequestPrePayCheck {
  canPay: boolean;
  missingDocuments: string[];
  message: string;
}

// ============================================================================
// Detail
// ============================================================================

export interface PaymentRequestDetail extends PaymentRequest {
  source: PaymentRequestSource;
  paymentRequestEvents: PaymentRequestEvent[];
  paymentDocuments?: PaymentRequestDocument[];
  documentRequirements?: PaymentRequestDocumentRequirement[];
  supportingDocuments?: PaymentRequestDocumentRequirement[];
  isNeedApproval?: boolean;
}
