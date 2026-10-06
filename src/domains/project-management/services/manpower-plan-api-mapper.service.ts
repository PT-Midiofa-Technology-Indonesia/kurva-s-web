import type { InformasiProjectCardData } from '@/domains/project-control/components/InformasiProjectCard';

import { MANPOWER_PLAN_LABELS } from '../constants/manpower-plan';
import type {
  ManpowerBoqItemNode,
  ManpowerPlanListResponse,
  ProjectTaskFinalDetail,
  ProjectTaskNonFinalDetail,
  QcTask,
  QcTaskDetailResponse,
  QcWorkTask,
  TaskHistoryEntry,
} from '../schemas/manpower-planning-api';
import type {
  ManpowerAssignmentDetail,
  ManpowerCard,
  ManpowerPlanStatus,
  ManpowerPlanTreeItem,
  ManpowerReportStatus,
  ManpowerTimelineEntry,
  ParentTaskDetail,
  QcReportDetail,
  QcReportRow,
  QcReportStatus,
} from '../types/manpower-planning';

/**
 * Wire → domain mappers of the new Manpower Planning + QC flow. Pure functions over the parsed
 * schemas of `schemas/manpower-planning-api.ts` — no React, no HTTP. Every status/enum translation
 * is an exported map with a documented fallback, so an unrecognised wire value degrades to the
 * closest display state instead of hard-failing the page (locked decision 3).
 */

// ─── Status maps (defensive wire → domain) ────────────────────────────────────

/**
 * Tree `status.value` → `ManpowerPlanStatus`. `qc_waiting` (all manpower submitted, awaiting QC)
 * reads as 'Selesai' on the manpower side; everything else (`in_progress`, unknown) degrades to
 * 'Progress'. TODO(backend): confirm the rejected wire value so 'Ditolak' can be mapped explicitly.
 */
export const MANPOWER_TREE_STATUS_MAP: Record<string, ManpowerPlanStatus> = {
  not_assigned: 'Belum Assign',
  qc_waiting: 'Selesai',
  done: 'Selesai',
};

/** Applies `MANPOWER_TREE_STATUS_MAP` with its 'Progress' fallback. */
function mapTreeStatus(value: string): ManpowerPlanStatus {
  return MANPOWER_TREE_STATUS_MAP[value] ?? 'Progress';
}

/**
 * Manpower card `status.value` → `ManpowerReportStatus`.
 * TODO(backend): confirm the real 'rejected' wire value — the samples never show it.
 */
export const MANPOWER_REPORT_STATUS_MAP: Record<string, ManpowerReportStatus> = {
  in_progress: 'Belum Diselesaikan',
  qc_waiting: 'Menunggu QC',
  done: 'Diterima',
};

/** Labels of the union — unknown wire values get one more chance via their `status.label`. */
const REPORT_STATUS_LABELS: readonly ManpowerReportStatus[] = [
  'Belum Diselesaikan',
  'Menunggu QC',
  'Diterima',
  'Ditolak',
];

/** Value map first, then the human-readable label, then the neutral default. */
function mapReportStatus(status: { value: string; label: string }): ManpowerReportStatus {
  return (
    MANPOWER_REPORT_STATUS_MAP[status.value] ??
    REPORT_STATUS_LABELS.find((label) => label === status.label) ??
    'Belum Diselesaikan'
  );
}

/**
 * QC task `status` → `QcReportStatus`. 'rejected' is not a confirmed wire value, so it is not
 * mapped; unrecognised values fall back on `qcDecision`.
 * TODO(backend): confirm the rejected wire value.
 */
export const QC_STATUS_MAP: Record<string, QcReportStatus> = {
  waiting: 'Waiting',
  in_progress: 'Progress',
  done: 'Selesai',
};

/** Applies `QC_STATUS_MAP` — an unmapped status is only 'Ditolak' when QC already decided 'fail'. */
function mapQcStatus(status: string, qcDecision: string | null | undefined): QcReportStatus {
  return QC_STATUS_MAP[status] ?? (qcDecision === 'fail' ? 'Ditolak' : 'Progress');
}

/**
 * Reverse of `QC_STATUS_MAP` — the `?status=` query param of the QC list. 'Ditolak' → 'rejected'
 * is the integration plan's assumption, not a confirmed wire value.
 * TODO(backend): confirm the rejected wire value.
 */
export const QC_STATUS_TO_API: Record<QcReportStatus, string> = {
  Waiting: 'waiting',
  Progress: 'in_progress',
  Selesai: 'done',
  Ditolak: 'rejected',
};

/** `taskHistory.event` → timeline kind; anything unmapped degrades to 'other'. */
export const TIMELINE_EVENT_KIND_MAP: Record<string, ManpowerTimelineEntry['kind']> = {
  submitted_to_qc: 'submitted',
};

/**
 * `decision.value` of a `qc_decision` event → timeline kind. Only 'approved' is confirmed; every
 * other decision reads as a revision request.
 * TODO(backend): confirm the rejected decision value.
 */
export const TIMELINE_DECISION_KIND_MAP: Record<string, ManpowerTimelineEntry['kind']> = {
  approved: 'approved',
};

/** Resolves a history row's kind: event map first, then decision, then the resubmission guess. */
function resolveTimelineKind(entry: TaskHistoryEntry): ManpowerTimelineEntry['kind'] {
  if (entry.event === 'qc_decision') {
    return TIMELINE_DECISION_KIND_MAP[entry.decision?.value ?? ''] ?? 'revision_requested';
  }
  const mapped = TIMELINE_EVENT_KIND_MAP[entry.event];
  if (mapped) return mapped;
  // TODO(backend): confirm the resubmission event name — any event containing 'resubmit' counts.
  if (entry.event.includes('resubmit')) return 'resubmitted';
  return 'other';
}

// ─── 1. Manpower planning list ────────────────────────────────────────────────

/** Turns `data.project` into the InformasiProjectCard payload (company/client collapse to names). */
function mapProjectCard(
  project: ManpowerPlanListResponse['data']['project']
): InformasiProjectCardData {
  return {
    name: project.name,
    // The card renders only `company.name` / `client.name`.
    company: project.company ? { name: project.company.name } : null,
    client: project.client ? { name: project.client.name } : null,
    estimatedValue: project.estimatedValue,
    projectStartDate: project.projectStartDate,
    projectEndDate: null, // the wire does not expose the project end date
    description: project.description ?? null,
  };
}

/** Parents carry `-` instead of a number — that is "no volume", not a literal dash to render. */
function mapTreeVolume(
  volumeProject: number | string,
  unit: string
): ManpowerPlanTreeItem['volume'] {
  return typeof volumeProject === 'number' ? { value: volumeProject, unit } : null;
}

/**
 * Maps one BOQ node; `ancestorsAssigned` is the recursion-carried parent gate (`isParentAssigned`)
 * — every ancestor's `status.value !== 'not_assigned'`. The gate deliberately excludes the node's
 * own status: the wire's `canAssign` does NOT encode it (plan-verified on B.1).
 */
function mapBoqNode(node: ManpowerBoqItemNode, ancestorsAssigned: boolean): ManpowerPlanTreeItem {
  const isLeaf = node.isFinalLevel;
  const selfAssigned = node.status.value !== 'not_assigned';

  return {
    id: node.id,
    code: node.code,
    name: node.name,
    level: node.level,
    isLeaf,
    volume: mapTreeVolume(node.volumeProject, node.uom?.name ?? ''),
    progress: isLeaf ? { achieved: node.completedVolume } : null,
    status: mapTreeStatus(node.status.value),
    canAssign: node.canAssign,
    canComplete: node.canComplete,
    // Optional on the wire until the backend ships it — an absent flag hides the Edit action.
    canEdit: node.canEdit ?? false,
    assignees: node.assign.map((assignee) => assignee.employee.fullName),
    lastUpdate: node.updatedAt,
    // TODO(backend): the tree endpoint does not expose a per-item retryCount — stays 0 ('-').
    revisiCount: 0,
    isParentAssigned: ancestorsAssigned,
    children: node.children.map((child) => mapBoqNode(child, ancestorsAssigned && selfAssigned)),
  };
}

/** List endpoint → `{ project, tree }`: the InformasiProjectCard payload + the manpower tree. */
export function mapManpowerPlanList(data: ManpowerPlanListResponse['data']): {
  project: InformasiProjectCardData;
  tree: ManpowerPlanTreeItem[];
} {
  return {
    project: mapProjectCard(data.project),
    tree: data.boq.items.map((item) => mapBoqNode(item, true)),
  };
}

// ─── 2. Final-level item detail ───────────────────────────────────────────────

/** `data.manpower[]` → `ManpowerCard`. `id` is the projectTaskId — the submit key of endpoint 5. */
function mapManpowerCard(card: ProjectTaskFinalDetail['manpower'][number]): ManpowerCard {
  const reportStatus = mapReportStatus(card.status);

  return {
    id: card.projectTaskId,
    employee: { id: card.employee.id, fullName: card.employee.fullName },
    helpers: card.helpers.map((helper) => ({ id: helper.id, fullName: helper.fullName })),
    targetQty: card.target,
    note: card.note ?? null,
    // Repair flag rides the mapped status until the rejected wire value is confirmed.
    needsRepair: reportStatus === 'Ditolak',
    // Absent flag = editable (pre-flag behaviour); `true` locks the card in the Assign/Edit dialog.
    isCompleted: card.isCompleted ?? false,
    reportStatus,
    todayReport: null, // the server has no draft concept — the dialog owns the draft
    timeline: mapTaskHistoryToTimeline(card.taskHistory),
  };
}

/** Final-level `GET /project-tasks/items/{boqItemId}` → `ManpowerAssignmentDetail` (+ Durasi). */
export function mapFinalItemDetail(data: ProjectTaskFinalDetail): ManpowerAssignmentDetail {
  return {
    boqItemId: data.id,
    createdBy: data.createdBy?.name ?? '',
    volumeBoq: { value: data.volumeBoq, unit: data.uom?.name ?? '' },
    achievedQty: data.currentProgress,
    duration: data.duration,
    manpowers: data.manpower.map(mapManpowerCard),
    lastUpdate: data.lastUpdated ?? null,
  };
}

// ─── 3. Non-final item detail ─────────────────────────────────────────────────

/** Non-final `GET /project-tasks/items/{boqItemId}` → `ParentTaskDetail` (read-only "Lihat"). */
export function mapNonFinalItemDetail(data: ProjectTaskNonFinalDetail): ParentTaskDetail {
  return {
    boqItemId: data.id,
    code: data.code,
    name: data.name,
    createdBy: data.createdBy?.name ?? '',
    assignee: data.assign?.employee.fullName ?? null,
    assignDate: data.assign?.assignDate ?? null,
    lastUpdate: data.lastUpdated ?? null,
    note: data.note ?? null,
    children: data.children.map((child) => ({
      id: child.id,
      code: child.code,
      name: child.name,
      status: mapTreeStatus(child.status.value),
    })),
  };
}

// ─── 4. Task history → timeline (shared by 2 and 8) ──────────────────────────

/**
 * `taskHistory[]` → `ManpowerTimelineEntry[]`. The backend emits no distinct event for a repair
 * resubmission — it reuses the initial-submission event — so a submitted row that follows any
 * revision request (chronologically older rows sit further down the array) is reclassified as
 * `resubmitted`, with `revisionNo` counting the revision requests that precede it.
 */
export function mapTaskHistoryToTimeline(entries: TaskHistoryEntry[]): ManpowerTimelineEntry[] {
  const kinds = entries.map(resolveTimelineKind);

  return entries.map((entry, index) => {
    // Revision requests at larger indices happened BEFORE this row (list is newest-first).
    const priorRevisionCount = kinds.filter(
      (kind, kindIndex) => kindIndex > index && kind === 'revision_requested'
    ).length;
    const kind =
      kinds[index] === 'submitted' && priorRevisionCount > 0 ? 'resubmitted' : kinds[index];
    const revisionNo = kind === 'resubmitted' ? priorRevisionCount : undefined;
    // 'other' events have no label of their own — event label + note is all the context there is.
    const body =
      kind === 'other'
        ? `${entry.eventLabel}${entry.note ? `: ${entry.note}` : ''}`
        : entry.note || entry.eventLabel;

    return {
      id: `${entry.projectTaskId}-${index}`,
      actorName: entry.actor.name,
      at: entry.recordedAt,
      kind,
      body,
      attachments: (entry.documents ?? []).map((document) => ({
        id: document.id,
        fileName: document.fileName,
        url: document.url,
      })),
      ...(revisionNo !== undefined ? { revisionNo } : {}),
    };
  });
}

// ─── 5 + 6. QC list + detail ─────────────────────────────────────────────────

/**
 * One QC task + its manpower work task → `QcReportRow`. The wire splits them: list items nest
 * `workTask`, while the detail payload carries it as a sibling of `qcTask` — so callers pass it in.
 */
export function mapQcTaskToRow(task: QcTask, workTask: QcWorkTask): QcReportRow {
  return {
    id: task.id,
    boqItemId: task.boqItemId,
    code: task.boqItem.code,
    jobItem: task.boqItem.name,
    manpower: {
      fullName: workTask.assignedEmployee?.fullName ?? '',
      helpers: (workTask.helperEmployees ?? []).map((helper) => helper.fullName),
    },
    /** Wire `listNote` — the note the Catatan cell displays ('-' when the row has none). */
    note: task.listNote ?? null,
    reportSummary: MANPOWER_PLAN_LABELS.QC_PAGE.TABLE.REPORT_SUMMARY(
      task.completedVolume,
      task.boqItem.uom?.name ?? '',
      task.targetVolume
    ),
    status: mapQcStatus(task.status, task.qcDecision),
    assigneeQc: task.assignedEmployee?.fullName ?? null,
    // List rows omit retryCount when it is 0 — the detail payload always carries it.
    revisiCount: workTask.retryCount ?? 0,
    lastUpdate: task.doneAt ?? task.createdAt,
  };
}

/** `GET /quality-control/{projectTaskId}` → `QcReportDetail` (row + createdBy/note/timeline). */
export function mapQcTaskDetail(data: QcTaskDetailResponse['data']): QcReportDetail {
  // The sample carries `note`; the plan text says `notes` — read both until the backend confirms.
  const manpowerNote = data.workTask.note ?? data.workTask.notes ?? '';
  const row = mapQcTaskToRow(data.qcTask, data.workTask);

  return {
    ...row,
    createdBy: data.qcTask.createdBy.name,
    // Older payloads omit targetDescription — degrade to the FE-composed summary, never blank.
    targetDescription: data.workTask.targetDescription ?? row.reportSummary,
    manpowerNote,
    timeline: mapTaskHistoryToTimeline(data.taskHistory),
  };
}
