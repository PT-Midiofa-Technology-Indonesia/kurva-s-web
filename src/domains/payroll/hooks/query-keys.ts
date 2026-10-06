'use client';

export const PAYROLL_QUERY_KEYS = {
  all: ['payroll'] as const,
  components: ['payroll-components'] as const,
  salaryStructureGrades: ['salary-structure-grades'] as const,
  salaryStructureDetail: ['salary-structure-detail'] as const,
  employeeSalaryAdjustments: ['employee-salary-adjustments'] as const,
  employeeSalaryAdjustmentDetail: ['employee-salary-adjustment-detail'] as const,
  payrollDrafts: ['payroll-drafts'] as const,
  payrollDraftDetail: (id: string, companyId: string) =>
    ['payroll-drafts', 'detail', id, companyId] as const,
  payrollDraftPreview: (id: string, companyId: string) =>
    ['payroll-drafts', 'preview', id, companyId] as const,
};
