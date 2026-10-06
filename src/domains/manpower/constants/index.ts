import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';

const SHARED_FIELDS = {
  CODE: COMMON_LABELS.FIELDS.CODE,
  FULL_NAME: 'Nama',
  EMAIL: 'Email',
  PHONE: 'Telepon',
  EMPLOYEE_TYPE: 'Type',
  CONTRACT_TYPE: 'Tipe Kontrak',
  SALARY_TYPE: 'Tipe Gaji',
  NIK: 'NIK',
  NPWP: 'NPWP',
  BIRTH_PLACE: 'Tempat lahir',
  BIRTH_DATE: 'Tanggal Lahir',
  GENDER: 'Jenis Kelamin',
  ADDRESS: 'Alamat',
  HIRE_DATE: 'Tanggal Masuk',
  TERMINATION_DATE: 'Tanggal Berakhir',
  STATUS: COMMON_LABELS.FIELDS.STATUS,
  PROVINCE: 'Provinsi',
  CITY: 'Kota',
  DISTRICT: 'Kecamatan',
  VILLAGE: 'Desa',
  ADDRESS_DETAIL: 'Detail Alamat',
  ADDRESS_SECTION: 'Informasi Detail Alamat',
};

export const MANPOWER_LABELS = {
  LIST: {
    TITLE: 'Manpower',
    ADD_BUTTON: 'Tambah Employee Baru',
    EMPTY: 'Belum ada data Employee. Klik Tambah untuk membuat Employee pertama.',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      FULL_NAME: 'Nama Lengkap',
      EMAIL: 'Email',
      GENDER: 'Jenis Kelamin',
      EMPLOYEE_TYPE: 'Tipe Karyawan',
      CONTRACT_TYPE: 'Tipe Kontrak',
      STATUS: 'Status',
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    STATUS: COMMON_LABELS.STATUS,
    ACTIONS: COMMON_LABELS.LIST.ACTIONS,
  },
  CREATE: {
    PAGE_TITLE: 'Buat Employee Baru',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    FIELDS: SHARED_FIELDS,
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Employee Baru?',
      DESCRIPTION: 'Anda akan membuat employee baru dengan data yang telah ditentukan.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  EDIT: {
    PAGE_TITLE: 'Edit Employee',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    NOT_FOUND: 'Employee tidak ditemukan',
    FIELDS: SHARED_FIELDS,
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE_CHANGE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Perubahan?',
      DESCRIPTION: 'Anda akan menyimpan perubahan pada employee ini.',
      USER_SYNC_TITLE: 'Simpan Perubahan?',
      USER_SYNC_DESCRIPTION: 'Perubahan ini akan memperbarui data User yang berelasi. Lanjutkan?',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: 'Ya, Lanjutkan',
    },
  },
  DETAIL: {
    PAGE_TITLE: 'Detail Manpower',
    INFO_CARD_TITLE: 'Informasi Manpower',
    POSITION_CARD_TITLE: 'Pengaturan Company Position',
    OTHER_SETTINGS_CARD_TITLE: 'Pengaturan Lainnya',
    PAYROLL_SETTINGS_CARD_TITLE: 'Pengaturan Payroll',
    NOT_FOUND: 'Employee tidak ditemukan',
    FIELDS: SHARED_FIELDS,
    BUTTONS: {
      EDIT: COMMON_LABELS.ACTIONS.EDIT,
      CLOSE: COMMON_LABELS.ACTIONS.CANCEL,
      DELETE: 'Hapus',
      SETTING: 'Setting',
    },
    POSITION_COLUMNS: {
      COMPANY: 'Company',
      JOB_POSITION: 'Job Position',
      DEFAULT: 'Default',
    },
    OTHER_COLUMNS: {
      ASSIGNMENT: 'Penugasan',
      CONTRACT_TYPE: 'Kontrak Kerja',
    },
    PAYROLL_COLUMNS: {
      GRADE: 'Golongan',
      SALARY_TYPE: 'Penggajian',
      BANK_NAME: 'Nama Bank',
      ACCOUNT_NUMBER: 'No. Rekening',
      ACCOUNT_NAME: 'Nama Pemilik',
    },
    RATING: {
      TITLE: 'Rating',
      SUMMARY_TITLE: 'Ringkasan Rating',
      HISTORY_TITLE: 'Riwayat Rating',
      EMPTY: 'Belum ada rating untuk karyawan ini.',
      EMPTY_FILTERED: 'Tidak ada rating yang cocok dengan pencarian.',
      SUMMARY_DESCRIPTION: 'Rata-rata rating karyawan berdasarkan seluruh project.',
      HISTORY_DESCRIPTION: 'Daftar rating karyawan berdasarkan project.',
      SEARCH: 'Cari project',
      COLUMNS: {
        INFO_PROJECT: 'Info Project',
        RATED_BY: 'Dinilai Oleh',
        SCORE: 'Overall Score',
      },
      SUMMARY: {
        LAST_RATED_AT: 'Terakhir dinilai',
      },
    },
    TABLE_EMPTY: COMMON_LABELS.STATE.EMPTY,
    DIALOG: {
      CHANGE_STATUS_TITLE: COMMON_LABELS.DIALOG.CHANGE_STATUS_TITLE,
      CHANGE_STATUS_DESCRIPTION: 'Anda akan mengubah status employee ini.',
      CHANGE_STATUS_CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CHANGE_STATUS_CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
      DELETE_TITLE: 'Hapus Employee',
      DELETE_DESCRIPTION:
        'Aksi ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus employee ini?',
      DELETE_CANCEL: 'Batal',
      DELETE_CONFIRM: 'Ya, Hapus',
    },
  },
  OTHER_SETTINGS_FORM: {
    TITLE: 'Pengaturan Lainnya',
    FIELDS: {
      ASSIGNMENT: 'Penugasan',
      CONTRACT_TYPE: 'Kontrak Kerja',
    },
    PLACEHOLDERS: {
      ASSIGNMENT: 'Pilih penugasan',
      CONTRACT_TYPE: 'Pilih kontrak kerja',
    },
    BUTTONS: {
      SAVE: COMMON_LABELS.ACTIONS.SAVE,
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
    },
  },
  PAYROLL_SETTINGS_FORM: {
    TITLE: 'Pengaturan Payroll',
    FIELDS: {
      GRADE: 'Golongan',
      SALARY_TYPE: 'Penggajian',
      BANK_NAME: 'Nama Bank',
      ACCOUNT_NUMBER: 'No. Rekening',
      ACCOUNT_NAME: 'Nama Pemilik',
    },
    PLACEHOLDERS: {
      GRADE: 'Pilih golongan',
      SALARY_TYPE: 'Pilih penggajian',
      BANK_NAME: 'Masukkan nama bank',
      ACCOUNT_NUMBER: 'Masukkan nomor rekening',
      ACCOUNT_NAME: 'Masukkan nama pemilik rekening',
    },
    BUTTONS: {
      SAVE: COMMON_LABELS.ACTIONS.SAVE,
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
    },
  },
  POSITION_ASSIGNMENT_FORM: {
    TITLE: 'Pengaturan Company Position',
    ASSIGN_LABEL: 'Assign',
    COMPANY_LABEL: 'Company',
    POSITION_LABEL: 'Job Position',
    ADD_ASSIGNMENT_BUTTON: 'Tambah Assignment',
    SAVE_BUTTON: 'Simpan',
    CANCEL_BUTTON: 'Batal',
    SAVING: 'Menyimpan...',
    COMPANY_PLACEHOLDER: 'Pilih company',
    POSITION_PLACEHOLDER: 'Pilih job position',
    DELETE_BUTTON: COMMON_LABELS.ACTIONS.DELETE,
  },
  DIALOG: {
    DELETE_TITLE: 'Hapus Employee',
    DELETE_DESCRIPTION: 'Aksi ini tidak dapat dibatalkan. Apakah Anda yakin?',
    DELETE_CANCEL: 'Batal',
    DELETE_CONFIRM: 'Ya, Hapus',
  },
  SKILL_SETTINGS: {
    TITLE: 'Pengaturan Skill',
    BUTTON_ADD: 'Tambah',
    EMPTY: 'Belum ada data Skill',
    COLUMNS: {
      CODE: 'Kode',
      SKILL: 'Skill',
      LEVEL: 'Level',
      CATEGORY: 'Kategori',
      STATUS: 'Status',
      ACTIONS: 'Aksi',
    },
    STATUS_ACTIVE: 'Aktif',
    STATUS_INACTIVE: 'Tidak Aktif',
    ACTION_EDIT: 'Edit',
    ACTION_DETAIL: 'Detail',
    ACTION_DELETE: 'Hapus',
    DELETE_TITLE: 'Hapus Skill',
    DELETE_DESCRIPTION:
      'Aksi ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus skill ini?',
    DELETE_CANCEL: 'Batal',
    DELETE_CONFIRM: 'Ya, Hapus',
  },
  WORKPLACE_SETTINGS: {
    TITLE: 'Pengaturan Work Place',
    BUTTON_ADD: 'Tambah',
    EMPTY: 'Belum ada data Work Place',
    COLUMNS: {
      TYPE: 'Tipe',
      CODE: 'Kode',
      NAME: 'Nama',
      ASSIGNED_AT: 'Tanggal Assign',
      STATUS: 'Status',
      ACTIONS: 'Aksi',
    },
    STATUS_ACTIVE: 'Aktif',
    STATUS_INACTIVE: 'Tidak Aktif',
    ACTION_EDIT: 'Edit',
    ACTION_DETAIL: 'Detail',
    ACTION_DELETE: 'Hapus',
    DELETE_TITLE: 'Hapus Work Place',
    DELETE_DESCRIPTION:
      'Aksi ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus work place ini?',
    DELETE_CANCEL: 'Batal',
    DELETE_CONFIRM: 'Ya, Hapus',
  },
} as const;

export const STATUS_OPTIONS = COMMON_STATUS_OPTIONS;

export const EMPLOYEE_TYPE_OPTIONS = [
  { label: 'Employee', value: 'permanent_staff' },
  { label: 'Project Worker', value: 'project_worker' },
];

export const CONTRACT_TYPE_OPTIONS = [
  { label: 'Karyawan Tetap', value: 'permanent' },
  { label: 'Karyawan Kontrak', value: 'contract' },
];

export const SALARY_TYPE_OPTIONS = [
  { label: 'Gaji Bulanan', value: 'monthly' },
  { label: 'Gaji Harian', value: 'daily' },
];

export const GENDER_OPTIONS = [
  { label: 'Laki-laki', value: 'male' },
  { label: 'Perempuan', value: 'female' },
];

export const PLACEHOLDERS = {
  CODE: 'Masukan kode employee',
  FULL_NAME: 'Masukan nama user',
  EMAIL: 'Masukan email',
  PHONE: '',
  EMPLOYEE_TYPE: 'Pilih type manpower',
  CONTRACT_TYPE: 'Pilih tipe kontrak',
  SALARY_TYPE: 'Pilih tipe gaji',
  NIK: 'Masukan NIK',
  NPWP: 'Masukan NPWP',
  BIRTH_PLACE: 'Masukan tempat lahir',
  BIRTH_DATE: 'Pilih tanggal lahir',
  GENDER: 'Pilih jenis kelamin',
  ADDRESS: 'Masukan alamat lengkap',
  HIRE_DATE: 'Pilih tanggal masuk',
  TERMINATION_DATE: 'Pilih tanggal berakhir',
  STATUS: COMMON_LABELS.PLACEHOLDERS.STATUS,
  PROVINCE: 'Pilih provinsi',
  CITY: 'Pilih kota',
  DISTRICT: 'Pilih kecamatan',
  VILLAGE: 'Pilih desa',
  ADDRESS_DETAIL: 'Tulis detail alamat disini',
} as const;
