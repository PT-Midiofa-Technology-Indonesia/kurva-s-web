import type { FeeRange, FeeRow, SettingFeeRow } from '../types';
import type {
  ProspectFeeListItemResponse,
  ProspectFeeSettingListItemResponse,
  ProspectFeeSettingTierResponse,
} from '../types/api';

function mapFeeType(feeType: ProspectFeeSettingTierResponse['feeType']): FeeRange['type'] {
  return feeType === 'Percentage' ? 'percentage' : 'nominal';
}

function mapStatus(isActive: boolean): FeeRange['status'] {
  return isActive ? 'active' : 'inactive';
}

export function mapProspectFeeListItem(item: ProspectFeeListItemResponse): FeeRow {
  return {
    id: item.id,
    projectId: item.project.id,
    project: item.project.name,
    companyId: item.company.id,
    companyName: item.company.name,
    projectCapabilityId: item.projectCapability?.id ?? null,
    projectCapability: item.projectCapability?.name ?? '',
    projectValue: item.projectValue,
    fee: item.fee,
    note: item.note,
  };
}

export function mapProspectFeeTier(item: ProspectFeeSettingTierResponse): FeeRange {
  return {
    id: item.id,
    settingFeeId: item.prospectFeeSettingId,
    order: item.order,
    min: item.minValue,
    max: item.maxValue,
    fee: item.feeValue,
    type: mapFeeType(item.feeType),
    lastUpdate: item.lastUpdate,
    status: mapStatus(item.isActive),
  };
}

export function mapProspectFeeSetting(item: ProspectFeeSettingListItemResponse): SettingFeeRow {
  return {
    id: item.id,
    projectCapabilityId: item.projectCapability.id,
    projectCapability: item.projectCapability.name,
    companyId: item.company.id,
    companyName: item.company.name,
    status: item.isActive ? 'active' : 'inactive',
    ranges: item.tiers.map(mapProspectFeeTier),
  };
}

export function getNextTierOrder(ranges: FeeRange[]): number {
  return ranges.length > 0 ? Math.max(...ranges.map((range) => range.order)) + 1 : 1;
}
