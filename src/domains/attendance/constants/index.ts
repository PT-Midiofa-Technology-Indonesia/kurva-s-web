'use client';

export const ATTENDANCE_LABELS = {
  LIST: {
    TITLE: 'Attendance',
    EMPTY: 'Belum ada data Attendance.',
    ADD_BUTTON: 'Bulk Input Attendance',
    COLUMNS: {
      DATE: 'Date',
      CODE: 'Code',
      NAME: 'Nama',
      CHECK_IN: 'Check in',
      CHECK_OUT: 'Check out',
      LOCATION: 'Location',
      PROJECT: 'Project',
      STATUS: 'Status',
      ACTIONS: 'Action',
    },
    FILTERS: {
      FILTER: 'Filter',
      DATE_RANGE: 'Date range',
      STATUS: 'Status',
      EMPLOYEE: 'Employee',
      PROJECT: 'Project',
      LOCATION: 'Location',
    },
    PAGINATION: {
      SHOWING: 'Showing',
      TO: 'to',
      OF: 'of',
      ENTRIES: 'entries',
      SHOW: 'Show',
    },
    SEARCH: 'Pencarian',
  },
  DETAIL: {
    PAGE_TITLE: 'Detail Attendance',
    EDIT_PAGE_TITLE: 'Edit Attendance',
    DATE: 'Date',
    NAME: 'Name',
    CODE: 'Code',
    STATUS: 'Status',
    PROJECT: 'Project',
    TIMEZONE: 'Time zone',
    WORK_HOUR: 'Work Hour',
    LOCATION: 'Location',
    LOCATION_ID: 'Location ID',
    CHECK_IN: 'Check in',
    CHECK_OUT: 'Check out',
    LATE: 'Late',
    EARLY_LEAVE: 'Early Leave',
    NOTES: 'Notes',
    SELFIES: {
      TITLE: 'Foto Absensi',
      CHECK_IN: 'Check in',
      CHECK_OUT: 'Check out',
      EMPTY: 'Belum ada foto',
      OPEN_NEW_TAB: 'Buka foto di tab baru',
    },
    BUTTONS: {
      EDIT: 'Edit',
      CLOSE: 'Tutup',
      SAVE: 'Simpan',
      CANCEL: 'Batal',
    },
  },
  FORM: {
    DATE: 'Date',
    STATUS: 'Status',
    NAME: 'Name',
    CODE: 'Code',
    LOCATION: 'Location',
    LOCATION_ID: 'Location ID',
    CHECK_IN: 'Check in',
    CHECK_OUT: 'Check out',
    NOTES: 'Notes',
  },
  DIALOG: {
    DELETE_TITLE: 'Hapus Attendance',
    DELETE_DESCRIPTION: 'Apakah Anda yakin ingin menghapus data attendance ini?',
  },
  ACTIONS: {
    VIEW: 'View',
    EDIT: 'Edit',
    DELETE: 'Delete',
  },
} as const;

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
  { value: 'sick', label: 'Sick' },
  { value: 'leave', label: 'Leave' },
  { value: 'dayoff', label: 'Day Off' },
  { value: 'halfday', label: 'Half Day' },
] as const;

export const ATTENDANCE_LOCATION_TYPE_OPTIONS = [
  { value: 'Office', label: 'Office' },
  { value: 'Warehouse', label: 'Warehouse' },
] as const;

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'warning';

export const ATTENDANCE_STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  present: { label: 'Present', variant: 'secondary' },
  late: { label: 'Late', variant: 'warning' },
  absent: { label: 'Absent', variant: 'destructive' },
  sick: { label: 'Sick', variant: 'secondary' },
  leave: { label: 'Leave', variant: 'secondary' },
  dayoff: { label: 'Day Off', variant: 'secondary' },
  halfday: { label: 'Half Day', variant: 'secondary' },
};

export const BULK_ATTENDANCE_LABELS = {
  PAGE_TITLE: 'Bulk Input Attendance',
  BUTTON_SUBMIT: 'Submit',
  BUTTON_SUBMITTING: 'Menyimpan...',
  LOADING: 'Memuat data karyawan...',
  ERROR: 'Gagal memuat data. Silakan coba lagi.',
  NO_DATE: 'Tanggal tidak ditemukan.',
  EMPTY: 'Tidak ada data karyawan untuk tanggal ini.',
  EXISTING_BADGE: 'Existing',
  EXISTING_COUNT: 'data sudah ada',
  COLUMNS: {
    DATE: 'Date',
    CODE: 'Code',
    NAME: 'Nama',
    CHECK_IN: 'Check in',
    CHECK_OUT: 'Check out',
    LOCATION: 'Location',
    PROJECT: 'Project',
    STATUS: 'Status',
  },
} as const;
