import { COMMON_LABELS } from '@/shared/constants';
import type { AssetRegistrationStatus } from '../types';

export const ASSET_MANAGEMENT_ROUTES = {
  ROOT: '/asset-management',
  ASSET_CATALOG: '/asset-management/asset-catalog',
  ASSET_CATEGORY: '/asset-management/asset-category',
  ASSET_CATEGORY_CREATE: '/asset-management/asset-category/create',
} as const;

export function getAssetCategoryEditRoute(assetCategoryId: string) {
  return `${ASSET_MANAGEMENT_ROUTES.ASSET_CATEGORY}/${assetCategoryId}/edit`;
}

export const ASSET_REGISTRATION_STATUS_META: Record<
  AssetRegistrationStatus,
  { label: string; variant: 'success' | 'destructive' | 'secondary' }
> = {
  active: { label: 'Active', variant: 'success' },
  disposed: { label: 'Disposed', variant: 'destructive' },
  superseded: { label: 'Superseded', variant: 'secondary' },
};

export const BOOLEAN_STATUS_META = {
  true: { label: COMMON_LABELS.STATUS.ACTIVE, variant: 'success' as const },
  false: { label: COMMON_LABELS.STATUS.INACTIVE, variant: 'destructive' as const },
} as const;

export const BOOLEAN_YES_NO_META = {
  true: { label: 'Ya', variant: 'success' as const },
  false: { label: 'Tidak', variant: 'destructive' as const },
} as const;

export const ASSET_CATALOG_LABELS = {
  LIST: {
    TITLE: 'Asset Catalog',
    EMPTY: 'Tidak ada asset catalog',
    SEARCH: 'Cari unit, serial number, atau nama item...',
    COLUMNS: {
      UNIT_CODE: 'Unit Code',
      ITEM_NAME: 'Item Name',
      SERIAL_NUMBER: 'Serial Number',
      CATEGORY: 'Category',
      WAREHOUSE: 'Warehouse',
      ACQUISITION_DATE: 'Acquisition Date',
      ACQUISITION_COST: 'Acquisition Cost',
      DEPRECIATION_START_DATE: 'Depreciation Start Date',
      BOOK_VALUE: 'Book Value',
      MONTHS_ELAPSED: 'Months Elapsed',
      REGISTERED_AT: 'Registered At',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    FILTERS: {
      STATUS: 'Semua Status',
      CATEGORY: 'Semua Kategori',
      WAREHOUSE: 'Semua Gudang',
    },
    ACTIONS: {
      DETAIL: 'Detail',
    },
    BUTTONS: {
      REGISTER: 'Register Asset',
    },
  },
  REGISTER: {
    TITLE: 'Register Asset',
    STEPS: {
      UNIT: 'Pilih Unit',
      DETAILS: 'Detail Asset',
    },
    FIELDS: {
      RESOURCE_UNIT: 'Resource Unit',
      WAREHOUSE: 'Warehouse',
      SHOW_ALL: 'Tampilkan semua unit',
      ASSET_CATEGORY: 'Asset Category',
      DEPRECIATION_START_DATE: 'Tanggal Mulai Depresiasi',
      SALVAGE_VALUE: 'Salvage Value',
      BOOK_VALUE_AT_REGISTER: 'Book Value Saat Register',
      SERIAL_NUMBER: 'Serial Number',
      NOTES: COMMON_LABELS.FIELDS.DESCRIPTION,
    },
    PLACEHOLDERS: {
      RESOURCE_UNIT: 'Pilih unit resource',
      WAREHOUSE: 'Pilih warehouse',
      ASSET_CATEGORY: 'Pilih asset category',
      DEPRECIATION_START_DATE: 'Pilih tanggal mulai depresiasi',
      SALVAGE_VALUE: 'Masukkan salvage value',
      BOOK_VALUE_AT_REGISTER: 'Masukkan book value saat register',
      SERIAL_NUMBER: 'Masukkan serial number',
      NOTES: 'Masukkan keterangan tambahan',
    },
    BUTTONS: {
      BACK: COMMON_LABELS.ACTIONS.BACK,
      NEXT: 'Lanjut',
      REGISTER: 'Register Asset',
      REGISTERING: COMMON_LABELS.STATE.SAVING,
    },
    WARNINGS: {
      NON_ASSET:
        'Unit ini belum ditandai sebagai asset. Registrasi tetap bisa dilanjutkan setelah konfirmasi.',
      CONSUMABLE_SERIAL:
        'Kategori ini membutuhkan serial number, tetapi unit yang dipilih ditandai sebagai consumable.',
    },
    DIALOG: {
      CONFIRM_TITLE: 'Lanjutkan registrasi asset?',
      CONFIRM_DESCRIPTION:
        'Unit yang dipilih belum ditandai sebagai asset. Lanjutkan registrasi tetap?',
      CONFIRM_CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM_CONFIRM: 'Ya, Lanjutkan',
    },
  },
  DETAIL: {
    TITLE: 'Asset Detail',
    FIELDS: {
      UNIT_CODE: 'Unit Code',
      SERIAL_NUMBER: 'Serial Number',
      ITEM_NAME: 'Item Name',
      CATEGORY: 'Category',
      WAREHOUSE: 'Warehouse',
      ACQUISITION_DATE: 'Acquisition Date',
      ACQUISITION_COST: 'Acquisition Cost',
      DEPRECIATION_START_DATE: 'Depreciation Start Date',
      SALVAGE_VALUE: 'Salvage Value',
      BOOK_VALUE_AT_REGISTER: 'Book Value At Register',
      BOOK_VALUE: 'Book Value',
      ACCUMULATED_DEPRECIATION: 'Accumulated Depreciation',
      MONTHS_ELAPSED: 'Months Elapsed',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      NOTES: 'Notes',
      REGISTERED_BY: 'Registered By',
      REGISTERED_AT: 'Registered At',
    },
    KPIS: {
      BOOK_VALUE: 'Book Value',
      ACCUMULATED_DEPRECIATION: 'Accumulated Depreciation',
      MONTHS_ELAPSED: 'Months Elapsed',
      REMAINING_MONTHS: 'Remaining Months',
    },
    SCHEDULE: {
      TITLE: 'Depreciation Schedule',
      COLUMNS: {
        YEAR: 'Year',
        BEGINNING: 'Beginning',
        EXPENSE: 'Expense',
        ENDING: 'Ending',
        ACCUMULATED: 'Accumulated',
      },
    },
    BUTTONS: {
      CLOSE: COMMON_LABELS.ACTIONS.CLOSE,
      SAVE_NOTES: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  DIALOG: {
    SAVE_NOTES_TITLE: 'Simpan Catatan?',
    SAVE_NOTES_DESCRIPTION: 'Catatan asset registration akan diperbarui.',
    SAVE_NOTES_CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
    SAVE_NOTES_CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
  },
} as const;

export const ASSET_CATEGORY_LABELS = {
  LIST: {
    TITLE: 'Asset Category',
    ADD_BUTTON: 'Tambah Asset Category',
    EMPTY: 'Tidak ada asset category',
    SEARCH: 'Cari kode atau nama category...',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Category Name',
      USEFUL_LIFE_MONTHS: 'Useful Life (Months)',
      DEPRECIATION_METHOD: 'Depreciation Method',
      SALVAGE_VALUE_PERCENT: 'Salvage (%)',
      MAINTENANCE_INTERVAL_MONTHS: 'Maintenance Interval',
      REQUIRES_SERIAL: 'Requires Serial',
      ACTIVE_REGISTRATIONS_COUNT: 'Active Registrations',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    FILTERS: {
      STATUS: 'Semua Status',
      DEPRECIATION_METHOD: 'Semua Metode Depresiasi',
    },
    ACTIONS: COMMON_LABELS.LIST.ACTIONS,
  },
  FORM: {
    CREATE_TITLE: 'Tambah Asset Category',
    EDIT_TITLE: 'Edit Asset Category',
    NOT_FOUND: 'Asset category tidak ditemukan',
    FIELDS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Category Name',
      USEFUL_LIFE_MONTHS: 'Useful Life (Months)',
      DEPRECIATION_METHOD: 'Depreciation Method',
      SALVAGE_VALUE_PERCENT: 'Salvage Value (%)',
      MAINTENANCE_INTERVAL_MONTHS: 'Maintenance Interval (Months)',
      REQUIRES_SERIAL: 'Requires Serial',
      NOTES: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    PLACEHOLDERS: {
      CODE: 'Masukkan kode category',
      NAME: 'Masukkan nama category',
      USEFUL_LIFE_MONTHS: 'Masukkan useful life dalam bulan',
      DEPRECIATION_METHOD: 'Pilih metode depresiasi',
      SALVAGE_VALUE_PERCENT: 'Masukkan persentase salvage',
      MAINTENANCE_INTERVAL_MONTHS: 'Masukkan interval maintenance',
      REQUIRES_SERIAL: 'Pilih apakah memerlukan serial',
      NOTES: 'Masukkan catatan tambahan',
      STATUS: COMMON_LABELS.PLACEHOLDERS.STATUS,
    },
    BUTTONS: {
      BACK: COMMON_LABELS.ACTIONS.BACK,
      SAVE: COMMON_LABELS.ACTIONS.SAVE,
      SAVE_CHANGE: COMMON_LABELS.ACTIONS.SAVE_CHANGE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
  },
  DETAIL: {
    TITLE: 'Detail Asset Category',
    FIELDS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Category Name',
      USEFUL_LIFE_MONTHS: 'Useful Life (Months)',
      DEPRECIATION_METHOD: 'Depreciation Method',
      SALVAGE_VALUE_PERCENT: 'Salvage Value (%)',
      MAINTENANCE_INTERVAL_MONTHS: 'Maintenance Interval (Months)',
      REQUIRES_SERIAL: 'Requires Serial',
      NOTES: COMMON_LABELS.FIELDS.DESCRIPTION,
      ACTIVE_REGISTRATIONS_COUNT: 'Active Registrations',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    STATUS_ACTIVE: COMMON_LABELS.STATUS.ACTIVE,
    STATUS_INACTIVE: COMMON_LABELS.STATUS.INACTIVE,
    BUTTONS: {
      EDIT: COMMON_LABELS.ACTIONS.EDIT,
      CLOSE: COMMON_LABELS.ACTIONS.CLOSE,
    },
    DIALOG: {
      CHANGE_STATUS_TITLE: COMMON_LABELS.DIALOG.CHANGE_STATUS_TITLE,
      CHANGE_STATUS_DESCRIPTION: 'Anda akan mengubah status asset category ini.',
      CHANGE_STATUS_CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CHANGE_STATUS_CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  DIALOG: {
    DELETE_TITLE: 'Hapus Asset Category?',
    DELETE_DESCRIPTION:
      'Tindakan ini tidak dapat dibatalkan. Asset Category akan dihapus secara permanen.',
    CONFIRM_SAVE_TITLE: 'Simpan Asset Category?',
    CONFIRM_SAVE_DESCRIPTION: 'Data Asset Category akan disimpan.',
    CONFIRM_EDIT_TITLE: 'Simpan Perubahan?',
    CONFIRM_EDIT_DESCRIPTION: 'Anda akan menyimpan perubahan pada Asset Category ini.',
    CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
    CONFIRM_DELETE: COMMON_LABELS.ACTIONS.DELETE,
    CONFIRM_SAVE: COMMON_LABELS.ACTIONS.SAVE,
  },
} as const;
