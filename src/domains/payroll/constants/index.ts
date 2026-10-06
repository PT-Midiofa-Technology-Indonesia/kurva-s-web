export type PayrollTab = 'payroll-component' | 'salary-structure' | 'adjustment' | 'draft';

export const DEFAULT_TAB: PayrollTab = 'payroll-component';

export const TAB_OPTIONS: { value: PayrollTab; label: string }[] = [
  { value: 'payroll-component', label: 'Payroll Component' },
  { value: 'salary-structure', label: 'Salary Structure' },
  { value: 'adjustment', label: 'Employee Salary Adjustment' },
  { value: 'draft', label: 'Payroll' },
];

export const PAYROLL_LABELS = {
  PAGE_TITLE: 'Payroll',
  COMPONENT: {
    TITLE: 'Payroll Component',
    SEARCH: 'Pencarian',
    EMPTY: 'Tidak ada komponen payroll',
    COLUMNS: {
      CODE: 'Code',
      CATEGORY: 'Category',
      NAME: 'Nama',
      DESCRIPTION: 'Description',
      SORT_ORDER: 'Sort Order',
      IS_CONFIGURABLE: 'Configurable',
      VALUE_TYPE: 'Tipe Nilai',
    },
  },
  SALARY_STRUCTURE: {
    TITLE: 'Salary Structure',
    SEARCH: 'Pencarian',
    EMPTY: 'Tidak ada struktur gaji',
    COLUMNS: {
      GRADE: 'Golongan',
      NAME: 'Nama',
      MONTHLY: 'Monthly',
      DAILY: 'Daily',
      HOURLY: 'Hourly',
      AMOUNT: 'Default',
      MIN: 'Min',
      MAX: 'Max',
      ACTION: 'Action',
    },
    FORM: {
      TITLE: 'Edit Salary Structure',
      SAVE: 'Simpan',
      CANCEL: 'Batal',
    },
  },
  FILTER: {
    CATEGORY: 'Category',
  },
} as const;

export const CATEGORY_OPTIONS = [
  { value: 'pokok', label: 'Pokok' },
  { value: 'tunjangan', label: 'Tunjangan' },
  { value: 'variable', label: 'Variabel' },
  { value: 'lembur', label: 'Lembur' },
  { value: 'potongan', label: 'Potongan' },
] as const;

const BADGE_BASE_CLASS = 'border-0 rounded-md px-2 py-0.5 text-xs font-medium';

export const CATEGORY_BADGE: Record<string, { className: string; label: string }> = {
  pokok: {
    className: `bg-teal-100 text-teal-700 hover:bg-teal-100 ${BADGE_BASE_CLASS}`,
    label: 'Pokok',
  },
  tunjangan: {
    className: `bg-green-100 text-green-600 hover:bg-green-100 ${BADGE_BASE_CLASS}`,
    label: 'Tunjangan',
  },
  variable: {
    className: `bg-purple-100 text-purple-700 hover:bg-purple-100 ${BADGE_BASE_CLASS}`,
    label: 'Variabel',
  },
  lembur: {
    className: `bg-amber-100 text-amber-700 hover:bg-amber-100 ${BADGE_BASE_CLASS}`,
    label: 'Lembur',
  },
  potongan: {
    className: `bg-red-100 text-red-700 hover:bg-red-100 ${BADGE_BASE_CLASS}`,
    label: 'Potongan',
  },
};

export const COMPLETENESS_BADGE: Record<string, { className: string; label: string }> = {
  Complete: {
    className: `bg-green-100 text-green-600 hover:bg-green-100 ${BADGE_BASE_CLASS}`,
    label: 'Complete',
  },
  Incomplete: {
    className: `bg-red-100 text-red-600 hover:bg-red-100 ${BADGE_BASE_CLASS}`,
    label: 'Incomplete',
  },
};

export const CONFIGURABLE_BADGE: Record<'true' | 'false', { className: string; label: string }> = {
  true: {
    className: `bg-green-100 text-green-600 hover:bg-green-100 ${BADGE_BASE_CLASS}`,
    label: 'Ya',
  },
  false: {
    className: `bg-slate-100 text-slate-600 hover:bg-slate-100 ${BADGE_BASE_CLASS}`,
    label: 'Tidak',
  },
};

export const PAYROLL_DRAFT_LABELS = {
  PAGE_TITLE: 'Payroll Draft',
  CREATE_BUTTON: 'Create Draft',
  SEARCH_PLACEHOLDER: 'Cari draft...',
  COLUMNS: {
    CODE: 'Code',
    PERIODE: 'Periode',
    TOTAL_AMOUNT: 'Total Amount',
    PERIOD_TYPE: 'Period Type',
    STATUS: 'Status',
    NOTES: 'Notes',
    ACTION: 'Action',
  },
  EMPTY: {
    TITLE: 'Data Not Found',
    DESCRIPTION: 'Data komponen belum tersedia. Silakan hubungi administrator sistem.',
  },
  MODAL: {
    TITLE: 'Create Draft',
    CANCEL: 'Cancel',
    SUBMIT: 'Submit',
    FIELDS: {
      PERIOD_TYPE: 'Period Type',
      PERIOD_START: 'Period Start',
      PERIOD_END: 'Period End',
      NOTES: 'Notes',
    },
  },
  ACTIONS: {
    DETAIL: 'Detail',
  },
};

export const PERIOD_TYPE_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'daily', label: 'Daily' },
  { value: 'hourly', label: 'Hourly' },
];

export const PAYROLL_DRAFT_STATUS_BADGE: Record<string, { className: string; label: string }> = {
  draft: { className: 'bg-slate-100 text-slate-600', label: 'Draft' },
  generated: { className: 'bg-amber-100 text-amber-600', label: 'Generated' },
  cancelled: { className: 'bg-rose-100 text-rose-500', label: 'Cancelled' },
  paid: { className: 'bg-green-100 text-green-600', label: 'Paid' },
};

export const PAYROLL_DRAFT_STATUS_BADGE_FALLBACK_CLASS = 'bg-slate-100 text-slate-600';

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'generated', label: 'Generated' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'paid', label: 'Paid' },
];

// ── Employee Salary Adjustment ───────────────────────────────────────────────

export const ADJUSTMENT_LABELS = {
  TITLE: 'Employee Salary Adjustment',
  SEARCH: 'Pencarian',
  EMPTY: 'Tidak ada data karyawan',
  COLUMNS: {
    NAME: 'Name',
    GOLONGAN: 'Golongan',
    SALARY_TYPE: 'Salary Type',
    HAS_ADJUSTMENT: 'Has Adjustment',
    ADJUSTMENT_COUNT: 'Jumlah Adjustment',
    ACTION: 'Action',
  },
  FILTER: {
    BUTTON: 'Filter',
    GOLONGAN: 'Golongan',
    HAS_ADJUSTMENT: 'Has Adjustment',
  },
  ACTIONS: {
    EDIT: 'Edit',
    DELETE: 'Delete',
  },
  DIALOG: {
    DELETE_TITLE: 'Hapus Adjustment Salary',
    DELETE_DESCRIPTION: 'Apakah Anda yakin ingin menghapus adjustment salary karyawan ini?',
  },
  NOT_PAYROLL_READY: 'Karyawan belum di-set Golongan/Salary Type. Set di Employee Detail.',
  INCOMPLETE_BANNER: 'Salary structure golongan ini belum lengkap. Setup di Salary Structure.',
  FORM: {
    CREATE_TITLE: 'Tambah Adjustment Salary',
    EDIT_TITLE: 'Edit Adjustment Salary',
    NAME: 'Name',
    GOLONGAN: 'Golongan',
    SALARY_TYPE: 'Salary Type',
    DEFAULT_AMOUNT: 'Default',
    RANGE: 'Range',
    ADJUSTED_AMOUNT: 'Adjusted Amount',
    REASON: 'Alasan',
    SAVE: 'Simpan',
    CANCEL: 'Batal',
    EMPTY: 'Minimal satu komponen harus diisi nominalnya',
  },
} as const;

export const HAS_ADJUSTMENT_OPTIONS = [
  { value: 'true', label: 'Ya' },
  { value: 'false', label: 'Tidak' },
] as const;
