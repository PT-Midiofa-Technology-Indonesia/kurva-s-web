import { COMMON_LABELS } from '@/shared/constants';

export const PROJECT_HIERARCHY_TEMPLATE_LABELS = {
  LIST: {
    TITLE: 'Project Hierarchy Templates',
    ADD_BUTTON: 'Add Template',
    EMPTY: 'No project hierarchy templates found.',
    COLUMNS: {
      NAME: 'Template Name',
      PROJECT_CAPABILITY: 'Project Capability',
      STATUS: 'Status',
      ACTIONS: 'Actions',
    },
    ACTIONS: {
      DETAIL: 'Detail',
      EDIT: 'Edit',
      DELETE: 'Delete',
    },
    FILTERS: {
      STATUS: 'Filter by Status',
    },
  },
  DIALOG: {
    DELETE_TITLE: 'Delete Project Hierarchy Template',
    DELETE_DESCRIPTION:
      'Are you sure you want to delete this project hierarchy template? This action cannot be undone.',
  },
  FEEDBACK: {
    CREATE_SUCCESS: 'Position added successfully.',
    CREATE_FAILED: 'Failed to add position.',
    UPDATE_SUCCESS: 'Project hierarchy template updated successfully.',
    UPDATE_FAILED: 'Failed to update project hierarchy template.',
    DELETE_SUCCESS: 'Project hierarchy template deleted successfully.',
    DELETE_FAILED: 'Failed to delete project hierarchy template.',
  },
};

export const PROJECT_HIERARCHY_TEMPLATE_STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];

export const BOQ_PROJECT_STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Planning Draft', value: 'planning_draft' },
  { label: 'Planning Done', value: 'planning_done' },
  { label: 'Final Draft', value: 'final_draft' },
  { label: 'Final Done', value: 'final_done' },
];

export const BOQ_STAGE_CONFIG = {
  planning: {
    settingColumnLabel: 'Setting BoQ',
    showFilter: true,
  },
  final: {
    settingColumnLabel: 'Limit Budget',
    showFilter: true,
  },
  execution: {
    settingColumnLabel: 'Execution',
    showFilter: false,
  },
} as const;

export const BOQ_PROJECT_DETAIL_LABELS = {
  settingBoQ: 'Setting BoQ',
  project: 'Project',
  projectOwner: 'Project Owner',
  client: 'Client',
  rabValue: 'RAB Value',
  projectPeriod: 'Project Period',
  description: 'Description',
} as const;

export const BOQ_TEMPLATE_SELECT_LABELS = {
  title: 'Pilih Template',
  description: 'Pilih template BoQ yang akan digunakan untuk project ini.',
  templateLabel: 'Template',
  templatePlaceholder: 'Cari template...',
  setManual: 'Set Manual',
  lanjutkan: 'Lanjutkan',
} as const;

export type BOQManagementTab = 'template' | 'planning' | 'final' | 'execution';

export const BOQ_MANAGEMENT_TABS: Record<Uppercase<BOQManagementTab>, BOQManagementTab> = {
  TEMPLATE: 'template',
  PLANNING: 'planning',
  FINAL: 'final',
  EXECUTION: 'execution',
} as const;

export const BOQ_MANAGEMENT_TAB_LABELS: Record<BOQManagementTab, string> = {
  template: 'Template',
  planning: 'Planning',
  final: 'Final',
  execution: 'Execution',
} as const;

export const SPK_UPLOAD_LABELS = {
  SECTION_TITLE: 'SPK',
  SPK_NUMBER_LABEL: 'Nomor SPK',
  SPK_NUMBER_REQUIRED: '*',
  SPK_NUMBER_PLACEHOLDER: 'Masukkan nomor SPK',
  DOCUMENTS_LABEL: 'Dokumen SPK',
  DOCUMENTS_REQUIRED: '*',
  ADD_FILES_BUTTON: 'Add files',
  FILE_LIMIT_INFO: 'docx, xls, pdf, jpeg, jpg, png (max {max} files, up to {maxSize}MB each)',
  SAVE_BUTTON: 'Simpan SPK',
  SAVE_PROGRESS: 'Menyimpan...',
  EDIT_BUTTON: 'Edit',
  EMPTY_REQUIREMENT_MESSAGE:
    'Tidak ada dokumen SPK yang dikonfigurasi. Hubungi administrator untuk menambahkan dokumen SPK.',
  NO_FILES_SELECTED: 'Belum ada file dipilih',
  TOTAL_FILES: '({count})',
  BUTTONS: {
    BROWSE_FILE: 'Browse File',
    ADD_FILE: 'Add File',
    SAVE: 'Simpan',
    SAVING: 'Menyimpan...',
    EDIT: 'Edit',
    CANCEL: 'Batal',
  },
  EMPTY_DOCUMENT: 'Belum ada dokumen yang diunggah',
};

export const BOQ_PLANNING_PAGE_LABELS = {
  lihatResume: 'Lihat Resume',
  generateQuotation: 'Generate Quotation',
} as const;

export const STATUS_OPTIONS = [
  { label: 'Aktif', value: 'true' },
  { label: 'Tidak Aktif', value: 'false' },
];

export const BOQ_PROJECT_COMPLETE_INCOMPLETE_OPTIONS = [
  { label: 'Complete', value: 'complete' },
  { label: 'Incomplete', value: 'incomplete' },
];

export const BOQ_PLANNING_STATUS_OPTIONS = [
  { label: 'Complete', value: 'isRabComplete_true' },
  { label: 'Incomplete', value: 'isRabComplete_false' },
];

export const BOQ_FINAL_STATUS_OPTIONS = [
  { label: 'Complete', value: 'isLimitBudgetComplete_true' },
  { label: 'Incomplete', value: 'isLimitBudgetComplete_false' },
];

export const BOQ_EXECUTION_STATUS_OPTIONS = [
  { label: 'Complete', value: 'isCcoComplete_true' },
  { label: 'Incomplete', value: 'isCcoComplete_false' },
];

export const BOQ_EXECUTION_DETAIL_PAGE_LABELS = {
  PAGE_TITLE: 'BOQ Execution',
  BUTTONS: {
    START_PROJECT: 'Mulai Project',
    VIEW_RESUME: 'Lihat Resume',
  },
  START_PROJECT_CONFIRM: {
    TITLE: 'Konfirmasi Mulai Project',
    DESCRIPTION:
      'Anda yakin ingin mulai project ini?\nProject yang sudah dimulai tidak dapat diedit kembali!',
    CANCEL: 'Kembali',
    CONFIRM: 'Mulai Project',
  },
  SIDE_INSTRUCTION_WARNING: {
    TITLE: 'Perhatian',
    DESCRIPTION: 'Simpan SPK dan complete BoQ Execution untuk memulai project.',
  },
  NOT_FOUND: 'Data BOQ Execution tidak ditemukan.',
} as const;

export type ProjectControlTab = 'hierarchy-template' | 'project';

export const PROJECT_CONTROL_TABS: Record<string, ProjectControlTab> = {
  HIERARCHY_TEMPLATE: 'hierarchy-template',
  PROJECT: 'project',
} as const;

export const PROJECT_CONTROL_TAB_LABELS: Record<ProjectControlTab, string> = {
  'hierarchy-template': 'Hierarki Project Template',
  project: 'Project',
} as const;

export const CREATE_POSITION_PAGE_LABELS = {
  PAGE_TITLE: 'Tambah Position Baru',
  FIELDS: {
    JOB_POSITION: 'Job Position',
    JOB_POSITION_PLACEHOLDER: 'Pilih job position',
    KODE_JOB_POSITION: 'Kode Job Position',
    KODE_JOB_POSITION_PLACEHOLDER: 'Pilih job position terlebih dahulu',
    PARENT_POSITION: 'Parent Position',
    PARENT_POSITION_PLACEHOLDER: 'Pilih parent position',
    STATUS: 'Status',

    PIC: 'PIC',
  },
  PERMISSIONS: {
    SELECT_ALL: 'Pilih semua',
  },
  BUTTONS: {
    CANCEL: 'Batal',
    SAVE: 'Simpan',
    SAVING: 'Menyimpan...',
  },
  DIALOG: {
    TITLE: 'Simpan Position Baru?',
    DESCRIPTION: 'Anda akan menambahkan position baru ke dalam hierarki template ini.',
    CANCEL: 'Batal',
    CONFIRM: 'Simpan',
  },
  TOAST: {
    SUCCESS: 'Position berhasil ditambahkan.',
    ERROR: 'Gagal menambahkan position.',
  },
} as const;

export const EDIT_POSITION_PAGE_LABELS = {
  PAGE_TITLE: 'Edit Position',
  DIALOG: {
    TITLE: 'Simpan Perubahan Position?',
    DESCRIPTION: 'Anda akan mengubah data position ini.',
    CANCEL: 'Batal',
    CONFIRM: 'Simpan',
  },
  TOAST: {
    SUCCESS: 'Position berhasil diperbarui.',
    ERROR: 'Gagal memperbarui position.',
  },
} as const;

export const DETAIL_PAGE_LABELS = {
  PAGE_TITLE: (name: string) => `Hierarki Project ${name}`,
  PROJECT_CAPABILITY: 'Project Capability',
  DESKRIPSI: 'Deskripsi',
  STATUS: 'Status',
  AKTIF: 'Aktif',
  TIDAK_AKTIF: 'Tidak Aktif',
  TAMBAH_POSITION: 'Tambah Position',
  TAMBAH_POSITION_PERTAMA: 'Tambah Position Pertama',
  SIDE_INSTRUCTION_READONLY_NOTICE: 'Site instruction',
  BELUM_ADA_POSITION: 'Belum ada position.',
  GAGAL_MEMUAT: 'Gagal memuat template.',
  BUTTONS: {
    BACK: COMMON_LABELS.ACTIONS.BACK,
  },
} as const;

export const CREATE_POSITION_FORM_FIELDS = [
  {
    name: 'positionId',
    type: 'select',
    label: CREATE_POSITION_PAGE_LABELS.FIELDS.JOB_POSITION,
    placeholder: CREATE_POSITION_PAGE_LABELS.FIELDS.JOB_POSITION_PLACEHOLDER,
    required: true,
    colSpan: 6,
    isSearchable: true,
    isClearable: true,
  },
  {
    name: '_kode',
    type: 'custom' as const,
    colSpan: 6,
    className: 'self-end',
  } as any,
  {
    name: 'parentId',
    type: 'select',
    label: CREATE_POSITION_PAGE_LABELS.FIELDS.PARENT_POSITION,
    placeholder: CREATE_POSITION_PAGE_LABELS.FIELDS.PARENT_POSITION_PLACEHOLDER,
    required: false,
    colSpan: 6,
    isSearchable: true,
    isClearable: true,
  },
  {
    name: 'status',
    type: 'select',
    label: CREATE_POSITION_PAGE_LABELS.FIELDS.STATUS,
    required: true,
    options: [
      { value: 'active', label: COMMON_LABELS.STATUS.ACTIVE },
      { value: 'inactive', label: COMMON_LABELS.STATUS.INACTIVE },
    ],
    colSpan: 6,
  },
];

export const CREATE_PROJECT_POSITION_FORM_FIELDS = [
  {
    name: 'positionId',
    type: 'select',
    label: CREATE_POSITION_PAGE_LABELS.FIELDS.JOB_POSITION,
    placeholder: CREATE_POSITION_PAGE_LABELS.FIELDS.JOB_POSITION_PLACEHOLDER,
    required: true,
    colSpan: 6,
    isSearchable: true,
    isClearable: true,
  },
  {
    name: '_kode',
    type: 'custom' as const,
    colSpan: 6,
    className: 'self-end',
  } as any,
  {
    name: 'parentId',
    type: 'select',
    label: CREATE_POSITION_PAGE_LABELS.FIELDS.PARENT_POSITION,
    placeholder: CREATE_POSITION_PAGE_LABELS.FIELDS.PARENT_POSITION_PLACEHOLDER,
    required: false,
    colSpan: 6,
    isSearchable: true,
    isClearable: true,
  },
  {
    name: 'status',
    type: 'select',
    label: CREATE_POSITION_PAGE_LABELS.FIELDS.STATUS,
    required: true,
    options: [
      { value: 'active', label: COMMON_LABELS.STATUS.ACTIVE },
      { value: 'inactive', label: COMMON_LABELS.STATUS.INACTIVE },
    ],
    colSpan: 6,
  },
  {
    name: '_pic',
    type: 'custom' as const,
    colSpan: 6,
  } as any,
];

export const PROGRESS_MONITORING_PAGE_LABELS = {
  PAGE_TITLE: 'Progress Monitoring',
  BREADCRUMB: {
    PROJECT_CONTROL: 'Project Control',
    PROJECT: 'Project',
  },
  BACK_BUTTON: 'Kembali',
  INFORMATION_CARD: {
    TITLE: 'Informasi Project',
    LABELS: {
      PROJECT_NAME: 'Nama Project',
      PROJECT_OWNER: 'Pemilik Project',
      CLIENT: 'Klien',
      ESTIMATED_VALUE: 'Estimasi Nilai Project',
      PROJECT_PERIOD: 'Periode Project',
      DESCRIPTION: 'Deskripsi',
    },
  },
  TABLE: {
    KODE: 'Kode',
    VIEW: 'View',
    TASK_NAME: 'Task Name',
    START: 'Start',
    END: 'End',
    ASSIGNE: 'Assigne',
    DAYS: 'Days',
    BOBOT: 'Bobot',
    TOTAL: 'Total',
    DONE: 'Done',
    PERCENT: '%',
    STATUS: 'Status',
    MANPOWER_TASK: 'Manpower Task',
    QC_TASK: 'QC Task',
  },
  SEARCH_PLACEHOLDER: 'Cari task...',
  STATUS: {
    QC_PASSED: 'QC Passed',
    DONE_PENDING_QC: 'Done - Pending QC',
    IN_PROGRESS: 'In Progress',
    QC_FAILED: 'QC Failed',
    NOT_STARTED: 'Not Started',
  },
  VIEW_MODE: {
    ALL: 'All',
    DAY: 'Day',
    WEEK: 'Week',
    MONTH: 'Month',
  },
} as const;

export const SCHEDULE_PAGE_LABELS = {
  BREADCRUMB: {
    PROJECT_CONTROL: 'Project Control',
    PROJECT: 'Project',
  },
  INFORMATION_CARD: PROGRESS_MONITORING_PAGE_LABELS.INFORMATION_CARD,
} as const;

export const PROJECT_HIERARCHY_TEMPLATE_SELECT_LABELS = {
  TITLE: 'Pilih Template',
  DESCRIPTION: 'Pilih template hierarki yang ingin anda gunakan',
  TEMPLATE_LABEL: 'Template',
  TEMPLATE_PLACEHOLDER: 'Pilih template',
  SET_MANUAL: 'Set Manual',
  LANJUTKAN: 'Lanjutkan',
} as const;

export const PROJECT_LIST_PAGE_LABELS = {
  PAGE_TITLE: 'Project',
  SEARCH_PLACEHOLDER: 'Cari project...',
  TABLE: {
    PROJECT: 'Project',
    PROJECT_OWNER: 'Project Owner',
    PROJECT_TYPE: 'Project Type',
    PROJECT_SOURCE_CATEGORY: 'Source Category',
    STATUS: 'Status',
    START_STATUS: 'Start Status',
    START_STATUS_NOT_STARTED: 'Belum Dimulai',
    START_STATUS_STARTED: 'Dimulai',
    ACTION: 'Aksi',
  },
  STATUS_FILTER: {
    ALL: 'Semua Status',
    ACTIVE: 'Aktif',
    INACTIVE: 'Tidak Aktif',
  },
  FILTERS: {
    SOURCE_CATEGORY: 'Source Category',
    STATUS: 'Status',
  },
  ACTIONS: {
    VIEW: 'Lihat Detail',
    PROGRESS_MONITORING: 'Progress Monitoring',
    HIERARKI: 'Hierarki',
    SCHEDULE: 'Schedule',
    WORKING_HOURS: 'Jam Kerja',
    WAREHOUSE: 'Warehouse',
    CANCEL_PROJECT: 'Batalkan Project',
    SITE_INSTRUCTION: 'Site Instruction',
  },
  SITE_INSTRUCTION: {
    TITLE: 'Konfirmasi Site Instruction',
    DESCRIPTION: 'Apakah anda yakin ingin membuat site instruction untuk project ini?',
    CANCEL: 'Batal',
    CONFIRM: 'Create Site Instruction',
  },
  WORK_HOURS_MODAL: {
    TITLE: 'Set Jam Kerja',
    DESCRIPTION:
      'Default mengikuti warehouse. Override di sini hanya jika project punya jadwal berbeda.',
    INFO_READONLY: 'Site instruction',
  },
  WAREHOUSE_MODAL: {
    TITLE: 'Pilih Warehouse',
    DESCRIPTION: 'Pilih warehouse yang ingin anda gunakan',
    INFO_READONLY: 'Site instruction',
  },
  SPK: {
    TITLE: 'Upload SPK',
    DESCRIPTION: 'Upload dokumen SPK untuk project ini',
    UPLOAD_BUTTON: 'Upload SPK',
    PLACEHOLDER: 'Pilih dokumen SPK...',
    REQUIRED: 'Dokumen SPK wajib diunggah',
    FILE_TYPE_ERROR: 'Format file tidak sesuai',
    FILE_SIZE_ERROR: 'Ukuran file terlalu besar',
  },
} as const;

export const TASK_DETAIL_DRAWER_LABELS = {
  TITLE: 'Detail Tugas',
  TABS: {
    TASK_HISTORY: 'Task History',
    EVIDENCE_FILES: 'Evidence Files',
    QC_HISTORY: 'QC History',
  },
  TASK_HISTORY_TABLE: {
    TASK: 'Task',
    ASSIGNE: 'Assigne',
    STATUS: 'Status',
    END: 'End',
    RETRY: 'Retry',
  },
  EVIDENCE_FILES: {
    NO_FILES: 'Tidak ada file bukti',
  },
  QC_HISTORY_TABLE: {
    QC_TASK: 'QC Task',
    ASSIGN: 'Assign',
    DECISION: 'Decision',
    END: 'End',
    EVIDENCE: 'Evidence',
  },
} as const;

export const SCREEN_LABELS = {
  fullscreenEnter: 'Layar penuh',
  fullscreenExit: 'Keluar layar penuh',
} as const;

export const BOQ_LIST_PAGE_LABELS = {
  PLANNING: {
    TITLE: 'BoQ Planning',
    EMPTY: 'Belum ada data',
    COMPANY_PLACEHOLDER: 'Pilih Company',
    STATUS_PLACEHOLDER: 'Semua Status',
    COLUMNS: {
      PROJECT: 'Project',
      PROJECT_OWNER: 'Project Owner',
      SETTING_BOQ: 'Setting BoQ',
      COMPLETE: 'Complete',
      INCOMPLETE: 'Incomplete',
      ACTION: 'Action',
      ACTION_LABEL: 'BoQ',
    },
  },
  FINAL: {
    TITLE: 'BoQ Final',
    EMPTY: 'Belum ada data',
    COMPANY_PLACEHOLDER: 'Pilih Company',
    STATUS_PLACEHOLDER: 'Semua Status',
    COLUMNS: {
      PROJECT: 'Project',
      PROJECT_OWNER: 'Project Owner',
      LIMIT_BUDGET: 'Limit Budget',
      COMPLETE: 'Complete',
      INCOMPLETE: 'Incomplete',
      ACTION: 'Action',
      VIEW_BOQ_FINAL: 'View BoQ Final',
      LIMIT_BUDGET_ACTION: 'Limit Budget',
    },
  },
  EXECUTION: {
    TITLE: 'BoQ Execution',
    EMPTY: 'Belum ada data',
    COMPANY_PLACEHOLDER: 'Pilih Company',
    STATUS_PLACEHOLDER: 'Semua Status',
    COLUMNS: {
      PROJECT: 'Project',
      PROJECT_OWNER: 'Project Owner',
      EXECUTION: 'Execution',
      COMPLETE: 'Complete',
      INCOMPLETE: 'Incomplete',
      ACTION: 'Action',
      ACTION_LABEL: 'Execution',
    },
  },
} as const;

export const FINANCIAL_REPORT_LIST_LABELS = {
  TITLE: 'Financial Report',
  SEARCH_PLACEHOLDER: 'Cari project...',
  COLUMNS: {
    PROJECT: 'Project',
    PROJECT_OWNER: 'Project Owner',
    CLIENT: 'Client',
    STATUS: 'Status',
    ACTION: 'Action',
    VIEW_REPORT: 'Lihat Laporan',
  },
} as const;

export const FINANCIAL_REPORT_TREE_LABELS = {
  COLUMNS: {
    KODE: 'Kode',
    VIEW_COST: 'View Cost',
    JOB_ITEM: 'Job/Item',
    JENIS: 'Jenis',
    MATERIAL: 'Material',
    WORK: 'Work',
    RAB: 'RAB',
    CCO: 'CCO',
    COST_USED: 'Cost (Used)',
    BUDGET_REMAINING: 'Budget (Remaining)',
    OVERBUDGET_ITEM: 'Overbudget Item',
    YES: 'Yes',
    NO: 'No',
  },
  GROUPS: {
    TOTAL_PRICE: 'Total Price',
    AMOUNT: 'Amount',
  },
} as const;

export const FINANCIAL_REPORT_COST_LABELS = {
  COLUMNS: {
    KODE: 'Kode',
    EQUIPMENT_NAME: 'Equipment Name',
    JOB_TITLE: 'Job Title',
    NAMA_MATERIAL: 'Nama Material',
    SALARY_H: 'Salary/h',
    UNIT_PRICE: 'Unit Price',
    RAB: 'RAB',
    COST_USED: 'Cost (Used)',
    BUDGET_REMAINING: 'Budget (Remaining)',
    OVERBUDGET_ITEM: 'Overbudget Item',
    YES: 'Yes',
    NO: 'No',
  },
  GROUPS: {
    AMOUNT: 'Amount',
  },
} as const;

export const PROJECT_HIERARCHY_TEMPLATE_LIST_LABELS = {
  SEARCH_PLACEHOLDER: 'Pencarian',
  EMPTY: 'Belum ada data',
  STATUS_FILTER_PLACEHOLDER: 'Filter by Status',
  SAVE_BUTTON: 'Simpan',
  SAVING_BUTTON: 'Menyimpan...',
  ADD_BUTTON: 'Tambah',
  VIEW_TOOLTIP: 'Lihat detail',
  COLUMNS: {
    INDEX: '',
    VIEW: '',
    NAME: 'Nama Template',
    PROJECT_CAPABILITY: 'Project Capability',
    STATUS: 'Status',
    STATUS_ACTIVE: 'Aktif',
    STATUS_INACTIVE: 'Tidak Aktif',
  },
  CONTEXT_MENU: {
    COPY: 'Salin',
    CUT: 'Potong',
    PASTE: 'Tempel',
    INSERT_ABOVE: 'Sisipkan baris di atas',
    INSERT_BELOW: 'Sisipkan baris di bawah',
    DELETE: 'Hapus baris',
  },
} as const;
