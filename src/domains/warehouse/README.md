# Warehouse

Warehouse master data management with full CRUD, geography cascading, company association, and GPS coordinates.

## Structure

```
warehouse/
├── api/
│   ├── get-warehouses.ts     # GET /warehouses (paginated list)
│   ├── get-warehouse.ts      # GET /warehouses/:id
│   ├── create-warehouse.ts   # POST /warehouses
│   ├── update-warehouse.ts   # PUT /warehouses/:id
│   └── delete-warehouse.ts   # DELETE /warehouses/:id
├── components/
│   ├── WarehouseForm.tsx          # Create/edit form with geography cascading and company select
│   └── WarehouseDetailDrawer.tsx  # Read-only detail drawer with status toggle
├── hooks/
│   ├── use-warehouses.ts            # useQuery for paginated list
│   ├── use-warehouse.ts             # useQuery for single warehouse
│   ├── use-create-warehouse.ts      # useMutation for create
│   ├── use-update-warehouse.ts      # useMutation for update
│   ├── use-delete-warehouse.ts      # useMutation for delete
│   ├── use-warehouse-page.ts        # Page-level hook for list page
│   ├── use-create-warehouse-page.ts # Page-level hook for create page
│   └── use-edit-warehouse-page.ts   # Page-level hook for edit page
├── pages/
│   ├── WarehouseListPage.tsx    # List page with search, status filter, pagination
│   ├── CreateWarehousePage.tsx  # Create warehouse form page
│   └── EditWarehousePage.tsx    # Edit warehouse form page
├── schemas/
│   └── index.ts                 # Zod validation schemas (createWarehouseSchema, editWarehouseSchema)
├── types/
│   └── index.ts                 # Warehouse, WarehouseFilters types
├── constants/
│   └── index.ts                 # WAREHOUSE_LABELS, PLACEHOLDERS, STATUS_OPTIONS
└── index.ts                     # Public barrel exports
```

## Key Files

- `components/WarehouseForm.tsx` — Form with geography cascading (province → city → district → village) and company `AsyncSelect`
- `components/WarehouseDetailDrawer.tsx` — Read-only detail view opened from the list page with inline status toggle
- `hooks/use-warehouse-page.ts` — Orchestrates list page: search, status filter, pagination, detail drawer open/close, delete confirm

## Exports

- `WarehouseListPage` — List page with search, status filter, and pagination
- `CreateWarehousePage` — Create warehouse form page
- `EditWarehousePage` — Edit warehouse form page
- `WarehouseForm` — Reusable create/edit form component
- `WarehouseDetailDrawer` — Read-only detail drawer with status toggle
- `useWarehouses` — Paginated list query hook
- `useWarehouse` — Single-item query hook
- `useCreateWarehouse` / `useUpdateWarehouse` / `useDeleteWarehouse` — Mutation hooks
- `useWarehousePage` / `useCreateWarehousePage` / `useEditWarehousePage` — Page-level orchestration hooks
- `WAREHOUSE_LABELS` / `PLACEHOLDERS` / `STATUS_OPTIONS` — UI constants
- `createWarehouseSchema` / `editWarehouseSchema` / `WarehouseFormInput` — Zod schemas and form input type
- `Warehouse` / `WarehouseFilters` — TypeScript types

## Usage Example

```tsx
import { WarehouseListPage } from '@/domains/warehouse';

export default function Page() {
  return <WarehouseListPage />;
}
```

```tsx
import { EditWarehousePage } from '@/domains/warehouse';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditWarehousePage id={id} />;
}
```

## Related Domains

- **company** — Company association on the warehouse form uses the same company `AsyncSelect` pattern
- **vendor-catalog** / **office** — Share the same geography cascading hook pattern (province → city → district → village)

## Required location fields

`provinceId` is required on both create and edit, so the shared `addressBaseShape` / `addressEditBaseShape` are overridden here rather than changed — company and vendor-catalog still treat it as optional. The form defaults it to `''` rather than `undefined`, because `requiredSelectSchema` accepts a string or null but not undefined; that matches how `companyId` already behaves in the same form.

`latitude`, `longitude` and `attendanceRadiusMeters` are required on create and edit too — a location that cannot be placed on a map, or has no radius, cannot accept a check-in.

## Attendance radius and time zone

`attendanceRadiusMeters` bounds how far a check-in may be from the location, and `timezone` is what the backend computes lateness against — a wrong zone shifts `late_minutes` by one or two hours for everyone there.

The form never sends a time zone. It submits `timezone: null`, which asks the backend to derive the zone from `provinceId`, and shows the resulting zone under the province field as a hint so the value is visible before saving. Indonesian zones follow provincial borders rather than meridians, so they cannot be guessed from coordinates; `GET /geography/provinces` carries the zone per province and `useProvinceTimezone` reads it from the same cache entry `useProvinces` already fills, costing no extra request.

One consequence to know: because the form always sends null, saving re-derives the zone from the province. A location that the backend had set to an exception zone by hand loses that override on the next edit from this form.
