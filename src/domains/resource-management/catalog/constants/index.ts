import { COMMON_LABELS } from '@/shared/constants';

export const RESOURCE_UNIT_LABELS = {
  LIST: {
    TITLE: 'Resource Catalog',
    DESCRIPTION: 'Manage resource units (equipment & materials) in warehouse',
    ADD_BUTTON: 'Tambah Resource Unit Baru',
    EMPTY: 'Tidak ada resource unit ditemukan',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      ITEM_NAME: 'Nama Item',
      WAREHOUSE: 'Warehouse',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      ACQUISITION_DATE: 'Tgl. Perolehan',
      ACQUISITION_COST: 'Biaya Perolehan',
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    STATUS: COMMON_LABELS.STATUS,
    ACTIONS: {
      ...COMMON_LABELS.LIST.ACTIONS,
      DETAIL: 'Detail',
    },
    FILTERS: {
      WAREHOUSE: 'Semua Warehouse',
      STATUS: 'Semua Status',
    },
  },
  DETAIL: {
    PAGE_TITLE: 'Resource Unit Detail',
    FIELDS: {
      CODE: 'Code',
      ITEM_CATALOG: 'Item Catalog',
      COMPANY: 'Company',
      WAREHOUSE: 'Warehouse',
      STATUS: 'Status',
      ACQUISITION_DATE: 'Acquisition Date',
      ACQUISITION_COST: 'Acquisition Cost',
      NOTES: 'Notes',
    },
    BUTTONS: {
      EDIT: 'Edit',
      CLOSE: 'Close',
    },
  },
  CREATE: {
    PAGE_TITLE: 'Buat Resource Unit Baru',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    FIELDS: {
      ITEM_CATALOG: 'Item Catalog',
      WAREHOUSE: 'Warehouse',
      STATUS: 'Status',
      ACQUISITION_DATE: 'Tanggal Perolehan',
      ACQUISITION_COST: 'Biaya Perolehan',
      NOTES: 'Catatan',
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
  },
  EDIT: {
    PAGE_TITLE: 'Edit Resource Unit',
    NOT_FOUND: 'Resource unit tidak ditemukan',
  },
  DETAIL_DRAWER: {
    TITLE: 'Detail Resource Unit',
    CLOSE: COMMON_LABELS.ACTIONS.CLOSE,
    EDIT: COMMON_LABELS.ACTIONS.EDIT,
  },
  DELETE_DIALOG: {
    TITLE: 'Hapus Resource Unit?',
    DESCRIPTION: 'Tindakan ini tidak dapat dibatalkan.',
    CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
    CONFIRM: COMMON_LABELS.ACTIONS.DELETE,
  },
};

export const RESOURCE_UNIT_STATUS_OPTIONS = [
  { label: 'Available', value: 'available' },
  { label: 'Allocated', value: 'allocated' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Retired', value: 'retired' },
];
