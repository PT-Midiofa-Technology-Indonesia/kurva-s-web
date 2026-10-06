import type { BaseQueryParams } from '@/types/query-params';

export interface CompletenessStatus {
  monthly: 'Complete' | 'Incomplete';
  daily: 'Complete' | 'Incomplete';
  hourly: 'Complete' | 'Incomplete';
}

export type PayrollComponentCategory = 'pokok' | 'tunjangan' | 'variable' | 'lembur' | 'potongan';

export type PayrollValueType = 'fixed' | 'percentage';

export type PayrollBaseScope = 'gross' | 'component' | null;

export interface PayrollComponent {
  id: string;
  code: string;
  name: string;
  category: PayrollComponentCategory;
  categoryLabel: string;
  description: string;
  sortOrder: number;
  isDeduction: boolean;
  isConfigurable: boolean;
  valueType: PayrollValueType;
  valueTypeLabel: string;
  baseScope: PayrollBaseScope;
  baseScopeLabel: string | null;
  baseComponentId: string | null;
  baseComponentName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryStructureGrade {
  id: string;
  code: string;
  name: string;
  completeness: CompletenessStatus;
}

export interface SalaryStructureDetail {
  employeeGradeId: string;
  code: string;
  name: string;
  salaryType: SalaryType;
  status: string;
  isComplete: boolean;
  completeness: CompletenessStatus;
  items: SalaryStructureDetailItem[];
}

export interface SalaryStructureDetailItem {
  payroll_component_id: string;
  component_name: string;
  category: string;
  category_label?: string;
  is_deduction?: boolean;
  value_type: PayrollValueType;
  base_scope: PayrollBaseScope;
  base_component_name: string | null;
  is_applicable: boolean;
  is_mandatory: boolean;
  default_amount: string | number | null;
  min_amount: string | number | null;
  max_amount: string | number | null;
  is_active: boolean;
}

export interface UpdateSalaryStructureItem {
  payroll_component_id: string;
  is_applicable: boolean;
  default_amount: number | null;
  min_amount: number | null;
  max_amount: number | null;
  is_active: boolean;
}

export interface UpdateSalaryStructurePayload {
  employeeGradeId: string;
  salaryType: 'monthly' | 'daily' | 'hourly';
  items: UpdateSalaryStructureItem[];
}

export type SalaryType = 'monthly' | 'daily' | 'hourly';

// ── Payroll Draft ─────────────────────────────────────────────────────────

export type PayrollDraftStatus = 'draft' | 'generated' | 'cancelled' | 'paid';

export type PeriodeType = 'monthly' | 'daily' | 'hourly';

export interface PayrollDraftItem {
  id: string;
  payrollDraftId: string;
  employeeId: string;
  employeeName: string;
  payrollComponentId: string;
  componentName: string;
  componentCategory: string;
  componentCategoryLabel: string;
  isDeduction: boolean;
  amount: string;
  signedAmount: number | string;
  referenceCount: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollDraftSummary {
  id: string;
  code: string;
  companyId: string;
  periodType: PeriodeType;
  periodStart: string;
  periodEnd: string;
  status: PayrollDraftStatus;
  totalAmount: string | number | null;
  notes: string | null;
  createdBy: string;
  creatorName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollDraftDetail extends PayrollDraftSummary {
  items: PayrollDraftItem[];
}

export interface PayrollDraftPreviewManpower {
  id: string;
  name: string;
  grade: string;
  salary_type: PeriodeType;
  component_count: number;
  attendance_count: number | null;
  estimated_amount: number;
}

export interface PayrollDraftPreviewSkippedEmployee {
  id: string;
  name: string;
}

export interface PayrollDraftPreview {
  manpower: PayrollDraftPreviewManpower[];
  skipped_no_company: PayrollDraftPreviewSkippedEmployee[];
  skipped_no_grade_or_type: PayrollDraftPreviewSkippedEmployee[];
}

export type PayrollDraftListItem = PayrollDraftSummary;

export interface CreateDraftFormData {
  periodType: PeriodeType;
  periodStart: string;
  periodEnd: string;
  notes?: string;
}

export interface PayrollDraftUrlParams extends BaseQueryParams {
  companyId?: string;
  periodType?: string;
  periodStart?: string;
  periodEnd?: string;
  status?: string;
}

// ── Employee Salary Adjustment ───────────────────────────────────────────────

export interface EmployeeSalaryAdjustmentGrade {
  id: string;
  code: string;
  name: string;
}

export interface EmployeeSalaryAdjustment {
  id: string;
  fullName: string;
  nik: string | null;
  grade: EmployeeSalaryAdjustmentGrade | null;
  salaryType: SalaryType | null;
  hasAdjustment: boolean;
  adjustmentCount: number;
  isPayrollReady: boolean;
}

export interface EmployeeSalaryAdjustmentGridRow {
  payrollComponentId: string;
  componentName: string;
  category: string;
  categoryLabel: string;
  isDeduction: boolean;
  valueType: PayrollValueType;
  baseScope: PayrollBaseScope;
  baseComponentName: string | null;
  defaultAmount: string | number | null;
  minAmount: string | number | null;
  maxAmount: string | number | null;
  adjustedAmount: string | number | null;
  reason: string | null;
}

export interface EmployeeSalaryAdjustmentDetailEmployee {
  id: string;
  fullName: string;
  nik: string | null;
  grade: EmployeeSalaryAdjustmentGrade | null;
  salaryType: SalaryType | null;
}

export interface EmployeeSalaryAdjustmentDetail {
  employee: EmployeeSalaryAdjustmentDetailEmployee;
  hasAdjustment: boolean;
  incomplete: boolean;
  grid: EmployeeSalaryAdjustmentGridRow[];
}

export interface EmployeeSalaryAdjustmentItemPayload {
  payrollComponentId: string;
  adjustedAmount: number | null;
  reason?: string | null;
}

export interface CreateEmployeeSalaryAdjustmentPayload {
  employeeId: string;
  items: EmployeeSalaryAdjustmentItemPayload[];
}

export interface UpdateEmployeeSalaryAdjustmentPayload {
  items: EmployeeSalaryAdjustmentItemPayload[];
}
