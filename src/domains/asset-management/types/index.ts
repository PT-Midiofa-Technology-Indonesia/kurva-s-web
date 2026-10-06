export type AssetRegistrationStatus = 'active' | 'disposed' | 'superseded';

export type AssetRegistrationStatusFilter = AssetRegistrationStatus | 'all';

export interface AssetCategory {
  id: string;
  code: string;
  name: string;
  usefulLifeMonths: number;
  depreciationMethod: string;
  salvageValuePercent: string;
  maintenanceIntervalMonths: number | null;
  requiresSerial: boolean;
  notes: string | null;
  isActive: boolean;
  isProtected: boolean;
  activeRegistrationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssetCategoryListItem extends AssetCategory {}

export interface AssetRegistrationCategoryRef {
  id: string;
  name: string;
  depreciationMethod?: string;
  usefulLifeMonths?: number;
  isActive?: boolean;
}

export interface AssetRegistrationWarehouseRef {
  id: string;
  name: string;
}

export interface AssetRegistrationListItem {
  id: string;
  unitCode: string;
  serialNumber: string | null;
  itemName: string;
  category: AssetRegistrationCategoryRef;
  warehouse: AssetRegistrationWarehouseRef | null;
  inProject: boolean;
  unitDeleted: boolean;
  acquisitionDate: string;
  acquisitionCost: string;
  depreciationStartDate: string;
  salvageValue: string;
  bookValue: number;
  accumulatedDepreciation: number;
  monthsElapsed: number;
  status: AssetRegistrationStatus;
  registeredAt: string;
}

export interface AssetRegistrationRegisterableUnit {
  id: string;
  unitCode: string;
  serialNumber: string | null;
  itemName: string;
  isAsset: boolean;
  isConsumable: boolean;
  warehouse: AssetRegistrationWarehouseRef | null;
  inProject: boolean;
  acquisitionDate: string;
  acquisitionCost: string;
  status: string;
}

export interface AssetRegistrationScheduleItem {
  year: number;
  beginningBookValue: number;
  depreciationExpense: number;
  endingBookValue: number;
  accumulated: number;
  isCurrentYear: boolean;
}

export interface AssetRegistrationDetail {
  id: string;
  status: AssetRegistrationStatus;
  unit: {
    id: string;
    unitCode: string;
    serialNumber: string | null;
    itemName: string;
    warehouse: AssetRegistrationWarehouseRef | null;
    inProject: boolean;
    unitDeleted: boolean;
    acquisitionDate: string;
    acquisitionCost: string;
  };
  registration: {
    category: AssetRegistrationCategoryRef;
    depreciationStartDate: string;
    salvageValue: string;
    bookValueAtRegister: number | null;
    registeredBy: string;
    registeredAt: string;
    notes: string | null;
  };
  depreciation: {
    summary: {
      bookValue: number;
      accumulatedDepreciation: number;
      monthsElapsed: number;
      usefulLifeMonths: number;
      remainingMonths: number;
    };
    schedule: AssetRegistrationScheduleItem[];
  };
}
