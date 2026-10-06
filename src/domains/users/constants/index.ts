import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';

const ROLE = {
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
} as const;

const USER_TYPE = {
  SUPER_ADMIN: 'Super Admin',
  CONTENT_MANAGER: 'Content Manager',
  REGULAR_USER: 'Regular User',
  EMPLOYEE: 'Employee',
  NON_EMPLOYEE: 'Non Employee',
} as const;

const ACTIONS = {
  EDIT: 'Edit',
  VIEW: 'View',
  DELETE: 'Delete',
} as const;

export const PLACEHOLDERS = {
  STATUS: 'Semua Status',
  ROLE: 'Semua Role',
  USER_TYPE: 'Semua Tipe User',
  SEARCH: 'Search by name, email, or role...',
  NAME: 'Masukan nama user',
  EMAIL: 'Masukan email',
  PHONE_NUMBER: '',
  PASSWORD: 'Masukan password',
  ADDRESS: 'Masukan alamat',
  ROLE_SELECT: 'Pilih role',
} as const;

export const USER_LABELS = {
  LIST: {
    PAGE_TITLE: 'Users',
    ADD_BUTTON: 'Tambah User Baru',
    SEARCH_PLACEHOLDER: PLACEHOLDERS.SEARCH,
    ERROR: 'Failed to load users. Please try again.',
    EMPTY: 'Tidak ada user ditemukan',
    COLUMNS: {
      USER: 'User',
      EMAIL: 'Email',
      PHONE: 'Telepon',
      ROLE: 'Role',
      USER_TYPE: 'Tipe User',
      STATUS: 'Status',
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    STATUS: COMMON_LABELS.STATUS,
    ACTIONS: ACTIONS,
    FILTERS: {
      STATUS: PLACEHOLDERS.STATUS,
      ROLE: PLACEHOLDERS.ROLE,
      USER_TYPE: PLACEHOLDERS.USER_TYPE,
    },
  },
  CREATE: {
    PAGE_TITLE: 'Buat User Baru',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    FIELDS: {
      USER_TYPE: 'User Type',
      COMPANY: 'Company',
      EMPLOYEE_NAME: 'Employee',
      NAME: 'Nama',
      EMAIL: 'Email',
      PHONE_NUMBER: 'No. Telepon',
      ROLE: 'Role',
      STATUS: 'Status',
      PASSWORD: 'Password',
    },
    EMPLOYEE_ALERT: {
      TITLE: 'Keterangan',
      DESCRIPTION:
        'Data ini diambil dari data Employee. Perubahan hanya dapat dilakukan melalui menu Employee.',
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan User Baru?',
      DESCRIPTION: 'Anda akan membuat user baru dengan data yang telah ditentukan.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  EDIT: {
    PAGE_TITLE: 'Edit User',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    NOT_FOUND: 'User tidak ditemukan',
    FIELDS: {
      USER_TYPE: 'User Type',
      COMPANY: 'Company',
      EMPLOYEE_NAME: 'Employee',
      NAME: 'Nama',
      EMAIL: 'Email',
      PHONE_NUMBER: 'No. Telepon',
      ROLE: 'Role',
      STATUS: 'Status',
      PASSWORD: 'Password',
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE_CHANGE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Perubahan?',
      DESCRIPTION: 'Anda akan menyimpan perubahan pada user ini.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  DETAIL: {
    PAGE_TITLE: 'Detail User',
    BACK_BUTTON: 'Kembali',
    EDIT_BUTTON: 'Edit',
    DELETE_BUTTON: 'Hapus',
    FIELDS: {
      NAME: 'Nama',
      USER_TYPE: 'Tipe User',
      STATUS: 'Status',
      COMPANY: 'Company',
      EMPLOYEE: 'Employee',
      ROLE: 'Role',
      EMAIL: 'Email',
      PHONE: 'Telepon',
      PASSWORD: 'Password',
    },
    STATUS_ACTIVE: COMMON_LABELS.STATUS.ACTIVE,
    STATUS_INACTIVE: COMMON_LABELS.STATUS.INACTIVE,
    DELETE_DIALOG: {
      TITLE: 'Hapus User?',
      DESCRIPTION: 'Anda akan menghapus user ini secara permanen.',
      CANCEL: 'Batal',
      CONFIRM: 'Hapus',
    },
    STATUS_DIALOG: {
      TITLE: 'Simpan Status Baru?',
      DESCRIPTION: 'Anda akan merubah status user ini.',
      CANCEL: 'Batal',
      CONFIRM: 'Simpan',
    },
    NOT_FOUND: COMMON_LABELS.NOT_FOUND,
  },
} as const;

export const USER_STATUS_OPTIONS = COMMON_STATUS_OPTIONS;

export const USER_ROLE_OPTIONS = [
  { label: ROLE.ADMIN, value: ROLE.ADMIN },
  { label: ROLE.EDITOR, value: ROLE.EDITOR },
  { label: ROLE.VIEWER, value: ROLE.VIEWER },
];

export const USER_TYPE_SELECT_OPTIONS = [
  { value: 'non_employee', label: USER_TYPE.NON_EMPLOYEE },
  { value: 'employee', label: USER_TYPE.EMPLOYEE },
];

export const ROLE_SELECT_OPTIONS = [
  { value: 'admin', label: ROLE.ADMIN },
  { value: 'editor', label: ROLE.EDITOR },
  { value: 'viewer', label: ROLE.VIEWER },
];

export const STATUS_SELECT_OPTIONS = [
  { value: '1', label: COMMON_LABELS.STATUS.ACTIVE },
  { value: '0', label: COMMON_LABELS.STATUS.INACTIVE },
];
