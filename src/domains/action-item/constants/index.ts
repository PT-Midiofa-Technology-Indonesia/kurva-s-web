import type { MeetingTaskApiStatus, QcDecisionApi } from '../types/api';

export const ACTION_ITEM_LABELS = {
  PAGE_TITLE: 'Action Item',
  TABS: {
    TASK_CONTROL: 'Task Control',
    QUALITY_CONTROL: 'Quality Control',
  },
  TASK_CONTROL: {
    ACTION: {
      HEADER: 'Aksi',
      VIEW: 'Lihat',
      COMPLETE: 'Selesaikan',
    },
    SEARCH_PLACEHOLDER: 'Pencarian',
    MOM_PLACEHOLDER: 'Pilih MoM',
    STATUS_PLACEHOLDER: 'Semua status',
    DELEGATE_BUTTON: 'Delegate',
    EMPTY_MOM_TITLE: 'Pilih MoM',
    EMPTY_MOM_DESCRIPTION: 'Pilih MoM untuk melihat task yang tersedia',
    EMPTY_TABLE: 'Tidak ada task ditemukan.',
    COLUMNS: {
      CODE: 'Kode',
      DETAIL: 'Detail',
      TASK: 'Task',
      PROJECT: 'Project',
      ASSIGNEE: 'Assignee',
      DONE_AT: 'Done At',
      RETRY_COUNT: 'Retry Count',
      STATUS: 'Status',
    },
  },
  DELEGATE_DIALOG: {
    TITLE: 'Delegate Task',
    SELECTED_LABEL: (count: number) => `${count} task dipilih`,
    EMPLOYEE_LABEL: 'Employee',
    EMPLOYEE_PLACEHOLDER: 'Pilih Employee',
    CANCEL: 'Batal',
    SUBMIT: (count: number) => `Delegate (${count})`,
  },
  DETAIL_DIALOG: {
    MOM_LABEL: 'MoM',
    PROJECT_LABEL: 'Project',
    CREATED_BY_LABEL: 'Created by',
    ASSIGNEE_LABEL: 'Assignee',
    CREATED_AT_LABEL: 'Created at',
    DONE_AT_LABEL: 'Done at',
    EVIDENCE_TASK_LABEL: 'Task Evidences',
    EVIDENCE_LABEL: 'Attach Evidence',
    CANCEL: 'Batal',
    CANCEL_TASK: 'Cancel Task',
    DONE_TASK: 'Done Task',
    EVIDENCE_REQUIRED: 'Lampirkan minimal 1 file evidence',
    LOAD_ERROR: 'Gagal memuat detail task.',
  },
  CANCEL_TASK_DIALOG: {
    TITLE: 'Batalkan Task?',
    REASON_LABEL: 'Alasan Pembatalan',
    REASON_PLACEHOLDER: 'Tulis alasan pembatalan',
    REASON_MAX_LENGTH_ERROR: 'Alasan pembatalan maksimal 1000 karakter',
    EVIDENCE_LABEL: 'Attach Evidence',
    CANCEL: 'Batal',
    CONFIRM: 'Ya, Batalkan',
    SUBMITTING: 'Menyimpan...',
  },
  QC_REVIEW_DIALOG: {
    MOM_LABEL: 'MoM',
    PROJECT_LABEL: 'Project',
    CREATED_BY_LABEL: 'Created by',
    ASSIGNEE_LABEL: 'Assignee',
    CREATED_AT_LABEL: 'Created at',
    DONE_AT_LABEL: 'Done at',
    QC_DELEGATOR_LABEL: 'QC Delegator',
    QC_ASSIGNEE_LABEL: 'QC Assignee',
    QC_AT_LABEL: 'QC at',
    DECISION_LABEL: 'Decision',
    TASK_EVIDENCE_LABEL: 'Task Evidence',
    QC_NOTE_LABEL: 'Catatan QC',
    QC_NOTE_PLACEHOLDER: 'Masukkan deskripsi',
    QC_EVIDENCE_LABEL: 'Attach QC Evidence',
    CANCEL: 'Batal',
    SUBMIT_FAIL: 'Submit Fail',
    SUBMIT_PASS: 'Submit Pass',
    EVIDENCE_REQUIRED: 'Lampirkan minimal 1 file evidence',
    NOTE_REQUIRED: 'Catatan QC wajib diisi',
    LOAD_ERROR: 'Gagal memuat detail QC task.',
    NO_TASK_EVIDENCE: 'Tidak ada evidence dari task.',
  },
  QUALITY_CONTROL: {
    ACTION: {
      HEADER: 'Aksi',
      VIEW: 'Lihat',
      COMPLETE: 'Selesaikan',
    },
    SEARCH_PLACEHOLDER: 'Pencarian',
    MOM_PLACEHOLDER: 'Pilih MoM',
    STATUS_PLACEHOLDER: 'Semua status',
    DECISION_PLACEHOLDER: 'Semua decision',
    DELEGATE_BUTTON: 'Delegate',
    EMPTY_MOM_DESCRIPTION: 'Pilih MoM untuk melihat task yang tersedia',
    EMPTY_TABLE: 'Tidak ada task ditemukan.',
    COLUMNS: {
      CODE: 'Kode',
      DETAIL: 'Detail',
      QC_TASK: 'QC Task',
      PROJECT: 'Project',
      QC_STATUS: 'QC Status',
      ASSIGNEE: 'Assignee',
      DONE_AT: 'Done At',
      RETRY_COUNT: 'Retry Count',
      DECISION: 'Decision',
    },
  },
} as const;

/**
 * Guards against a stale/hand-edited `status` URL param. Shared by both tabs —
 * Task Control and Quality Control read the same meeting-task status enum, so a
 * value carried across a tab switch stays valid; anything else degrades to "no
 * filter" instead of being sent to the API.
 */
export const MEETING_TASK_STATUS_BADGE_CLASSNAMES: Record<MeetingTaskApiStatus, string> = {
  created: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-amber-100 text-amber-600',
  done: 'bg-green-100 text-green-600',
  qc_passed: 'bg-emerald-100 text-emerald-700',
  qc_failed: 'bg-red-100 text-red-600',
  cancelled: 'bg-red-100 text-red-600',
};

export const MEETING_TASK_STATUS_OPTIONS: { value: MeetingTaskApiStatus; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'qc_passed', label: 'QC Passed' },
  { value: 'qc_failed', label: 'QC Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function resolveMeetingTaskStatus(
  value: string | undefined
): MeetingTaskApiStatus | undefined {
  return MEETING_TASK_STATUS_OPTIONS.some((option) => option.value === value)
    ? (value as MeetingTaskApiStatus)
    : undefined;
}

// Terminal QC statuses: qc_passed, qc_failed (must be redone by the assignee
// in Task Control first), or cancelled can no longer be reviewed — Submit
// Pass/Fail are hidden.
export const QC_TERMINAL_STATUSES: MeetingTaskApiStatus[] = ['qc_passed', 'qc_failed', 'cancelled'];

export const QC_DECISION_BADGE_CLASSNAMES: Record<QcDecisionApi, string> = {
  pass: 'bg-emerald-100 text-emerald-700',
  fail: 'bg-red-100 text-red-600',
};

export const QC_DECISION_LABELS: Record<QcDecisionApi, string> = {
  pass: 'Pass',
  fail: 'Fail',
};

export const QC_DECISION_OPTIONS: { value: QcDecisionApi; label: string }[] = [
  { value: 'pass', label: 'Pass' },
  { value: 'fail', label: 'Fail' },
];

export function resolveQcDecision(value: string | undefined): QcDecisionApi | undefined {
  return QC_DECISION_OPTIONS.some((option) => option.value === value)
    ? (value as QcDecisionApi)
    : undefined;
}
