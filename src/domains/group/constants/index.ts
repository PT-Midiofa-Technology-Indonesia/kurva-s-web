import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';

export const GROUP_LABELS = {
  LIST: {
    TITLE: 'Group',
    DESCRIPTION: 'Manage groups in the system',
    ADD_BUTTON: 'Tambah Group Baru',
    EMPTY: 'Tidak ada group ditemukan',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Group',
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      CREATED: COMMON_LABELS.FIELDS.CREATED_AT,
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    STATUS: COMMON_LABELS.STATUS,
    ACTIONS: COMMON_LABELS.LIST.ACTIONS,
    FILTERS: {
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
  },
  EDIT: {
    PAGE_TITLE: 'Edit Group',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    NOT_FOUND: 'Group tidak ditemukan',
    FIELDS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
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
      DESCRIPTION: 'Anda akan menyimpan perubahan pada group ini.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  FORM: {
    TITLE: 'Group',
  },
  // DIALOG intentionally omitted — delete has been removed
  DETAIL: {
    PAGE_TITLE: 'Detail Group',
    FIELDS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Group',
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
      CHANGE_STATUS_DESCRIPTION: 'Anda akan mengubah status group ini.',
      CHANGE_STATUS_CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CHANGE_STATUS_CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
} as const;

export const STATUS_OPTIONS = COMMON_STATUS_OPTIONS;

export const PLACEHOLDERS = {
  CODE: 'Masukan kode group',
  NAME: 'Masukan nama group',
  DESCRIPTION: 'Masukan deskripsi group',
  STATUS: COMMON_LABELS.PLACEHOLDERS.STATUS,
} as const;

export const GROUP_FORM_FIELDS = [
  {
    name: 'code',
    label: 'Kode Group',
    type: 'text' as const,
    placeholder: 'e.g., GRP-001',
    required: true,
  },
  {
    name: 'name',
    label: 'Nama Group',
    type: 'text' as const,
    placeholder: 'e.g., Headquarters Group',
    required: true,
  },
  {
    name: 'description',
    label: 'Deskripsi',
    type: 'textarea' as const,
    placeholder: 'Deskripsi group',
    required: false,
  },
  {
    name: 'isActive',
    label: 'Status',
    type: 'checkbox' as const,
    required: false,
  },
];
