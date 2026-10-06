# action-item Domain

Task Control and Quality Control pages under the Meeting > Action Item menu, in the company portal. **Fully API-backed** — both tabs read/write `/v1/meeting-tasks/*`. No Zustand store, no mock data.

## Structure

```
action-item/
├── api/
│   ├── mappers.ts                      # Maps meeting-task API responses to domain types
│   ├── get-meeting-tasks.ts            # GET /meeting-tasks/tasks — Task Control list, server-paginated
│   ├── get-meeting-task.ts             # GET /meeting-tasks/{id} — Task Control detail
│   ├── delegate-meeting-task.ts        # POST /meeting-tasks/{id}/delegate — shared by BOTH tabs
│   ├── done-meeting-task.ts            # POST /meeting-tasks/{id}/done — multipart, evidenceFiles[]
│   ├── cancel-meeting-task.ts          # POST /meeting-tasks/{id}/cancel — multipart, reason + evidenceFiles[]
│   ├── get-qc-tasks.ts                 # GET /meeting-tasks/quality-controls — QC list, server-paginated
│   └── review-qc-task.ts               # POST /meeting-tasks/{id}/review-qc — multipart, qcEvidenceFiles[]
├── components/
│   ├── ActionItemTaskTable.tsx         # Task Control: flat, server-paginated table with delegatable cascade selection
│   ├── ActionItemQcTable.tsx           # Quality Control: same selection behavior, QC columns/status/decision
│   ├── DelegateActionItemsDialog.tsx   # Bulk-delegate modal, generic over DelegateTaskListItem — reused by both tabs
│   ├── ActionItemTaskDetailDialog.tsx  # Task Control: per-task detail modal, evidence upload, Done Task
│   └── ActionItemQcReviewDialog.tsx    # Quality Control: per-task review modal (QC note + evidence, Submit Fail/Pass)
├── constants/
│   └── index.ts                # Labels, MEETING_TASK_STATUS_* (shared status enum), QC_DECISION_*/QC_TERMINAL_STATUSES
├── hooks/
│   ├── use-meeting-tasks.ts        # React Query: Task Control list + the shared query-key root
│   ├── use-meeting-task.ts         # React Query: Task Control detail
│   ├── use-delegate-meeting-tasks.ts   # React Query: bulk delegate (fans out one request per task) — shared by both tabs
│   ├── use-done-meeting-task.ts    # React Query: submit evidence + mark done
│   ├── use-cancel-meeting-task.ts  # React Query: submit reason (+ optional evidence) + cancel
│   ├── use-qc-tasks.ts             # React Query: QC list, keys nested under the shared root
│   ├── use-qc-task.ts              # React Query: QC review detail (same endpoint as use-meeting-task, different projection)
│   ├── use-review-qc-task.ts       # React Query: submit QC decision
│   ├── use-task-control-page.ts    # Task Control: URL params -> API params, cascade selection state
│   └── use-quality-control-page.ts # Quality Control: URL params -> API params, cascade selection state
├── pages/
│   ├── ActionItemPage.tsx      # Tab shell (Task Control / Quality Control) + company selector (useCompaniesInfinite)
│   ├── TaskControlTab.tsx      # Task Control tab content
│   └── QualityControlTab.tsx   # Quality Control tab content
├── services/
│   ├── task-tree.ts             # Rebuilds parent/child hierarchy from dotted task codes
│   └── task-selection.ts        # Shared delegatable descendant selection helpers
├── types/
│   ├── api.ts                   # Raw meeting-task API response shapes (MeetingTaskApiStatus, QcDecisionApi, ...)
│   └── index.ts                 # TaskControlRow/TaskControlDetail, QcTaskRow/QcReviewDetail, EmployeeOption, EvidenceFile
└── index.ts                    # Barrel exports
```

## Key Files

- `api/get-meeting-tasks.ts` / `api/get-qc-tasks.ts` — server-paginated lists. Both take `companyId` (sent as the `X-Company-Id` header, never a query param) and `meetingId` (required by the backend).
- `api/delegate-meeting-task.ts` + `hooks/use-delegate-meeting-tasks.ts` — **shared by both tabs**. The API delegates ONE task per request; the hook fans a bulk selection out with `Promise.all`. On a QC task, the backend is assumed to route by `taskType` and set `qcAssignedToEmployee` instead of `assignedToEmployee` (unverified — see Open Questions).
- `api/done-meeting-task.ts` — Task Control only. Submits evidence as `multipart/form-data` (`evidenceFiles[]`) and marks the task done.
- `api/cancel-meeting-task.ts` — Task Control only. Submits `reason` (required, max 1000 chars) plus optional evidence (`evidenceFiles[]`) as multipart to `POST /meeting-tasks/{id}/cancel`.
- `api/review-qc-task.ts` — Quality Control only. Submits `qcDecision`/`qcNote`/`qcEvidenceFiles[]` as multipart to `POST /meeting-tasks/{id}/review-qc`.
- `hooks/use-meeting-tasks.ts` — owns `MEETING_TASK_QUERY_KEYS`, the **shared React Query key root** (`['meeting-tasks']`). `hooks/use-qc-tasks.ts`'s `QC_TASK_QUERY_KEYS` nests under this same root deliberately: `useDelegateMeetingTasks` and `useReviewQcTask` both invalidate `MEETING_TASK_QUERY_KEYS.all` on success, so a mutation from either tab refreshes both tabs' lists without each hook needing to know about the other's cache.
- `hooks/use-qc-task.ts` — calls the SAME `GET /meeting-tasks/{id}` endpoint as `use-meeting-task.ts`, but maps the response into `QcReviewDetail` (a different projection) via `mapQcTaskToReviewDetail`. Its own detail request (rather than reusing `get-meeting-task.ts`) is what lets the review dialog show fields Task Control's detail dialog doesn't need.
- `hooks/use-task-control-page.ts` / `hooks/use-quality-control-page.ts` — turn URL query params into API params; no client-side filtering, search, or pagination — all of it is server-driven. Selection cascades through descendants present on the current page, while `pageSelectableIds` contains only rows whose backend `isDelegatable` flag is not false.
- `services/task-selection.ts` — pure shared helpers build descendant maps and apply the same delegatable cascade behavior to both tabs.
- `pages/ActionItemPage.tsx` — tab shell driven by `?tab=task-control|quality-control` and `?companyId=` (resolved via `useCompaniesInfinite()`). Switching tabs clears `?status=` and `?qcDecision=` — the latter only applies to Quality Control, so it's cleared to avoid leaking into Task Control's params.
- `components/ActionItemTaskTable.tsx` / `components/ActionItemQcTable.tsx` — flat `DataTable`s (the API paginates flat). The checkbox column is hand-rolled, disables non-delegatable rows, and keeps select-all limited to delegatable rows on the current page.
- `components/ActionItemTaskDetailDialog.tsx` — "Cancel Task"/"Done Task" and the evidence upload section are hidden entirely (not just disabled) once the task is terminal (`done`/`qc_passed`/`cancelled`). "Cancel Task" opens `CancelActionItemTaskDialog` (reason + optional evidence); on success, the outer detail dialog closes.
- `components/ActionItemQcReviewDialog.tsx` — Submit Fail/Submit Pass are hidden when the task's status is terminal (`qc_passed`/`qc_failed`/`cancelled` via `QC_TERMINAL_STATUSES`); only a `done` task can be reviewed. Row buttons show "Lihat" for terminal statuses and "Selesaikan" otherwise — a `qc_failed` task is redone by the assignee in Task Control, not re-reviewed here.

## Open Questions / Assumptions (confirm with backend)

- **`POST /{id}/delegate` on a QC task** is assumed to set `qcAssignedToEmployee` (backend routes by `taskType`). If it sets `assignedToEmployee` instead, the QC table's Assignee column still renders correctly (`mapQcTaskToRow` falls back across both fields), but the review dialog's "QC Assignee" field would stay empty.
- **`documents` on a QC task detail** is assumed to hold the work task's evidence ("Task Evidence" in the review dialog's left column).

## Exports

- `ActionItemPage` — page component
- `EmployeeOption`, `EvidenceFile`, `QcReviewDetail`, `QcTaskRow`, `TaskControlDetail`, `TaskControlRow` — types (barrel-exported from `index.ts`)
- `MeetingTaskApiStatus`, `QcDecisionApi` — barrel-exported from `types/api.ts`

## Usage Example

```tsx
import { ActionItemPage } from '@/domains/action-item';

export default function Page() {
  return <ActionItemPage />;
}
```

## Related Domains

- `mom` — `useMeetings` (`src/domains/mom/hooks/use-meetings.ts`) supplies both tabs' MoM dropdown; not re-exported from `mom`'s barrel, imported directly from that hook file.
- `company` — `useCompaniesInfinite` supplies the page-level company selector.
- `manpower` — `useEmployeesInfinite` supplies the Delegate dialog's employee list.

## Best Practices

- Both tabs are fully API-backed; do not reintroduce client-side tree/pagination logic — filtering, search, and pagination are all server params.
- `DelegateActionItemsDialog` and `useDelegateMeetingTasks` are shared by both tabs — changing either affects both. Keep the dialog's prop signature stable; both tabs adapt their row shape to its existing `EmployeeOption[]`/`DelegateTaskListItem[]` props rather than the dialog changing to fit either tab.
- `MEETING_TASK_QUERY_KEYS` is the shared cache root both tabs' mutations invalidate. If a future QC-specific mutation is added, nest its keys the same way `QC_TASK_QUERY_KEYS` does, or cross-tab cache invalidation silently breaks.
