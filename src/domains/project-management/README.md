# project-management Domain

Project execution domain: BOQ/task tree, task delegation, and the new **Manpower Planning** and **Quality Control** flows (wired to the real backend endpoints). Renders under the Project Management menu (`/project-management/manpower-planning`, `/project-management/manpower-planning/create-task`, `/project-management/quality-control`).

## Structure

```
project-management/
├── api/                        # one file per operation (see the Manpower Planning / Quality Control sections for the new fns)
│   ├── get-project-tasks-boq.ts       # legacy source of the project block + legacy tree
│   ├── get-manpower-plan.ts           # NEW: GET /project-management/manpower-planning
│   ├── get-manpower-assignment.ts     # NEW: GET /project-management/project-tasks/items/{boqItemId} (final)
│   ├── get-parent-task-detail.ts      # NEW: GET /project-management/project-tasks/items/{boqItemId} (non-final)
│   ├── assign-leaf-manpower.ts        # NEW: POST /project-management/project-tasks/delegate/final
│   ├── assign-parent-items.ts         # NEW: POST /project-management/project-tasks/delegate/non-final
│   ├── submit-manpower-reports.ts     # NEW: POST /project-management/project-tasks/items/{boqItemId}/done (multipart)
│   ├── get-qc-reports.ts              # NEW: GET /project-management/quality-control (paginated)
│   ├── get-qc-report-detail.ts        # NEW: GET /project-management/quality-control/{reportId}
│   ├── claim-qc-report.ts             # NEW: POST /project-management/quality-control/claim/{reportId}
│   ├── submit-qc-review.ts            # NEW: POST /project-management/quality-control/{reportId}/decision (multipart)
│   ├── assign-qc-reports.ts           # NEW: POST /project-management/quality-control/delegate
│   ├── delegate-project-task.ts       # legacy delegate (no page consumes it in the new flow)
│   ├── delegate-project-task-qc.ts    # legacy QC delegate (no page consumes it in the new flow)
│   ├── claim-project-task.ts          # legacy claim (ProjectTaskTreeTable only)
│   ├── cancel-project-task.ts         # legacy cancel
│   └── mark-project-task-done.ts      # legacy done/QC decision
├── components/
│   ├── ManpowerPlanTreeTable.tsx      # NEW: parents-as-checkboxes tree, one action button per row
│   ├── QcReportTable.tsx              # NEW: flat QC report list (one report per row, no tree)
│   ├── AssignItemsDialog.tsx          # NEW: bulk assign — `taskCategory='work'` (manpower) | `'qc'` (QC page)
│   ├── ParentTaskDetailDialog.tsx     # NEW: read-only parent "Lihat"
│   ├── AssignPekerjaanDialog.tsx      # NEW: leaf manpower assignment
│   ├── SelesaikanPekerjaanDialog.tsx  # NEW: leaf daily reports + QC timeline (+ read-only Detail variant)
│   ├── QcReviewDialog.tsx             # NEW: 2-panel QC decision (review) + read-only Detail Pekerjaan (detail)
│   ├── ManpowerTimeline.tsx           # NEW: shared QC lifecycle rail
│   ├── ProjectTaskTreeTable.tsx       # legacy tree table — no page renders it any more
│   ├── DelegateSelectedTasksDialog.tsx# legacy delegate dialog — no page renders it (AssignItemsDialog supersedes it)
│   ├── TaskDoneDialog.tsx             # legacy done dialog — no page renders it any more
│   ├── QcTaskReviewDialog.tsx         # legacy QC review dialog — no page renders it any more
│   ├── EvidenceFileCard.tsx           # legacy evidence card (used by the two legacy dialogs above)
│   └── ScheduleView.tsx               # legacy schedule view
├── constants/
│   ├── manpower-plan.ts               # MANPOWER_PLAN_LABELS — every string of the new flow
│   └── manpower-planning.ts           # NEW_TASK_INFORMATION_CARD_LABELS (InformasiProjectCard)
├── hooks/
│   ├── use-manpower-plan.ts           # useManpowerPlan() + MANPOWER_PLAN_QUERY_KEYS
│   ├── use-manpower-project.ts        # useManpowerProject() — InformasiProjectCard slice of the list query
│   ├── use-manpower-assignment.ts     # useManpowerAssignment(boqItemId)
│   ├── use-parent-task-detail.ts      # useParentTaskDetail(boqItemId) — "Lihat" dialog payload
│   ├── use-assign-leaf-manpower.ts    # useAssignLeafManpower()
│   ├── use-assign-parent-items.ts     # useAssignParentItems() — bulk parent assign
│   ├── use-submit-manpower-reports.ts # useSubmitManpowerReports()
│   ├── use-manpower-plan-page.ts      # useManpowerPlanPage() — page orchestration (Task 9)
│   ├── use-qc-reports.ts              # useQcReports({ page, perPage, search, status }) + QC_REPORTS_QUERY_KEYS
│   ├── use-qc-report-detail.ts        # useQcReportDetail(reportId) — 2-panel dialog payload
│   ├── use-claim-qc-report.ts         # useClaimQcReport()
│   ├── use-assign-qc-reports.ts       # useAssignQcReports() — bulk QC assign
│   ├── use-submit-qc-review.ts        # useSubmitQcReview()
│   ├── use-qc-reports-page.ts         # useQcReportsPage() — QC page orchestration (Task 16)
│   └── use-new-task-page.ts           # legacy page hook — no page uses it any more
├── pages/
│   ├── manpower-planning/ManpowerPlanningPage.tsx  # new flow page
│   └── quality-control/QualityControlPage.tsx      # new flow page (flat QC report list)
├── schemas/
│   ├── manpower-planning-api.ts       # Zod wire schemas for the 5 response shapes (+ inferred wire types)
│   └── assign-pekerjaan.ts            # Zod schemas for the Assign Pekerjaan submit
├── services/
│   ├── manpower-plan-api-mapper.service.ts  # pure wire→domain mappers + exported status maps
│   ├── manpower-plan-flow.service.ts  # pure flow rules: row action, checkable, status filter, ...
│   ├── project-task-tree.service.ts   # legacy tree mapper
│   ├── boq-to-schedule-tree.ts        # schedule tree mapping
│   └── filter-schedule-tree.ts        # schedule tree filtering
├── types/
│   ├── manpower-planning.ts           # ManpowerPlanTreeItem, ManpowerCard, payloads, ...
│   └── schedule.ts                    # schedule types
└── index.ts                           # barrel: re-exports components + pages only
```

## Manpower Planning — New Flow

The new flow replaces the legacy "create-task" (delegate) flow on `/project-management/manpower-planning`. The BOQ tree is fetched from `getManpowerPlan` (real `GET /project-management/manpower-planning`), the page header offers search + a status filter (both client-side — the endpoint takes no params), and every action opens one of the flow's dialogs.

### Parent-gating rule

A leaf is locked until its whole parent chain is assigned:

- `getManpowerRowAction(item)` (services/manpower-plan-flow.service.ts) is the single source of truth: a leaf with `isParentAssigned: false` renders **no action button** (the checkbox column is parents-only anyway, per the design sticky "checkbox bagi child tidak ada").
- `isParentAssigned` is derived while the tree is mapped (services/manpower-plan-api-mapper.service.ts): parents in the `Belum Assign` chain render **Assign**, assigned parents render **Lihat** (`ParentTaskDetailDialog`, which fetches the item detail through `useParentTaskDetail`).
- Once a chain is assigned, leaves progress Assign → Selesaikan → Lihat as the BOQ volume fills up; the backend's `canAssign` + `canComplete` flags (both true) flip a leaf back to **Assign** for next-day re-assignment.

### Status filter

`filterManpowerTreeByStatus(nodes, statusFilter)` — a leaf matches by its own status; a parent survives only as a container when any descendant matches (non-matching leaves are dropped, and so are parents left without matching descendants). `''` disables filtering. Applied in `useManpowerPlanPage` before the table (search is applied inside the table itself).

### Dialog inventory

| Dialog | Opens from | What it does |
|---|---|---|
| `AssignItemsDialog` | "Assign Terpilih" (≥1 checked parent) or a parent row's **Assign** | Parent bulk/single assign; removable item list, one employee + optional note for the batch; `onRemoveItem` filters the open target's items inside `useManpowerPlanPage`. |
| `ParentTaskDetailDialog` | a parent row's **Lihat** | Read-only parent summary + direct children — seeded from the tree item, then reconciled with the `useParentTaskDetail(boqItemId)` fetch (server truth for every field). |
| `AssignPekerjaanDialog` | a leaf **Assign** | Multi-manpower cards with BOQ volume validation (per-card target lock once the volume is exhausted, `Total Qty diAssign x/y unit` footer) and **Perlu Perbaikan** cards that cannot be deleted (`isCardDeletable`) and whose Nama select is locked — the rejected card is repaired by its own assignee, but the rejection frees that employee to be picked again on a new card (`computeTakenEmployeeIds`; non-rejected assignees stay unselectable elsewhere). |
| `SelesaikanPekerjaanDialog` | a leaf **Selesaikan** / **Lihat** | Daily reports (Laporan Harian inputs, evidence upload) + QC timeline rail; `mode='detail'` is the read-only "Detail Pekerjaan" variant (no inputs, single `Tutup` footer). |
| `ManpowerTimeline` (not a dialog) | inside the dialogs above | Shared QC lifecycle rail (submitted → revision_requested → resubmitted · Revisi n → approved). |

Dialogs open from a single `dialogTarget` union in `useManpowerPlanPage`; the page stays declarative (stable memoised return object — CLAUDE.md anti-pattern #3).

### Wired endpoints (manpower)

Every new API function calls the real endpoint: Zod guard on the payload (where one exists), `getApiPath('/project-management/...')` (`/v1` prepended by the helper), `ApiSuccessResponse<T>` unwrap, `try/catch` + `handleApiError`. Bearer auth and `X-Project-Id` are attached by the axios interceptor — callers never thread `projectId`.

| Function | File | Endpoint |
|---|---|---|
| `getManpowerPlan()` | `api/get-manpower-plan.ts` | `GET /project-management/manpower-planning` |
| `getManpowerAssignment(boqItemId)` | `api/get-manpower-assignment.ts` | `GET /project-management/project-tasks/items/{boqItemId}` (final level) |
| `getParentTaskDetail(boqItemId)` | `api/get-parent-task-detail.ts` | `GET /project-management/project-tasks/items/{boqItemId}` (non-final level) |
| `assignLeafManpower(payload)` | `api/assign-leaf-manpower.ts` | `POST /project-management/project-tasks/delegate/final` — JSON `{boqItemId, manpower: [{employeeId, target, helperEmployeeIds, note}]}` |
| `assignParentItems(payload)` | `api/assign-parent-items.ts` | `POST /project-management/project-tasks/delegate/non-final` — JSON `{boqItemIds, employeeId, note}` |
| `submitManpowerReports(payload)` | `api/submit-manpower-reports.ts` | `POST /project-management/project-tasks/items/{boqItemId}/done` — multipart `manpower[i][projectTaskId]`, `manpower[i][completedVolume]`, `manpower[i][note]`, `manpower[i][files][j]` |

### Wired endpoints (QC)

| Function | File | Endpoint |
|---|---|---|
| `getQcReports({page, perPage, search, status})` | `api/get-qc-reports.ts` | `GET /project-management/quality-control?page=&perPage=&search=&status=` |
| `getQcReportDetail(reportId)` | `api/get-qc-report-detail.ts` | `GET /project-management/quality-control/{reportId}` |
| `claimQcReport(reportId)` | `api/claim-qc-report.ts` | `POST /project-management/quality-control/claim/{reportId}` |
| `submitQcReview(payload)` | `api/submit-qc-review.ts` | `POST /project-management/quality-control/{reportId}/decision` — multipart `qcDecision`, `note` (non-empty only), `files[i]` |
| `assignQcReports(payload)` | `api/assign-qc-reports.ts` | `POST /project-management/quality-control/delegate` — JSON `{projectTaskIds, employeeId, note}` |

### Data flow (wire → domain)

`schemas/manpower-planning-api.ts` (Zod wire schemas, inferred wire types) → `services/manpower-plan-api-mapper.service.ts` (pure wire→domain mappers) → `api/*` (fetch + unwrap + error handling) → `hooks/*` (React Query, invalidating `MANPOWER_PLAN_QUERY_KEYS.all` on every mutation so the tree, the QC list and every open dialog refresh together) → `pages/` + `components/`.

Statuses are mapped defensively: unknown wire values fall back rather than throw (`MANPOWER_TREE_STATUS_MAP`, `MANPOWER_REPORT_STATUS_MAP`, `QC_STATUS_MAP`, `TIMELINE_EVENT_KIND_MAP` in the mapper service — all exported so the UI never sees a wire enum). The status filter param goes the other way through `QC_STATUS_TO_API`. The API layer stays HTTP-only: mapping rules live in the service, orchestration in the hooks.

### Deliberate TODOs (pending backend confirmations)

Left in the code on purpose — resolve each when the backend confirms, not before:

| TODO | Where | Why it is safe today |
|---|---|---|
| Tree `revisiCount` stays 0 | mapper (`mapManpowerPlanList`) | the tree endpoint does not expose a per-item retryCount (QC rows do use `workTask.retryCount`) |
| `'rejected'` wire value unknown | mapper status maps | unknown values fall back defensively (`'Ditolak'` via decision, `'Progress'` otherwise) |
| Resubmission event name unconfirmed | mapper (`mapTaskHistoryToTimeline`) | any event containing `'resubmit'` maps to the `'resubmitted'` timeline kind |
| `delegate/final` append-vs-replace unconfirmed | `api/assign-leaf-manpower.ts` | the dialog submits only newly added cards, so either semantic is safe |
| workTask `note` vs `notes` | mapper (`mapQcTaskDetail`) | the mapper reads both fields |
| QC `reportSummary` omits the manpower note | mapper (`mapQcTaskToRow`) | `TODO(product)` — append it only when the cell should carry it |
| Server-side `sortBy` unused | manpower list | the tree is small; client-side search/status filtering is sufficient |

## Quality Control — New Flow

`/project-management/quality-control` renders the **flat report list**. Unlike Manpower Planning there is no tree: **one row = one manpower daily report** (`QcReportRow`), so selection is a plain per-row checkbox with a header select-all — no descendant cascade. The page header offers search (`Pencarian`) and a status Select (`Semua status` / Waiting / Progress / Selesai / Ditolak) that are passed straight to `useQcReports({ page, perPage, search, status })` — search, status and pagination are **all server-side** (the manpower tree filters client-side instead), and `DataTablePagination` reads `meta.total` / `meta.lastPage` / `meta.currentPage`. `useManpowerProject()` — the project slice of the same list query — feeds the InformasiProjectCard.

### Row actions & status lifecycle

`getQcRowAction(row)` (services/manpower-plan-flow.service.ts) is the single source of truth, and `isQcRowCheckable` gates the checkbox (only Waiting rows can be bulk-assigned):

| Status | Checkbox | Action |
|---|---|---|
| Waiting | yes | **Claim** (+ **Lihat** detail) |
| Progress | no | **Selesaikan** (QC review) |
| Ditolak | no | **Selesaikan** (QC reviews the resubmitted revision — user-confirmed) |
| Selesai | no | **Lihat** (read-only Detail Pekerjaan) |

Lifecycle: Waiting → Progress (via **Claim** or **Assign Terpilih**) → Selesai / Ditolak. A rejection bumps `revisiCount` (red `Nx` badge, from `workTask.retryCount`) and the leaf's manpower card maps to **Perlu Perbaikan** (`needsRepair`, derived from the `Ditolak` report status) on the Manpower Planning side — so a rejected manpower re-reports by adding a new card the next day.

- **Claim = self-assign**: `useQcReportsPage.handleClaim` runs `useClaimQcReport()` (`POST /project-management/quality-control/claim/{reportId}`), toasts, then `bumpClearSelection` — the row stops being Waiting, so it drops out of the selection on refetch.
- **Assign Terpilih** (header button, disabled with no checked rows) opens the manpower flow's `AssignItemsDialog` with `taskCategory='qc'`: removable item rows whose subtitle is `Manpower · reportSummary` (`QC_PAGE.TABLE.ASSIGN_ITEM_SUBTITLE`), one QC employee for the whole batch, and each item's `taskId` = the report id. The dialog submits through `useAssignQcReports()` with payload `{ projectTaskIds, employeeId, note? }` (`POST /quality-control/delegate`), `useSubordinateEmployees('qc')`, and a guard toast when a selected report has no task id (`ASSIGN_ITEMS.QC_TASK_UNAVAILABLE`).
- `removeAssignRow(id)` removes exactly one report: `AssignItemsDialog` keys/emits each item's optional `id` (the QC page passes the report id, so two Waiting reports sharing a `boqItemId` are removable independently; the manpower page omits it and keeps the `boqItemId` fallback).
- After a successful bulk assign the dialog's `useAssignQcReports` mutation invalidates `MANPOWER_PLAN_QUERY_KEYS.all`, refreshing the QC list, the manpower tree and every open leaf assignment at once. The page hook's `handleAssignCompleted` only bumps `clearSelectionSignal` — assigned reports stop being Waiting, so they drop out of the selection on refetch.

### Dialog inventory (QC)

| Dialog | Opens from | What it does |
|---|---|---|
| `AssignItemsDialog` (`taskCategory='qc'`) | "Assign Terpilih" | Bulk-assigns the checked Waiting reports to one QC employee. |
| `QcReviewDialog` (`mode='review'`) | **Selesaikan** on Progress/Ditolak | Two-panel decision: manpower identity card + `ManpowerTimeline` left, QC Review form (note + evidence, **Terima**/**Tolak**) right. |
| `QcReviewDialog` (`mode='detail'`) | **Lihat** | The same two panels read-only — title "Detail Pekerjaan", single **Tutup** footer. |

Dialogs open from one `dialogTarget` union in `useQcReportsPage` (`qc-assign` / `qc-review` / `qc-detail`) — same orchestration shape as `useManpowerPlanPage`: stable `useCallback`s handed to `QcReportTable` (its selection is emitted from an effect, so fresh identities would loop) and a memoised return object (CLAUDE.md anti-pattern #3).

### What stays legacy

`ProjectTaskTreeTable`, `TaskDoneDialog` and `QcTaskReviewDialog` are **no longer rendered by any page** (Manpower Planning and Quality Control both use the new flow now). They are kept for reference; removing them — plus `DelegateSelectedTasksDialog` (superseded by `AssignItemsDialog`, which still re-uses its `DelegateTaskListItem` type), `EvidenceFileCard`, `useNewTaskPage` and the legacy API fns they alone consume (`claim-project-task.ts`, `mark-project-task-done.ts`) — is a separate explicit step.

## Exports

- `index.ts` re-exports `./components` and `./pages` only (this domain's long-standing pattern) - hooks, api fns, services, types and constants stay internal and are consumed via the folder barrels (`components/index.ts`, `hooks/index.ts`, `api/index.ts`) or deep paths.
- Pages: `ManpowerPlanningPage`, `QualityControlPage`.
- New-flow components: `ManpowerPlanTreeTable`, `QcReportTable`, `AssignItemsDialog` (+ `AssignItemListItem`), `ParentTaskDetailDialog`, `AssignPekerjaanDialog`, `SelesaikanPekerjaanDialog`, `QcReviewDialog`, `ManpowerTimeline`.

## Usage Example

```tsx
import { ManpowerPlanningPage } from '@/domains/project-management/pages/manpower-planning/ManpowerPlanningPage';
import { useManpowerPlanPage } from '@/domains/project-management/hooks';
```
