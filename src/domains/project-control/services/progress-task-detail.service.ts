import type { ProjectBOQItem } from '../api/get-project-boq';
import type {
  Evidence,
  TaskDetailHistory,
  File as TaskEvidenceFile,
  TaskHistory,
} from '../api/get-project-detail-task-history';

export type ProgressStatus = 'QC Passed' | 'QC Failed' | 'Selesai' | 'In Progress' | 'Not Started';

export interface TaskHistoryRow {
  id: string;
  task: string;
  assign: string;
  status: ProgressStatus;
  end: string;
  retry: number;
}

export interface EvidenceFileRow {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
  fileSize: string;
  type: 'image' | 'document';
}

export interface QcHistoryRow {
  id: string;
  qcTask: string;
  assign: string;
  decision: ProgressStatus;
  end: string;
}

export interface FileGroup {
  date: string;
  files: EvidenceFileRow[];
}

export interface ProgressTaskDetailViewModel {
  code: string;
  status: ProgressStatus;
  weight: string;
  subItemCount: number;
  title: string;
  taskRows: TaskHistoryRow[];
  evidenceRows: EvidenceFileRow[];
  qcRows: QcHistoryRow[];
  qcEvidenceRows: EvidenceFileRow[];
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '-';

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
}

function formatWeight(value: string | number | null | undefined): string {
  const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
  if (Number.isNaN(numericValue)) return '-';
  return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(2);
}

function formatFileSize(value: number | null | undefined): string {
  if (!value) return '-';

  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / 1024 ** unitIndex;

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function mapProgressStatus(status: string | null | undefined): ProgressStatus {
  const normalizedStatus = (status ?? '').toLowerCase();

  if (normalizedStatus.includes('qc_passed') || normalizedStatus.includes('passed')) {
    return 'QC Passed';
  }

  if (normalizedStatus.includes('qc_failed') || normalizedStatus.includes('failed')) {
    return 'QC Failed';
  }

  if (normalizedStatus.includes('done') || normalizedStatus.includes('complete')) {
    return 'Selesai';
  }

  if (normalizedStatus.includes('not_started')) {
    return 'Not Started';
  }

  return 'In Progress';
}

function createTaskHistoryRows(rows: TaskHistory[] | undefined): TaskHistoryRow[] {
  return (rows ?? []).map((row) => ({
    id: row.id,
    task: row.title,
    assign: row.assignedEmployee?.fullName ?? '-',
    status: mapProgressStatus(row.statusLabel || row.status),
    end: formatDate(row.doneAt ?? row.updatedAt),
    retry: row.retryCount,
  }));
}

function getEvidenceFileType(file: TaskEvidenceFile): EvidenceFileRow['type'] {
  return file.mimeType?.startsWith('image/') ? 'image' : 'document';
}

function createEvidenceFileRows(evidences: Evidence[] | undefined): EvidenceFileRow[] {
  return (evidences ?? []).flatMap((evidence) =>
    (evidence.files ?? []).map((file) => ({
      id: file.id,
      fileName: file.fileName,
      filePath: file.filePath,
      uploadedAt: formatDate(evidence.updatedAt ?? evidence.createdAt),
      fileSize: formatFileSize(file.fileSize),
      type: getEvidenceFileType(file),
    }))
  );
}

function createQcHistoryRows(rows: TaskHistory[] | undefined): QcHistoryRow[] {
  return (rows ?? []).map((row) => ({
    id: row.id,
    qcTask: row.title,
    assign: row.assignedEmployee?.fullName ?? '-',
    decision: mapProgressStatus(row.qcDecision || row.statusLabel || row.status),
    end: formatDate(row.doneAt ?? row.updatedAt),
  }));
}

export function groupFilesByDate(files: EvidenceFileRow[]): FileGroup[] {
  const groups: Record<string, EvidenceFileRow[]> = {};

  for (const file of files) {
    if (!groups[file.uploadedAt]) {
      groups[file.uploadedAt] = [];
    }

    groups[file.uploadedAt].push(file);
  }

  return Object.entries(groups).map(([date, fileList]) => ({ date, files: fileList }));
}

export function createProgressTaskDetailViewModel(
  item: ProjectBOQItem | null,
  data: TaskDetailHistory | undefined
): ProgressTaskDetailViewModel {
  const boqItem = data?.boqItem;

  return {
    code: item?.code ?? '-',
    status: mapProgressStatus(boqItem?.status ?? item?.taskMonitoring?.status),
    weight: formatWeight(item?.taskMonitoring?.weightItem ?? item?.weight),
    subItemCount: boqItem?.totalCountChildren ?? item?.children?.length ?? 0,
    title: boqItem?.name ?? item?.name ?? 'Detail Progress',
    taskRows: createTaskHistoryRows(data?.taskHistory),
    evidenceRows: createEvidenceFileRows(data?.evidences),
    qcRows: createQcHistoryRows(data?.qcTasks),
    qcEvidenceRows: createEvidenceFileRows(data?.evidenceQcTask),
  };
}
