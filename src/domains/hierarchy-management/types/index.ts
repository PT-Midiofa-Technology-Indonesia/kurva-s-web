export interface Company {
  id: string;
  code: string;
  name: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
}

export interface HierarchyManagementPosition {
  id: string;
  code: string;
  name: string;
  level: number;
  isActive: boolean;
}

export interface HierarchyManagementParent {
  id: string;
  position: HierarchyManagementPosition;
  department: Department;
}

export interface HierarchyManagement {
  id: string;
  isActive: boolean;
  company: Company;
  department: Department;
  position: HierarchyManagementPosition;
  parent: HierarchyManagementParent | null;
  children: HierarchyManagement[];
  createdAt: string;
  updatedAt: string;
}

export interface HierarchyManagementListItem {
  id: string;
  isActive: boolean;
  position: HierarchyManagementPosition;
  department: Department;
}

export interface CompanyPositionNode {
  id: string;
  isActive: boolean;
  position: {
    id: string;
    code: string;
    name: string;
    level: number;
    isActive: boolean;
  };
  department: {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
  };
  children: CompanyPositionNode[];
}

export interface CompanyWithPositions {
  company: {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
  };
  companyPositions: CompanyPositionNode[];
}
