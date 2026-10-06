import { create } from 'zustand';
import { generateId } from '@/utils/generate-id';
import { DUMMY_COMPANIES } from '../constants';
import type { CompanyOption, FeeRange, FeeRow, SettingFeeRow } from '../types';

function createDummyFeeRows(): FeeRow[] {
  return [
    {
      id: generateId(),
      project: 'Pekerjaan Jembatan',
      companyId: 'company-1',
      companyName: 'Company 1',
      projectCapability: 'Project Jembatan',
      projectValue: 100_000_000,
      fee: 100_000,
      note: '-',
    },
    {
      id: generateId(),
      project: 'Pekerjaan Bangunan Office',
      companyId: 'company-1',
      companyName: 'Company 1',
      projectCapability: 'Project Bangunan',
      projectValue: 150_000_000,
      fee: 3_000_000,
      note: '2% dari nilai project',
    },
    {
      id: generateId(),
      project: 'Pekerjaan Jalan Layang',
      companyId: 'company-1',
      companyName: 'Company 1',
      projectCapability: 'Project Jalan Layang',
      projectValue: 200_000_000,
      fee: 200_000,
      note: '-',
    },
    {
      id: generateId(),
      project: 'Pekerjaan Bangunan Hotel',
      companyId: 'company-1',
      companyName: 'Company 1',
      projectCapability: 'Project Bangunan',
      projectValue: 220_000_000,
      fee: 11_000_000,
      note: '5% dari nilai project',
    },
    {
      id: generateId(),
      project: 'Pekerjaan Jalan Tol',
      companyId: 'company-1',
      companyName: 'Company 1',
      projectCapability: 'Project Jalan Tol',
      projectValue: 250_000_000,
      fee: 250_000,
      note: '-',
    },
  ];
}

function createDummyRanges(settingFeeId: string): FeeRange[] {
  return [
    {
      id: generateId(),
      settingFeeId,
      order: 1,
      min: 0,
      max: 99_000_000,
      fee: 1_000_000,
      type: 'nominal',
      status: 'inactive',
      lastUpdate: '10 Feb 2026 21:00 WIB',
    },
    {
      id: generateId(),
      settingFeeId,
      order: 2,
      min: 100_000_000,
      max: 199_000_000,
      fee: 10,
      type: 'percentage',
      status: 'active',
      lastUpdate: '10 Feb 2026 20:00 WIB',
    },
    {
      id: generateId(),
      settingFeeId,
      order: 3,
      min: 200_000_000,
      max: 299_000_000,
      fee: 1_500_000,
      type: 'nominal',
      status: 'inactive',
      lastUpdate: '10 Feb 2026 19:50 WIB',
    },
  ];
}

function createDummySettingFeeRows(): SettingFeeRow[] {
  const id1 = generateId();
  const id2 = generateId();
  const id3 = generateId();
  return [
    {
      id: id1,
      projectCapabilityId: 'pcap-1',
      projectCapability: 'Project Jembatan',
      companyId: 'company-1',
      companyName: 'Company 1',
      status: 'active',
      ranges: createDummyRanges(id1),
    },
    {
      id: id2,
      projectCapabilityId: 'pcap-2',
      projectCapability: 'Project Bangunan',
      companyId: 'company-1',
      companyName: 'Company 1',
      status: 'inactive',
      ranges: [],
    },
    {
      id: id3,
      projectCapabilityId: 'pcap-3',
      projectCapability: 'Project Jalan Layang',
      companyId: 'company-1',
      companyName: 'Company 1',
      status: 'inactive',
      ranges: [],
    },
  ];
}

interface ProspectFeeStore {
  companies: CompanyOption[];
  feeRows: FeeRow[];
  settingFeeRows: SettingFeeRow[];
  addSettingFeeRow: (company?: CompanyOption) => void;
  updateSettingFeeRow: (id: string, patch: Partial<SettingFeeRow>) => void;
  addFeeRange: (settingFeeRowId: string) => void;
  updateFeeRange: (settingFeeRowId: string, rangeId: string, patch: Partial<FeeRange>) => void;
}

function createEmptyRange(settingFeeId: string, order: number): FeeRange {
  return {
    id: generateId(),
    settingFeeId,
    order,
    min: 0,
    max: 0,
    fee: 0,
    type: 'nominal',
    status: 'inactive',
    lastUpdate: new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export const useProspectFeeStore = create<ProspectFeeStore>((set) => ({
  companies: DUMMY_COMPANIES,
  feeRows: createDummyFeeRows(),
  settingFeeRows: createDummySettingFeeRows(),
  addSettingFeeRow: (company) =>
    set((state) => ({
      settingFeeRows: [
        ...state.settingFeeRows,
        {
          id: generateId(),
          projectCapabilityId: '',
          projectCapability: '',
          companyId: company?.id ?? state.companies[0]?.id ?? '',
          companyName: company?.name ?? state.companies[0]?.name ?? '',
          status: 'inactive',
          ranges: [],
        },
      ],
    })),
  updateSettingFeeRow: (id, patch) =>
    set((state) => ({
      settingFeeRows: state.settingFeeRows.map((row) =>
        row.id === id ? { ...row, ...patch } : row
      ),
    })),
  addFeeRange: (settingFeeRowId) =>
    set((state) => ({
      settingFeeRows: state.settingFeeRows.map((row) => {
        if (row.id !== settingFeeRowId) return row;
        return {
          ...row,
          ranges: [...row.ranges, createEmptyRange(settingFeeRowId, row.ranges.length + 1)],
        };
      }),
    })),
  updateFeeRange: (settingFeeRowId, rangeId, patch) =>
    set((state) => ({
      settingFeeRows: state.settingFeeRows.map((row) =>
        row.id === settingFeeRowId
          ? {
              ...row,
              ranges: row.ranges.map((range) =>
                range.id === rangeId ? { ...range, ...patch } : range
              ),
            }
          : row
      ),
    })),
}));
