export interface PoDraftCreatedBy {
  id: string;
  name: string;
  email: string;
}

export interface PoDraftItem {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  companyId: string;
  companyName: string;
  code: string;
  type: string;
  status: string;
  notes: string | null;
  createdBy: PoDraftCreatedBy;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
