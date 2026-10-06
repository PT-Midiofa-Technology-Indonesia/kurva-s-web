export interface GeographyItem {
  id: string;
  code: string;
  name: string;
}

export interface Company {
  id: string;
  code: string;
  name: string;
}

export interface Office {
  id: string;
  code: string;
  name: string;
  type: 'main_office' | 'branch_office';
  phone: string;
  company: Company;
  latitude?: number | null;
  longitude?: number | null;
  province?: GeographyItem | null;
  city?: GeographyItem | null;
  district?: GeographyItem | null;
  village?: GeographyItem | null;
  postalCode: string;
  addressDetail: string;
  isActive: boolean;
  workStartTime?: string | null;
  workEndTime?: string | null;
  workDays?: string[];
  attendanceRadiusMeters?: number | null;
  timezone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeListItem extends Office {}
