# Attendance Domain

Manages attendance records — CRUD, filtering, bulk input. Uses `X-Company-Id` header for company-scoped access.

## Structure

```
attendance/
├── api/
│   ├── delete-attendance.ts        # DELETE
│   ├── get-attendance-detail.ts    # GET single detail
│   ├── get-attendances.ts          # GET paginated list (+ X-Company-Id)
│   ├── get-bulk-prepare.ts         # GET bulk prepare data for date range
│   ├── post-bulk-attendances.ts    # POST bulk submit
│   └── update-attendance.ts        # PUT update
├── components/
│   ├── AttendanceDetailDrawer.tsx   # Detail drawer (check in/out, late, early leave, location, project)
│   ├── AttendanceFilterDrawer.tsx   # Filter drawer (date range, status, employee, project, location)
│   ├── BulkAttendancePage.tsx       # Bulk input UI (employee list with check in/out per date)
│   └── BulkInputModal.tsx           # Modal for individual row edit in bulk mode
├── constants/
│   └── index.ts                     # ATTENDANCE_LABELS, ATTENDANCE_STATUS_BADGE, ATTENDANCE_STATUS_OPTIONS
├── hooks/
│   ├── use-attendance-detail.ts     # Query: single detail
│   ├── use-attendance-page.ts       # Page-level hook (list state, filters, pagination)
│   ├── use-attendances.ts           # Query: paginated list + ATTENDANCE_QUERY_KEYS
│   ├── use-bulk-prepare.ts          # Query: prepare data for bulk input + BULK_QUERY_KEYS
│   ├── use-bulk-submit.ts           # Mutation: submit bulk attendance
│   ├── use-delete-attendance.ts     # Mutation: delete
│   └── use-update-attendance.ts     # Mutation: update
├── pages/
│   └── AttendanceListPage.tsx       # List page with DataTable, filters, pagination
├── types/
│   └── index.ts                     # Attendance, AttendanceListItem, BulkAttendanceItem, UpdateAttendancePayload, GetAttendancesParams
└── index.ts                         # Public barrel exports
```

## Key Exports

### APIs

| Function | Description |
|---|---|
| `getAttendances(params)` | GET paginated list (supports `search`, `startDate`, `endDate`, `status[]`, `employeeIds[]`, `projectIds[]`, `locationType`, `page`, `perPage`) |
| `getBulkPrepare(params)` | GET bulk prepare data for a date range |
| `postBulkAttendances(payload)` | POST bulk submit attendance |
| `updateAttendance(id, payload)` | PUT update single attendance |
| `deleteAttendance(id)` | DELETE attendance by ID |

### Hooks

| Hook | Type | Description |
|---|---|---|
| `useAttendances(params)` | Query | Paginated list; exports `ATTENDANCE_QUERY_KEYS` |
| `useAttendanceDetail(id)` | Query | Single detail (enabled when `id` truthy) |
| `useBulkPrepare(params)` | Query | Bulk prepare data; exports `BULK_QUERY_KEYS` |
| `useAttendancePage()` | Page hook | Combines list query + filter/pagination state |
| `useBulkSubmit()` | Mutation | Submit bulk attendance |
| `useUpdateAttendance()` | Mutation | Update single attendance |
| `useDeleteAttendance()` | Mutation | Delete attendance |

### Pages

| Page | Description |
|---|---|
| `AttendanceListPage` | DataTable list with search, filters (date range, status multi, employee multi, project multi, location), pagination, detail drawer |

### Components

| Component | Description |
|---|---|
| `AttendanceDetailDrawer` | Side drawer with full attendance detail (check in/out, late/early leave, location, project, work hour, timezone) |
| `AttendanceFilterDrawer` | Filter drawer — date range, multi status, multi employee, multi project, location |
| `BulkAttendancePage` | Self-contained bulk input page — date picker, employee list with check in/out fields, validation, submit |
| `BulkInputModal` | Modal for editing a single attendance row within bulk input flow |

### Types

| Type | Description |
|---|---|
| `Attendance` | Full attendance entity (employee, company, check in/out, status, location, project, work hour, timezone, late/early minutes) |
| `AttendanceListItem` | Alias for `Attendance` |
| `BulkAttendanceItem` | Employee attendance row for bulk input (employee, date, check in/out, status, existing record flag) |
| `UpdateAttendancePayload` | Form payload for update |
| `GetAttendancesParams` | Query params with search, date range, status/employee/project filters, location type, pagination |
| `BulkSubmitPayload` | Array of `BulkAttendancePayloadItem` |
| `BulkPrepareResponse` | Prepared employee list for given date range |

### Labels & Constants

- `ATTENDANCE_LABELS` — ID labels for list page, detail drawer, form, dialog, actions
- `ATTENDANCE_STATUS_OPTIONS` — Status dropdown: `present`, `late`, `absent`, `sick`, `leave`, `dayoff`, `halfday`
- `ATTENDANCE_LOCATION_TYPE_OPTIONS` — Location: `Office`, `Warehouse`
- `ATTENDANCE_STATUS_BADGE` — Status badge config per status value

## Usage Examples

```tsx
import { AttendanceListPage } from '@/domains/attendance';
import { useAttendances } from '@/domains/attendance';
import type { Attendance } from '@/domains/attendance';

// Page component
// app/(protected)/hr/attendance/page.tsx
import { Suspense } from 'react';
import { ListPageSkeleton } from '@/shared/components/templates/ListPageSkeleton';
import { AttendanceListPage } from '@/domains/attendance';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <AttendanceListPage />
    </Suspense>
  );
}
```

## API Contracts

### GET /api/v1/attendances

**Headers**: `X-Company-Id: <uuid>`

**Query params**: `page`, `perPage`, `search`, `startDate`, `endDate`, `status[]`, `employeeIds[]`, `projectIds[]`, `locationType`, `sortBy`, `sortOrder`

**Response**: Paginated list of `Attendance` items.

### GET /api/v1/attendance/bulk/prepare

**Query params**: `startDate`, `endDate`, `companyId`

**Response**: Array of `BulkAttendanceItem` (employee data with existing records flagged).

### POST /api/v1/attendance/bulk

**Payload**: `{ companyId, attendances: BulkAttendancePayloadItem[] }`

## Related Domains

- **manpower** — Employee data used in attendance records
- **project-control** — Project reference for attendance project field; work hour settings
- **overtime** — Overtime records linked to attendance by `attendanceId`
