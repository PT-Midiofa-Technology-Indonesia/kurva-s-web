export const PROSPECT_DOCUMENT_LABELS = {
  PAGE_TITLE: 'Document Setting',
  TABLE: {
    STAGE: 'Stage Prospect',
    DOCUMENT_TYPE: 'Tipe Document',
    ACTION: 'Action',
    EMPTY_DOCUMENTS: '-',
  },
  SETTING_DRAWER: {
    TITLE: 'Pengaturan',
    FIELDS: {
      DOCUMENT: 'Document',
      DOCUMENT_MANDATORY: 'Mandatory',
      DOCUMENT_ACTIVE: 'Active',
    },
    PLACEHOLDERS: {
      DOCUMENT: 'Pilih tipe dokumen...',
    },
    BUTTONS: {
      SAVE: 'Simpan Perubahan',
      CANCEL: 'Batal',
      ADD: 'Tambah Document',
      DELETE: 'Hapus',
    },
  },
  ACTION: {
    SETTING: 'Pengaturan',
  },
} as const;

export const ENTITY_NAMES_PROSPECT_DOCUMENT = {
  PROSPECT_STAGE_DOCUMENT: 'Pengaturan dokumen',
} as const;
