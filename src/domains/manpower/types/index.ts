export type EmployeeType = 'permanent_staff' | 'project_worker' | 'staff';

export type ContractType = 'permanent' | 'contract';

export type SalaryType = 'monthly' | 'daily';

export type Gender = 'male' | 'female';

export type WorkPlacement = 'office' | 'remote' | 'hybrid';

interface GeographyRef {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  userId: string | null;
  fullName: string;
  employeeType: string;
  isActive: boolean;
  gender: string;
  birthPlace: string;
  birthDate: string;
  phone: string;
  email: string;
  province: GeographyRef | null;
  city: GeographyRef | null;
  district: GeographyRef | null;
  village: GeographyRef | null;
  postalCode: string | null;
  addressDetail: string | null;
  nik: string | null;
  npwp: string | null;
  contractType: string | null;
  salaryType: string | null;
  workPlacement: string | null;
  hireDate: string | null;
  terminationDate: string | null;
  code: string | null;
  gradeId: string | null;
  grade: { id: string; code: string; name: string } | null;
  employeeGradeId: string | null;
  employeeGrade: { id: string; code: string; name: string } | null;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeListItem extends Employee {}

export const EMPLOYEE_TYPE_LABELS: Record<EmployeeType, string> = {
  permanent_staff: 'Employee',
  project_worker: 'Project Worker',
  staff: 'Staff',
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  permanent: 'Karyawan Tetap',
  contract: 'Karyawan Kontrak',
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Laki-laki',
  female: 'Perempuan',
};

interface Department {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

interface Position {
  id: string;
  code: string;
  name: string;
  level: number;
  isActive: boolean;
}

interface CompanyPosition {
  id: string;
  isActive: boolean;
  department: Department;
  position: Position;
  createdAt: string;
  updatedAt: string;
}

interface AssignmentCompany {
  id: string;
  code: string;
  name: string;
  npwp: string | null;
  siupNumber: string | null;
  phone: string | null;
  email: string | null;
  postalCode: string | null;
  addressDetail: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyEmployee {
  id: string;
  companyId: string;
  employeeId: string;
  officeId: string | null;
  warehouseId: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PositionAssignment {
  id: string;
  employeeId: string;
  companyId: string;
  companyPositionId: string;
  startedAt: string;
  endedAt: string | null;
  reason: string | null;
  notes: string | null;
  isActive: boolean;
  company: AssignmentCompany;
  companyPosition: CompanyPosition;
  companyEmployee: CompanyEmployee | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyPositionOption {
  id: string;
  label: string;
  company: {
    id: string;
    name: string;
  };
  position: {
    id: string;
    name: string;
    code: string;
  };
}

/** Employee Skill — from v1/employees/{id}/skills */
export interface EmployeeSkill {
  id: string;
  employeeId: string;
  skillCatalogId: string;
  skillCatalog: {
    id: string;
    groupId: string | null;
    group: string | null;
    skillCategoryId: string;
    skillCategory: { id: string; name: string };
    skillLevelId: string;
    skillLevel: { id: string; name: string };
    approvalGroupId: string | null;
    approvalGroup: string | null;
    code: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string | null;
    updatedAt: string | null;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeSkillPayload {
  skillCatalogId: string;
  isActive: boolean;
}

/** Employee Workplace — from v1/employees/{id}/workplaces */
export interface EmployeeWorkplace {
  id: string;
  employeeId: string;
  workplaceType: string;
  workplaceId: string;
  workplace: {
    id: string;
    name: string;
    code: string;
    type: string;
  };
  assignedAt: string;
  removedAt: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeWorkplacePayload {
  workplaceType: string;
  workplaceId: string;
  assignedAt: string;
  notes?: string | null;
  isActive?: boolean;
}

/** Payload for PATCH v1/employees/{id}/payroll-settings */
export interface UpdateEmployeePayrollSettingsPayload {
  gradeId: string | null;
  salaryType: SalaryType | null;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
}

// ─── Employee Rating ──────────────────────────────────────────────────────

export interface EmployeeRatingSummaryCategory {
  categoryId: string | null;
  categoryCode: string;
  categoryName: string;
  avgScore: number;
  count: number;
  isActive: boolean;
}

export interface EmployeeRatingSummary {
  overallAvg: number | null;
  totalRatings: number;
  lastRatedAt: string | null;
  perCategory: EmployeeRatingSummaryCategory[];
}

export interface EmployeeRatingRatedBy {
  id: string;
  name: string;
}

export interface EmployeeRatingSource {
  type: string;
  id: string;
  label: string | null;
  deleted: boolean;
}

export interface EmployeeRatingScore {
  categoryId: string | null;
  categoryCode: string;
  categoryName: string;
  categoryStatus: 'active' | 'inactive' | 'deleted';
  score: number;
  note: string | null;
}

export interface EmployeeRatingHistoryItem {
  id: string;
  ratedAt: string;
  overallScore: number;
  note: string | null;
  ratedBy: EmployeeRatingRatedBy | null;
  source: EmployeeRatingSource;
  scores: EmployeeRatingScore[];
}
