import { COMMON_LABELS } from '@/shared/constants';

export const APPROVAL_WORKFLOW_LABELS = {
  LIST: {
    TITLE: 'Approval Workflow',
    EMPTY: 'Belum ada data Approval Workflow.',
    COLUMNS: {
      NAME: 'Approval Workflow',
      STEPS_COUNT: 'Jumlah Langkah',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    STATUS: COMMON_LABELS.STATUS,
    ACTIONS: {
      SETTINGS: 'Pengaturan',
    },
    FILTERS: {
      COMPANY: 'Pilih Company',
    },
    SEARCH_PLACEHOLDER: 'Cari approval workflow...',
  },
  SETTINGS_DRAWER: {
    TITLE: 'Pengaturan Approval',
    STEP_LABEL: 'Langkah',
    FIELDS: {
      IS_FINANCE: 'Workflow Finance',
      NOMINAL_THRESHOLD: 'Batas Nominal',
      APPROVER_TYPE: 'Tipe Approver',
      APPROVER_ID: 'Bagian',
      PIC: 'PIC',
    },
    PLACEHOLDERS: {
      APPROVER_TYPE: 'Pilih tipe approver',
      APPROVER_ID: 'Pilih Bagian',
      PIC: 'Semua',
      NOMINAL_THRESHOLD: 'Masukan nominal Threshold',
    },
    DESCRIPTIONS: {
      NOMINAL_THRESHOLD: 'Hanya berlaku jika Workflow Finance aktif. Kosongkan jika tanpa batas.',
    },
    BUTTONS: {
      ADD_STEP: 'Tambah Step',
      SAVE: 'Simpan Perubahan',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
  },
} as const;

export const APPROVER_TYPE_OPTIONS = [
  { label: 'Role', value: 'role' },
  { label: 'Employee', value: 'employee' },
  { label: 'Department', value: 'department' },
];
