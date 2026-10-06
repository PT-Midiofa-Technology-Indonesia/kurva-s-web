export interface ApprovalWorkflow {
  id: string;
  companyId: string;
  code: string;
  name: string;
  module: string;
  description: string | null;
  isActive: boolean;
  isFinance: boolean;
  stepsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalWorkflowStep {
  id: string;
  approvalWorkflowId: string;
  stepOrder: number;
  name: string;
  approverType: string;
  approverId: string;
  approverName?: string | null;
  picId?: string | null;
  picName?: string | null;
  nominalThreshold: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalWorkflowDetail extends ApprovalWorkflow {
  steps: ApprovalWorkflowStep[];
}

export interface UpdateApprovalWorkflowStepPayload {
  stepOrder: number;
  name: string;
  approverType: string;
  approverId: string;
  picId: string | null;
  nominalThreshold: number | null;
  isActive: boolean;
}

export interface RawApproverOption {
  value: string | number;
  label: string;
}

export interface ApproverOptionsResponse {
  tipeApprover: RawApproverOption[];
  departments: RawApproverOption[];
  roles: RawApproverOption[];
}

export interface UpdateApprovalWorkflowPayload {
  companyId: string;
  code: string;
  name: string;
  module: string;
  description: string | null;
  isActive: boolean;
  isFinance: boolean;
  steps: UpdateApprovalWorkflowStepPayload[];
}
