import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';

export const ITEM_MASTER_TABS = {
  ITEM_TYPE: 'item-type',
  ITEM_CATEGORY: 'item-category',
  ITEM_CATALOG: 'item-catalog',
} as const;

export type ItemMasterTab = (typeof ITEM_MASTER_TABS)[keyof typeof ITEM_MASTER_TABS];

export const ITEM_MASTER_TAB_LABELS: Record<ItemMasterTab, string> = {
  [ITEM_MASTER_TABS.ITEM_TYPE]: 'Item Type',
  [ITEM_MASTER_TABS.ITEM_CATEGORY]: 'Item Category',
  [ITEM_MASTER_TABS.ITEM_CATALOG]: 'Item Catalog',
};

export const ITEM_MASTER_TAB_REQUIRED_PERMISSIONS: Record<ItemMasterTab, string> = {
  [ITEM_MASTER_TABS.ITEM_TYPE]: 'md.im.ityp',
  [ITEM_MASTER_TABS.ITEM_CATEGORY]: 'md.im.ictg',
  [ITEM_MASTER_TABS.ITEM_CATALOG]: 'md.im.ictlg',
};

export const ITEM_TYPE_LABELS = {
  LIST: {
    TITLE: 'Item Type',
    EMPTY: 'Tidak ada Item Type',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Item Type',
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    STATUS: COMMON_LABELS.STATUS,
    ACTIONS: COMMON_LABELS.LIST.ACTIONS,
    FILTERS: {
      STATUS: 'Semua Status',
    },
  },
} as const;

export const STATUS_OPTIONS = COMMON_STATUS_OPTIONS;

export const YES_NO_OPTIONS = [
  { label: 'Ya', value: 'true' },
  { label: 'Tidak', value: 'false' },
];

export const ITEM_CATEGORY_LABELS = {
  LIST: {
    TITLE: 'Item Category',
    ADD_BUTTON: 'Tambah Item Category Baru',
    EMPTY: 'Tidak ada item category',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Item Category',
      ITEM_TYPE: 'Item Type',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    STATUS: COMMON_LABELS.STATUS,
    ACTIONS: COMMON_LABELS.LIST.ACTIONS,
    FILTERS: {
      STATUS: 'Semua Status',
      ITEM_TYPE: 'Semua Item Type',
    },
  },
  FORM: {
    CREATE_TITLE: 'Tambah Item Category',
    EDIT_TITLE: 'Edit Item Category',
    NOT_FOUND: 'Item category tidak ditemukan',
    FIELDS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Item Category',
      ITEM_TYPE: 'Item Type',
      PARENT: 'Kategori Induk',
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    PLACEHOLDERS: {
      CODE: 'Masukkan kode kategori',
      NAME: 'Masukkan nama Item Category',
      ITEM_TYPE: 'Pilih Item Type',
      PARENT: 'Pilih kategori induk (opsional)',
      DESCRIPTION: 'Masukkan deskripsi kategori',
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
    TITLE: 'Detail Item Category',
    FIELDS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Item Category',
      ITEM_TYPE: 'Item Type',
      PARENT: 'Kategori Induk',
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    STATUS_ACTIVE: COMMON_LABELS.STATUS.ACTIVE,
    STATUS_INACTIVE: COMMON_LABELS.STATUS.INACTIVE,
    BUTTONS: {
      EDIT: COMMON_LABELS.ACTIONS.EDIT,
      CLOSE: COMMON_LABELS.ACTIONS.CANCEL,
    },
    DIALOG: {
      CHANGE_STATUS_TITLE: COMMON_LABELS.DIALOG.CHANGE_STATUS_TITLE,
      CHANGE_STATUS_DESCRIPTION: 'Anda akan mengubah status kategori item ini.',
      CHANGE_STATUS_CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CHANGE_STATUS_CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  DIALOG: {
    DELETE_TITLE: 'Hapus Item Category?',
    DELETE_DESCRIPTION:
      'Tindakan ini tidak dapat dibatalkan. Item Category akan dihapus secara permanen.',
    CONFIRM_SAVE_TITLE: 'Simpan Item Category?',
    CONFIRM_SAVE_DESCRIPTION: 'Data Item Category akan disimpan.',
    CONFIRM_EDIT_TITLE: 'Simpan Perubahan?',
    CONFIRM_EDIT_DESCRIPTION: 'Anda akan menyimpan perubahan pada Item Category ini.',
    CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
    CONFIRM_DELETE: COMMON_LABELS.ACTIONS.DELETE,
    CONFIRM_SAVE: COMMON_LABELS.ACTIONS.SAVE,
  },
} as const;

export const ITEM_CATALOG_LABELS = {
  LIST: {
    TITLE: 'Item Catalog',
    ADD_BUTTON: 'Tambah Item Catalog Baru',
    EMPTY: 'Tidak ada item catalog',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Item Catalog',
      ITEM_TYPE: 'Item Type',
      ITEM_CATEGORY: 'Item Category',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    STATUS: COMMON_LABELS.STATUS,
    ACTIONS: COMMON_LABELS.LIST.ACTIONS,
    FILTERS: {
      STATUS: 'Semua Status',
      ITEM_TYPE: 'Semua Item Type',
      ITEM_CATEGORY: 'Semua Item Category',
    },
    BUTTONS: {
      DOWNLOAD_TEMPLATE: 'Download Template',
      IMPORT: 'Import',
    },
    IMPORT_EXPORT: {
      TOAST_DOWNLOAD_ID: 'item-catalog-download',
      TOAST_IMPORT_ID: 'item-catalog-import',
      FILE_NAME: 'item-catalog-template.xlsx',
      MESSAGES: {
        DOWNLOAD_PROGRESS: (percent: number) => `Mengunduh template... ${percent}%`,
        DOWNLOAD_SUCCESS: 'Template berhasil diunduh',
        DOWNLOAD_ERROR: 'Gagal mengunduh template',
        IMPORT_PROGRESS: (percent: number) => `Mengupload file... ${percent}%`,
        IMPORT_PROCESSING: 'Memproses data...',
        IMPORT_SUCCESS: (count: number) => `${count} baris berhasil diimport`,
        IMPORT_FAILED: (count: number) => `${count} baris gagal diimport`,
        IMPORT_ERROR: 'Gagal mengimport data',
      },
    },
  },
  FORM: {
    CREATE_TITLE: 'Tambah Item Catalog',
    EDIT_TITLE: 'Edit Item Catalog',
    NOT_FOUND: 'Item catalog tidak ditemukan',
    FIELDS: {
      CODE: 'Kode Item Catalog',
      NAME: 'Nama Item Catalog',
      ITEM_TYPE: 'Item Type',
      ITEM_CATEGORY: 'Item Category',
      UOM: 'UoM',
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      IS_ALLOCATABLE: 'Item Dapat Dialokasikan',
      IS_ASSET: 'Item Aset',
      IS_STOCK: 'Kelola Item Sebagai Stok',
      IS_SENSITIVE: 'Item Sensitif',
      DEFAULT_PRICE: 'Harga Default',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    PLACEHOLDERS: {
      CODE: 'Masukkan kode item',
      NAME: 'Masukkan nama item catalog',
      ITEM_TYPE: 'Pilih Item Type',
      ITEM_CATEGORY: 'Pilih Item Category',
      UOM: 'Pilih UoM',
      DESCRIPTION: 'Masukkan deskripsi item',
      DEFAULT_PRICE: 'Masukkan harga default',
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
    TITLE: 'Detail Item Catalog',
    FIELDS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Item Catalog',
      ITEM_TYPE: 'Item Type',
      ITEM_CATEGORY: 'Item Category',
      UOM: 'UoM',
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      IS_ALLOCATABLE: 'Item Dapat Dialokasikan',
      IS_ASSET: 'Item Aset',
      IS_STOCK: 'Kelola Item Sebagai Stok',
      IS_SENSITIVE: 'Item Sensitif',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    STATUS_ACTIVE: COMMON_LABELS.STATUS.ACTIVE,
    STATUS_INACTIVE: COMMON_LABELS.STATUS.INACTIVE,
    BUTTONS: {
      EDIT: 'Edit Data',
      CLOSE: COMMON_LABELS.ACTIONS.CANCEL,
    },
    DIALOG: {
      CHANGE_STATUS_TITLE: COMMON_LABELS.DIALOG.CHANGE_STATUS_TITLE,
      CHANGE_STATUS_DESCRIPTION: 'Anda akan mengubah status item catalog ini.',
      CHANGE_STATUS_CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CHANGE_STATUS_CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  DIALOG: {
    DELETE_TITLE: 'Hapus Item Catalog?',
    DELETE_DESCRIPTION:
      'Tindakan ini tidak dapat dibatalkan. Item Catalog akan dihapus secara permanen.',
    CONFIRM_SAVE_TITLE: 'Simpan Item Catalog?',
    CONFIRM_SAVE_DESCRIPTION: 'Data Item Catalog akan disimpan.',
    CONFIRM_EDIT_TITLE: 'Simpan Perubahan?',
    CONFIRM_EDIT_DESCRIPTION: 'Anda akan menyimpan perubahan pada Item Catalog ini.',
    CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
    CONFIRM_DELETE: COMMON_LABELS.ACTIONS.DELETE,
    CONFIRM_SAVE: COMMON_LABELS.ACTIONS.SAVE,
  },
} as const;
