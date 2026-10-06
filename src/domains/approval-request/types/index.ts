export type ApprovalRequestStatus =
  | 'in_progress'
  | 'approved'
  | 'rejected'
  | 'pending'
  | 'cancelled';

export interface ApprovalRequestWorkflow {
  id: string;
  name: string;
  code: string;
}

export interface ApprovalRequestCompany {
  id: string;
  name: string;
}

export interface ApprovalRequestActor {
  id: string;
  name: string;
  department?: string;
}

export interface ApprovalRequestPayload {
  name?: string;
  gender?: string;
  birthPlace?: string;
  birthDate?: string;
  birthDateFormatted?: string;
  phone?: string;
  email?: string;
  type?: string;
  status?: string;
  province?: string;
  city?: string;
  district?: string;
  village?: string;
  addressDetail?: string;
  [key: string]: unknown;
}

export interface ApprovalRequest {
  id: string;
  code: string;
  approvalWorkflowId: string;
  approvableType: string | null;
  approvableId: string | null;
  companyId: string;
  requestedBy: string;
  currentStepOrder: number;
  status: ApprovalRequestStatus;
  payload: ApprovalRequestPayload;
  finalDecidedAt: string | null;
  finalDecidedBy: string | null;
  notes: string | null;
  isActive: boolean;
  department: string | null;
  createdAtFormatted: string;
  waktuPengajuanFormatted: string;
  workflow: ApprovalRequestWorkflow;
  company: ApprovalRequestCompany;
  requestor: ApprovalRequestActor;
  finalDecider: ApprovalRequestActor | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRequestStep {
  id: string;
  approvalRequestId: string;
  stepOrder: number;
  name: string;
  approverType: string;
  approverId: string;
  approverName: string;
  status: ApprovalRequestStatus;
  decidedBy: string | null;
  decidedAt: string | null;
  decidedAtFormatted: string | null;
  comment: string | null;
  decider: ApprovalRequestActor | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRequestHistory {
  id: string;
  approvalRequestId: string;
  stepOrder: number | null;
  action: 'approve' | 'reject' | 'submit';
  actorId: string;
  comment: string | null;
  actor: ApprovalRequestActor;
  createdAt: string;
  createdAtFormatted: string;
}

export interface ApprovalRequestDetail extends ApprovalRequest {
  steps: ApprovalRequestStep[];
  histories: ApprovalRequestHistory[];
  detail?: ApprovalDetail | null;
}

export type DetailFormat = 'text' | 'number' | 'currency' | 'date' | 'date-list' | 'badge';

export interface DetailSummaryItem {
  label: string;
  value: string | number | string[] | null;
  format: DetailFormat;
}

export interface DetailTableColumn {
  label: string;
  format: DetailFormat;
}

export interface DetailTable {
  columns: DetailTableColumn[];
  rows: (string | number | null)[][];
}

export interface CostBreakdownRow {
  label: string;
  value: string | number | null;
  format: DetailFormat;
  effect?: 'ADDITION' | 'DEDUCTION' | string;
}

export interface CostBreakdownTax {
  id?: string;
  taxTypeId?: string;
  name: string;
  rate: number;
  label: string;
  amount: number;
  effect?: 'ADDITION' | 'DEDUCTION' | string;
}

export interface CostBreakdown {
  title?: string;
  dpp?: number;
  taxAmount?: number;
  totalPayable?: number;
  taxes?: CostBreakdownTax[];
  rows?: CostBreakdownRow[];
}

export interface ApprovalDetail {
  type?: string;
  title: string;
  summary: DetailSummaryItem[];
  table: DetailTable | null;
  costBreakdown?: CostBreakdown | null;
  rincianNilai?: CostBreakdown | null;
}

export interface ApprovalDecisionPayload {
  comment: string;
}
