import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';

export const PROJECT_CAPABILITY_LABELS = {
  LIST: {
    TITLE: 'Project Capability',
    DESCRIPTION: 'Manage project capabilities in the system',
    ADD_BUTTON: 'Tambah Project Capability Baru',
    EMPTY: 'Tidak ada project capability ditemukan',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Project Capability',
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
  CREATE: {
    PAGE_TITLE: 'Buat Project Capability Baru',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    FIELDS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
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
      TITLE: 'Simpan Project Capability Baru?',
      DESCRIPTION: 'Anda akan membuat project capability baru dengan data yang telah ditentukan.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  EDIT: {
    PAGE_TITLE: 'Edit Project Capability',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    NOT_FOUND: 'Project capability tidak ditemukan',
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
      DESCRIPTION: 'Anda akan menyimpan perubahan pada project capability ini.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  FORM: {
    TITLE: 'Project Capability',
  },
  DIALOG: {
    DELETE_TITLE: 'Delete Project Capability',
    DELETE_DESCRIPTION: 'Are you sure you want to delete this project capability?',
  },
  DETAIL: {
    PAGE_TITLE: 'Detail Project Capability',
    FIELDS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Project Capability',
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
      CHANGE_STATUS_DESCRIPTION: 'Anda akan mengubah status project capability ini.',
      CHANGE_STATUS_CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CHANGE_STATUS_CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
} as const;

export const STATUS_OPTIONS = COMMON_STATUS_OPTIONS;

export const PLACEHOLDERS = {
  CODE: 'Masukan kode project capability',
  NAME: 'Masukan nama project capability',
  DESCRIPTION: 'Masukan deskripsi project capability',
  STATUS: COMMON_LABELS.PLACEHOLDERS.STATUS,
} as const;

export const PROJECT_CAPABILITY_FORM_FIELDS = [
  {
    name: 'code',
    label: 'Code',
    type: 'text' as const,
    placeholder: 'e.g., PC-001',
    required: true,
  },
  {
    name: 'name',
    label: 'Name',
    type: 'text' as const,
    placeholder: 'e.g., Project Capability Name',
    required: true,
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea' as const,
    placeholder: 'Project capability description',
    required: false,
  },
  {
    name: 'isActive',
    label: 'Active',
    type: 'checkbox' as const,
    required: false,
  },
];
