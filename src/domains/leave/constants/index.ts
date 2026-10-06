'use client';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'warning';

export const LEAVE_LABELS = {
  LIST: {
    TITLE: 'Cuti',
    EMPTY: 'Belum ada data cuti.',
    ADD_BUTTON: 'Ajukan Cuti',
    SEARCH: 'Pencarian',
    COLUMNS: {
      APPLIED_DATE: 'Tanggal Pengajuan',
      EMPLOYEE: 'Karyawan',
      LEAVE_TYPE: 'Jenis Cuti',
      START_DATE: 'Tanggal Mulai',
      END_DATE: 'Tanggal Berakhir',
      DURATION: 'Durasi',
      QUOTA: 'Kuota',
      STATUS: 'Status',
      DESCRIPTION: 'Keterangan',
      ACTIONS: 'Action',
    },
    FILTERS: {
      FILTER: 'Filter',
      EMPLOYEE: 'Karyawan',
      YEAR: 'Tahun',
      STATUS: 'Status',
      LEAVE_TYPE: 'Jenis Cuti',
    },
  },
  SETTINGS: {
    TITLE: 'Setting Cuti',
    SAVE: 'Simpan',
    CANCEL: 'Batal',
    LEAVE_TYPES: {
      TITLE: 'Jenis Cuti',
      DESCRIPTION: 'Atur jenis cuti yang aktif, kuota tahunan, dan kebutuhan approval per jenis.',
      LEAVE_TYPE: 'Jenis Cuti',
      LEAVE_TYPE_PLACEHOLDER: 'Tulis jenis cuti',
      QUOTA: 'Kuota Tahunan',
      EMPTY: 'Belum ada jenis cuti.',
      REQUIRES_APPROVAL: 'Perlu Approval',
      ACTIVE: 'Aktif',
      ADD: 'Tambah Jenis Cuti',
      REMOVE: 'Hapus',
    },
  },
  DETAIL: {
    TITLE: 'Detail Cuti',
    FIELDS: {
      STATUS: 'Status',
      LEAVE_TYPE: 'Jenis Cuti',
      APPLIED_DATE: 'Tanggal Pengajuan',
      START_DATE: 'Tanggal Mulai',
      END_DATE: 'Tanggal Berakhir',
      DURATION: 'Durasi',
      QUOTA: 'Kuota',
      DESCRIPTION: 'Keterangan',
      ADMIN_NOTE: 'Catatan Admin',
    },
    BUTTONS: {
      EDIT: 'Edit',
      CLOSE: 'Tutup',
      CANCEL: 'Batalkan Cuti',
    },
  },
  FORM: {
    CREATE_TITLE: 'Ajukan Cuti',
    EDIT_TITLE: 'Edit Cuti',
    EMPLOYEE: 'Karyawan',
    EMPLOYEE_PLACEHOLDER: 'Cari karyawan',
    LEAVE_TYPE: 'Jenis Cuti',
    LEAVE_TYPE_PLACEHOLDER: 'Pilih jenis cuti',
    START_DATE: 'Tanggal Mulai',
    END_DATE: 'Tanggal Berakhir',
    DESCRIPTION: 'Keterangan',
    DESCRIPTION_PLACEHOLDER: 'Tulis keterangan',
    QUOTA: 'Sisa Kuota',
    DURATION: 'Durasi',
    SAVE: 'Simpan',
    SAVE_CHANGES: 'Simpan Perubahan',
    CANCEL: 'Batal',
  },
  BUTTONS: {
    SETTING: 'Setting Cuti',
  },
  ACTIONS: {
    VIEW: 'View',
    EDIT: 'Edit',
    CANCEL: 'Cancel',
  },
  DIALOG: {
    CANCEL_TITLE: 'Batalkan Cuti',
    CANCEL_DESCRIPTION: 'Apakah yakin ingin membatalkan cuti ini?',
  },
} as const;

export const LEAVE_STATUS_OPTIONS = [
  { value: 'pending_approval', label: 'Menunggu Persetujuan' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'cancelled', label: 'Dibatalkan' },
] as const;

export const LEAVE_STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Menunggu Persetujuan', variant: 'warning' },
  pending_approval: { label: 'Menunggu Persetujuan', variant: 'warning' },
  approved: { label: 'Disetujui', variant: 'default' },
  rejected: { label: 'Ditolak', variant: 'destructive' },
  cancelled: { label: 'Dibatalkan', variant: 'secondary' },
};
