export const PROJECT_TASK_TREE_LABELS = {
  TOAST: {
    QC_CLAIM_SUCCESS: 'QC task berhasil di-claim',
    TASK_CANCEL_SUCCESS: 'Task berhasil dibatalkan',
  },
  TABLE: {
    SELECT_ALL: 'Select all',
    SELECT_ROW: 'Select row',
    KODE: 'Kode',
    JOB_ITEM: 'Job/Item',
    JENIS: 'Jenis',
    ASSIGNEE: 'Assignee',
    DONE_AT: 'Done at',
    RETRY_COUNT: 'Retry Count',
    STATUS: 'Status',
    ACTION: 'Aksi',
    EMPTY: 'No results.',
  },
  ACTIONS: {
    CLAIM: 'Claim',
    DETAIL: 'Lihat',
    DONE: 'Selesaikan',
    CANCEL_QC_TASK: 'Cancel QC Task',
    CANCEL_TASK: 'Batalkan Task',
  },
  DIALOG: {
    CANCEL_TITLE: 'Batalkan Task?',
    CANCEL_DESCRIPTION: (taskName: string) =>
      `Task "${taskName}" akan dibatalkan dan tidak dapat dikerjakan lagi.`,
    CANCEL_TEXT: 'Batal',
    CONFIRM_CANCEL: 'Ya, Batalkan',
  },
} as const;

/** Shared by the task tree table and the task detail dialog so both colour a status the same way. */
export const TASK_STATUS_BADGE_CLASSNAMES: Record<string, string> = {
  Done: 'bg-green-100 text-green-700',
  Created: 'bg-slate-100 text-slate-950',
  'QC Failed': 'bg-red-100 text-red-600',
  Delegate: 'bg-cyan-100 text-cyan-700',
  'In Progress': 'bg-amber-100 text-amber-600',
  'QC Passed': 'bg-emerald-100 text-emerald-700',
  Reopened: 'bg-yellow-100 text-orange-600',
  Cancelled: 'bg-red-100 text-red-600',
};

/** Fallback for a status the API introduced but the map doesn't know yet. */
export const DEFAULT_TASK_STATUS_BADGE_CLASSNAME = 'bg-slate-100 text-slate-950';

/** `qcDecision` as returned by `/project-tasks/{id}/detail`. */
export const QC_DECISION_LABELS: Record<string, string> = {
  pass: 'Pass',
  fail: 'Fail',
};

export const TASK_DONE_DIALOG_LABELS = {
  FALLBACK_TITLE: 'Task Detail',
  FALLBACK_STATUS: 'Created',
  LOADING: 'Memuat detail task...',
  TASK_SECTION: {
    TITLE: 'Detail Task',
    CREATED_BY: 'Created by',
    ASSIGNEE: 'Assignee',
    DONE_BY: 'Done by',
    DONE_AT: 'Done at',
    DESCRIPTION: 'Deskripsi',
    ACTIVITY_DESCRIPTION: 'Deskripsi Aktivitas',
    ACTIVITY_PLACEHOLDER: 'Jelaskan aktivitas yang sudah dikerjakan',
    EVIDENCE: 'Evidence',
    ATTACH_EVIDENCE: 'Attach Evidence',
    NO_EVIDENCE: 'Belum ada evidence.',
  },
  QC_SECTION: {
    TITLE: 'Quality Control',
    DELEGATOR: 'QC Delegator',
    ASSIGNEE: 'QC Assignee',
    QC_AT: 'QC At',
    DECISION: 'Decision',
    NOTE: 'QC Note',
    NO_NOTE: 'Belum ada catatan QC.',
    EVIDENCE: 'QC Evidence',
    NO_EVIDENCE: 'Belum ada evidence QC.',
  },
  FOOTER: {
    CANCEL: 'Batal',
    SUBMIT: 'Done Task',
    SUBMITTING: 'Menyimpan...',
  },
  TOAST: {
    EVIDENCE_REQUIRED: 'Lampirkan minimal 1 file evidence',
    SUBMIT_SUCCESS: 'Task berhasil diselesaikan',
  },
} as const;
