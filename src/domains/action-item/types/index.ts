import type { MeetingTaskApiStatus, QcDecisionApi } from './api';

export interface EmployeeOption {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface EvidenceFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

/** One row of the Task Control table — flat, server-paginated. */
export interface TaskControlRow {
  id: string;
  /** Server-assigned hierarchical code, e.g. "A" or "A.1". Displayed verbatim. */
  code: string;
  task: string;
  meetingId: string;
  momTitle: string;
  projectName: string;
  assignee: string | null;
  doneAt: string | null;
  retryCount: number;
  status: MeetingTaskApiStatus;
  statusLabel: string;
  isDelegatable: boolean;
}

/** Task Control detail — the row plus the fields only `GET /meeting-tasks/{id}` returns. */
export interface TaskControlDetail extends TaskControlRow {
  createdBy: string;
  createdAt: string;
  cancelledReason: string | null;
  evidenceFiles: EvidenceFile[];
}

/** One row of the Quality Control table — flat, server-paginated. */
export interface QcTaskRow {
  id: string;
  /** Server-assigned hierarchical code, e.g. "A.1". Displayed verbatim. */
  code: string;
  task: string;
  meetingId: string;
  momTitle: string;
  projectName: string;
  status: MeetingTaskApiStatus;
  statusLabel: string;
  assignee: string | null;
  doneAt: string | null;
  retryCount: number;
  decision: QcDecisionApi | null;
  isDelegatable: boolean;
}

/** QC review detail — everything the review dialog renders. */
export interface QcReviewDetail extends QcTaskRow {
  createdBy: string;
  createdAt: string;
  qcDelegator: string | null;
  qcAssignee: string | null;
  qcAt: string | null;
  qcNote: string;
  /** The work task's evidence, read-only in the dialog. */
  taskEvidenceFiles: EvidenceFile[];
}
