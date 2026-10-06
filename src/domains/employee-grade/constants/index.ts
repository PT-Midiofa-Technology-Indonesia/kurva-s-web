import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';

export const STATUS_OPTIONS = COMMON_STATUS_OPTIONS;

export const EMPLOYEE_GRADE_LABELS = {
  LIST: {
    TITLE: 'Golongan',
    DESCRIPTION: 'Manage employee grades in the system',
    ADD_BUTTON: 'Tambah Golongan Baru',
    EMPTY: 'Tidak ada golongan ditemukan',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Golongan',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    STATUS: COMMON_LABELS.STATUS,
    ACTIONS: COMMON_LABELS.LIST.ACTIONS,
    FILTERS: {
      STATUS: 'Semua Status',
    },
  },
  CREATE: {
    PAGE_TITLE: 'Buat Golongan Baru',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    FIELDS: {
      CODE: 'Kode Golongan',
      NAME: 'Nama Golongan',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Golongan Baru?',
      DESCRIPTION: 'Anda akan membuat golongan baru dengan data yang telah ditentukan.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  EDIT: {
    PAGE_TITLE: 'Edit Golongan',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    NOT_FOUND: 'Golongan tidak ditemukan',
    FIELDS: {
      CODE: 'Kode Golongan',
      NAME: 'Nama Golongan',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE_CHANGE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Perubahan?',
      DESCRIPTION: 'Anda akan menyimpan perubahan pada golongan ini.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  FORM: {
    TITLE: 'Golongan',
  },
  DIALOG: {
    DELETE_TITLE: 'Hapus Golongan',
    DELETE_DESCRIPTION: 'Apakah Anda yakin ingin menghapus golongan ini?',
  },
  DETAIL: {
    PAGE_TITLE: 'Detail Golongan',
    FIELDS: {
      CODE: 'Kode Golongan',
      NAME: 'Nama Golongan',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
    },
    STATUS_ACTIVE: COMMON_LABELS.STATUS.ACTIVE,
    STATUS_INACTIVE: COMMON_LABELS.STATUS.INACTIVE,
    BUTTONS: {
      EDIT: COMMON_LABELS.ACTIONS.EDIT,
      CLOSE: COMMON_LABELS.ACTIONS.CANCEL,
    },
    DIALOG: {
      CHANGE_STATUS_TITLE: COMMON_LABELS.DIALOG.CHANGE_STATUS_TITLE,
      CHANGE_STATUS_DESCRIPTION: 'Anda akan mengubah status golongan ini.',
      CHANGE_STATUS_CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CHANGE_STATUS_CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
} as const;

export const PLACEHOLDERS = {
  CODE: 'Masukan kode golongan',
  NAME: 'Masukan nama golongan',
  DESCRIPTION: 'Masukan deskripsi',
  STATUS: COMMON_LABELS.PLACEHOLDERS.STATUS,
} as const;
