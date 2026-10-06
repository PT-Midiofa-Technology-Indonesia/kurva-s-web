import type { BillingPaymentMethod, BillingStatus, BillingType } from '../types';

// ============================================================================
// Labels
// ============================================================================

export const BILLING_STATUS_LABELS: Record<BillingStatus, string> = {
  draft: 'Draft',
  invoiced: 'Menunggu Pembayaran',
  pendingClearance: 'Menunggu Clearance',
  paid: 'Dibayar',
  cancelled: 'Dibatalkan',
};

export const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  lumsum: 'Lumsum',
  lumpsum: 'Lumpsum',
  unit_price: 'Unit Price',
  progress: 'Progress',
  retention: 'Retensi',
  downPayment: 'Uang Muka',
  other: 'Lainnya',
};

export const BILLING_PAYMENT_METHOD_LABELS: Record<BillingPaymentMethod, string> = {
  cash: 'Tunai',
  transfer: 'Transfer',
  check: 'BG / Cek',
};

export const BILLING_ACTION_LABELS = {
  SET_AS_INVOICED: 'Tandai Sudah Faktur',
  DETAIL: 'Detail',
  EDIT: 'Edit',
  DOWNLOAD_PDF: 'Unduh PDF',
  PAY: 'Bayar',
  MARK_CLEARED: 'Tandai Clear',
  CANCEL: 'Batal',
  CREATE_BILLING: 'Create Billing',
  SETTING_PROGRESS: 'Setting Progress',
  UPLOAD_DOCUMENT: 'Upload Dokumen',
  LOAD_PROJECTS_FAILED: 'Gagal memuat daftar proyek',
  LOAD_PROGRESS_FAILED: 'Data progress belum tersedia',
} as const;

export const BILLING_SECTION_LABELS = {
  BILLING_INFORMATION: 'Informasi Billing',
  PROJECT_INFORMATION: 'Informasi Proyek',
  CLIENT_PROGRESS: 'Progress Client',
  DOCUMENTS: 'Upload Dokumen',
  PAYMENT: 'Set Payment',
  PAYMENT_INFORMATION: 'Informasi Pembayaran',
  SCHEDULE_HISTORIES: 'Riwayat Jadwal',
  PROOF_PAYMENT: 'Bukti Bayar',
} as const;

export const BILLING_MODAL_LABELS = {
  SET_AS_INVOICED_TITLE: 'Tandai Sudah Faktur',
  SET_AS_INVOICED_DESCRIPTION: 'Apakah Anda yakin ingin menandai billing ini sebagai invoiced?',
  SET_AS_INVOICED_PUBLISH_TITLE: 'Terbitkan Invoice',
  SET_AS_INVOICED_PUBLISH_DESCRIPTION: 'Apakah anda yakin ingin Menerbitkan tagihan ini',
  MARK_CLEARED_TITLE: 'Tandai Clear',
  MARK_CLEARED_DESCRIPTION: 'Apakah Anda yakin ingin menandai billing ini sebagai cleared?',
  CANCEL_TITLE: 'Batalkan Billing',
  CANCEL_DESCRIPTION: 'Apakah Anda yakin ingin membatalkan billing ini?',
  PAY_TITLE: 'Bayar Billing',
  PAY_FIELDS: {
    PAID_AT: 'Tanggal Bayar',
    PAYMENT_METHOD: 'Metode Pembayaran',
    CHECK_NUMBER: 'Nomor Cek',
    CHECK_ISSUE_DATE: 'Tanggal Terbit Cek',
    CHECK_EFFECTIVE_DATE: 'Tanggal Efektif Cek',
    NOTES: 'Catatan',
  },
  PAY_PLACEHOLDERS: {
    CHECK_NUMBER: 'Masukkan nomor cek',
    NOTES: 'Catatan pembayaran (opsional)',
  },
  BUTTONS: {
    CANCEL: 'Batal',
    CONFIRM: 'Ya, Konfirmasi',
    PROCESSING: 'Memproses...',
    SAVING: 'Menyimpan...',
    CANCELLING: 'Membatalkan...',
    PAY: 'Bayar',
    SET_AS_INVOICED: 'Set as Invoiced',
  },
  DOCUMENTS: {
    TITLE: 'Upload Dokumen',
    LOADING: 'Memuat dokumen...',
    EMPTY: 'Tidak ada persyaratan dokumen.',
    BROWSE: 'Browse File',
    REPLACE: 'Ganti File',
    DOWNLOAD: 'Download file',
    DELETE: 'Hapus file',
  },
} as const;

export const BILLING_LABELS = {
  CREATE: {
    TITLE: 'Create Billing',
    STEP_1: 'Informasi Billing',
    STEP_2: 'Progress Client',
    STEP_3: 'Upload Documents',
    STEP_4: 'Set Payment',
    GENERAL_INFORMATION: 'General Information',
    PROGRESS_SUMMARY: 'Ringkasan progress & pembayaran',
    BILLING_INFORMATION: 'Informasi Tagihan',
    PROJECT: 'Project',
    PROJECT_TYPE: 'Tipe Proyek',
    BILLED_AT: 'Tanggal Tagihan',
    DUE_DATE: 'Jatuh Tempo',
    NOTES: 'Catatan',
    BILLING_PERCENTAGE: 'Persentase Tagihan',
    CANCEL: 'Batal',
    BACK: 'Kembali',
    NEXT: 'Lanjut',
    SAVE_CONTINUE: 'Save and Continue',
    PROGRESS_LOADING: 'Memuat data progress...',
    PROGRESS_EMPTY: 'Belum ada data progress.',
    PROGRESS_ACTUAL: 'Aktual',
    PROGRESS_READY_TO_BILL: 'Siap Ditagihkan',
    PROGRESS_CLIENT_BILLING: 'Tagihan Klien',
    SAVE_DRAFT: 'Save as Draft',
    FINAL_ACTION: 'Set as Invoiced',
    PICK_PROJECT: 'Pilih proyek...',
    AUTO_FILL: 'Auto-filled based on selected project',
    NOTES_PLACEHOLDER: 'Tambahkan catatan billing jika diperlukan...',
    DOCUMENT_REQUIRED: 'Dokumen Wajib',
    DOCUMENT_OPTIONAL: 'Dokumen Opsional',
    DROPZONE_TITLE: 'Klik untuk upload atau seret file ke area ini',
    DROPZONE_HINT: 'PDF, XLSX, JPG, PNG hingga 10 MB',
    PAYMENT_INFORMATION: 'Informasi Pembayaran',
    PAYMENT_SUMMARY: 'Ringkasan Pembayaran',
    TAX_INFORMATION: 'Terapkan Pajak',
    REVIEW_INFORMATION: 'Final Review',
    PAYMENT_METHOD: 'Metode Pembayaran',
    BANK_TRANSFER: 'Transfer Bank',
    VIRTUAL_ACCOUNT: 'Virtual Account',
    CHECK_GIRO: 'BG / Cek',
    CASH: 'Tunai',
    BANK_GIRO: 'Billyet Giro(BG)',
    RECIPIENT_ACCOUNT: 'Rekening dan Virtual Account Penerima',
    APPLY_TAX: 'Terapkan Pajak',
    NOTES_EN: 'Notes',
    BASE_VALUE: 'Nilai Dasar',
    BILLING_TERM: 'Penagihan',
    AUTO_GENERATED_BILLING_NUMBER: 'Nomor Tagihan(Auto Generate)',
    VAT: 'PPN 11%',
    TOTAL_BILLING: 'Total Tagihan',
    NO_PROJECT_SELECTED: 'Pilih proyek untuk melihat ringkasan billing.',
    RECEIVER_ACCOUNT: 'Rekening dan Virtual Account Penerima',
    ADD_ACCOUNT: 'Tambah Rekening',
    ADD_TAX: 'Tambah Pajak',
    SELECT_BANK: 'Pilih Bank',
    SELECT_TAX: 'Pilih Pajak',
    ACCOUNT_NUMBER: 'No. Rekening',
    ACCOUNT_OWNER: 'Atas Nama Rekening',
    SELECT_DATE: 'Pilih tanggal',
    PAYMENT_NOTES_PLACEHOLDER: 'Tambahkan catatan pembayaran...',
    MODALS: {
      ADD_ACCOUNT_TITLE: 'Tambah Rekening',
      SELECT_BANK: 'Pilih Bank',
      ACCOUNT_NUMBER: 'No. Rekening',
      ACCOUNT_HOLDER: 'Atas Nama Rekening',
      SAVE: 'Simpan',
      ADD_TAX_TITLE: 'Tambah Pajak',
      SELECT_TAX: 'Pilih Pajak',
      TAX_PERCENTAGE: 'Pajak %',
    },
  },
  DETAIL: {
    CREATE_BUTTON: 'Create Billing',
    EXPORT_PDF_BUTTON: 'Export Pdf',
    PROJECT_CODE: 'Kode Proyek',
    GENERAL_INFORMATION: 'General Information',
    BILLING_SUMMARY: 'Ringkasan progress & pembayaran',
    ACTIVE_BILLING: 'Tagihan Aktif',
    ACTIVE_BILLING_EMPTY_TITLE: 'No Billing Created',
    ACTIVE_BILLING_EMPTY_DESCRIPTION:
      "You haven't initiated any billing cycles for this project yet.",
    BILLING_HISTORY: 'Riwayat Billing',
    BILLING_HISTORY_EMPTY: 'Belum Ada History',
    FIELDS: {
      CLIENT: 'Klien',
      PROJECT_TYPE: 'Tipe',
      PIC: 'PIC',
      COMPANY: 'Company',
      STATUS: 'Status',
      PROJECT: 'Proyek',
      START: 'Mulai Proyek',
      END: 'Selesai Proyek',
      TOTAL_VALUE: 'Nilai Proyek',
      ESTIMATED_VALUE: 'Biaya Aktual',
      AMOUNT: 'Jumlah',
      BILLED_AT: 'Tanggal Tagihan',
      DUE_DATE: 'Jatuh Tempo',
      PERCENTAGE: 'Persentase',
    },
    SUMMARY: {
      PAID_BILLING: 'Sudah ditagih',
      READY_TO_BILL: 'Siap ditagih',
      UNWORKED: 'Belum dikerjakan',
      PAID_AMOUNT: 'Total pembayaran diterima',
      READY_AMOUNT: 'Siap ditagihkan sekarang',
      REMAINING_AMOUNT: 'Sisa tagihan berjalan',
    },
  },
  LIST: {
    TITLE: 'Daftar Tagihan',
    SEARCH_PLACEHOLDER: 'Cari berdasarkan kode atau proyek...',
    EMPTY: 'Tidak ada tagihan ditemukan.',
    FILTERS: {
      COMPANY: 'Semua Perusahaan',
      BILLING_TYPE: 'Semua Tipe Tagihan',
      STATUS: 'Semua Status',
    },
    COLUMNS: {
      CODE: 'Kode',
      PROJECT: 'Proyek',
      BILLING_TYPE: 'Tipe Tagihan',
      AMOUNT: 'Jumlah',
      DUE_DATE: 'Jatuh Tempo',
      STATUS: 'Status',
      ACTIONS: 'Aksi',
      PROJECT_CODE: 'Kode Proyek',
      PROJECT_NAME: 'Nama Proyek',
      CLIENT: 'Client',
      PROJECT_TYPE: 'Tipe Proyek',
      ACTUAL_PROGRESS: 'Progress Aktual',
      BILLED_PROGRESS: 'Progress Ditagih',
      CONTRACT_VALUE: 'Nilai Kontrak',
      OUTSTANDING: 'Outstanding',
    },
    ACTIONS: {
      CREATE_BILLING: 'Create Billing',
    },
    STATUS: {
      HAS_BILLING: 'Ada Tagihan Aktif',
      NO_BILLING: 'Tidak Ada Tagihan',
    },
    EMPTY_PROJECTS: 'Tidak ada proyek billing ditemukan.',
  },
  CALENDAR: {
    TITLE: 'Kalender Tagihan',
    TOTAL_REQUESTS: 'Total Tagihan',
    BACK_BUTTON: 'Kembali',
    TODAY: 'Hari Ini',
    ALL_STATUS: 'Semua Status',
    EMPTY: 'Tidak ada tagihan',
    DETAIL_BUTTON: 'Billing Detail',
    PAYMENT_REQUESTS_SUFFIX: 'Tagihan',
    LOADING: 'Loading...',
    MORE: (count: number) => `+ ${count} lainnya`,
  },
} as const;

export const BILLING_RECORD_DETAIL_LABELS = {
  NOT_FOUND: 'Data billing tidak ditemukan.',
  PRINT_BUTTON: 'Cetak',
  PUBLISH_BUTTON: 'Terbitkan',
  BILLING_INFO_TITLE: 'Informasi Billing',
  PAYMENT_INFO_TITLE: 'Informasi Pembayaran',
  PAYMENT_SUMMARY_TITLE: 'Ringkasan Pembayaran',
  PROGRESS_CLIENT_TITLE: 'Progress Client',
  DOCUMENTS_TITLE: 'Dokumen',
  NOTES_TITLE: 'Catatan',
  DOCUMENTS_EMPTY: 'Tidak ada dokumen.',
  PROGRESS_EMPTY: 'Belum ada data progress.',
  FIELDS: {
    BILLING_NUMBER: 'Nomor Tagihan',
    STATUS: 'Status',
    TERM: 'Penagihan Ke',
    CLIENT: 'Klien',
    PIC: 'PIC',
    TYPE: 'Tipe Proyek',
    PROJECT_START: 'Mulai Proyek',
    PROJECT_END: 'Selesai Proyek',
    PAYMENT_METHOD: 'Metode Pembayaran',
    RECIPIENT_ACCOUNT: 'Rekening Penerima',
    ACCOUNT_NAME: 'Atas Nama',
  },
  SUMMARY: {
    BASE_VALUE: 'Nilai Dasar',
    VAT_DEFAULT: 'PPN 11%',
    TOTAL_BILLING: 'Total Tagihan',
  },
  PROGRESS_COLUMNS: {
    BOQ: 'Item BOQ',
    WEIGHT: 'Bobot',
    ACTUAL_PROGRESS: 'Progress Aktual',
    BILLED_PROGRESS: 'Progress Ditagih',
    BILLING_AMOUNT: 'Jumlah Tagihan',
    ACTION: 'Aksi',
  },
} as const;

// ============================================================================
// Status Options
// ============================================================================

export const BILLING_STATUS_OPTIONS: { value: BillingStatus; label: string }[] = Object.entries(
  BILLING_STATUS_LABELS
).map(([value, label]) => ({
  value: value as BillingStatus,
  label,
}));

// ============================================================================
// Billing Type Options
// ============================================================================

export const BILLING_TYPE_OPTIONS: { value: BillingType; label: string }[] = Object.entries(
  BILLING_TYPE_LABELS
).map(([value, label]) => ({
  value: value as BillingType,
  label,
}));

export const BILLING_CREATE_DOCUMENTS = {
  required: ['Surat Tagihan', 'Progress Report', 'Berita Acara Pekerjaan'],
  optional: ['Foto Lapangan', 'Dokumen Pendukung Lainnya'],
} as const;
