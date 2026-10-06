export const COMMON_LABELS = {
  ACTIONS: {
    BACK: 'Kembali',
    CANCEL: 'Batal',
    SAVE: 'Simpan',
    SAVE_CHANGE: 'Simpan Perubahan',
    DELETE: 'Hapus',
    EDIT: 'Edit Data',
    CLOSE: 'Tutup',
  },
  STATE: {
    SAVING: 'Menyimpan...',
    DELETING: 'Menghapus...',
    EMPTY: 'Belum ada data.',
  },
  LIST: {
    ACTIONS: {
      DETAIL: 'View',
      EDIT: 'Edit',
      DELETE: 'Delete',
    },
  },
  STATUS: {
    ACTIVE: 'Aktif',
    INACTIVE: 'Tidak Aktif',
  },
  DIALOG: {
    CHANGE_STATUS_TITLE: 'Ubah Status?',
  },
  FIELDS: {
    CODE: 'Kode',
    NAME: 'Nama',
    DESCRIPTION: 'Deskripsi',
    STATUS: 'Status',
    CREATED_AT: 'Created At',
    ACTIONS: 'Action',
  },
  PLACEHOLDERS: {
    CODE: 'Masukan kode',
    NAME: 'Masukan nama',
    DESCRIPTION: 'Masukan deskripsi',
    STATUS: 'Pilih status',
    SEARCH: 'Search...',
  },
  NOT_FOUND: 'Item tidak ditemukan',
  FETCH_ERROR: 'Gagal memuat data. Silakan coba lagi.',
} as const;

export const COMMON_STATUS_OPTIONS = [
  { label: COMMON_LABELS.STATUS.ACTIVE, value: 'true' },
  { label: COMMON_LABELS.STATUS.INACTIVE, value: 'false' },
];

export * from './endpoints';
export * from './task-status';
