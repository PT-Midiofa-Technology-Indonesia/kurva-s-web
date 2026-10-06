import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';

const SKILL_CATALOG = {
  label: 'Katalog Skill',
  placeholder: 'Pilih katalog skill',
} as const;

export const POSITION_LABELS = {
  LIST: {
    TITLE: 'Position',
    DESCRIPTION: 'Manage positions in the system',
    ADD_BUTTON: 'Tambah Position Baru',
    EMPTY: 'Tidak ada position ditemukan',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Position',
      LEVEL: 'Level',
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
    PAGE_TITLE: 'Buat Position Baru',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    FIELDS: {
      CODE: 'Kode Position',
      NAME: 'Nama Position',
      LEVEL: 'Level',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      SKILL_CATALOG: SKILL_CATALOG.label,
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Position Baru?',
      DESCRIPTION: 'Anda akan membuat position baru dengan data yang telah ditentukan.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  EDIT: {
    PAGE_TITLE: 'Edit Position',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    NOT_FOUND: 'Position tidak ditemukan',
    FIELDS: {
      CODE: 'Kode Position',
      NAME: 'Nama Position',
      LEVEL: 'Level',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      SKILL_CATALOG: SKILL_CATALOG.label,
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE_CHANGE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Perubahan?',
      DESCRIPTION: 'Anda akan menyimpan perubahan pada position ini.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  FORM: {
    TITLE: 'Position',
  },
  DIALOG: {
    DELETE_TITLE: 'Hapus Position',
    DELETE_DESCRIPTION: 'Apakah Anda yakin ingin menghapus position ini?',
  },
  DETAIL: {
    PAGE_TITLE: 'Detail Position',
    FIELDS: {
      CODE: 'Kode Position',
      NAME: 'Nama Position',
      LEVEL: 'Level',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      SKILL_CATALOG: SKILL_CATALOG.label,
    },
    STATUS_ACTIVE: COMMON_LABELS.STATUS.ACTIVE,
    STATUS_INACTIVE: COMMON_LABELS.STATUS.INACTIVE,
    BUTTONS: {
      EDIT: COMMON_LABELS.ACTIONS.EDIT,
      CLOSE: COMMON_LABELS.ACTIONS.CANCEL,
    },
    DIALOG: {
      CHANGE_STATUS_TITLE: COMMON_LABELS.DIALOG.CHANGE_STATUS_TITLE,
      CHANGE_STATUS_DESCRIPTION: 'Anda akan mengubah status position ini.',
      CHANGE_STATUS_CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CHANGE_STATUS_CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
} as const;

export const STATUS_OPTIONS = COMMON_STATUS_OPTIONS;

export const PLACEHOLDERS = {
  CODE: 'Masukan kode',
  NAME: 'Masukan nama',
  LEVEL: 'Pilih level',
  STATUS: COMMON_LABELS.PLACEHOLDERS.STATUS,
  SKILL_CATALOG: SKILL_CATALOG.placeholder,
} as const;
