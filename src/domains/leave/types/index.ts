export interface LeaveEmployee {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  nik: string | null;
  department: string;
  position: string | null;
}

export interface LeaveCompany {
  id: string;
  name: string;
}

export interface LeaveTypeSetting {
  id: string;
  leaveType: string;
  annualQuota: number;
  requiresApproval: boolean;
  isActive: boolean;
}

export interface LeaveTypeBalance {
  quota: number;
  used: number;
  remaining: number;
}

export interface LeaveTypeOption {
  id: string;
  code: string;
  name: string;
  isActive?: boolean;
  isPaid: boolean;
  requiresDocument: boolean;
  quota: number | null;
  balance: LeaveTypeBalance | null;
}

export interface LeaveTypeSummary {
  id: string;
  code: string;
  name: string;
}

export interface Leave {
  id: string;
  code?: string;
  employeeId: string;
  employee: LeaveEmployee;
  companyId: string;
  company: LeaveCompany;
  leaveTypeId: string;
  leaveType: LeaveTypeSummary;
  appliedDate: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  quotaBalance: number;
  status: string;
  description: string | null;
  adminNote: string | null;
  canCancel: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveListItem extends Leave {}

export interface LeaveSettingsData {
  leaveTypes: LeaveTypeSetting[];
}

export interface UpdateLeaveSettingsPayload extends LeaveSettingsData {}

export interface CreateLeavePayload {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  description?: string | null;
}

export interface UpdateLeavePayload extends CreateLeavePayload {}
