export interface EmployeeGrade {
  id: string;
  code: string;
  name: string;
  description: string | null;
  salaryType: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeGradeListItem extends EmployeeGrade {}

export interface CreateEmployeeGradePayload {
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface UpdateEmployeeGradePayload {
  code?: string;
  name?: string | null;
  description?: string | null;
  isActive?: boolean;
}
