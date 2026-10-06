import { COMMON_LABELS } from '@/shared/constants';

export const VENDOR_DIRECTORY_TABS = {
  ITEM_CATALOG: 'item-catalog',
  CAPABILITY: 'capability',
  SERVICE_COVERAGE: 'service-coverage',
  OFFERING_DOCUMENT: 'offering-document',
  FLEET: 'fleet',
} as const;

export type VendorDirectoryTab = (typeof VENDOR_DIRECTORY_TABS)[keyof typeof VENDOR_DIRECTORY_TABS];

export const VENDOR_DIRECTORY_TAB_LABELS: Record<VendorDirectoryTab, string> = {
  [VENDOR_DIRECTORY_TABS.ITEM_CATALOG]: 'Item Catalog',
  [VENDOR_DIRECTORY_TABS.CAPABILITY]: 'Capabilities',
  [VENDOR_DIRECTORY_TABS.SERVICE_COVERAGE]: 'Service Coverage',
  [VENDOR_DIRECTORY_TABS.OFFERING_DOCUMENT]: 'Offering Document',
  [VENDOR_DIRECTORY_TABS.FLEET]: 'Fleet',
};

export const VENDOR_DIRECTORY_TAB_ORDER: VendorDirectoryTab[] = [
  VENDOR_DIRECTORY_TABS.ITEM_CATALOG,
  VENDOR_DIRECTORY_TABS.CAPABILITY,
  VENDOR_DIRECTORY_TABS.SERVICE_COVERAGE,
  VENDOR_DIRECTORY_TABS.OFFERING_DOCUMENT,
  VENDOR_DIRECTORY_TABS.FLEET,
];

export const VENDOR_DIRECTORY_LABELS = {
  PAGE_TITLE: 'Vendor Directory',
  PAGE_DESCRIPTION: 'Direktori data vendor dan turunannya',

  SEARCH_PLACEHOLDER: 'Pencarian',
  STATUS_FILTER_PLACEHOLDER: 'Semua Status',

  COMMON: {
    CODE: COMMON_LABELS.FIELDS.CODE,
    STATUS: COMMON_LABELS.FIELDS.STATUS,
    STATUS_ACTIVE: COMMON_LABELS.STATUS.ACTIVE,
    STATUS_INACTIVE: COMMON_LABELS.STATUS.INACTIVE,
    VENDOR_NAME: 'Nama Vendor',
  },

  ITEM_CATALOG: {
    TITLE: 'Item Catalog',
    EMPTY: 'Item catalog tidak ditemukan',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Item',
      VENDOR: 'Nama Vendor',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
  },

  CAPABILITY: {
    TITLE: 'Capabilities',
    EMPTY: 'Capability tidak ditemukan',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Skill',
      VENDOR: 'Nama Vendor',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
  },

  SERVICE_COVERAGE: {
    TITLE: 'Service Coverage',
    EMPTY: 'Service coverage tidak ditemukan',
    COLUMNS: {
      PROVINCE: 'Provinsi',
      CITY: 'Kabupaten/Kota',
      VENDOR: 'Nama Vendor',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
  },

  OFFERING_DOCUMENT: {
    TITLE: 'Offering Document',
    EMPTY: 'Offering document tidak ditemukan',
    COLUMNS: {
      CODE: 'Kode',
      TITLE: 'Nama Document',
      VENDOR: 'Nama Vendor',
      PERIOD: 'Periode',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
  },

  FLEET: {
    TITLE: 'Fleet',
    EMPTY: 'Fleet tidak ditemukan',
    COLUMNS: {
      NAME: 'Nama Armada',
      VEHICLE_TYPE: 'Type',
      PLATE_NUMBER: 'Plat Nomor',
      VENDOR: 'Nama Vendor',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
  },
} as const;

export const VENDOR_DIRECTORY_STATUS_OPTIONS = [
  { label: VENDOR_DIRECTORY_LABELS.COMMON.STATUS_ACTIVE, value: 'true' },
  { label: VENDOR_DIRECTORY_LABELS.COMMON.STATUS_INACTIVE, value: 'false' },
];
