import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';

export const HIERARCHY_MANAGEMENT_LABELS = {
  LIST: {
    TITLE: 'Hierarchy',
    DESCRIPTION: 'Manage hierarchy in the system',
    ADD_BUTTON: 'Tambah Hierarchy Baru',
    EMPTY: 'Tidak ada hierarki ditemukan',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Hierarchy',
      COMPANY: 'Company',
      DEPARTMENT: 'Department',
      LEVEL: 'Level',
      SPECIALIZATION: 'Spesialisasi',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    STATUS: COMMON_LABELS.STATUS,
    ACTIONS: COMMON_LABELS.LIST.ACTIONS,
    FILTERS: {
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      COMPANY: 'Pilih Company',
    },
  },
  CREATE: {
    PAGE_TITLE: 'Buat Hierarki Baru',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    COMPANY_BANNER: 'Anda menambahkan data untuk',
    FIELDS: {
      DEPARTMENT: 'Department',
      POSITION: 'Job Position',
      POSITION_CODE: 'Kode Job Position',
      LEVEL: 'Level',
      PARENT: 'Parent Position',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Hierarchy Baru?',
      DESCRIPTION: 'Anda akan membuat hierarchy baru dengan data yang telah ditentukan.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  EDIT: {
    PAGE_TITLE: 'Edit Hierarchy',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    NOT_FOUND: 'Hierarki tidak ditemukan',
    COMPANY_BANNER: 'Anda mengubah data untuk',
    FIELDS: {
      DEPARTMENT: 'Department',
      POSITION: 'Job Position',
      POSITION_CODE: 'Kode Job Position',
      LEVEL: 'Level',
      PARENT: 'Parent Position',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE_CHANGE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Perubahan?',
      DESCRIPTION: 'Anda akan menyimpan perubahan pada hierarchy ini.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  FORM: {
    TITLE: 'Hierarchy',
  },
  DIALOG: {
    DELETE_TITLE: 'Delete Hierarchy',
    DELETE_DESCRIPTION: 'Are you sure you want to delete this hierarchy?',
  },
  DETAIL: {
    PAGE_TITLE: 'Detail Hierarchy',
    FIELDS: {
      CODE: 'Kode Job Position',
      NAME: 'Job Position',
      COMPANY: 'Company',
      DEPARTMENT: 'Department',
      LEVEL: 'Level',
      PARENT: 'Parent Position',
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
      CHANGE_STATUS_DESCRIPTION: 'Anda akan mengubah status hierarchy ini.',
      CHANGE_STATUS_CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CHANGE_STATUS_CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
} as const;

export const STATUS_OPTIONS = COMMON_STATUS_OPTIONS;

export const PLACEHOLDERS = {
  DEPARTMENT: 'Pilih department',
  POSITION: 'Pilih job position',
  POSITION_CODE: 'Pilih job position terlebih dahulu',
  LEVEL: 'Pilih job position terlebih dahulu',
  PARENT: 'Pilih parent position',
  STATUS: COMMON_LABELS.PLACEHOLDERS.STATUS,
} as const;
