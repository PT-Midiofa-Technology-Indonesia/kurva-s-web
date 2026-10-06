import type {
  ManpowerPlanStatus,
  ManpowerReportStatus,
  QcReportStatus,
} from '../types/manpower-planning';

/**
 * Shared Badge chrome of the new flow — declared once so every badge in the tables and detail
 * dialogs renders identically. Colour maps per status stay in MANPOWER_PLAN_LABELS; this is the
 * shell (sizing/padding) and the Revisi red.
 */
export const BADGE_CHROME = {
  /** Sizing/padding shell of every status Badge (tree table, QC table, detail dialogs, timeline). */
  STATUS: 'h-5 rounded-md border-0 px-2 text-xs font-medium',
  /** Revisi column badge — same red as the Ditolak status. */
  REVISI: 'bg-red-100 text-red-600',
} as const;

/**
 * Every UI string of the new Manpower Planning flow lives here — never hardcode labels in .tsx.
 * Each dialog of the flow appends its own block to this object (ASSIGN_ITEMS_*, PARENT_DETAIL_*,
 * ASSIGN_PEKERJAAN_*, SELESAIKAN_*).
 */
export const MANPOWER_PLAN_LABELS = {
  PAGE: {
    TITLE: 'Manpower Planning',
    DETAIL_CARD_TITLE: 'Detail Item Project',
    /**
     * Leaf statuses offered by the page-header status Select, in Figma order. `TABLE.STATUS_FILTER_ALL`
     * supplies the "no filter" option; the search box reuses `TABLE.SEARCH_PLACEHOLDER`.
     */
    STATUS_FILTER_OPTIONS: ['Belum Assign', 'Progress', 'Selesai'] as readonly ManpowerPlanStatus[],
  },
  TABLE: {
    SELECT_ALL: 'Select all',
    SELECT_ROW: 'Select row',
    KODE: 'Kode',
    JOB_ITEM: 'Job/Item',
    VOLUME: 'Volume',
    ASSIGN: 'Assign',
    PROGRES: 'Progres',
    STATUS: 'Status',
    LAST_UPDATE: 'Last Update',
    REVISI: 'Revisi',
    ACTION: 'Aksi',
    EMPTY: 'No results.',
    ASSIGN_TERPILIH: 'Assign Terpilih',
    SEARCH_PLACEHOLDER: 'Pencarian',
    STATUS_FILTER_ALL: 'Semua status',
    /** Trailing overflow marker of the assignees cell — "Budi, Ricko +2" renders the `+2`. */
    ASSIGNEES_OVERFLOW: (count: number) => `+${count}`,
    /** Revisi cell badge text — `2x` when revisiCount is 2, `-` when it is 0. */
    REVISI_COUNT: (count: number) => `${count}x`,
  },
  ACTIONS: {
    ASSIGN: 'Assign',
    SELESAIKAN: 'Selesaikan',
    LIHAT: 'Lihat',
    EDIT: 'Edit',
  },
  /** Shared by the tree table status column and the detail dialogs so both colour a status the same way. */
  STATUS_BADGE_CLASSNAMES: {
    'Belum Assign': 'bg-slate-100 text-slate-700',
    Progress: 'bg-amber-100 text-amber-600',
    Selesai: 'bg-green-100 text-green-700',
  } as Record<ManpowerPlanStatus, string>,
  REPORT_STATUS_BADGE_CLASSNAMES: {
    'Belum Diselesaikan': 'bg-slate-100 text-slate-700',
    'Menunggu QC': 'bg-orange-100 text-orange-600',
    Diterima: 'bg-green-100 text-green-700',
    Ditolak: 'bg-red-100 text-red-600',
  } as Record<ManpowerReportStatus, string>,
  /**
   * AssignItemsDialog (parent-level "Assign Terpilih") — work variant; the QC page reuses the same
   * dialog with `taskCategory='qc'` (QC endpoint + QC employee scope, see QC_TASK_UNAVAILABLE).
   */
  ASSIGN_ITEMS: {
    /** Dialog title — `Assign 3 Item Terpilih`. */
    TITLE: (count: number) => `Assign ${count} Item Terpilih`,
    /** Header subtitle — `3 item dipilih`. */
    SELECTED_COUNT: (count: number) => `${count} item dipilih`,
    /** Screen-reader label of each item row's "×" remove button. */
    REMOVE_ITEM: 'Hapus item terpilih',
    EMPLOYEE_LABEL: 'Employee',
    REQUIRED_MARK: '*',
    EMPLOYEE_PLACEHOLDER: 'Pilih Employee',
    EMPLOYEE_LOADING_PLACEHOLDER: 'Memuat employee...',
    NOTE_LABEL: 'Catatan',
    NOTE_PLACEHOLDER: 'Tambahkan catatan (opsional)',
    CANCEL: 'Batalkan',
    SUBMIT: (count: number) => `Assign (${count})`,
    SUBMITTING: 'Menyimpan...',
    SUCCESS_TOAST: 'Item berhasil di-assign',
    /**
     * QC variant (`taskCategory='qc'`) guard toast — a selected report whose task id is missing
     * cannot be assigned through the QC delegate endpoint.
     */
    QC_TASK_UNAVAILABLE: (title: string) => `Task "${title}" belum tersedia untuk QC`,
  },
  /** ParentTaskDetailDialog (read-only "Lihat" parent) — everything renders from the tree item prop. */
  PARENT_DETAIL: {
    TITLE: 'Detail',
    /** Header subtitle — `A.1 · Pekerjaan Tanah`. */
    SUBTITLE: (code: string, name: string) => `${code} · ${name}`,
    CREATED_BY: 'Created By',
    ASSIGN: 'Assign',
    /** Only the parent-detail endpoint (`ParentTaskDetail.assignDate`) carries it — the tree does not. */
    ASSIGN_DATE: 'Assign Date',
    LAST_UPDATED: 'Last Updated',
    NOTE: 'Catatan',
    /** Rendered while the detail is loading or the source value itself is null. */
    EMPTY: '-',
    ITEMS_SECTION_TITLE: 'Item Dipilih',
    CLOSE: 'Tutup',
  },
  /** AssignPekerjaanDialog (leaf-level manpower assignment) — the most intricate dialog of the flow. */
  ASSIGN_PEKERJAAN: {
    TITLE: 'Assign Pekerjaan',
    /** Header subtitle — `B.1.1.1 · Pondasi Batu Kali`. */
    SUBTITLE: (code: string, name: string) => `${code} · ${name}`,
    /** Rendered when the tree item prop is absent (dialog closed / animating out). */
    EMPTY: '-',
    /** Summary strip placeholders while the assignment detail is still loading. */
    LOADING_PLACEHOLDER: '...',
    /** Scroll-body placeholder while useManpowerAssignment resolves. */
    LOADING: 'Memuat...',
    VOLUME_LABEL: 'Volume BOQ',
    PROGRESS_LABEL: 'Progress saat ini',
    DURATION_LABEL: 'Durasi',
    /** Durasi cell — `4 Hari`, or the shared `EMPTY` dash when the item carries no duration. */
    DURATION_VALUE: (duration: number | null) => (duration === null ? '-' : `${duration} Hari`),
    WARNING_TITLE: 'Pastikan Target yang di input tidak lebih dari Volume BOQ',
    WARNING_BODY: 'Anda perlu menyesuaikan target manpower dengan volume dengan sesuai',
    /** Card header — `Manpower 1`. */
    CARD_TITLE: (n: number) => `Manpower ${n}`,
    NEEDS_REPAIR_BADGE: 'Perlu Perbaikan',
    /** Card header badge of an `isCompleted` card — its fields lock (report already submitted). */
    COMPLETED_BADGE: 'Selesai',
    /** Screen-reader label of the trash icon button. */
    DELETE_ARIA_LABEL: 'Hapus Manpower',
    /** Trash is disabled + this tooltip when the card carries a QC repair (isCardDeletable false). */
    DELETE_DISABLED_TOOLTIP: 'Anda tidak dapat menghapus Manpower ini karena memiliki perbaikan QC',
    /** Edit mode — an existing card has no delete endpoint, so its trash is disabled with this. */
    DELETE_EXISTING_TOOLTIP: 'Manpower yang sudah ada tidak dapat dihapus',
    EMPLOYEE_LABEL: 'Nama',
    REQUIRED_MARK: '*',
    EMPLOYEE_PLACEHOLDER: 'Pilih Nama',
    EMPLOYEE_LOADING_PLACEHOLDER: 'Memuat employee...',
    TARGET_LABEL: 'Target',
    /** Number input hint before the user types a target qty. */
    TARGET_PLACEHOLDER: '0',
    HELPER_LABEL: 'Helper (opsional, bisa lebih dari 1)',
    HELPER_PLACEHOLDER: 'Pilih Helper',
    NOTE_LABEL: 'Catatan',
    NOTE_PLACEHOLDER: 'Tambahkan catatan (opsional)',
    /** In-card red alert when the volume is exhausted and the card is still unused. */
    VOLUME_FULL_TITLE: 'Volume BOQ sudah terpenuhi',
    VOLUME_FULL_BODY: 'Jika ingin menambahkan manpower Silahkan sesuaikan kembali targetnya',
    ADD_MANPOWER: 'Tambah Manpower',
    /** Footer — `Total Manpower 3 Manpower`. */
    TOTAL_MANPOWER: (n: number) => `Total Manpower ${n} Manpower`,
    /** Footer — `Total Qty diAssign 7/10 m³`. */
    TOTAL_QTY: (total: number, volume: number, unit: string) =>
      `Total Qty diAssign ${total}/${volume} ${unit}`,
    CANCEL: 'Batalkan',
    SUBMIT: 'Assign',
    SUBMITTING: 'Menyimpan...',
    SUCCESS_TOAST: 'Manpower berhasil di-assign',
    /** Edit mode — same dialog, every card submits with its project task id. */
    SUBMIT_EDIT: 'Simpan',
    SUCCESS_TOAST_EDIT: 'Perubahan manpower berhasil disimpan',
  },
  /**
   * SelesaikanPekerjaanDialog — leaf-level daily report collector. `mode='detail'` renders the
   * read-only "Detail Pekerjaan" variant: no Laporan Harian inputs, single `Tutup` footer button.
   */
  SELESAIKAN: {
    /** Title per dialog mode. */
    TITLES: {
      selesaikan: 'Selesaikan Pekerjaan',
      detail: 'Detail Pekerjaan',
    } as Record<'selesaikan' | 'detail', string>,
    /** Header subtitle — `B.1.1.1 · Pondasi Batu Kali`. */
    SUBTITLE: (code: string, name: string) => `${code} · ${name}`,
    /** Rendered when the tree item prop is absent (dialog closed / animating out). */
    EMPTY: '-',
    /** Summary strip placeholders while the assignment detail is still loading. */
    LOADING_PLACEHOLDER: '...',
    /** Scroll-body placeholder while useManpowerAssignment resolves. */
    LOADING: 'Memuat...',
    CREATED_BY: 'Created by',
    VOLUME_LABEL: 'Volume BOQ',
    TOTAL_MANPOWER: 'Total Manpower',
    LAST_UPDATE: 'Last Update',
    /** Heading above the manpower cards. */
    SECTION_TITLE: 'Laporan Manpower',
    /** Scroll-body placeholder when a leaf has no manpower assigned yet. */
    EMPTY_MANPOWER: 'Belum ada Manpower yang di-assign',
    /** Card header subtext — `Helper Agus Prasetyo · target 4 m³`; helpers fall back to `-`. */
    HELPER_NAMES: (names: string) => `Helper ${names}`,
    TARGET: (qty: number, unit: string) => `target ${qty} ${unit}`,
    /** Screen-reader label of the accordion toggle. */
    EXPAND_ARIA_LABEL: (name: string) => `Detail laporan ${name}`,
    /** Badge chrome of the report-status badges — re-exports the shared shell. */
    REPORT_STATUS_CHROME: BADGE_CHROME.STATUS,
    TAB_DAILY: 'Laporan Harian',
    TAB_HISTORY: 'Riwayat Laporan',
    REPORT_DATE_LABEL: 'Tanggal Laporan',
    ACHIEVED_LABEL: 'Capaian Hari ini',
    /** Number input hint before the user types today's achieved qty. */
    CAPAIAN_PLACEHOLDER: '0',
    NOTE_LABEL: 'Catatan Kegiatan',
    NOTE_PLACEHOLDER: 'Type your message here.',
    EVIDENCE_LABEL: 'Evidence',
    /** Same constraints as the legacy TaskDoneDialog evidence dropzone. */
    EVIDENCE_ACCEPT: '.docx,.xls,.pdf,.jpeg,.jpg,.png',
    EVIDENCE_MAX_FILES: 5,
    EVIDENCE_MAX_SIZE_BYTES: 5 * 1024 * 1024,
    /** Footer counter — `2 dari 3 Manpower akan Diselesaikan`; live while capaian is typed. */
    FOOTER_COUNT: (done: number, total: number) =>
      `${done} dari ${total} Manpower akan Diselesaikan`,
    CANCEL: 'Batal',
    SUBMIT: 'Selesaikan',
    SUBMITTING: 'Menyimpan...',
    CLOSE: 'Tutup',
    SUCCESS_TOAST: 'Laporan manpower berhasil dikirim',
  },
  /** `resubmitted` is rendered as `${TIMELINE_KIND_LABELS.resubmitted} · Revisi ${revisionNo}`. */
  TIMELINE_KIND_LABELS: {
    submitted: 'Pengajuan Laporan Awal (Submitted)',
    revision_requested: 'Meminta Perbaikan (Revision Requested)',
    resubmitted: 'Kirim Ulang Laporan',
    approved: 'Diterima (Approved)',
    /** Catch-all for task-history events the wire sends without a dedicated kind (mapper's `other`). */
    other: 'Lainnya (Other)',
  },
  /** ManpowerTimeline — shared by Selesaikan/Detail Pekerjaan and the QC review/detail dialogs. */
  TIMELINE: {
    /** Rendered when a manpower card carries no timeline entry yet. */
    EMPTY: 'Belum ada riwayat laporan',
    /** Screen-reader label of an attachment chip — only chips with a URL are links. */
    ATTACHMENT_ARIA_LABEL: (fileName: string) => `Buka lampiran ${fileName}`,
    /** Appended to a resubmitted badge — `Kirim Ulang Laporan · Revisi 1`. */
    REVISION_SUFFIX: (n: number) => ` · Revisi ${n}`,
    /** Badge colour per kind — same palette as REPORT_STATUS_BADGE_CLASSNAMES. */
    KIND_BADGE_CLASSNAMES: {
      submitted: 'bg-slate-100 text-slate-700',
      revision_requested: 'bg-red-100 text-red-600',
      resubmitted: 'bg-slate-200 text-slate-800',
      approved: 'bg-green-100 text-green-700',
      /** Neutral grey — an event the UI cannot classify still renders, just without a colour claim. */
      other: 'bg-slate-100 text-slate-600',
    },
    /** Rail dot colour per kind. */
    KIND_DOT_CLASSNAMES: {
      submitted: 'bg-slate-400',
      revision_requested: 'bg-red-500',
      resubmitted: 'bg-slate-500',
      approved: 'bg-green-500',
      other: 'bg-slate-300',
    },
  },
  /**
   * QC Report page (flat table) — mirrors the manpower blocks above. Dialog blocks here are
   * placeholders; each QC dialog appends the rest of its own block when it lands.
   */
  QC_PAGE: {
    /** Fixed rows-per-page the QC list requests — the pagination molecule's selector stays fixed. */
    PER_PAGE: 15,
    /** Page header block — mirrors MANPOWER_PLAN_LABELS.PAGE (the sidebar owns the route label). */
    PAGE: {
      TITLE: 'Quality Control',
      DETAIL_CARD_TITLE: 'Detail Item Project',
      /** Page-header status Select options, in Figma order. `TABLE.STATUS_FILTER_ALL` is the "no filter" item. */
      STATUS_FILTER_OPTIONS: [
        'Waiting',
        'Progress',
        'Selesai',
        'Ditolak',
      ] as readonly QcReportStatus[],
    },
    TABLE: {
      SELECT_ALL: 'Select all',
      SELECT_ROW: 'Select row',
      KODE: 'Kode',
      JOB_ITEM: 'Job/Item',
      MANPOWER: 'Manpower',
      STATUS: 'Status',
      CATATAN: 'Catatan',
      ASSIGN_QC: 'Assign QC',
      REVISI: 'Revisi',
      LAST_UPDATE: 'Last Update',
      ACTION: 'Aksi',
      EMPTY: 'No results.',
      SEARCH_PLACEHOLDER: 'Pencarian',
      STATUS_FILTER_ALL: 'Semua status',
      ASSIGN_TERPILIH: 'Assign Terpilih',
      /** Trailing overflow marker of the QC manpower cell — "Budi, Ricko +3" renders the `+3`. */
      MANPOWER_HELPERS_OVERFLOW: (count: number) => `+${count}`,
      /** Report cell line the mapper assembles — `20 CM dari target 20` (truncated in the cell). */
      REPORT_SUMMARY: (completed: number, unit: string, target: number) =>
        `${completed} ${unit} dari target ${target}`,
      /** Second line of an AssignItemsDialog QC item row — `Rudi Hartono · 3 m³ dari target 4 m³`. */
      ASSIGN_ITEM_SUBTITLE: (manpowerName: string, summary: string) =>
        `${manpowerName} · ${summary}`,
    },
    ACTIONS: {
      CLAIM: 'Claim',
      SELESAIKAN: 'Selesaikan',
      LIHAT: 'Lihat',
    },
    /** Shared by the QC table status column so both colour a status the same way. */
    STATUS_BADGE_CLASSNAMES: {
      Waiting: 'bg-slate-100 text-slate-700',
      Progress: 'bg-amber-100 text-amber-600',
      Selesai: 'bg-green-100 text-green-700',
      Ditolak: 'bg-red-100 text-red-600',
    } as Record<QcReportStatus, string>,
    /**
     * QcReviewDialog `mode='review'` — QC deciding a manpower report. `mode='detail'` (read-only
     * "Detail Pekerjaan") shares this layout; only its title/footer differ (DETAIL block below).
     * Replaces the earlier placeholder block — no other consumer had picked those labels up.
     */
    QC_REVIEW: {
      TITLE: 'Selesaikan Pekerjaan',
      /** Header subtitle — `A.1.1.1 · Pondasi Batu Kali`. */
      SUBTITLE: (code: string, jobItem: string) => `${code} · ${jobItem}`,
      /** Rendered when the row prop is absent (dialog closed / animating out). */
      EMPTY: '-',
      /** Scroll-body placeholder while the detail is still loading. */
      LOADING: 'Memuat...',
      /** Headings of the two-panel layout. */
      MANPOWER_PANEL_TITLE: 'Manpower',
      QC_PANEL_TITLE: 'QC Review',
      CREATED_BY: 'Created by',
      ASSIGNEE_QC: 'Assignee QC',
      LAST_UPDATE: 'Last Update',
      /** Left-panel card lines; the Helper line is omitted when helpers is empty, an empty target note shows the summary alone. */
      HELPER_LINE: (names: string) => `Helper : ${names}`,
      /** Label-over-value pairs of the manpower identity card (Job/Item renders semibold). */
      JOB_ITEM_LABEL: 'Job/Item',
      /** Manpower card section — wire `workTask.targetDescription` ("10.5 CM dari 10.5 CM"). */
      CAPAIAN_TARGET_LABEL: 'Capaian dan Target',
      /** Manpower card section — the assignment note (wire `workTask.note`). */
      MANPOWER_NOTE_LABEL: 'Catatan',
      NOTE_LABEL: 'Catatan Kegiatan',
      NOTE_PLACEHOLDER: 'Type your message here.',
      EVIDENCE_LABEL: 'Evidence',
      /** Same constraints as the manpower Selesaikan evidence dropzone. */
      EVIDENCE_ACCEPT: '.docx,.xls,.pdf,.jpeg,.jpg,.png',
      EVIDENCE_MAX_FILES: 5,
      EVIDENCE_MAX_SIZE_BYTES: 5 * 1024 * 1024,
      CANCEL: 'Batal',
      REJECT: 'Tolak',
      APPROVE: 'Terima',
      SUBMITTING: 'Menyimpan...',
    },
    /** QcReviewDialog `mode='detail'` — read-only variant; body renders from the same two panels. */
    DETAIL: {
      TITLE: 'Detail Pekerjaan',
      CLOSE: 'Tutup',
    },
    TOASTS: {
      CLAIM_SUCCESS: 'Laporan berhasil di-claim',
      ASSIGN_SUCCESS: 'Laporan berhasil di-assign',
      /** Per-decision — a rejected report re-enters manpower's next-day daily report. */
      REVIEW_ACCEPTED: 'Laporan diterima',
      REVIEW_REJECTED: 'Laporan ditolak, manpower akan mengulang di hari berikutnya',
    },
  },
} as const;
