import type { SelectOption } from '@/shared/components/atoms';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'success';

export const COST_REQUEST_LABELS = {
  LIST: {
    TITLE: 'Cost Request',
    EMPTY: 'Belum ada Cost Request. Klik Buat Cost Request untuk mulai.',
    RESTRICTED: 'Anda tidak memiliki akses untuk melihat Cost Request.',
    SEARCH: 'Pencarian',
    CREATE_BUTTON: 'Create Cost Request',
    COLUMNS: {
      CODE: 'Code',
      REQUEST_TYPE: 'Request Type',
      PROJECT: 'Project',
      EMPLOYEE: 'Nama',
      TOTAL_AMOUNT: 'Total Amount (IDR)',
      DUE_DATE: 'Due Date',
      STATUS: 'Status',
      ACTIONS: 'Action',
    },
    FILTERS: {
      REQUEST_TYPE: 'Project Type',
      STATUS: 'Status',
      PROJECT: 'Project',
      DUE_DATE_RANGE: 'Due Date',
    },
  },
  ACTIONS: {
    DETAIL: 'Detail',
    CANCEL: 'Cancel',
    EDIT: 'Edit',
  },
  CREATE: {
    TITLE: 'Create Cost Request',
    EDIT_TITLE: 'Edit Cost Request',
    REASON: 'Reason',
    PROJECT: 'Project',
    EMPLOYEE: 'Requesting Employee',
    DUE_DATE: 'Due Date',
    PAYMENT_METHOD: 'Payment Method',
    NOTES: 'Notes',
    ITEM_SECTION_TITLE: 'Cost Item',
    ITEM_LIST_TITLE: 'Cost Request Item',
    ADD_ITEM: 'Simpan',
    ADD_ITEM_TRIGGER: '+ Add Item',
    ITEM_DESCRIPTION: 'Item Description',
    RECEIPT_NUMBER: 'Receipt Number',
    AMOUNT: 'Amount',
    TOTAL_AMOUNT: 'Total Amount',
    SUBMIT: 'Submit',
    CANCEL_BUTTON: 'Cancel',
    SAVE: 'Save',
  },
  DETAIL: {
    TITLE: 'Detail Cost Request',
    REQUEST_TYPE: 'Request Type',
    PROJECT: 'Project',
    NAME: 'Name',
    DUE_DATE: 'Due Date',
    REASON: 'Reason',
    PAYMENT_METHOD: 'Payment Method',
    NOTES: 'Notes',
    CANCEL_BUTTON: 'Cancel Cost Request',
    EDIT_BUTTON: 'Edit',
  },
  CANCEL_DIALOG: {
    TITLE: 'Konfirmasi Cancel',
    DESCRIPTION:
      'Cost Request ini akan dibatalkan. Payment request linked juga akan dibatalkan. Lanjutkan?',
    CANCEL_TEXT: 'Batal',
    CONFIRM_TEXT: 'Cancel',
  },
  TOAST: {
    createSuccess: (code: string) => `Berhasil! Cost Request ${code} berhasil dibuat`,
    updateSuccess: 'Data berhasil diperbarui.',
    cancelSuccess: (code: string) => `Berhasil! Cost Request ${code} berhasil dibatalkan`,
    genericError: 'Gagal menyimpan. Periksa koneksi dan coba lagi.',
  },
  VALIDATION: {
    PROJECT_REQUIRED: 'Project wajib dipilih untuk Cost Request type Project.',
    ITEMS_REQUIRED: 'Wajib tambah minimal 1 item expense.',
    AMOUNT_POSITIVE: 'Amount item harus lebih dari 0.',
    NO_PROOF_WARNING: 'Belum ada bukti nota untuk item ini.',
  },
} as const;

export const COST_REQUEST_TYPE_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  project: { label: 'Project', variant: 'secondary' },
  non_project: { label: 'Non Project', variant: 'outline' },
};

export const COST_REQUEST_STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  submitted: { label: 'Submitted', variant: 'default' },
  paid: { label: 'Paid', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

// TBD (Open Question D): hardcoded until an options endpoint is confirmed with backend.
export const PAYMENT_METHOD_OPTIONS: SelectOption[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'check', label: 'Check' },
];

export const COST_REQUEST_ITEM_PROOF_MAX_FILES = 5;
export const COST_REQUEST_ITEM_PROOF_MAX_SIZE = 5 * 1024 * 1024; // 5MB per Figma
