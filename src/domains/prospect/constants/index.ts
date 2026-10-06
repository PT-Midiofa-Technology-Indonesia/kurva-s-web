export const PROSPECT_READONLY_STAGES = new Set(['won', 'lost', 'cancel']);

export const PROSPECT_LABELS = {
  PAGE_TITLE: 'Prospect',
  ADD_BUTTON: 'Tambah Prospect Baru',
  COMPANY_PLACEHOLDER: 'Pilih perusahaan',

  DRAWER: {
    CREATE_TITLE: 'Tambah Prospect',
    SUBTITLE: 'Anda menambahkan data untuk',
    FIELDS: {
      TITLE: 'Judul Prospect',
      CLIENT: 'Client',
      ESTIMATED_VALUE: 'Estimasi Nilai Project',
      PROJECT_START_DATE: 'Tanggal Mulai',
      PROJECT_END_DATE: 'Tanggal Selesai',
      DESCRIPTION: 'Deskripsi',
      PROJECT_TYPE: 'Tipe Project',
      PROJECT_CAPABILITY: 'Kapabilitas Project',
    },
    PLACEHOLDERS: {
      TITLE: 'Masukan judul prospect',
      CLIENT: 'Masukan nama client',
      ESTIMATED_VALUE: '0',
      PROJECT_START_DATE: 'dd/mm/yyyy',
      PROJECT_END_DATE: 'dd/mm/yyyy',
      DESCRIPTION: 'Tulis deskripsi disini',
      PROJECT_TYPE: 'Pilih tipe project',
      PROJECT_CAPABILITY: 'Pilih kapabilitas',
    },
    BUTTONS: {
      SAVE: 'Simpan',
      CANCEL: 'Batal',
    },
  },

  EMPTY: 'Tidak ada prospect.',
  FETCH_ERROR: 'Gagal memuat data prospect.',

  DETAIL: {
    MODAL_TITLE: 'Detail Prospect',
    PERIODE_PREFIX: 'Periode',
    NILAI_PROJECT_PREFIX: 'Nilai Project : Rp',
    TABS: {
      DOCUMENT: 'Document',
      AKTIVITAS: 'Aktivitas',
    },
    EMPTY_DOCUMENT: 'Belum ada dokumen.',
    EMPTY_AKTIVITAS: 'Belum ada aktivitas.',
    ACTIVITY_FORM: {
      DESCRIPTION_LABEL: 'Deskripsi Aktivitas',
      ATTACHMENT_LABEL: 'Attachment',
    },
    BUTTONS: {
      CANCEL: 'Batalkan Prospect',
      NEXT_STAGE: 'Set to Next Stage',
      SET_TO_LOST: 'Set to Lost',
      SET_TO_WON: 'Set to Won',
      BROWSE_FILE: 'Browse file',
      ADD_FILE: 'Add file',
      FORM_CANCEL: 'Batal',
      FORM_SAVE: 'Simpan',
    },
    DIALOG: {
      CANCEL_TITLE: 'Batalkan Prospect',
      CANCEL_DESCRIPTION: 'Apakah Anda yakin ingin membatalkan prospect ini?',
      CANCEL_CONFIRM: 'Ya, Batalkan',
      CANCEL_CANCEL: 'Tidak',
    },
    STAGE_HISTORY: {
      LABEL: 'Stage History',
      TITLE: 'Stage History',
      DOCUMENT_SECTION: 'Document',
      AKTIVITAS_SECTION: 'Aktivitas',
      DESCRIPTION_LABEL: 'Deskripsi Aktivitas',
      ATTACHMENT_LABEL: 'Attachment',
      EMPTY: 'Belum ada riwayat stage.',
    },
  },
} as const;
