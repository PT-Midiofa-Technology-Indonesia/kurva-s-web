export type ProjectTaskCategory = 'control' | 'qc';

export type TaskControlStatus =
  | 'Done'
  | 'Created'
  | 'QC Failed'
  | 'Delegate'
  | 'In Progress'
  | 'QC Passed'
  | 'Reopened'
  | 'Cancelled';

export interface ProjectTreeItem {
  id: string;
  code: string;
  jobItem: string;
  jenis: 'Job' | 'Location'; // Hardcode for now, can be expanded later
  taskId?: string;
  description?: string | null;
  assignee?: string;
  doneBy?: string | null;
  createdBy?: string;
  doneAt?: string | null;
  retryCount?: number;
  status?: string;
  /** `false` disables row selection — the task can't be delegated. */
  isDelegatable?: boolean;
  children?: ProjectTreeItem[];
}

export interface TaskActionItem {
  id: string;
  taskId: string;
  boqCode: string;
  title: string;
  /** `null` when nobody is assigned yet — QC review can't be submitted in that state. */
  assignee: string | null;
  doneAt: string | null;
  status: string;
}

// ─── API Types ─────────────────────────────────────────────────────────────────

export interface BoqItem {
  id: string;
  code: string;
  name: string;
}

export interface AssignedEmployee {
  id: string;
  code: string;
  fullName: string;
}

export interface CreatedByUser {
  id: string;
  name: string;
}

export interface DoneByUser {
  id: string;
  name: string;
}

export interface ProjectTaskDocument {
  id: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  parentTaskId: string | null;
  taskType: string;
  sourceWorkTaskId: string | null;
  boqItemId: string | null;
  title: string;
  description: string | null;
  status: string;
  statusLabel: string;
  assignedToEmployeeId: string | null;
  createdByUserId: string;
  doneAt: string | null;
  doneByUserId: string | null;
  qcDecision: string | null;
  retryCount: number;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  boqItem: BoqItem | null;
  assignedEmployee: AssignedEmployee | null;
  createdByUser: CreatedByUser;
  doneByUser: DoneByUser | null;
  noteActivities?: string;
  documents?: ProjectTaskDocument[];
}

export interface MarkProjectTaskDonePayload {
  note?: string;
  files?: File[];
  qcDecision?: 'fail' | 'pass';
}

export interface DelegateProjectTaskInput {
  boqItemId: string;
  employeeId: string;
}

export interface DelegateProjectTasksPayload {
  tasks: DelegateProjectTaskInput[];
}

export interface DelegateProjectTaskQcInput {
  projectTaskId: string;
  employeeId: string;
}

export interface DelegateProjectTasksQcPayload {
  tasks: DelegateProjectTaskQcInput[];
}

// ─── Manpower Plan Flow (new flow) ────────────────────────────────────────────

/** Display statuses of the new manpower flow (Figma: Belum Assign | Progress | Selesai). */
export type ManpowerPlanStatus = 'Belum Assign' | 'Progress' | 'Selesai';

/** Per-manpower report lifecycle inside Selesaikan/Detail Pekerjaan. */
export type ManpowerReportStatus = 'Belum Diselesaikan' | 'Menunggu QC' | 'Diterima' | 'Ditolak';

export interface ManpowerPlanTreeItem {
  id: string; // boqItemId
  code: string; // A.1.1.1
  name: string;
  level: number;
  isLeaf: boolean; // no children in the BOQ
  /** null on parents — leaves carry the BOQ volume. */
  volume: { value: number; unit: string } | null;
  /** e.g. 3 of 10 → { achieved: 3 }; null on parents. */
  progress: { achieved: number } | null;
  status: ManpowerPlanStatus;
  assignees: string[]; // render joined + "+n" overflow
  lastUpdate: string | null; // ISO date
  revisiCount: number; // 0 → render '-'
  /** True when every ancestor chain is assigned — gates leaf actions. */
  isParentAssigned: boolean;
  /**
   * Backend-computed "this node may be assigned now" gate — the source of truth for row
   * selectability (bulk Assign Terpilih); `false` hides the checkbox.
   */
  canAssign: boolean;
  /**
   * Backend-computed "this node's work may be completed (reported) now" gate — together with
   * `canAssign` it drives the leaf Assign action (both open → more manpower can be added).
   */
  canComplete: boolean;
  /**
   * Backend-computed "this node's existing manpower may be edited now" gate — `true` adds the leaf
   * Edit action (Assign Pekerjaan dialog in edit mode, submitting every card with its task id).
   */
  canEdit: boolean;
  children?: ManpowerPlanTreeItem[];
}

export interface ManpowerHelperRef {
  id: string;
  fullName: string;
}

export interface ManpowerCard {
  id: string;
  employee: { id: string; fullName: string };
  helpers: ManpowerHelperRef[];
  targetQty: number; // unit follows boq uom
  note: string | null;
  /** QC-rejected yesterday → auto re-appeared, cannot be deleted. */
  needsRepair: boolean;
  /** Backend gate: report submitted/terminal → the Assign/Edit dialog locks this card's fields. */
  isCompleted: boolean;
  reportStatus: ManpowerReportStatus;
  /** Today's report draft — only for the Selesaikan dialog, null before expansion. */
  todayReport?: ManpowerDailyReport | null;
  timeline: ManpowerTimelineEntry[];
}

export interface ManpowerDailyReport {
  reportDate: string; // YYYY-MM-DD
  achievedQty: number | null;
  activityNote: string | null;
  files: File[]; // upload; ExistingFile[] when coming from server
}

export interface ManpowerTimelineEntry {
  id: string;
  actorName: string; // "David Beckham (QC)"
  at: string; // ISO datetime
  /** `other` catches task-history events the wire sends that the UI has no dedicated kind for. */
  kind: 'submitted' | 'revision_requested' | 'resubmitted' | 'approved' | 'other';
  revisionNo?: number; // for resubmitted
  body: string;
  attachments: { id: string; fileName: string; url?: string }[];
}

export interface ManpowerAssignmentDetail {
  boqItemId: string;
  createdBy: string;
  volumeBoq: { value: number; unit: string };
  achievedQty: number;
  /** Working days budgeted for the item (Durasi cell) — null when the wire omits it. */
  duration: number | null;
  manpowers: ManpowerCard[];
  lastUpdate: string | null;
}

/** Read-only "Lihat" payload of a non-final (parent) BOQ item. */
export interface ParentTaskDetail {
  boqItemId: string;
  code: string;
  name: string;
  createdBy: string;
  /** null while the parent is unassigned. */
  assignee: string | null;
  assignDate: string | null;
  lastUpdate: string | null;
  note: string | null;
  children: ParentTaskDetailChild[];
}

/** One child row of `ParentTaskDetail` — the dialog renders it like the tree's child rows. */
export interface ParentTaskDetailChild {
  id: string;
  code: string;
  name: string;
  status: ManpowerPlanStatus;
}

export interface AssignLeafManpowerPayload {
  boqItemId: string;
  manpowers: {
    /**
     * Project task id of an existing manpower card — `null` appends a new card. The store/update
     * endpoint is the same `delegate/final` call; `id` is the only difference.
     */
    id: string | null;
    employeeId: string;
    targetQty: number;
    helperEmployeeIds: string[];
    note?: string;
  }[];
}

export interface SubmitManpowerReportsPayload {
  boqItemId: string;
  reports: { manpowerId: string; achievedQty: number; note?: string; files?: File[] }[];
}

/** Bulk assign of non-final (parent) items — `POST /project-tasks/delegate/non-final`. */
export interface AssignParentItemsPayload {
  boqItemIds: string[];
  employeeId: string;
  note?: string;
}

// ─── QC Report Flow (new flow) ────────────────────────────────────────────────

/** QC report row statuses (Figma: Waiting | Progress | Selesai | Ditolak). */
export type QcReportStatus = 'Waiting' | 'Progress' | 'Selesai' | 'Ditolak';

/** One flat QC row = one manpower daily report awaiting/undergoing QC. */
export interface QcReportRow {
  id: string; // qcTask id — also the path param of the claim/delegate/decision endpoints
  boqItemId: string;
  code: string; // A.1.1.1
  jobItem: string;
  manpower: { fullName: string; helpers: string[] };
  /** Catatan cell text — wire `listNote`, '-' when the row carries none. */
  note: string | null;
  /** "3 m³ dari target 3 m³" — bulk-assign subtitle and the detail dialog's target note. */
  reportSummary: string;
  status: QcReportStatus;
  assigneeQc: string | null; // '-' while Waiting
  revisiCount: number; // red 'Nx' when > 0 (sticky: terisi saat reject/perlu perbaikan)
  lastUpdate: string | null; // ISO date
}

/** Detail payload for the QC review / detail dialogs (2-panel layout). */
export interface QcReportDetail extends QcReportRow {
  createdBy: string;
  /** "Capaian dan Target" line — wire `workTask.targetDescription` (falls back to the summary). */
  targetDescription: string;
  manpowerNote: string; // "Catatan" line of the Manpower card
  timeline: ManpowerTimelineEntry[]; // reuse Task 1 type — same rail component
}

export interface SubmitQcReviewPayload {
  reportId: string;
  decision: 'pass' | 'fail'; // mirrors old qcDecision values
  note: string;
  files?: File[];
}

/** Bulk assign of QC tasks — `POST /quality-control/delegate`. */
export interface AssignQcTasksPayload {
  projectTaskIds: string[];
  employeeId: string;
  note?: string;
}

/** Paginated QC list payload — `meta` is the subset of the wire paginator the table needs. */
export interface QcReportsPage {
  rows: QcReportRow[];
  meta: { currentPage: number; perPage: number; total: number; lastPage: number };
}
