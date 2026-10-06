export interface OvertimeEmployee {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  nik: string | null;
  department: string;
  position: string | null;
}

export interface OvertimeCompany {
  id: string;
  name: string;
}

export interface OvertimeProject {
  id: string;
  name: string;
}

export interface OvertimeUser {
  id: string;
  name: string;
}

export interface Overtime {
  id: string;
  employeeId: string;
  employee: OvertimeEmployee;
  companyId: string;
  company: OvertimeCompany;
  overtimeDate: string;
  startTime: string;
  endTime: string;
  totalMinutes: number;
  roundedHours: number;
  ratePerHourSnapshot: number;
  amount: number;
  reason: string;
  status: string;
  locationType: string;
  locationId: string | null;
  location: unknown | null;
  projectId: string | null;
  project: OvertimeProject | null;
  attendanceId: string | null;
  attendance: unknown | null;
  notes: string | null;
  inputBy: string;
  inputByUser: OvertimeUser;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OvertimeListItem extends Overtime {}

export interface OvertimeSettingsData {
  overtimeRatePerHour: number;
  overtimeRoundingMethod: string | null;
  overtimeRoundingThresholdMinutes: number;
}

export interface UpdateOvertimeSettingsPayload {
  overtimeRatePerHour: number;
  overtimeRoundingMethod: string;
  overtimeRoundingThresholdMinutes?: number;
}

// ── Form payloads ──

export interface CreateOvertimePayload {
  employeeId: string;
  overtimeDate: string;
  startTime: string;
  endTime: string;
  ratePerHourSnapshot: number;
  status: string;
  locationType: string;
  locationId?: string | null;
  projectId?: string | null;
  notes?: string | null;
  reason?: string | null;
  totalMinutes?: number;
  roundedHours?: number;
  amount?: number;
}

export interface UpdateOvertimePayload extends CreateOvertimePayload {}

export interface OvertimeCalculationPayload {
  overtimeId?: string;
  startTime: string;
  endTime: string;
  ratePerHourSnapshot?: number;
}

export interface OvertimeCalculation {
  startTime: string;
  endTime: string;
  totalMinutes: number;
  roundedHours: number;
  ratePerHourSnapshot: number;
  amount: number;
  roundingMethod: string;
  roundingThresholdMinutes: number;
}

export interface OvertimeActiveEmployee {
  id: string;
  code: string;
  full_name: string;
  work_placement: string;
}

export interface OvertimeEmployeeProjectLocation {
  type: string;
  id: string;
  name: string;
}

export interface OvertimeEmployeeProject {
  id: string;
  name: string;
  code: string;
  location: OvertimeEmployeeProjectLocation | null;
}

export interface OvertimeEmployeeProjectsData {
  projects: OvertimeEmployeeProject[];
  autoLocation: OvertimeEmployeeProjectLocation | null;
}
