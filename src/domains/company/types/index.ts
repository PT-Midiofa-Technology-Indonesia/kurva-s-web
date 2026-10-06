export interface Group {
  id: string;
  code: string;
  name: string;
}

export interface ProjectCapability {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface GeographyItem {
  id: string;
  code: string;
  name: string;
}

export interface Company {
  id: string;
  groupId: string;
  group: Group;
  code: string;
  name: string;
  npwp: string;
  siupNumber: string;
  phone: string;
  email: string | null;
  province?: GeographyItem | null;
  city?: GeographyItem | null;
  district?: GeographyItem | null;
  village?: GeographyItem | null;
  postalCode: string | null;
  addressDetail: string;
  isActive: boolean;
  projectCapabilities: ProjectCapability[];
  departments?: CompanyDepartment[];
  createdAt: string;
  updatedAt: string;
}

export interface CompanyDepartment {
  id: string;
  code: string;
  name: string;
}

export interface CompanyListItem extends Company {}
