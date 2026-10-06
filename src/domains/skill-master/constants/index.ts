import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';

export const SKILL_LEVEL_LABELS = {
  LIST: {
    TITLE: 'Skill Level',
    DESCRIPTION: 'Kelola tingkat keahlian dalam sistem',
    ADD_BUTTON: 'Tambah Skill Level',
    EMPTY: 'Tidak ada skill level ditemukan',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Skill Level',
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    STATUS: COMMON_LABELS.STATUS,
    ACTIONS: COMMON_LABELS.LIST.ACTIONS,
    FILTERS: {
      STATUS: 'Semua Status',
    },
  },
  DIALOG: {
    DELETE_TITLE: 'Hapus Skill Level',
    DELETE_DESCRIPTION: 'Apakah Anda yakin ingin menghapus skill level ini?',
  },
} as const;

export const STATUS_OPTIONS = COMMON_STATUS_OPTIONS;

export const SKILL_MASTER_TABS = {
  SKILL_LEVEL: 'skill-level',
  SKILL_CATEGORY: 'skill-category',
  SKILL: 'skill',
} as const;

export type SkillMasterTab = (typeof SKILL_MASTER_TABS)[keyof typeof SKILL_MASTER_TABS];

export const SKILL_MASTER_TAB_LABELS: Record<SkillMasterTab, string> = {
  [SKILL_MASTER_TABS.SKILL_LEVEL]: 'Skill Level',
  [SKILL_MASTER_TABS.SKILL_CATEGORY]: 'Skill Category',
  [SKILL_MASTER_TABS.SKILL]: 'Skill Catalog',
};

export const SKILL_MASTER_TAB_REQUIRED_PERMISSIONS: Record<SkillMasterTab, string> = {
  [SKILL_MASTER_TABS.SKILL_LEVEL]: 'md.sm.slvl',
  [SKILL_MASTER_TABS.SKILL_CATEGORY]: 'md.sm.sctg',
  [SKILL_MASTER_TABS.SKILL]: 'md.sm.sctlg',
};

export const SKILL_CATEGORY_LABELS = {
  LIST: {
    TITLE: 'Skill Category',
    EMPTY: 'Tidak ada skill category',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Skill Category',
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    STATUS: COMMON_LABELS.STATUS,
    ACTIONS: COMMON_LABELS.LIST.ACTIONS,
    FILTERS: {
      STATUS: 'Semua Status',
    },
  },
  CREATE: {
    PAGE_TITLE: 'Buat Skill Category Baru',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    FIELDS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: COMMON_LABELS.FIELDS.NAME,
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Skill Category Baru?',
      DESCRIPTION: 'Anda akan membuat skill category baru dengan data yang telah ditentukan.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  EDIT: {
    PAGE_TITLE: 'Edit Skill Category',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    NOT_FOUND: 'Skill category tidak ditemukan',
    FIELDS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: COMMON_LABELS.FIELDS.NAME,
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE_CHANGE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Perubahan?',
      DESCRIPTION: 'Anda akan menyimpan perubahan pada skill category ini.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  DETAIL: {
    PAGE_TITLE: 'Detail Skill Category',
    FIELDS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Skill Category',
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    STATUS_ACTIVE: COMMON_LABELS.STATUS.ACTIVE,
    STATUS_INACTIVE: COMMON_LABELS.STATUS.INACTIVE,
    BUTTONS: {
      EDIT: COMMON_LABELS.ACTIONS.EDIT,
      CLOSE: COMMON_LABELS.ACTIONS.CANCEL,
    },
  },
} as const;

export const SKILL_CATALOG_FORM_LABELS = {
  CODE: 'Kode Skill Catalog',
  NAME: 'Nama Skill Catalog',
  SKILL_CATEGORY: 'Skill Category',
  SKILL_LEVEL: 'Skill Level',
} as const;

export const SKILL_CATALOG_PLACEHOLDERS = {
  CODE: 'Masukan Kode',
  NAME: 'Masukkan nama skill catalog',
  SKILL_CATEGORY: 'Pilih skill category',
  SKILL_LEVEL: 'Pilih skill level',
  DESCRIPTION: 'Masukkan deskripsi skill catalog',
  STATUS: 'Pilih status',
} as const;

export const SKILL_CATALOG_LABELS = {
  LIST: {
    TITLE: 'Skill Catalog',
    EMPTY: 'Tidak ada skill catalog',
    COLUMNS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Skill Catalog',
      SKILL_CATEGORY: 'Skill Category',
      SKILL_LEVEL: 'Skill Level',
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
    STATUS: COMMON_LABELS.STATUS,
    ACTIONS: COMMON_LABELS.LIST.ACTIONS,
    FILTERS: {
      SKILL_LEVEL: 'Semua Skill Level',
      SKILL_CATEGORY: 'Semua Skill Category',
      STATUS: 'Semua Status',
    },
    DIALOG: {
      DELETE_TITLE: 'Hapus Skill Catalog',
      DELETE_DESCRIPTION: 'Apakah Anda yakin ingin menghapus skill catalog ini?',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: 'Hapus',
    },
  },
  CREATE: {
    PAGE_TITLE: 'Buat Skill Catalog Baru',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    FIELDS: {
      CODE: SKILL_CATALOG_FORM_LABELS.CODE,
      NAME: SKILL_CATALOG_FORM_LABELS.NAME,
      SKILL_CATEGORY: SKILL_CATALOG_FORM_LABELS.SKILL_CATEGORY,
      SKILL_LEVEL: SKILL_CATALOG_FORM_LABELS.SKILL_LEVEL,
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Skill Catalog Baru?',
      DESCRIPTION: 'Anda akan membuat skill catalog baru dengan data yang telah ditentukan.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  EDIT: {
    PAGE_TITLE: 'Edit Skill Catalog',
    BACK_BUTTON: COMMON_LABELS.ACTIONS.BACK,
    NOT_FOUND: 'Skill catalog tidak ditemukan',
    FIELDS: {
      CODE: SKILL_CATALOG_FORM_LABELS.CODE,
      NAME: SKILL_CATALOG_FORM_LABELS.NAME,
      SKILL_CATEGORY: SKILL_CATALOG_FORM_LABELS.SKILL_CATEGORY,
      SKILL_LEVEL: SKILL_CATALOG_FORM_LABELS.SKILL_LEVEL,
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    BUTTONS: {
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      SAVE: COMMON_LABELS.ACTIONS.SAVE_CHANGE,
      SAVING: COMMON_LABELS.STATE.SAVING,
    },
    DIALOG: {
      TITLE: 'Simpan Perubahan?',
      DESCRIPTION: 'Anda akan menyimpan perubahan pada skill catalog ini.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
  DETAIL: {
    PAGE_TITLE: 'Detail Skill Catalog',
    FIELDS: {
      CODE: COMMON_LABELS.FIELDS.CODE,
      NAME: 'Nama Skill',
      SKILL_CATEGORY: 'Kategori Skill',
      SKILL_LEVEL: 'Skill Level',
      DESCRIPTION: COMMON_LABELS.FIELDS.DESCRIPTION,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
    STATUS_ACTIVE: COMMON_LABELS.STATUS.ACTIVE,
    STATUS_INACTIVE: COMMON_LABELS.STATUS.INACTIVE,
    BUTTONS: {
      EDIT: COMMON_LABELS.ACTIONS.EDIT,
      SAVE: COMMON_LABELS.ACTIONS.SAVE,
      CLOSE: COMMON_LABELS.ACTIONS.CANCEL,
    },
    DIALOG: {
      TITLE: 'Ubah Status?',
      DESCRIPTION: 'Anda akan mengubah status skill catalog ini.',
      CANCEL: COMMON_LABELS.ACTIONS.CANCEL,
      CONFIRM: COMMON_LABELS.ACTIONS.SAVE,
    },
  },
} as const;

export const SKILL_CATEGORY_PLACEHOLDERS = {
  CODE: 'Masukan Kode',
  NAME: 'Masukkan nama skill category',
  DESCRIPTION: 'Masukkan deskripsi skill category',
  STATUS: 'Pilih status',
} as const;

export const SKILL_CATEGORY_FORM_LABELS = {
  CODE: 'Kode Skill Category',
  NAME: 'Nama Skill Category',
} as const;
