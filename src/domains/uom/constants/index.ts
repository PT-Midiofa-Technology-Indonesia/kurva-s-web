import { COMMON_LABELS } from '@/shared/constants';

export const UOM_LABELS = {
  LIST: {
    TITLE: 'Unit of Meause (UoM)',
    DESCRIPTION: 'Kelola satuan ukuran dalam sistem',
    ADD_BUTTON: 'Tambah UoM Baru',
    EMPTY: 'Satuan ukuran tidak ditemukan',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      GROUP: 'UoM Group',
      NAME: 'Nama UoM',
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      CREATED: COMMON_LABELS.FIELDS.CREATED_AT,
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    STATUS: COMMON_LABELS.STATUS,
    ACTIONS: COMMON_LABELS.LIST.ACTIONS,
    FILTERS: {
      STATUS: 'Semua Status',
      GROUP: 'Semua Group',
    },
  },
  CREATE: {
    PAGE_TITLE: 'Buat UoM Baru',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    FIELDS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      GROUP: 'Kelompok',
      NAME: COMMON_LABELS.FIELDS.NAME,
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Satuan Ukuran Baru?',
      DESCRIPTION: 'Anda akan membuat satuan ukuran baru dengan data yang telah ditentukan.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  EDIT: {
    PAGE_TITLE: 'Edit Satuan Ukuran',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    NOT_FOUND: 'Satuan ukuran tidak ditemukan',
    FIELDS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      GROUP: 'Kelompok',
      NAME: COMMON_LABELS.FIELDS.NAME,
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE_CHANGE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Perubahan?',
      DESCRIPTION: 'Anda akan menyimpan perubahan pada satuan ukuran ini.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  DIALOG: {
    DELETE_TITLE: 'Hapus Satuan Ukuran',
    DELETE_DESCRIPTION: 'Apakah Anda yakin ingin menghapus satuan ukuran ini?',
  },
  DETAIL: {
    PAGE_TITLE: 'Detail Satuan Ukuran',
    FIELDS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      GROUP: 'Kelompok',
      NAME: COMMON_LABELS.FIELDS.NAME,
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    BUTTONS: {
      EDIT: COMMON_LABELS.ACTIONS.EDIT,
      CLOSE: COMMON_LABELS.ACTIONS.CANCEL,
    },
    DIALOG: {
      CHANGE_STATUS_TITLE: COMMON_LABELS.DIALOG.CHANGE_STATUS_TITLE,
      CHANGE_STATUS_DESCRIPTION: 'Anda akan mengubah status satuan ukuran ini.',
      CHANGE_STATUS_CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CHANGE_STATUS_CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
} as const;

export const PLACEHOLDERS = {
  CODE: 'Masukan kode satuan ukuran',
  NAME: 'Masukan nama satuan ukuran',
  GROUP: 'Pilih kelompok',
  DESCRIPTION: 'Masukan deskripsi satuan ukuran',
} as const;
