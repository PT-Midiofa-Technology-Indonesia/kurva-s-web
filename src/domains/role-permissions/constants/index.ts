import type { FormFieldConfig } from '@/components/organisms/FormGenerator';
import { COMMON_LABELS } from '@/shared/constants';

interface RoleFormValues {
  name: string;
  status: 'active' | 'inactive';
}

const SHARED_FIELDS = {
  NAME_LABEL: 'Nama Role',
  STATUS_LABEL: 'Status',
  STATUS_ACTIVE: COMMON_LABELS.STATUS.ACTIVE,
  STATUS_INACTIVE: COMMON_LABELS.STATUS.INACTIVE,
} as const;

const SHARED_PERMISSIONS = {
  SELECT_ALL: 'Pilih semua',
  WEB: 'Website',
  MOBILE: 'Mobile',
} as const;

export const ROLE_LABELS = {
  LIST: {
    PAGE_TITLE: 'Role Permission',
    ADD_BUTTON: 'Tambah Role Baru',
    SEARCH_PLACEHOLDER: 'Cari Role',
    COLUMNS: {
      ROLE: 'Role',
      USERS_COUNT: 'User',
      STATUS: 'Status',
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    ERROR: 'Failed to load roles',
    EMPTY: 'Tidak ada role ditemukan',
    STATUS: COMMON_LABELS.STATUS,
    ...COMMON_LABELS.LIST,
  },
  CREATE: {
    PAGE_TITLE: 'Buat Role Baru',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    FIELDS: {
      ...SHARED_FIELDS,
      NAME_PLACEHOLDER: 'Type here',
    },
    PERMISSIONS: SHARED_PERMISSIONS,
    BUTTONS: {
      RESET: 'Reset',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Role Baru?',
      DESCRIPTION: 'Anda akan membuat role baru dengan konfigurasi yang telah ditentukan.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  EDIT: {
    PAGE_TITLE: 'Edit Role Permission',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    NOT_FOUND: 'Role tidak ditemukan',
    FIELDS: SHARED_FIELDS,
    PERMISSIONS: SHARED_PERMISSIONS,
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE_CHANGE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Perubahan?',
      DESCRIPTION: 'Anda akan mengupdate konfigurasi role ini.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  DETAIL: {
    PAGE_TITLE: 'Detail Role Permission',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    FIELDS: {
      ...SHARED_FIELDS,
      USERS_COUNT: 'User menggunakan Role ini',
    },
    PERMISSIONS: {
      WEB: SHARED_PERMISSIONS.WEB,
      MOBILE: SHARED_PERMISSIONS.MOBILE,
    },
    BUTTONS: {
      BACK: COMMON_LABELS.ACTIONS.BACK,
      EDIT: COMMON_LABELS.ACTIONS.EDIT,
      DELETE: COMMON_LABELS.ACTIONS.DELETE,
    },
    DELETE_DIALOG: {
      TITLE: 'Hapus Role?',
      DESCRIPTION: 'Anda akan menghapus role ini secara permanen.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.DELETE,
    },
    NOT_FOUND: COMMON_LABELS.NOT_FOUND,
  },
} as const;

export const ROLE_FORM_FIELDS: FormFieldConfig<RoleFormValues>[] = [
  {
    name: 'name',
    type: 'text',
    label: SHARED_FIELDS.NAME_LABEL,
    placeholder: 'Type here',
    required: true,
    colSpan: 6,
  },
  {
    name: 'status',
    type: 'select',
    label: SHARED_FIELDS.STATUS_LABEL,
    required: true,
    options: [
      { value: 'active', label: SHARED_FIELDS.STATUS_ACTIVE },
      { value: 'inactive', label: SHARED_FIELDS.STATUS_INACTIVE },
    ],
    colSpan: 6,
  },
];
