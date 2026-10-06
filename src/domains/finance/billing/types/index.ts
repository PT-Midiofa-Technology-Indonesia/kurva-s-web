// ============================================================================
// Billing Primitive Types
// ============================================================================

export type BillingStatus = 'draft' | 'invoiced' | 'pendingClearance' | 'paid' | 'cancelled';
export type BillingType =
  | 'lumsum'
  | 'lumpsum'
  | 'unit_price'
  | 'progress'
  | 'retention'
  | 'downPayment'
  | 'other';
export type BillingPaymentMethod = 'cash' | 'transfer' | 'check';
export type BillingProjectListStatus = 'has_billing' | 'no_billing' | string;

export interface BillingUserRef {
  id: string;
  name: string;
}

export interface BillingCompanyRef {
  id: string;
  name: string;
}

export interface BillingClientRef {
  id: string;
  name: string;
}

export interface BillingProjectTypeRef {
  id: string;
  name: string;
  code?: string;
}

export interface BillingProjectRef {
  id: string;
  code: string;
  name: string;
}

// ============================================================================
// Billing Record Types
// ============================================================================

export interface BillingProgressItem {
  id: string;
  billingId: string;
  boqItemId: string;
  boqItemName: string;
  boqItemCode: string;
  initialProgressPercentage: number;
  progressPercentage: number;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillingScheduleHistory {
  id?: string;
  billedAt: string;
  dueDate: string;
  changeReason: string | null;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string | null;
  changedBy?: string | null;
  changedByName?: string | null;
  changedAt?: string;
  changedByUser?: BillingUserRef | null;
}

export interface Billing {
  id: string;
  code: string;
  companyId: string;
  projectId: string;
  billingType: BillingType | string;
  termNumber?: number | null;
  percentage?: number | null;
  amount: number | null;
  amountAfterTax?: number | null;
  status: BillingStatus;
  billedAt: string;
  dueDate: string;
  paidAt: string | null;
  paidBy: string | null;
  paymentMethod: BillingPaymentMethod | string | null;
  clearedAt: string | null;
  clearedBy: string | null;
  checkNumber: string | null;
  checkIssueDate: string | null;
  checkEffectiveDate: string | null;
  isOverdueClearance?: boolean;
  notes: string | null;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company: BillingCompanyRef;
  project: BillingProjectRef;
  createdByUser: BillingUserRef;
  paidByUser?: BillingUserRef | null;
  clearedByUser?: BillingUserRef | null;
  progressItems: BillingProgressItem[];
  scheduleHistories: BillingScheduleHistory[];
}

export interface BillingDetailSummary {
  paidBillingPercentage: number;
  readyToBillPercentage: number;
  unworkedPercentage: number;
  paidBillingAmount: number;
  readyToBillAmount: number;
  remainingBillingAmount: number;
}

export interface BillingProjectDetailProject extends BillingProjectRef {
  description: string | null;
  currentStage: string;
  currentStageName: string;
  estimatedValue: number | null;
  totalValue: number | null;
  actualValue: number | null;
  projectStartDate: string | null;
  projectEndDate: string | null;
  tenderSubmissionDeadline: string | null;
  outcomeReason: string | null;
  isActive: boolean;
  statusBoqPlanning: boolean;
  statusBoqFinal: boolean;
  statusBoqExecution: boolean;
  isRabComplete: boolean;
  isLimitBudgetComplete: boolean;
  isCcoComplete: boolean;
  hasProjectHierarchy: boolean;
  hasProjectWarehouse: boolean;
  company: BillingCompanyRef;
  client: BillingClientRef | null;
  createdBy: BillingUserRef;
  projectType: BillingProjectTypeRef | null;
  workStartTime: string | null;
  workEndTime: string | null;
  workDays: string[];
  startedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  pic?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export interface BillingProjectDocumentRequirement {
  id: string;
  documentTypeId: string;
  documentTypeName: string;
  documentTypeCode: string;
  allowedFileTypes: string;
  allowedMaxSize: number | null;
  isMandatory: boolean;
  isUploaded: boolean;
}

export interface BillingProjectDetail {
  project: BillingProjectDetailProject;
  documentRequirements: BillingProjectDocumentRequirement[];
  summary: BillingDetailSummary;
  billing: {
    billingNextCode?: string;
    nextTerm?: number;
    active: Billing[];
    history: Billing[];
  };
}

// ============================================================================
// Project Billing List Types
// ============================================================================

export interface BillingProjectListBillingSummary {
  initialProgressPercentage: number;
  progressPercentage: number;
  contractValue: number;
  outstanding: number;
  status: BillingProjectListStatus;
  statusLabel: string;
}

export interface BillingProjectListItem {
  id: string;
  projectId?: string;
  code: string;
  name: string;
  client: BillingClientRef | null;
  projectType: BillingProjectTypeRef | null;
  billing: BillingProjectListBillingSummary;
}

// ============================================================================
// Progress Types
// ============================================================================

export interface BillingProgressTreeItem {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  level: number;
  sortOrder: number;
  actualProgress?: number;
  previousBill?: number;
  readyToBill?: number;
  source?: string[];
  children: BillingProgressTreeItem[];
}

export interface BillingProgressProject {
  id: string;
  code: string;
  name: string;
  client: BillingClientRef | null;
  projectType: BillingProjectTypeRef | null;
}

export interface BillingProgressDetail {
  project: BillingProgressProject;
  items: BillingProgressTreeItem[];
}

export interface BillingProgressDetailItem {
  boqItemId: string;
  boqName: string;
  weightPercentage: number;
  actualProgressPercentage: number;
  billedProgressPercentage: number;
  billingAmount: number;
}

export interface BillingProgressDetailBilling {
  id: string;
  code: string;
  termNumber: number;
  projectId: string;
  projectName: string;
}

export interface BillingProgressDetailSummary {
  totalBillingAmount: number;
}

export interface BillingProgressDetailData {
  billing: BillingProgressDetailBilling;
  summary: BillingProgressDetailSummary;
  items: BillingProgressDetailItem[];
}

// ============================================================================
// Calendar Types
// ============================================================================

export interface BillingCalendarItem {
  id: string;
  code: string;
  companyId: string;
  projectId: string;
  projectName: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: BillingStatus;
}

export interface BillingCalendarDay {
  date: string;
  totalCount: number;
  totalAmount: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  statusCounts: Partial<Record<BillingStatus, number>>;
  items: BillingCalendarItem[];
}

export interface BillingCalendarDetailItem {
  id: string;
  code: string;
  companyId: string;
  companyName: string;
  projectId: string;
  projectName: string;
  clientName: string;
  penagihanKe: number;
  percentage: number | null;
  progressBill: string;
  billedAt: string;
  billedAtLabel: string;
  dueDate: string;
  dueDateLabel: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: BillingStatus;
}

export interface BillingCalendarDetail {
  date: string;
  totalCount: number;
  totalAmount: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  items: BillingCalendarDetailItem[];
}

// ============================================================================
// Billing Document Types
// ============================================================================

export interface BillingUploadedDocument {
  id: string;
  documentTypeId: string;
  fileName: string;
  fileSize?: number | null;
  url: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BillingDocumentRequirement {
  id: string;
  documentTypeId: string;
  documentTypeCode: string;
  documentTypeName: string;
  allowedFileTypes: string;
  allowedFileSize: number | null;
  isMandatory: boolean;
  isUploaded?: boolean;
  uploadedDocuments: BillingUploadedDocument[];
}

export interface BillingDocuments {
  isAllMandatoryUploaded: boolean;
  requirements: BillingDocumentRequirement[];
  mandatoryRequirements?: BillingDocumentRequirement[];
  optionalRequirements?: BillingDocumentRequirement[];
}

export interface BillingPaymentBankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface BillingPaymentTax {
  id: string;
  taxTypeId: string;
  taxName: string;
  percentage: number;
  taxAmount: number;
}

export interface BillingPaymentSummary {
  baseAmount: number;
  termNumber: number;
  taxAmount: number;
  totalAmount: number;
}

export interface BillingPaymentDetail {
  id: string;
  code: string;
  termNumber: number;
  baseAmount: number;
  dueDate: string;
  notes: string | null;
  paymentMethods: string[];
  bankAccounts: BillingPaymentBankAccount[];
  taxes: BillingPaymentTax[];
  summary: BillingPaymentSummary;
}

export interface BillingPaymentProof {
  id: string;
  fileName?: string | null;
  fileSize?: number | null;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Billing Record Detail (/finance/billings/:id/detail)
// ============================================================================

export interface BillingRecordDetailBilling {
  id: string;
  code: string;
  companyId: string;
  projectId: string;
  billingType: BillingType | string;
  termNumber: number;
  percentage: number | null;
  amount: number | null;
  amountAfterTax?: number | null;
  status: BillingStatus;
  billedAt: string;
  dueDate: string;
  paidAt: string | null;
  paidBy: string | null;
  paymentMethod: BillingPaymentMethod | string | null;
  transferVia: string | null;
  clearedAt: string | null;
  clearedBy: string | null;
  checkNumber: string | null;
  checkIssueDate: string | null;
  checkEffectiveDate: string | null;
  isOverdueClearance: boolean;
  notes: string | null;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUser: BillingUserRef;
  paidByUser: BillingUserRef | null;
  clearedByUser: BillingUserRef | null;
  bankAccounts: BillingPaymentBankAccount[];
  taxes: BillingPaymentTax[];
  scheduleHistories: BillingScheduleHistory[];
  documents: BillingDocumentRequirement[];
  paymentProof: BillingDocumentRequirement | null;
}

export interface BillingRecordDetailSummary {
  paidBillingPercentage: number;
  readyToBillPercentage: number;
  unworkedPercentage: number;
  paidBillingAmount: number;
  readyToBillAmount: number;
  remainingBillingAmount: number;
}

export interface BillingRecordDetailData {
  project: BillingProjectDetailProject;
  documentRequirements: BillingDocumentRequirement[];
  summary: BillingRecordDetailSummary;
  billing: BillingRecordDetailBilling;
}
