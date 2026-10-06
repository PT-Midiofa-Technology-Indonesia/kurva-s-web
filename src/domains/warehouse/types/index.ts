export interface CompanyRef {
  id: string;
  code: string;
  name: string;
}

export interface GeographyItem {
  id: string;
  code: string;
  name: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: string;
  company: CompanyRef;
  province?: GeographyItem | null;
  city?: GeographyItem | null;
  district?: GeographyItem | null;
  village?: GeographyItem | null;
  addressDetail: string | null;
  latitude?: string | null;
  longitude?: string | null;
  isActive: boolean;
  workStartTime?: string | null;
  workEndTime?: string | null;
  workDays?: string[];
  attendanceRadiusMeters?: number | null;
  timezone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseListItem extends Warehouse {}

// Re-export filters type for public API
export type { GetWarehousesParams as WarehouseFilters } from '../api/get-warehouses';
