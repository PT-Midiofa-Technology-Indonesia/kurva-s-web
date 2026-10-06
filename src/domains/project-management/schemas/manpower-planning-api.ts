import { z } from 'zod';

/**
 * Wire contracts of the new Manpower Planning + QC flow (samples: `docs/api/manpower-planning.json`
 * + `docs/api/qc.json`). Parsed by the API layer before
 * `services/manpower-plan-api-mapper.service.ts` turns them into the domain types of
 * `types/manpower-planning.ts`.
 *
 * House rules for these schemas:
 * - status/enum-ish wire fields validate as `z.string()` — the backend can grow values the UI does
 *   not know, so mapping + defensive fallbacks live in the mapper service instead of here;
 * - only fields the mappers read are declared (unknown wire fields are stripped, never rejected);
 * - a field is `.nullable()`/`.optional()` whenever the domain type it feeds allows that.
 */

// ─── Shared wire pieces ───────────────────────────────────────────────────────

/** `{id, fullName}` employee stub (assignees, manpower, helpers). */
const employeeRefSchema = z.object({
  id: z.string(),
  fullName: z.string(),
});

/** `{id, name}` user stub (createdBy / actor / decidedBy). */
const userRefSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const uomSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
});

/** Tree/detail statuses arrive as `{value, label}` pairs — `value` is mapped defensively downstream. */
const statusValueSchema = z.object({
  value: z.string(),
  label: z.string(),
});

// ─── Task history (timeline of a manpower card and of the QC detail) ──────────

export const taskHistoryEntrySchema = z.object({
  projectTaskId: z.string(),
  actor: userRefSchema,
  note: z.string().nullable().optional(),
  documents: z
    .array(z.object({ id: z.string(), fileName: z.string(), url: z.string().optional() }))
    .optional(),
  recordedAt: z.string(),
  event: z.string(),
  eventLabel: z.string(),
  decision: z.object({ value: z.string(), label: z.string() }).optional(),
});

/** One `taskHistory[]` row of the manpower item detail and the QC detail. */
export type TaskHistoryEntry = z.infer<typeof taskHistoryEntrySchema>;

// ─── 1. Manpower planning list ────────────────────────────────────────────────

/** One recursive BOQ node of `data.boq.items[]`. */
export interface ManpowerBoqItemNode {
  id: string;
  code: string;
  name: string;
  level: number;
  uom?: { id: string; code: string; name: string } | null;
  isFinalLevel: boolean;
  /** `-` (parents) or the BOQ volume number. */
  volumeProject: number | string;
  completedVolume: number;
  status: { value: string; label: string };
  /** Backend-owned "this node may be assigned now" gate — the UI's source of truth. */
  canAssign: boolean;
  /** Backend-owned "this node's work may be completed (reported) now" gate. */
  canComplete: boolean;
  /**
   * Backend-owned "this node's existing manpower may be edited now" gate — gates the leaf Edit
   * action. Optional until the backend ships it; the mapper fails closed on `false`.
   */
  canEdit?: boolean;
  assign: {
    id: string;
    employee: { id: string; fullName: string };
    target: number | null;
    status: string;
    assignDate: string;
  }[];
  updatedAt: string;
  children: ManpowerBoqItemNode[];
}

export const manpowerBoqItemNodeSchema: z.ZodType<ManpowerBoqItemNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    level: z.number(),
    uom: uomSchema.nullable().optional(),
    isFinalLevel: z.boolean(),
    volumeProject: z.union([z.number(), z.string()]),
    completedVolume: z.number(),
    status: statusValueSchema,
    canAssign: z.boolean(),
    canComplete: z.boolean(),
    canEdit: z.boolean().optional(),
    assign: z.array(
      z.object({
        id: z.string(),
        employee: employeeRefSchema,
        target: z.number().nullable(),
        status: z.string(),
        assignDate: z.string(),
      })
    ),
    updatedAt: z.string(),
    children: z.array(manpowerBoqItemNodeSchema),
  })
);

/** Project stub of the manpower-planning list — feeds `InformasiProjectCardData`. */
const manpowerProjectSchema = z.object({
  name: z.string(),
  company: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
  client: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
  estimatedValue: z.number(),
  projectStartDate: z.string().nullable(),
  description: z.string().nullable().optional(),
});

export const manpowerPlanListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    project: manpowerProjectSchema,
    boq: z.object({
      items: z.array(manpowerBoqItemNodeSchema),
    }),
  }),
});

/** `GET /project-management/manpower-planning` success envelope. */
export type ManpowerPlanListResponse = z.infer<typeof manpowerPlanListResponseSchema>;

// ─── 2 + 3. Project task item detail (final vs non-final level) ───────────────

/** `data.manpower[]` of the final-level detail. */
const projectTaskManpowerSchema = z.object({
  projectTaskId: z.string(),
  employee: employeeRefSchema,
  helpers: z.array(employeeRefSchema),
  target: z.number(),
  note: z.string().nullable().optional(),
  status: statusValueSchema,
  /**
   * Backend-owned "this card's report is submitted/terminal" gate — locks the card's fields in the
   * Assign/Edit dialog. Optional until every environment ships it; the mapper fails open on absent
   * (treated as not completed → editable, the pre-flag behaviour).
   */
  isCompleted: z.boolean().optional(),
  taskHistory: z.array(taskHistoryEntrySchema),
});

export const projectTaskFinalDetailSchema = z.object({
  /** The final-level response omits this key entirely — hence `.optional()` (see the union below). */
  isFinalLevel: z.literal(true).optional(),
  id: z.string(),
  code: z.string(),
  name: z.string(),
  /** `null` while the item has never been touched (E2E: fresh leaf carries `createdBy: null`). */
  createdBy: userRefSchema.nullable(),
  volumeBoq: z.number(),
  /** Working days budgeted for the item — the Durasi cell. */
  duration: z.number().nullable(),
  currentProgress: z.number(),
  uom: uomSchema.nullable().optional(),
  lastUpdated: z.string().nullable(),
  manpower: z.array(projectTaskManpowerSchema),
});

export const projectTaskNonFinalDetailSchema = z.object({
  isFinalLevel: z.literal(false).optional(),
  id: z.string(),
  code: z.string(),
  name: z.string(),
  /** Same `null`-while-untouched rule as the final-level detail. */
  createdBy: userRefSchema.nullable(),
  /** Current assignee of a parent item — absent while the item is `not_assigned`. */
  assign: z
    .object({
      employee: employeeRefSchema,
      assignDate: z.string().nullable(),
    })
    .nullable()
    .optional(),
  lastUpdated: z.string().nullable(),
  note: z.string().nullable().optional(),
  children: z.array(
    z.object({
      id: z.string(),
      code: z.string(),
      name: z.string(),
      status: statusValueSchema,
    })
  ),
});

/**
 * Plain `z.union`, NOT `z.discriminatedUnion`: the final-level sample carries **no** `isFinalLevel`
 * key at all, and zod fails a discriminated union when the discriminator is absent (making it
 * optional instead throws `Duplicate discriminator value "undefined"` at construction time). The
 * literals still do the narrowing work — `data.isFinalLevel === false` picks the parent branch, and
 * a final payload can never satisfy the non-final member's `isFinalLevel: false` literal.
 */
export const projectTaskItemDetailSchema = z.union([
  projectTaskFinalDetailSchema,
  projectTaskNonFinalDetailSchema,
]);

export const projectTaskItemDetailResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: projectTaskItemDetailSchema,
});

/** `GET /project-management/project-tasks/items/{boqItemId}` success envelope. */
export type ProjectTaskItemDetailResponse = z.infer<typeof projectTaskItemDetailResponseSchema>;

/** Final-level member of the discriminated detail (leaf — manpower cards + task history). */
export type ProjectTaskFinalDetail = z.infer<typeof projectTaskFinalDetailSchema>;

/** Non-final-level member of the discriminated detail (parent — assignee + children). */
export type ProjectTaskNonFinalDetail = z.infer<typeof projectTaskNonFinalDetailSchema>;

/**
 * Picks the union's parent branch. Deliberately a type predicate instead of an inline
 * `data.isFinalLevel === false`: the members declare the literal as *optional*, so that inline
 * comparison neither narrows the union nor compiles (`!== false` trips TS2367 "no overlap"). The
 * predicate widens the read to `boolean | undefined`, which narrows both branches — the two API
 * files dispatch on it (`getManpowerAssignment` throws on true, `getParentTaskDetail` on false).
 */
export function isNonFinalItemDetail(
  data: ProjectTaskItemDetailResponse['data']
): data is ProjectTaskNonFinalDetail {
  return data.isFinalLevel === false;
}

// ─── QC list + detail ─────────────────────────────────────────────────────────

/** Employee stub of the QC payloads — `{id, code, fullName}`. */
const qcEmployeeSchema = z.object({
  id: z.string(),
  code: z.string(),
  fullName: z.string(),
});

/**
 * `workTask` is thinner on the list rows than on the detail payload, so every extra field stays
 * optional and the mapper falls back (`retryCount ?? 0`, `note ?? ''`).
 */
const qcWorkTaskSchema = z.object({
  id: z.string(),
  status: z.string(),
  /**
   * Backend-composed "capaian dari target" line of the QC detail's Manpower card ("10.5 CM dari
   * 10.5 CM") — present on the detail payload, absent on the thinner list `workTask`.
   */
  targetDescription: z.string().nullable().optional(),
  /**
   * The wire sample carries `note` while the plan text says `notes` — both stay valid until the
   * backend confirms which one it is (see the manpowerNote mapping TODO).
   */
  note: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  retryCount: z.number().optional(),
  assignedEmployee: qcEmployeeSchema.nullable().optional(),
  helperEmployees: z.array(qcEmployeeSchema).optional(),
});

/**
 * One QC task row. `workTask` is deliberately NOT part of this schema: list items nest it, while
 * the detail payload carries it as a **sibling** of `qcTask` (see the detail schema below).
 */
export const qcTaskSchema = z.object({
  id: z.string(),
  boqItemId: z.string(),
  boqItem: z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    uom: uomSchema.nullable().optional(),
  }),
  /** Plain status string (`waiting` | `in_progress` | `done`, `rejected` unconfirmed). */
  status: z.string(),
  qcDecision: z.string().nullable().optional(),
  targetVolume: z.number(),
  completedVolume: z.number(),
  /** Note the list's Catatan cell displays — absent on payloads that predate it. */
  listNote: z.string().nullable().optional(),
  assignedEmployee: qcEmployeeSchema.nullable().optional(),
  createdBy: userRefSchema,
  doneAt: z.string().nullable().optional(),
  createdAt: z.string(),
});

/** List item = QC task + its nested manpower `workTask`. */
export const qcTaskListItemSchema = qcTaskSchema.extend({
  workTask: qcWorkTaskSchema,
});

export const qcTaskListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(qcTaskListItemSchema),
  /** Laravel paginator meta — `links`/`counts` of the sample are deliberately not modelled. */
  meta: z.object({
    currentPage: z.number(),
    perPage: z.number(),
    total: z.number(),
    lastPage: z.number(),
  }),
});

/** `GET /project-management/quality-control` success envelope. */
export type QcTaskListResponse = z.infer<typeof qcTaskListResponseSchema>;

/** One flat QC task row — list items and the detail payload's `qcTask` (no `workTask`). */
export type QcTask = z.infer<typeof qcTaskSchema>;

/** A list item's nested manpower work task (sibling of `qcTask` on the detail payload). */
export type QcWorkTask = z.infer<typeof qcWorkTaskSchema>;

/** List row = QC task + nested workTask. */
export type QcTaskListItem = z.infer<typeof qcTaskListItemSchema>;

export const qcTaskDetailResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    qcTask: qcTaskSchema,
    workTask: qcWorkTaskSchema,
    taskHistory: z.array(taskHistoryEntrySchema),
  }),
});

/** `GET /project-management/quality-control/{projectTaskId}` success envelope. */
export type QcTaskDetailResponse = z.infer<typeof qcTaskDetailResponseSchema>;
