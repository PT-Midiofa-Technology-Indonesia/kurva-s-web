import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';

export const DOCUMENT_TYPE_LABELS = {
  LIST: {
    TITLE: 'Document Type',
    ADD_BUTTON: 'Tambah Document Type Baru',
    EMPTY: 'Tidak ada document type ditemukan',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Document Type',
      FILE_TYPES: 'Jenis File',
      FILE_SIZE: 'Maks Ukuran',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    STATUS: COMMON_LABELS.STATUS,
    ACTIONS: COMMON_LABELS.LIST.ACTIONS,
    FILTERS: {
      STATUS: 'Semua Status',
    },
    SEARCH_PLACEHOLDER: 'Cari kode atau nama document type',
  },
  CREATE: {
    PAGE_TITLE: 'Buat Document Type Baru',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    FIELDS: {
      CODE: 'Kode Document Type',
      NAME: 'Nama Document Type',
      DESCRIPTION: 'Deskripsi Document Type',
      FILE_SIZE: 'Maks Ukuran File (KB)',
      FILE_TYPES: 'Ekstensi File',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Document Type Baru?',
      DESCRIPTION: 'Anda akan membuat document type baru dengan data yang telah ditentukan.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  EDIT: {
    PAGE_TITLE: 'Edit Document Type',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    NOT_FOUND: 'Document type tidak ditemukan',
    FIELDS: {
      CODE: 'Kode Document Type',
      NAME: 'Nama Document Type',
      DESCRIPTION: 'Deskripsi Document Type',
      FILE_SIZE: 'Maks Ukuran File (kB)',
      FILE_TYPES: 'Ekstensi File',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE_CHANGE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Perubahan?',
      DESCRIPTION: 'Anda akan menyimpan perubahan pada document type ini.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  DETAIL: {
    PAGE_TITLE: 'Detail Document',
    FIELDS: {
      CODE: 'Kode',
      NAME: 'Nama Document Type',
      DESCRIPTION: 'Deskripsi',
      FILE_TYPES: 'Jenis File',
      FILE_SIZE: 'Maks Ukuran File',
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
      CHANGE_STATUS_DESCRIPTION: 'Anda akan mengubah status document type ini.',
      CHANGE_STATUS_CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CHANGE_STATUS_CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  DIALOG: {
    DELETE_TITLE: 'Hapus Document Type',
    DELETE_DESCRIPTION: 'Apakah Anda yakin ingin menghapus document type ini?',
  },
} as const;

export const STATUS_OPTIONS = COMMON_STATUS_OPTIONS;

export const DOCUMENT_TYPE_PLACEHOLDERS = {
  CODE: 'Masukan kode',
  NAME: 'Masukan nama document type',
  DESCRIPTION: 'Tulis deskripsi disini',
  FILE_SIZE: '0',
  STATUS: COMMON_LABELS.PLACEHOLDERS.STATUS,
} as const;

export const DOCUMENT_TYPE_TABS = {
  DOCUMENT_TYPE: 'document-type',
  DOCUMENT_MODULE: 'document-module',
} as const;

export type DocumentTab = (typeof DOCUMENT_TYPE_TABS)[keyof typeof DOCUMENT_TYPE_TABS];

export const DOCUMENT_TAB_LABELS: Record<DocumentTab, string> = {
  [DOCUMENT_TYPE_TABS.DOCUMENT_TYPE]: 'Document Type',
  [DOCUMENT_TYPE_TABS.DOCUMENT_MODULE]: 'Daftar Modul',
};

export const FILE_TYPE_OPTIONS = [
  { label: '.pdf', value: 'pdf' },
  { label: '.jpg', value: 'jpg' },
  { label: '.jpeg', value: 'jpeg' },
  { label: '.png', value: 'png' },
  { label: '.doc', value: 'doc' },
  { label: '.docx', value: 'docx' },
  { label: '.xls', value: 'xls' },
  { label: '.xlsx', value: 'xlsx' },
] as const;

export type FileTypeValue = (typeof FILE_TYPE_OPTIONS)[number]['value'];

// Document Module
export const DOCUMENT_MODULE_LABELS = {
  LIST: {
    TITLE: 'Modul',
    SEARCH_PLACEHOLDER: 'Cari modul',
    EMPTY: 'Tidak ada modul ditemukan',
    COLUMNS: {
      MODULE: 'Nama Modul',
      MANDATORY_DOCS: 'Document Wajib',
      OPTIONAL_DOCS: 'Document Lainnya',
      ACTIONS: 'Aksi',
    },
  },
  SETTINGS: {
    TITLE: 'Pengaturan Modul',
    ADD_DOCUMENT: 'Tambah dokumen',
    SAVE: 'Simpan Perubahan',
    CANCEL: 'Batal',
    SAVING: 'Menyimpan...',
  },
  DIALOG: {
    TITLE: 'Konfirmasi Perubahan',
    DESCRIPTION: 'Anda yakin untuk menambah dan merubah pengaturan modul?',
    CANCEL: 'Batal',
    CONFIRM: 'Simpan',
  },
} as const;
