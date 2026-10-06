'use client';

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'warning'
  | 'success'
  | 'info';

export const PROCUREMENT_LABELS = {
  PURCHASE_REQUEST: {
    TITLE: 'Purchase Request',
    EMPTY: 'Belum ada data Purchase Request.',
    ADD_BUTTON: 'Create Draft',
    SEARCH: 'Pencarian',
    COLUMNS: {
      CODE: 'No. PR',
      PROJECT: 'Project',
      TYPE: 'Type',
      SOURCE: 'Source',
      DATE_REQUIRED: 'Date Required',
      REQUESTED_BY: 'Requested By',
      STATUS: 'Status',
      ACTIONS: 'Action',
    },
    FILTERS: {
      FILTER: 'Filter',
      PROJECT: 'Semua Project',
      STATUS: 'Semua Status',
    },
    TABS: {
      MATERIAL_TOOL: 'Material & Tools',
      SERVICE_RENTAL: 'Service & Rental',
    },
    MANUAL_DIALOG: {
      FALLBACK_TITLE: 'Detail',
      DATE_REQUIRED_PLACEHOLDER: 'Date Required',
      SUBMIT: 'Submit',
      SUBMITTING: 'Menyimpan...',
      EMPTY: 'Belum ada data',
      CLOSE: 'Close',
      REMARKS: 'Remarks',
      VOL_EDIT_HINT: 'Centang item terlebih dahulu untuk mengubah volume',
    },
  },
  PURCHASE_PLANNING: {
    TITLE: 'Purchase Planning',
    EMPTY: 'Belum ada data Purchase Planning.',
    ADD_BUTTON: 'Create Draft',
    SEARCH: 'Pencarian',
    COLUMNS: {
      CODE: 'Kode',
      PROJECT: 'Project',
      TYPE: 'Type',
      CREATED_BY: 'Created By',
      CREATED_AT: 'Created At',
      NOTES: 'Notes',
      STATUS: 'Status',
      ACTIONS: 'Action',
    },
    FILTERS: {
      FILTER: 'Filter',
      PROJECT: 'Semua Project',
      STATUS: 'Semua Status',
    },
    TABS: {
      MATERIAL_TOOL: 'Material & Tools',
      SERVICE_RENTAL: 'Service & Rental',
    },
    FINALIZE: {
      TAX: {
        TITLE: 'Tambahkan Pajak',
        DESCRIPTION: 'Aktifkan untuk mengisi dan menghitung DPP, PPN, serta PPH secara otomatis.',
        EMPTY: 'Belum ada komponen pajak.',
        ADD_TAX_COMPONENT: 'Komponen Pajak',
        ADD_SELECTED_TAX: 'Tambahkan',
        SELECT_TAX_LABEL: 'Pilih jenis Pajak',
        SELECT_TAX_PLACEHOLDER: 'Pilih jenis Pajak',
        RATE_LABEL: 'Tarif',
        REMOVE_TAX: 'Hapus jenis pajak',
        SUMMARY: {
          TITLE: 'RINCIAN NILAI',
          BASE_AMOUNT: 'DPP (Nilai Sebelum Pajak)',
          TOTAL_AFTER_TAX: 'Total Setelah Pajak',
        },
      },
    },
  },
  PURCHASE_ORDER: {
    TITLE: 'Purchase Order',
    EMPTY: 'Belum ada data Purchase Order.',
    SEARCH: 'Pencarian',
    COLUMNS: {
      CODE: 'Kode',
      PROJECT: 'Project',
      TYPE: 'Type',
      VENDOR: 'Vendor',
      TOTAL_PRICE: 'Total Price',
      CREATED_BY: 'Created By',
      STATUS: 'Status',
      ACTIONS: 'Action',
    },
    TABS: {
      MATERIAL_TOOL: 'Material & Tools',
      SERVICE_RENTAL: 'Service & Rental',
    },
  },
  GOODS_RECEIPT: {
    TITLE: 'Goods Receipt',
    EMPTY: 'Belum ada data Goods Receipt.',
    ADD_BUTTON: 'Add Goods Receipt',
    SEARCH: 'Pencarian',
    WAREHOUSE_PLACEHOLDER: 'Semua Warehouse',
    COLUMNS: {
      CODE: 'Kode GR',
      DO_CODE: 'Kode DO',
      WAREHOUSE: 'Warehouse',
      SOURCE: 'Source',
      RECEIVED_AT: 'Received At',
      RECEIVED_BY: 'Received By',
      STATUS: 'Status',
      ACTIONS: 'Action',
    },
    FORM: {
      TITLE: 'Tambah Goods Receipt',
      FIELDS: {
        DELIVERY_ORDER: 'Delivery Order',
        DESTINATION_WAREHOUSE: 'Destination Warehouse',
        SOURCE_TYPE: 'Source Type',
        PURCHASE_ORDER: 'Purchase Order',
        RECEIVED_AT: 'Received At',
        RECEIVED_BY: 'Received By',
        NOTE: 'Note',
      },
      PLACEHOLDERS: {
        DELIVERY_ORDER: 'Pilih delivery order',
        FILLED_FROM_DO: 'Filled based on delivery order',
        NOTE: 'Masukkan note',
      },
      RECEIVED_BY_AUTO: '(Auto Current User)',
      ITEMS_TABLE: {
        TITLE: 'Info Penerimaan',
        CODE: 'Kode',
        ITEM: 'Item',
        DO_QTY: 'DO Qty',
        QTY_RECEIVED: 'Qty Received',
        QTY_REJECTED: 'Qty Rejected',
        QTY_NET: 'Qty Net',
        UOM: 'UoM',
        REMARKS: 'Remarks',
      },
      BATAL: 'Batal',
      SIMPAN: 'Simpan',
    },
    DETAIL: {
      TITLE: 'Detail Goods Receipt',
      ITEMS_UNAVAILABLE: 'Detail item belum tersedia.',
      ITEMS_FALLBACK_NOTE:
        'Menampilkan data dari Delivery Order — Qty Received/Rejected/Net belum tersedia.',
      DOCUMENTS_TITLE: 'Bukti',
      DOCUMENTS_EMPTY: 'Belum ada file bukti.',
      DOWNLOAD_DOCUMENT: (fileName: string) => `Download ${fileName}`,
    },
  },
  ACTIONS: {
    VIEW: 'View',
    VIEW_PR: 'View PR',
    VIEW_DRAFT: 'View Draft',
    DETAIL_PO: 'Detail PO',
    ISSUE_PO: 'Issue PO',
    CANCEL_PO: 'Cancel PO',
    DRAFT: 'Draft',
    CANCEL_DRAFT: 'Cancel Draft',
    HAPUS_CANCEL_DRAFT: 'Hapus Cancel Draft',
    HAPUS_PR: 'Hapus PR',
  },
  DIALOG: {
    DELETE_TITLE: 'Cancel Draft',
    DELETE_DESCRIPTION: 'Apakah yakin ingin menghapus cancel draft ini?',
    CANCEL_DRAFT_TITLE: 'Cancel Draft',
    CANCEL_DRAFT_DESCRIPTION: 'Apakah yakin ingin cancel draft ini?',
    ISSUE_PO_TITLE: 'Issue Purchase Order',
    ISSUE_PO_DESCRIPTION: 'Apakah yakin ingin issue Purchase Order ini?',
    CANCEL_PO_TITLE: 'Cancel Purchase Order',
    CANCEL_PO_DESCRIPTION: 'Apakah yakin ingin cancel Purchase Order ini?',
  },
  TOAST: {
    DELETE_SUCCESS: 'Purchase Planning berhasil dihapus',
  },
  PURCHASE_REQUEST_DETAIL: {
    TITLE: 'Detail Purchase Request',
    BACK_BUTTON: 'Kembali',
    INFORMATION_CARD: {
      TITLE: 'Informasi Project',
      LABELS: {
        PROJECT_NAME: 'Project',
        PROJECT_OWNER: 'Project Owner',
        CLIENT: 'Client',
        ESTIMATED_VALUE: 'Estimasi Nilai Project',
        PROJECT_PERIOD: 'Periode Project',
        DESCRIPTION: 'Deskripsi',
      },
    },
    TABLE: {
      SEARCH_PLACEHOLDER: 'Pencarian',
      KODE: 'Kode',
      MATERIAL_TOOLS: 'Material/Tools',
      VOL_PR: 'VOL PR',
      UOM: 'UoM',
      EMPTY: 'Belum ada data.',
    },
  },
  PURCHASE_ORDER_DETAIL: {
    TITLE: 'Detail Purchase Order',
    BACK_BUTTON: 'Kembali',
    VENDOR_INFO: {
      TITLE: 'Vendor Info',
      NAMA_VENDOR: 'Nama Vendor',
      ALAMAT_VENDOR: 'Alamat Vendor',
    },
    INVOICE_SECTION: {
      TITLE: 'Invoice,Faktur dan Dokumen',
      EDIT_BUTTON: 'Edit',
      CREATE_BUTTON: 'Create',
      COMPLETE_DATA_BUTTON: 'Lengkapi Data',
      INVOICE_AND_TAX_TITLE: 'Invoice dan Faktur',
      DOCUMENTS_TITLE: 'Dokumen',
      EMPTY_DOCUMENTS: 'Belum ada dokumen yang diunggah',
      GROUPS: {
        INVOICE: 'Invoice',
        TAX: 'Surat Faktur',
      },
      FIELDS: {
        INVOICE_NUMBER: 'Nomor Invoice',
        INVOICE_DATE: 'Tanggal Invoice',
        INVOICE_DUE_DATE: 'Jatuh Tempo',
        INVOICE_AMOUNT: 'Nilai Invoice',
        TAX_INVOICE_NUMBER: 'Nomor Faktur',
        TAX_INVOICE_DATE: 'Tanggal Faktur',
        TAX_INVOICE_STATUS: 'Status Faktur',
        TAXPAYER_NPWP: 'Diisi Oleh',
      },
      SUMMARY: {
        TITLE: 'Rincian Nilai',
        BASE_AMOUNT: 'DPP (Nilai Sebelum Pajak)',
        TAX: 'Total Pajak',
        VAT: 'PPN 11%',
        WITHHOLDING: 'PPh 0% (Tidak Dipotong)',
        TOTAL: 'Total Dibayarkan ke Vendor',
      },
      DOWNLOAD: (fileName: string) => `Unduh ${fileName}`,
    },
    INVOICE_DRAWER: {
      TITLE_CREATE: 'Create Invoice,Faktur dan Dokumen',
      TITLE_EDIT: 'Edit Invoice,Faktur dan Dokumen',
      EMPTY_TAXES: 'Belum ada rincian pajak.',
      EMPTY_TAX_TYPE: 'Belum ada jenis pajak',
      SECTIONS: {
        INVOICE: 'Invoice',
        TAX: 'Faktur',
        TAX_DETAIL: 'Rincian pajak',
        DOCUMENTS: 'Dokumen',
      },
      FIELDS: {
        INVOICE_NUMBER: 'Nomor Invoice',
        INVOICE_DATE: 'Tanggal Invoice',
        INVOICE_DUE_DATE: 'Jatuh Tempo',
        INVOICE_AMOUNT: 'Nilai Invoice(Rp)',
        TAX_INVOICE_NUMBER: 'Nomor Faktur',
        TAX_INVOICE_DATE: 'Tanggal Faktur',
        TAX_INVOICE_STATUS: 'Status Faktur',
        TAXPAYER_NPWP: 'NPWP pada faktur',
        TAX_TYPE: 'Pilih Jenis Pajak',
        TAX_RATE: 'Tarif',
        INVOICE_DOCUMENTS: 'Invoice',
        TAX_DOCUMENTS: 'Surat Faktur',
      },
      PLACEHOLDERS: {
        INVOICE_NUMBER: 'Nomor Invoice',
        INVOICE_DATE: 'Pilih tanggal invoice',
        INVOICE_DUE_DATE: 'Pilih jatuh tempo',
        INVOICE_AMOUNT: '0',
        TAX_INVOICE_NUMBER: 'Nomor Faktur',
        TAX_INVOICE_DATE: 'Pilih tanggal faktur',
        TAX_INVOICE_STATUS: 'Pilih status faktur',
        TAXPAYER_NPWP: '00.000.000.0-000.000',
        TAX_TYPE: 'Pilih Jenis Pajak',
        TAX_RATE: 'Tarif',
      },
      BUTTONS: {
        ADD_TAX: 'Komponen Pajak',
        BROWSE_FILES: 'Browse files',
        CANCEL: 'Batal',
        CREATE: 'Create',
        SAVE: 'Simpan',
        SAVING: 'Menyimpan...',
      },
    },
    RATING: {
      TITLE: 'Rating Vendor',
      EMPTY: 'Belum ada rating untuk purchase order ini.',
      OVERALL_SCORE: 'Overall Score',
      RATED_AT: 'Tanggal Rating',
      RATED_BY: 'Dinilai Oleh',
    },
    AUDIT_TRAIL: {
      TITLE: 'Audit Trail',
      DIBUAT_DARI_DRAFT: 'Dibuat dari Draft',
      STATUS: 'Status',
    },
    TABLE: {
      SECTION_TITLE: 'Detail PO',
      SEARCH_PLACEHOLDER: 'Pencarian',
      NO: 'No',
      PR_SOURCE: 'PR Source',
      VOL_PO: 'VOL PO',
      UOM: 'UoM',
      UNIT_PRICE: 'Unit Price',
      TOTAL_PRICE: 'Total Price',
      REMARKS: 'Remarks',
      EMPTY: 'Belum ada data.',
    },
    BUTTONS: {
      SIMPAN: 'Simpan',
      CANCEL_PO: 'Cancel PO',
      ISSUE_PO: 'Issue PO',
      ADD_GOODS_RECEIPT: 'Add Goods Receipt',
      PRINT: 'Print',
    },
    INFO_BANNER: {
      ISSUED: 'PO sudah Issued. Hanya PO berstatus Draft yang bisa diedit.',
      ISSUED_COMPLETE_DATA: 'Silahkan Lengkapi Data Invoice, Faktur dan Dokumen dibawah',
    },
  },
  PO_DRAFT: {
    SELECT_PR: {
      PROJECT_LABEL: 'Project',
      PROJECT_PLACEHOLDER: 'Pilih Project',
      NO_PROJECT_MESSAGE: 'Pilih project untuk menampilkan daftar PR',
      TYPE_LABEL: 'Tipe',
      TYPE_MATERIAL_TOOL: 'Material & Tool',
      TYPE_SERVICE_RENTAL: 'Service & Rental',
      COLUMNS: {
        NO_PR: 'No. PR',
        PR_APPROVED: 'PR Approved',
        SOURCE: 'Source',
      },
    },
    SELECT_ITEMS: {
      SEARCH_PLACEHOLDER: 'Cari material / tools ...',
      SELECT_ITEM_FIRST: 'Centang item terlebih dahulu untuk mengedit VOL PO',
      COLUMNS: {
        KODE: 'Kode',
        NAMA_MATERIAL_TOOLS: 'Nama Material / Tools',
        VOL_PR: 'VOL PR',
        VOL_PO: 'VOL PO',
        UOM: 'UoM',
        REMARKS: 'Remarks',
      },
    },
    PICK_WINNER: {
      COLUMNS: {
        NO: 'No',
        MATERIAL_TOOLS: 'Material/Tools',
        VOL_PO: 'VOL PO',
        UOM: 'UoM',
        WINNER: 'Winner',
        PRICE_SUFFIX: ' Price',
      },
    },
  },
} as const;

export const PURCHASE_REQUEST_STATUS_BADGE: Record<
  string,
  { label: string; variant: BadgeVariant }
> = {
  draft: { label: 'Draft', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  finalized: { label: 'Finalized', variant: 'default' },
  open: { label: 'Open', variant: 'default' },
  closed: { label: 'Closed', variant: 'success' },
  waiting_approval: { label: 'Waiting Approval', variant: 'warning' },
};

export const PO_DRAFT_STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  finalized: { label: 'Finalized', variant: 'default' },
};

export const PO_STATUS_BADGE: Record<
  string,
  { label: string; variant: BadgeVariant; className?: string }
> = {
  draft: { label: 'Draft', variant: 'secondary' },
  waiting_approval: {
    label: 'Waiting Approval',
    variant: 'outline',
    className: 'border-0 bg-yellow-100 text-yellow-600 hover:bg-yellow-100',
  },
  issued: {
    label: 'Issued',
    variant: 'outline',
    className: 'border-0 bg-blue-100 text-blue-600 hover:bg-blue-100',
  },
  in_progress: {
    label: 'In Progress',
    variant: 'outline',
    className: 'border-0 bg-purple-100 text-purple-700 hover:bg-purple-100',
  },
  complete: {
    label: 'Complete',
    variant: 'outline',
    className: 'border-0 bg-green-100 text-green-600 hover:bg-green-100',
  },
  completed: {
    label: 'Completed',
    variant: 'outline',
    className: 'border-0 bg-green-100 text-green-600 hover:bg-green-100',
  },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export const GR_STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  received: { label: 'Received', variant: 'success' },
};

export const ITEM_STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  approved: { label: 'Approved', variant: 'default' },
  pending: { label: 'Pending', variant: 'warning' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  draft: { label: 'Draft', variant: 'secondary' },
  waiting_approval: { label: 'Waiting Approval', variant: 'warning' },
};
