export interface DepartmentCompany {
  id: string;
  code: string;
  name: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  company: DepartmentCompany;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentListItem extends Department {}
