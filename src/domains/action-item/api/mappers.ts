import { getLatestTaskLog } from '../services/latest-task-log';
import type {
  EvidenceFile,
  QcReviewDetail,
  QcTaskRow,
  TaskControlDetail,
  TaskControlRow,
} from '../types';
import type {
  MeetingTaskDetailApiResponse,
  MeetingTaskDocumentApi,
  MeetingTaskListApiResponse,
  QcTaskApiResponse,
} from '../types/api';

function mapDocument(doc: MeetingTaskDocumentApi): EvidenceFile {
  return {
    id: doc.id,
    fileName: doc.fileName ?? 'Dokumen',
    fileSize: doc.fileSize ?? 0,
    mimeType: doc.mimeType ?? 'application/octet-stream',
    url: doc.fileUrl ?? '#',
  };
}

export function mapMeetingTaskToRow(task: MeetingTaskListApiResponse): TaskControlRow {
  return {
    id: task.id,
    code: task.code,
    task: task.title,
    meetingId: task.meetingId,
    momTitle: task.meeting?.title ?? '-',
    projectName: task.project?.name ?? '-',
    assignee: task.assignedToEmployee?.name ?? null,
    doneAt: task.doneAt,
    retryCount: task.retryCount,
    status: task.status,
    statusLabel: task.statusLabel,
    isDelegatable: task.isDelegatable,
  };
}

export function mapMeetingTaskToDetail(task: MeetingTaskDetailApiResponse): TaskControlDetail {
  return {
    ...mapMeetingTaskToRow({ ...task, attachments: [], dueDate: null }),
    createdBy: task.createdByUser?.name ?? '-',
    createdAt: task.createdAt,
    cancelledReason: task.cancelledReason,
    evidenceFiles: (task.documents ?? []).map(mapDocument),
  };
}

export function mapQcTaskToRow(task: QcTaskApiResponse): QcTaskRow {
  return {
    id: task.id,
    code: task.code,
    task: task.title,
    meetingId: task.meetingId,
    momTitle: task.meeting?.title ?? '-',
    projectName: task.project?.name ?? '-',
    status: task.status,
    statusLabel: task.statusLabel,
    // A QC row's assignee is the QC assignee. `assignedToEmployee` is the
    // fallback in case the shared /delegate endpoint sets that field instead
    // for taskType 'qc' (see Open Question 1).
    assignee: task.qcAssignedToEmployee?.name ?? task.assignedToEmployee?.name ?? null,
    doneAt: task.doneAt,
    retryCount: task.retryCount,
    decision: task.qcDecision,
    isDelegatable: task.isDelegatable,
  };
}

export function mapQcTaskToReviewDetail(task: MeetingTaskDetailApiResponse): QcReviewDetail {
  const latestDelegatedLog = getLatestTaskLog(task.logs, 'delegated');
  const latestQcReviewedLog = getLatestTaskLog(task.logs, 'qc_reviewed');

  return {
    id: task.id,
    code: task.code,
    task: task.title,
    meetingId: task.meetingId,
    momTitle: task.meeting?.title ?? '-',
    projectName: task.project?.name ?? '-',
    status: task.status,
    statusLabel: task.statusLabel,
    // Left ("task side") column: the work assignee and when the work was done.
    assignee: task.sourceWorkTask?.assignedToEmployee?.name ?? null,
    doneAt: task.doneAt,
    retryCount: task.retryCount,
    decision: task.qcDecision,
    isDelegatable: task.isDelegatable,
    createdBy: task.createdByUser?.name ?? '-',
    createdAt: task.createdAt,
    // Right ("QC side") column.
    qcDelegator: latestDelegatedLog?.actorUser?.name ?? null,
    qcAssignee: task.assignedToEmployee?.name ?? null,
    qcAt: latestQcReviewedLog?.createdAt ?? null,
    qcNote: task.qcNote ?? '',
    taskEvidenceFiles: (task.documents ?? []).map(mapDocument),
  };
}
