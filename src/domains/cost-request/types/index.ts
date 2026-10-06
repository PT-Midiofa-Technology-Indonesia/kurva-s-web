export type CostRequestType = 'project' | 'non_project';
export type CostRequestStatus = 'submitted' | 'paid' | 'cancelled';
export type PaymentMethod = 'cash' | 'transfer' | 'check';

export interface CostRequestProofFile {
  id: string;
  fileName: string;
  fileSize: number;
  url: string;
}

export interface CostRequestItem {
  id: string;
  receiptNumber: string | null;
  description: string;
  amount: number;
  notes: string | null;
  proofs: CostRequestProofFile[];
}

export interface CostRequestRefProject {
  id: string;
  code: string;
  name: string;
}

export interface CostRequestRefEmployee {
  id: string;
  code: string;
  name: string | null;
}

export interface CostRequestCreatedBy {
  id: string;
  name: string;
}

export interface CostRequest {
  id: string;
  code: string;
  requestType: CostRequestType;
  requestTypeLabel: string;
  project: CostRequestRefProject | null;
  employee: CostRequestRefEmployee;
  totalAmount: number;
  reason: string | null;
  dueDate: string;
  paymentMethod: PaymentMethod;
  paymentMethodLabel: string;
  status: CostRequestStatus;
  statusLabel: string;
  notes: string | null;
  createdBy: CostRequestCreatedBy;
  items: CostRequestItem[];
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}
