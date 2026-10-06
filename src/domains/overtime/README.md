# Overtime Domain

Manages overtime records — create, edit, delete, filter, and settings (rate per hour, rounding config). Uses `X-Company-Id` header for company-scoped access.

## Structure

```
overtime/
├── api/
│   ├── create-overtime.ts          # POST create
│   ├── delete-overtime.ts          # DELETE
│   ├── get-overtime-detail.ts      # GET single detail
│   ├── get-overtime-settings.ts    # GET overtime settings (rate per hour)
│   ├── get-overtimes.ts            # GET paginated list (+ X-Company-Id)
│   ├── update-overtime-settings.ts # PUT settings
│   └── update-overtime.ts          # PUT update
├── components/
│   ├── OvertimeDetailDrawer.tsx     # Detail drawer (attendance ID, status, date, employee, location, project, times, rate, amount, notes)
│   ├── OvertimeFilterDrawer.tsx     # Filter drawer (date range, status single, employee multi, project multi)
│   └── OvertimeFormDrawer.tsx       # Create/edit form drawer (FormGenerator)
├── constants/
│   └── index.ts                     # OVERTIME_LABELS, OVERTIME_STATUS_BADGE
├── hooks/
│   ├── use-create-overtime.ts       # Mutation: create
│   ├── use-delete-overtime.ts       # Mutation: delete
│   ├── use-overtime-detail.ts       # Query: single detail
│   ├── use-overtime-page.ts         # Page-level hook (list state, filters, pagination)
│   ├── use-overtime-settings.ts     # Query: settings
│   ├── use-overtimes.ts             # Query: paginated list + OVERTIME_QUERY_KEYS
│   ├── use-update-overtime-settings.ts  # Mutation: update settings
│   └── use-update-overtime.ts       # Mutation: update
├── pages/
│   ├── OvertimeListPage.tsx         # List page with DataTable, filters, pagination
│   └── OvertimeSettingsPage.tsx     # Settings page (rate per hour, rounding config)
├── schemas/
│   └── index.ts                     # overtimeFormSchema, overtimeSettingsSchema (Zod)
├── types/
│   └── index.ts                     # Overtime, OvertimeListItem, OvertimeSettingsData, CreateOvertimePayload, UpdateOvertimePayload
└── index.ts                         # Public barrel exports
```

## Key Exports

### APIs

| Function | Description |
|---|---|
| `createOvertime(payload)` | POST create new overtime |
| `deleteOvertime(id)` | DELETE overtime by ID |
| `getOvertimeDetail(id)` | GET single overtime detail |
| `getOvertimeSettings()` | GET overtime rate/rounding settings |
| `getOvertimes(params)` | GET paginated list (supports `page`, `perPage`, `search`, `startDate`, `endDate`, `status`, `employeeIds`, `projectIds`) |
| `updateOvertime(id, payload)` | PUT update overtime |
| `updateOvertimeSettings(payload)` | PUT update settings |

### Hooks

| Hook | Type | Description |
|---|---|---|
| `useOvertimes(params)` | Query | Paginated list; exports `OVERTIME_QUERY_KEYS` |
| `useOvertimeDetail(id)` | Query | Single detail (enabled when `id` truthy) |
| `useOvertimeSettings()` | Query | Rate/rounding settings |
| `useCreateOvertime()` | Mutation | Create — invalidates `OVERTIME_QUERY_KEYS.all` |
| `useUpdateOvertime()` | Mutation | Update — invalidates keys |
| `useDeleteOvertime()` | Mutation | Delete — invalidates keys |
| `useUpdateOvertimeSettings()` | Mutation | Update settings — invalidates keys |
| `useOvertimePage()` | Page hook | Combines list query + filter/pagination state |

### Pages

| Page | Description |
|---|---|
| `OvertimeListPage` | DataTable list with search, date range filter, status/employee/project filters, pagination, detail drawer, create/edit form drawer |
| `OvertimeSettingsPage` | Form for rate per hour, rounding method, and threshold minutes |

### Components

| Component | Description |
|---|---|
| `OvertimeDetailDrawer` | Side drawer with full overtime detail (employee, times, rate, amount, notes, project, location) |
| `OvertimeFilterDrawer` | Filter drawer — date range, single status, multi employee, multi project |
| `OvertimeFormDrawer` | Create/edit form drawer using FormGenerator with Zod validation |

### Types

| Type | Description |
|---|---|
| `Overtime` | Full overtime entity (employee, company, times, rate, amount, status, location, project) |
| `OvertimeListItem` | Alias for `Overtime` (list row item) |
| `OvertimeSettingsData` | `overtimeRatePerHour`, `overtimeRoundingMethod`, `overtimeRoundingThresholdMinutes` |
| `CreateOvertimePayload` | Form payload for create |
| `UpdateOvertimePayload` | Form payload for update |

### Labels

- `OVERTIME_LABELS` — ID labels for list page, settings page, form, dialog, buttons, actions
- `OVERTIME_STATUS_BADGE` — Status badge config (`done` → default, `cancelled` → secondary)

## Usage Examples

```tsx
import { OvertimeListPage } from '@/domains/overtime';
import { useOvertimes, useCreateOvertime } from '@/domains/overtime';
import type { Overtime } from '@/domains/overtime';

// Page component
// app/(protected)/hr/overtime/page.tsx
import { Suspense } from 'react';
import { ListPageSkeleton } from '@/shared/components/templates/ListPageSkeleton';
import { OvertimeListPage } from '@/domains/overtime';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <OvertimeListPage />
    </Suspense>
  );
}

// Using hooks
function MyComponent() {
  const { data, isLoading } = useOvertimes({ page: 1, perPage: 10 });
  const { mutateAsync: create } = useCreateOvertime();
  // ...
}
```

## API Contracts

### GET /api/v1/overtimes

**Headers**: `X-Company-Id: <uuid>`

**Query params**: `page`, `perPage`, `search`, `startDate`, `endDate`, `status`, `employeeIds[]`, `projectIds[]`

**Response**: Paginated list of `Overtime` items.

### GET /api/v1/overtime-settings

**Response**: `{ overtimeRatePerHour, overtimeRoundingMethod, overtimeRoundingThresholdMinutes }`

### POST /api/v1/overtimes

**Payload**: `{ employeeId, overtimeDate, startTime, endTime, ratePerHourSnapshot, status, locationType, locationId?, projectId?, notes?, reason? }`

## Related Domains

- **manpower** — Employee data used in overtime records
- **project-control** — Project reference for overtime project field
- **attendance** — Attendance ID linked in overtime detail
