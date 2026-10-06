export interface CompanyOption {
  id: string;
  name: string;
}

export interface FeeRow {
  id: string;
  projectId?: string;
  project: string;
  companyId: string;
  companyName: string;
  projectCapabilityId?: string | null;
  projectCapability: string;
  projectValue: number;
  fee: number;
  note: string;
}

export type FeeRangeType = 'nominal' | 'percentage';
export type FeeSettingStatus = 'active' | 'inactive';

export interface FeeRange {
  id: string;
  settingFeeId: string;
  order: number;
  min: number;
  max: number;
  fee: number;
  type: FeeRangeType;
  lastUpdate: string;
  status: FeeSettingStatus;
}

export interface SettingFeeRow {
  id: string;
  projectCapabilityId: string;
  projectCapability: string;
  companyId: string;
  companyName: string;
  status: FeeSettingStatus;
  ranges: FeeRange[];
}
