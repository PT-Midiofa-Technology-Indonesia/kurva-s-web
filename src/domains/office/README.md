# Office

Domain for managing office (branch and head office) master data, including full CRUD operations, address details, and geolocation.

## Structure

```
office/
├── api/
│   ├── create-office.ts        # POST /v1/offices
│   ├── delete-office.ts        # DELETE /v1/offices/:id
│   ├── get-office.ts           # GET /v1/offices/:id
│   ├── get-offices.ts          # GET /v1/offices (paginated list)
│   └── update-office.ts        # PUT /v1/offices/:id
├── components/
│   ├── OfficeDetailDrawer.tsx  # Read-only detail drawer
│   └── OfficeForm.tsx          # Shared create/edit form
├── constants/
│   └── index.ts                # Labels, office type options, form fields
├── hooks/
│   ├── index.ts
│   ├── use-create-office-page.ts  # Create page orchestration
│   ├── use-create-office.ts       # Create mutation
│   ├── use-delete-office.ts       # Delete mutation
│   ├── use-edit-office-page.ts    # Edit page orchestration
│   ├── use-office-page.ts         # List page orchestration
│   ├── use-office.ts              # Single office query
│   ├── use-offices.ts             # Paginated list query (defines OFFICE_QUERY_KEYS)
│   └── use-update-office.ts       # Update mutation
├── pages/
│   ├── __tests__/
│   │   ├── CreateOfficePage.integration.test.tsx
│   │   ├── EditOfficePage.integration.test.tsx
│   │   └── OfficeListPage.integration.test.tsx
│   ├── CreateOfficePage.tsx
│   ├── EditOfficePage.tsx
│   └── OfficeListPage.tsx
├── schemas/
│   └── index.ts                # Zod validation schemas
├── types/
│   └── index.ts                # Office, OfficeListItem, Company, GeographyItem
└── index.ts                    # Barrel exports
```

## Key Files

- `api/get-offices.ts` — paginated list with filters (`page`, `perPage`, `sortBy`, `sortOrder`, `search`, `isActive`)
- `api/get-office.ts` — fetch single office by id
- `api/create-office.ts` — create office (POST)
- `api/update-office.ts` — update office (PUT)
- `api/delete-office.ts` — delete office (DELETE)
- `hooks/use-offices.ts` — React Query list hook; also defines `OFFICE_QUERY_KEYS`
- `hooks/use-office.ts` — React Query single-item hook
- `hooks/use-office-page.ts` — full list-page logic (search, filter, drawer state, delete)
- `hooks/use-create-office-page.ts` — create-page form submission logic
- `hooks/use-edit-office-page.ts` — edit-page pre-fill and submission logic
- `components/OfficeForm.tsx` — shared form used by both create and edit pages
- `components/OfficeDetailDrawer.tsx` — read-only detail view with status toggle
- `types/index.ts` — `Office` (with `type: 'main_office' | 'branch_office'`, address, geolocation fields), `OfficeListItem`, `Company`, `GeographyItem`

## Exports

- `getOffices` / `getOffice` / `createOffice` / `updateOffice` / `deleteOffice` — API functions
- `useOffices` / `useOffice` — query hooks
- `OFFICE_QUERY_KEYS` — query key factory
- `useCreateOffice` / `useUpdateOffice` / `useDeleteOffice` — mutation hooks
- `useOfficePage` / `useCreateOfficePage` / `useEditOfficePage` — page orchestration hooks
- `OfficeListPage` / `CreateOfficePage` / `EditOfficePage` — page components
- `Office` / `OfficeListItem` / `Company` / `GeographyItem` — TypeScript types

## Routes

| Route | Page |
|---|---|
| `/organization/office` | `OfficeListPage` |
| `/organization/office/create` | `CreateOfficePage` |
| `/organization/office/:id/edit` | `EditOfficePage` |

## Usage Example

```tsx
import { useOffices, useDeleteOffice, OfficeListPage } from '@/domains/office';

// Use the page component directly in app/ routes
export { OfficeListPage as default } from '@/domains/office';

// Or consume hooks in custom components
function MyComponent() {
  const { data, isLoading } = useOffices({ page: 1, perPage: 10, isActive: true });
  const { mutate: deleteOffice } = useDeleteOffice();
  // ...
}
```

## Required location fields

`provinceId` is required on both create and edit, so the shared `addressBaseShape` / `addressEditBaseShape` are overridden here rather than changed — company and vendor-catalog still treat it as optional. The form defaults it to `''` rather than `undefined`, because `requiredSelectSchema` accepts a string or null but not undefined; that matches how `companyId` already behaves in the same form.

`latitude`, `longitude` and `attendanceRadiusMeters` are required on create and edit too — a location that cannot be placed on a map, or has no radius, cannot accept a check-in.

## Attendance radius and time zone

`attendanceRadiusMeters` bounds how far a check-in may be from the location, and `timezone` is what the backend computes lateness against — a wrong zone shifts `late_minutes` by one or two hours for everyone there.

The form never sends a time zone. It submits `timezone: null`, which asks the backend to derive the zone from `provinceId`, and shows the resulting zone under the province field as a hint so the value is visible before saving. Indonesian zones follow provincial borders rather than meridians, so they cannot be guessed from coordinates; `GET /geography/provinces` carries the zone per province and `useProvinceTimezone` reads it from the same cache entry `useProvinces` already fills, costing no extra request.

One consequence to know: because the form always sends null, saving re-derives the zone from the province. A location that the backend had set to an exception zone by hand loses that override on the next edit from this form.
