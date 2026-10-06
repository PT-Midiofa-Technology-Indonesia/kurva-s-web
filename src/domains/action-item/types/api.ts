export type MeetingTaskApiStatus =
  | 'created'
  | 'in_progress'
  | 'done'
  | 'qc_passed'
  | 'qc_failed'
  | 'cancelled';

/** QC evaluation result. Lowercase on the wire; display labels are capitalised in the UI. */
export type QcDecisionApi = 'pass' | 'fail';

export interface MeetingTaskPersonRef {
  id: string;
  name: string;
}

export interface MeetingTaskProjectRef {
  id: string;
  code: string;
  name: string;
}

export interface MeetingTaskMeetingRef {
  id: string;
  code: string;
  title: string;
}

/**
 * Confirmed against the `review-qc` response, which is the only sample that
 * returns a populated attachment. `fileUrl` is the download URL — there is no
 * `url` field. Fields stay optional because list responses have only ever
 * returned empty arrays, so an unseeded/partial shape must not crash the mapper.
 */
export interface MeetingTaskDocumentApi {
  id: string;
  type?: string;
  filePath?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedByUser?: MeetingTaskPersonRef | null;
  createdAt?: string;
}

export interface MeetingTaskLogApi {
  id: string;
  eventType: string;
  actorUser: MeetingTaskPersonRef | null;
  prevStatus: string | null;
  newStatus: string | null;
  qcDecision: QcDecisionApi | null;
  notes: string | null;
  metadata: unknown;
  createdAt: string;
}

export interface MeetingTaskListApiResponse {
  id: string;
  meetingId: string;
  meeting: MeetingTaskMeetingRef;
  projectId: string;
  project: MeetingTaskProjectRef;
  taskType: string;
  taskTypeLabel: string;
  sourceWorkTaskId: string | null;
  code: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: MeetingTaskApiStatus;
  statusLabel: string;
  isDelegatable: boolean;
  assignedToEmployee: MeetingTaskPersonRef | null;
  qcAssignedToEmployee: MeetingTaskPersonRef | null;
  qcDelegatedByUser: MeetingTaskPersonRef | null;
  qcDecision: QcDecisionApi | null;
  qcNote: string | null;
  qcAt: string | null;
  retryCount: number;
  doneAt: string | null;
  doneByUser: MeetingTaskPersonRef | null;
  cancelledReason: string | null;
  createdByUser: MeetingTaskPersonRef;
  attachments: MeetingTaskDocumentApi[];
  createdAt: string;
  updatedAt: string;
}

export interface SourceWorkTask {
  id: string;
  code: string;
  title: string;
  status: string;
  assignedToEmployee: AssignedToEmployee;
  documents: Document[];
  taskEvidences: TaskEvidence[];
}

export interface AssignedToEmployee {
  id: string;
  name: string;
}

export interface Document {
  id: string;
  fileName: string;
  filePath: string;
  url: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface TaskEvidence {
  id: string;
  fileName: string;
  filePath: string;
  url: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface MeetingTaskDetailApiResponse
  extends Omit<MeetingTaskListApiResponse, 'attachments' | 'dueDate'> {
  documents: MeetingTaskDocumentApi[];
  sourceWorkTask: SourceWorkTask;
  qcTasks: unknown[];
  logs: MeetingTaskLogApi[];
}

/**
 * One row from `GET /meeting-tasks/quality-controls`. Same record family as
 * MeetingTaskListApiResponse but with `taskType: 'qc'` and `documents` instead
 * of `attachments`.
 */
export interface QcTaskApiResponse {
  id: string;
  meetingId: string;
  meeting: MeetingTaskMeetingRef;
  projectId: string;
  project: MeetingTaskProjectRef;
  taskType: string;
  taskTypeLabel: string;
  sourceWorkTaskId: string | null;
  code: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: MeetingTaskApiStatus;
  statusLabel: string;
  isDelegatable: boolean;
  assignedToEmployee: MeetingTaskPersonRef | null;
  qcAssignedToEmployee: MeetingTaskPersonRef | null;
  qcDelegatedByUser: MeetingTaskPersonRef | null;
  qcDecision: QcDecisionApi | null;
  qcNote: string | null;
  qcAt: string | null;
  retryCount: number;
  doneAt: string | null;
  doneByUser: MeetingTaskPersonRef | null;
  cancelledReason: string | null;
  createdByUser: MeetingTaskPersonRef;
  documents: MeetingTaskDocumentApi[];
  createdAt: string;
  updatedAt: string;
}
