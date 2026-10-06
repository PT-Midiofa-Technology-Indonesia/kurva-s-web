export interface ProspectFeeProjectRef {
  id: string;
  code: string;
  name: string;
}

export interface ProspectFeeCompanyRef {
  id: string;
  name: string;
}

export interface ProspectFeeProjectCapabilityRef {
  id: string;
  code: string;
  name: string;
}

export interface ProspectFeeListItemResponse {
  id: string;
  project: ProspectFeeProjectRef;
  company: ProspectFeeCompanyRef;
  projectCapability: ProspectFeeProjectCapabilityRef | null;
  projectValue: number;
  fee: number;
  note: string;
}

export interface ProspectFeeSettingTierResponse {
  id: string;
  prospectFeeSettingId: string;
  order: number;
  minValue: number;
  maxValue: number;
  feeType: 'Nominal' | 'Percentage';
  feeValue: number;
  lastUpdate: string;
  isActive: boolean;
  status: string;
}

export interface ProspectFeeSettingListItemResponse {
  id: string;
  projectCapability: ProspectFeeProjectCapabilityRef;
  company: ProspectFeeCompanyRef;
  settingFeeCount: string;
  feeSetting: string;
  isActive: boolean;
  status: string;
  tiers: ProspectFeeSettingTierResponse[];
}

export interface CreateProspectFeeSettingPayload {
  projectCapabilityId: string;
  isActive: boolean;
}

export interface UpdateProspectFeeSettingStatusPayload {
  isActive: boolean;
}

export interface CreateProspectFeeTierPayload {
  order: number;
  minValue: number;
  maxValue: number;
  feeType: 'Nominal' | 'Percentage';
  feeValue: number;
  isActive: boolean;
}

export interface UpdateProspectFeeTierPayload extends CreateProspectFeeTierPayload {}

export interface UpdateProspectFeeTierStatusPayload {
  isActive: boolean;
}
