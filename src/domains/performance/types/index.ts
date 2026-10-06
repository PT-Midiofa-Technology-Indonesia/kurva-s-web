import type {
  PaginationLinks as ApiPaginationLinks,
  PaginationMeta as ApiPaginationMeta,
} from '@/shared/types/api';

// Employee reference types
export interface EmployeeRef {
  id: string;
  employeeId: string;
  name: string;
  email?: string;
  avatar?: string | null;
}

// Base employee data
export interface Employee extends EmployeeRef {
  nik?: string;
  phone?: string | null;
  position?: string;
  department?: string;
}

// Performance grade types
export interface PerformanceGrade {
  id: string;
  code?: string;
  name?: string;
  grade?: 'A' | 'B' | 'C' | 'D' | 'E' | string;
  gradeColor?: string;
  minScore?: number;
  maxScore?: number;
  minValue?: number;
  maxValue?: number;
  description?: string | null;
}

// Performance pillar types
export interface PillarComponent {
  id?: string;
  code: string;
  name: string;
  value?: number;
  maxValue?: number;
  percentage?: number;
  score?: number;
  weight?: number;
  finalScore?: number;
  description?: string | null;
}

export interface PerformancePillar {
  id?: string;
  code: string;
  name: string;
  icon?: string;
  score?: number;
  finalScore?: number;
  totalValue?: number;
  maxValue?: number;
  percentage?: number;
  components?: PillarComponent[];
}

// Performance action types (reward/punishment)
export interface PerformanceAction {
  id: string;
  code?: string;
  name?: string;
  type?: 'reward' | 'punishment';
  title?: string;
  description?: string | null;
  value?: number;
  date?: string;
  createdBy?: EmployeeRef;
  createdAt?: string;
}

// Performance detail
export interface PerformanceDetail {
  id?: string;
  employee: {
    id: string;
    name: string;
    code?: string;
    email?: string;
    position?: string;
    employeeGrade?: string;
    department?: string;
    nik?: string;
  };
  period: string;
  score?: number;
  totalScore?: number;
  grade: PerformanceGrade;
  pillars: PerformancePillar[];
  rewards: PerformanceAction[];
  punishments: PerformanceAction[];
  createdAt?: string;
  updatedAt?: string;
}

// Performance history types
export interface PerformanceHistory {
  id: string;
  period: string;
  score?: number;
  totalScore?: number;
  grade?: PerformanceGrade;
  pillars?: PerformancePillar[];
  createdAt?: string;
}

// Project history types
export interface ProjectHistory {
  id: string;
  name: string;
  projectCode?: string;
  projectName?: string;
  role?: string;
  workerCount?: number;
  period?: string;
  periodStart?: string;
  periodEnd?: string;
  startDate?: string;
  endDate?: string | null;
  status: string;
  score?: number | null;
  performanceScore?: number | null;
  grade?: {
    id: string;
    code: string;
    name: string;
  } | null;
  performanceGrade?: PerformanceGrade | null;
}

// Grade distribution for summary
export interface GradeDistribution {
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  count: number;
  percentage: number;
}

// Performance summary for list
export interface PerformanceEmployee extends Employee {
  employeeGrade?: string;
  period?: string;
  pillars?: PerformancePillar[];
  totalScore?: number;
  grade?: PerformanceGrade;
  performance?: {
    id?: string;
    period?: string;
    score?: number;
    grade?: PerformanceGrade;
    pillars?: PerformancePillar[];
  };
}
export interface PerformanceSummary {
  totalEmployees: number;
  averageScore: number;
  gradeDistribution: GradeDistribution[];
}

export interface EmployeeGradeSetting {
  id: string;
  code: string;
  name: string;
  totalKpiComponents: number;
  totalGrades: number;
  status: boolean;
}

export interface KPICompanyPillarWeight {
  id?: string;
  performancePillarId?: string;
  code?: string;
  name: string;
  weight: number;
}

export interface KPICompanyGradeThreshold {
  id?: string;
  performanceGradeId?: string;
  code?: 'A' | 'B' | 'C' | 'D' | 'E' | string;
  name?: string;
  grade?: 'A' | 'B' | 'C' | 'D' | 'E' | string;
  minScore: number;
  maxScore: number;
}

export interface KPICompanySettings {
  pillarWeights?: KPICompanyPillarWeight[];
  pillars?: KPICompanyPillarWeight[];
  gradeThresholds?: KPICompanyGradeThreshold[];
  grades?: KPICompanyGradeThreshold[];
}

export interface KPICompanySettingsPayload {
  pillars: Array<{ performancePillarId: string; weight: number }>;
  grades: Array<{ performanceGradeId: string; minScore: number; maxScore: number }>;
}

export interface KPIAction {
  id: string;
  performanceActionId?: string;
  code?: string;
  name?: string;
  title?: string;
  description?: string | null;
  type?: 'reward' | 'punishment';
}

export interface EmployeeGradeDetailSetting {
  id: string;
  grade?: 'A' | 'B' | 'C' | 'D' | 'E' | string;
  code?: string;
  name?: string;
  minScore?: number;
  maxScore?: number;
  rewards?: KPIAction[];
  punishments?: KPIAction[];
}

export interface KPIPillarComponent {
  id: string;
  performanceComponentId?: string;
  name: string;
  code?: string;
  weight?: number;
}

export interface KPIGradePillarSetting {
  id: string;
  performancePillarId?: string;
  name: string;
  code?: string;
  weight?: number;
  components?: KPIPillarComponent[];
}

export interface EmployeeGradeDetailSettings {
  id?: string;
  code?: string;
  name?: string;
  grades?: EmployeeGradeDetailSetting[];
  gradeSettings?: EmployeeGradeDetailSetting[];
  pillars?: KPIGradePillarSetting[];
}

export interface SaveGradeActionsPayload {
  performanceGradeId: string;
  type: 'reward' | 'punishment';
  performanceActionIds: string[];
}

export interface SavePillarComponentsPayload {
  performancePillarId: string;
  components: Array<{ performanceComponentId: string; weight: number }>;
}

export type { PaginationLinks, PaginationMeta } from '@/shared/types/api';

// API response types
export interface GetPerformanceEmployeesResponse {
  data: {
    summary: PerformanceSummary;
    employees: PerformanceEmployee[];
  };
  meta: ApiPaginationMeta;
  links: ApiPaginationLinks;
  period: string;
}

export interface GetEmployeeDetailResponse {
  data: PerformanceEmployee;
}

export interface GetEmployeeHistoryResponse {
  data: PerformanceHistory[];
  meta: ApiPaginationMeta;
  links: ApiPaginationLinks;
}

export interface GetEmployeeProjectHistoryResponse {
  data: ProjectHistory[];
  meta: ApiPaginationMeta;
  links: ApiPaginationLinks;
}

export interface GetEmployeeViolationsResponse {
  data: ProjectHistory[];
  meta?: ApiPaginationMeta;
  links?: ApiPaginationLinks;
}

export interface GetPerformanceDetailResponse {
  data: PerformanceDetail;
}

export interface GetEmployeeGradesResponse {
  data: EmployeeGradeSetting[];
  meta: ApiPaginationMeta;
  links: ApiPaginationLinks;
}

export interface GetCompanySettingsResponse {
  data: KPICompanySettings;
}

export interface GetEmployeeGradeDetailSettingsResponse {
  data: EmployeeGradeDetailSettings;
}

export interface PerformanceEmployeesResponse extends GetPerformanceEmployeesResponse {}
export interface PerformanceDetailResponse extends GetPerformanceDetailResponse {}
export interface PerformanceHistoryResponse extends GetEmployeeHistoryResponse {}
export interface ProjectHistoryResponse extends GetEmployeeProjectHistoryResponse {}

// Re-export filters type for public API (will be defined in api layer)
export type { GetPerformanceEmployeesParams as PerformanceEmployeeFilters } from '../api/get-performance-employees';
