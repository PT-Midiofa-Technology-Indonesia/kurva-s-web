# mom Domain

List, create, and detail pages for Minutes of Meeting (MoM), under the Meeting menu in the company portal. API-backed via `/meetings` endpoints and React Query.

## Structure

```
mom/
├── api/
│   ├── get-meetings.ts         # GET /meetings — list (search/status/sort/pagination), company-scoped
│   ├── get-meeting.ts          # GET /meetings/:id — detail
│   ├── create-meeting.ts       # POST /meetings — create
│   ├── update-meeting.ts       # PUT /meetings/:id — edit save
│   ├── publish-meeting.ts      # POST /meetings/:id/publish
│   ├── cancel-meeting.ts       # POST /meetings/:id/cancel — with { reason }
│   └── mappers.ts               # MeetingApiResponse -> MomRow / MomDetail
├── components/
│   ├── CancelMomDialog.tsx     # Cancel confirmation dialog with a required reason textarea
│   ├── CreateMomForm.tsx       # FormGenerator wiring, shared by create AND edit (mode prop)
│   ├── MomDetailView.tsx       # Read-only detail display (fields + To Do tabs)
│   ├── TodoSection.tsx         # Editable tabs (General + one per selected project) + empty state
│   ├── TodoTreeTable.tsx       # Excel-mode hierarchical To Do grid (per tab, editable)
│   └── TodoTreeView.tsx        # Read-only hierarchical To Do tree (per tab, detail page)
├── constants/
│   └── index.ts                # Labels (list/create/detail), status labels/options
├── hooks/
│   ├── use-meetings.ts         # useMeetings() — list query; also owns MOM_QUERY_KEYS
│   ├── use-meeting.ts          # useMeeting(id, companyId) — detail query
│   ├── use-create-meeting.ts   # useCreateMeeting() — create mutation
│   ├── use-update-meeting.ts   # useUpdateMeeting(id, companyId) — edit mutation
│   ├── use-publish-meeting.ts  # usePublishMeeting(id, companyId) — publish mutation
│   ├── use-cancel-meeting.ts   # useCancelMeeting(id, companyId) — cancel mutation
│   └── use-mom-list-page.ts    # Wraps useMeetings() with URL param handlers (sort/search/filter/paginate)
├── pages/
│   ├── MoMListPage.tsx         # List page (search, company/status filters, table)
│   ├── CreateMomPage.tsx       # "Tambah MoM Baru" page (back header + form)
│   └── MomDetailPage.tsx       # Detail page — view/edit toggle + status-gated actions
├── schemas/
│   └── index.ts                # createMomSchema (Zod), shared by create and edit
├── types/
│   ├── index.ts                # MomRow, MomDetail, TodoNode, CreateMomFormValues, ...
│   └── api.ts                  # MeetingApiResponse, MeetingPayload, MeetingTaskPayload — API request/response shapes
├── utils/
│   ├── todo-tree.utils.ts      # Hierarchical code generation (A/A.1/A.1.1) + add/insert/delete node, flatten/unflatten
│   └── mom-form.utils.ts       # momDetailToFormValues / momFormValuesToMeetingPayload (shared create/edit)
└── index.ts                    # Barrel exports
```

## Key Files

- `api/get-meetings.ts` / `api/get-meeting.ts` / `api/create-meeting.ts` / `api/update-meeting.ts` / `api/publish-meeting.ts` / `api/cancel-meeting.ts` — one file per operation, all company-scoped via the `X-Company-Id` header, all wrapped in try/catch → `handleApiError`.
- `api/mappers.ts` — `mapMeetingToRow` / `mapMeetingToDetail` translate the raw `MeetingApiResponse` (nested company/projects/participants/tasks refs) into the flat `MomRow`/`MomDetail` shapes the UI consumes; task un-flattening into the `TodoNode` tree goes through `unflattenTasksToTodoTree`.
- `hooks/use-meetings.ts` — owns `MOM_QUERY_KEYS` (`all` → `lists()`/`list(params)` and `details()`/`detail(id)`), reused by every other hook in this domain for cache invalidation.
- `hooks/use-mom-list-page.ts` — derives list state (rows, pagination meta, loading) from `useMeetings()` plus URL param change handlers (company, status, search, sort, pagination); no direct API calls.
- `pages/MoMListPage.tsx` — 100% UI; "Tambah MoM Baru" navigates to `/meeting/mom/create`, the "eye" action navigates to `/meeting/mom/[id]`.
- `pages/CreateMomPage.tsx` — converts form values to a `MeetingPayload` via `momFormValuesToMeetingPayload` and calls `useCreateMeeting()`, then navigates back to the list on success.
- `pages/MomDetailPage.tsx` — reads `useMeeting(momId, companyId)`; renders `MomDetailView` (read-only) by default, or `CreateMomForm mode="edit"` when "Edit MoM" is clicked. Action buttons (Edit MoM / Batalkan MoM / Publish MoM) only show when `status === 'draft'` — `published` and `cancelled` are both terminal/read-only, matching the design's notation. "Batalkan MoM" opens `CancelMomDialog` (reason required) and "Publish MoM" confirms via `ConfirmDialog`, each calling its respective mutation hook.
- `components/CancelMomDialog.tsx` — reason textarea + confirm/cancel buttons; confirm stays disabled until a reason is typed, labels from `DETAIL_MOM_LABELS.CANCEL_DIALOG`.
- `components/CreateMomForm.tsx` — `mode: 'create' | 'edit'` prop; in edit mode the Company field is disabled (per the design's notation) via `buildMomFormFields(disableCompany)`. Fields: text/select/multi-select/date/time/textarea, plus a `type: 'custom'` field embedding `TodoSection`.
- `components/TodoSection.tsx` — editable version, self-contained via `useFormContext`/`useWatch` (no props); renders one tab per selected project plus a fixed "General" tab, or the "Belum ada data / Masukkan project terlebih dahulu" empty state when no project is selected.
- `components/TodoTreeTable.tsx` — editable Excel-mode tree grid (`enableTreeView` + `enableRangeSelection` on the shared `DataTable`): auto-computed "Kode" column with inline add-child/add-sibling buttons, editable "Task" column, right-click menu (Potong/Salin/Tempel/Sisipkan baris di atas-bawah/Tambahkan child/Hapus baris) — mirrors the pattern in `src/shared/components/templates/BOQ/`, reimplemented locally to keep this domain isolated from BOQ.
- `components/TodoTreeView.tsx` — read-only counterpart used on the detail page: same tree/"Kode" rendering, no editing, no context menu.
- `utils/todo-tree.utils.ts` — pure tree functions (`computeTodoCodes`, `addTodoChild`, `addTodoSibling`, `deleteTodoNode`, `cloneTodoNode`, `findTodoDepth`, `canAddTodoChild`, `flattenTodoNodes`, `unflattenTasksToTodoTree`), no React/HTTP.
- `utils/mom-form.utils.ts` — `momDetailToFormValues` / `momFormValuesToMeetingPayload`, shared by the create and edit flows so the ISO `startAt`/`endAt` <-> split date+time conversion and the tree-to-flat-tasks conversion live in one place.

## Exports

- `MoMListPage`, `CreateMomPage`, `MomDetailPage` — page components
- `MomRow`, `MomDetail`, `MomStatus`, `CompanyOption`, `ProjectOption`, `ParticipantOption`, `TodoNode`, `MomTodoByTab`, `CreateMomFormValues` — types

## Usage Example

```tsx
import { CreateMomPage, MomDetailPage, MoMListPage } from '@/domains/mom';

export default function ListPage() {
  return <MoMListPage />;
}

export default function CreatePage() {
  return <CreateMomPage />;
}

export default function DetailPage({ momId }: { momId: string }) {
  return <MomDetailPage momId={momId} />;
}
```

## Related Domains

- `company` — `useCompaniesInfinite()` supplies the company filter/select options (list and detail pages).
- `project-control` — `useProjectsInfinite()` supplies project options scoped to the selected company.

## Best Practices

- All mutations (`useCreateMeeting`, `useUpdateMeeting`, `usePublishMeeting`, `useCancelMeeting`) invalidate `MOM_QUERY_KEYS.all` on success, plus `MOM_QUERY_KEYS.detail(id)` where applicable — reuse this pattern for any new mutation added to this domain.
- Every API call in `api/` is company-scoped via the `X-Company-Id` header; pass `companyId` through from the page/hook rather than reading it internally.
- `MomStatus` is a 3-state lifecycle: `draft` ("Proses", editable/actionable) → `published` or `cancelled` ("Dibatalkan") — both terminal/read-only. Don't add actions reachable from the terminal states.
