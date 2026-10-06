import type { CompanyOption } from '../types';

export const PROSPECT_FEE_TABS = {
  FEE: 'fee',
  SETTING_FEE: 'setting-fee',
} as const;

export type ProspectFeeTab = (typeof PROSPECT_FEE_TABS)[keyof typeof PROSPECT_FEE_TABS];

export const PROSPECT_FEE_TAB_LABELS: Record<ProspectFeeTab, string> = {
  [PROSPECT_FEE_TABS.FEE]: 'Fee',
  [PROSPECT_FEE_TABS.SETTING_FEE]: 'Setting Fee',
};

export const PROSPECT_FEE_LABELS = {
  COMPANY_PLACEHOLDER: 'Company',
  FEE_LIST: {
    TITLE: 'Fee',
    SEARCH_PLACEHOLDER: 'Pencarian',
    EMPTY: 'Belum ada data',
    COLUMNS: {
      PROJECT: 'Project',
      COMPANY: 'Company',
      PROJECT_CAPABILITY: 'Project Capability',
      PROJECT_VALUE: 'Nilai Project',
      FEE: 'Fee',
      NOTE: 'Note',
    },
  },
  SETTING_FEE_LIST: {
    TITLE: 'Setting Fee',
    SEARCH_PLACEHOLDER: 'Pencarian',
    ADD_BUTTON: 'Tambah',
    EMPTY: 'Belum ada data',
    COLUMNS: {
      VIEW: 'View',
      PROJECT_CAPABILITY: 'Project Capability',
      COMPANY: 'Company',
      SETTING_FEE: 'Setting Fee',
      FEE_SETTING: 'Fee Setting',
      STATUS: 'Status',
    },
    FEE_SETTING_BADGE: {
      SET: 'Set',
      UNSET: 'Unset',
    },
    STATUS_BADGE: {
      ACTIVE: 'Aktif',
      INACTIVE: 'Tidak aktif',
    },
  },
  SETTING_DETAIL: {
    TITLE: 'Detail Setting Fee',
    INFO_CARD_TITLE: 'Informasi Setting Fee',
    NOT_FOUND: 'Data setting fee tidak ditemukan.',
    LABELS: {
      PROJECT_CAPABILITY: 'Project Capability',
      COMPANY: 'Company',
      SETTING_FEE: 'Setting Fee',
      FEE_SETTING: 'Fee Setting',
      STATUS: 'Status',
    },
    RANGE_LIST: {
      SEARCH_PLACEHOLDER: 'Pencarian',
      ADD_BUTTON: 'Tambah',
      EMPTY: 'Belum ada data',
      COLUMNS: {
        ORDER: 'Order',
        MIN: 'Min',
        MAX: 'Max',
        FEE: 'Fee',
        TYPE: 'Type',
        LAST_UPDATE: 'Last Update',
        STATUS: 'Status',
      },
      TYPE_OPTIONS: {
        NOMINAL: 'Nominal',
        PERCENTAGE: 'Percentage',
      },
    },
  },
} as const;

export const STATUS_SELECT_OPTIONS = [
  { value: 'active', label: PROSPECT_FEE_LABELS.SETTING_FEE_LIST.STATUS_BADGE.ACTIVE },
  { value: 'inactive', label: PROSPECT_FEE_LABELS.SETTING_FEE_LIST.STATUS_BADGE.INACTIVE },
];

export const FEE_RANGE_TYPE_OPTIONS = [
  {
    value: 'nominal',
    label: PROSPECT_FEE_LABELS.SETTING_DETAIL.RANGE_LIST.TYPE_OPTIONS.NOMINAL,
  },
  {
    value: 'percentage',
    label: PROSPECT_FEE_LABELS.SETTING_DETAIL.RANGE_LIST.TYPE_OPTIONS.PERCENTAGE,
  },
];

export const DUMMY_COMPANIES: CompanyOption[] = [
  { id: 'company-1', name: 'Company 1' },
  { id: 'company-2', name: 'Company 2' },
  { id: 'company-3', name: 'Company 3' },
];

export const DUMMY_PROJECT_CAPABILITIES: string[] = [
  'Project Jembatan',
  'Project Bangunan',
  'Project Jalan Layang',
  'Project Jalan Tol',
];
