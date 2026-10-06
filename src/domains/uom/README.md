# UoM

Manages Unit of Measurement (UoM) master data with full CRUD operations including list, create, edit, and detail drawer with status toggle.

## Structure

```
uom/
├── api/
│   ├── get-uoms.ts          # GET /uoms (paginated list)
│   ├── get-uom.ts           # GET /uoms/:id
│   ├── get-uom-groups.ts    # GET /uom-groups (group options)
│   ├── create-uom.ts        # POST /uoms
│   ├── update-uom.ts        # PUT /uoms/:id
│   └── delete-uom.ts        # DELETE /uoms/:id
├── components/
│   ├── UomForm.tsx          # Create/edit form
│   └── UomDetailDrawer.tsx  # Detail drawer with status toggle
├── hooks/
│   ├── use-uoms.ts              # useQuery for paginated list
│   ├── use-uoms-infinite.ts     # Infinite-scroll query (AsyncSelect)
│   ├── use-uom.ts               # useQuery for single UoM
│   ├── use-create-uom.ts        # useMutation for create
│   ├── use-update-uom.ts        # useMutation for update
│   ├── use-delete-uom.ts        # useMutation for delete
│   ├── use-uom-page.ts          # Page-level hook for list page
│   ├── use-create-uom-page.ts   # Page-level hook for create page
│   └── use-edit-uom-page.ts     # Page-level hook for edit page
├── pages/
│   ├── UomListPage.tsx      # List page with search, filter, pagination
│   ├── CreateUomPage.tsx    # Create UoM page
│   └── EditUomPage.tsx      # Edit UoM page
├── schemas/
│   └── index.ts             # Zod validation schemas
├── types/
│   └── index.ts             # Uom, UomListItem types
├── constants/
│   └── index.ts             # UOM_LABELS, PLACEHOLDERS, form field configs
└── index.ts                 # Public barrel exports
```

## Key Files

- `api/get-uoms.ts` — Paginated list with `search`, `sortBy`, `sortOrder`, `isActive`, `group` params
- `api/get-uom-groups.ts` — Fetches available UoM group options (length, weight, volume, etc.)
- `hooks/use-uoms-infinite.ts` — Infinite-scroll hook used by `AsyncSelect` in other domains
- `hooks/use-uom-page.ts` — Orchestrates list page state: search, filters, pagination, drawer open/close, delete confirm

## Exports

- `UomListPage` — List page with search, status filter, pagination, and CRUD actions
- `CreateUomPage` — Create UoM form page
- `EditUomPage` — Edit UoM form page
- `UomForm` — Reusable create/edit form component
- `UomDetailDrawer` — Read-only detail drawer with inline status toggle
- `useUoms` — Paginated list query hook
- `useUomsInfinite` — Infinite-scroll query hook (for `AsyncSelect`)
- `useUom` — Single-item query hook
- `useCreateUom` / `useUpdateUom` / `useDeleteUom` — Mutation hooks
- `useUomPage` / `useCreateUomPage` / `useEditUomPage` — Page-level orchestration hooks
- `UOM_LABELS` / `PLACEHOLDERS` — UI label and placeholder constants
- `Uom` / `UomListItem` — TypeScript types
- `GetUomsParams` / `GetUomsResponse` / `GetUomResponse` — API param and response types
- `CreateUomPayload` / `UpdateUomPayload` — Mutation payload types

## Usage Example

```tsx
import { UomListPage } from '@/domains/uom';

// app/(protected)/master-data/uom/page.tsx
export default function Page() {
  return <UomListPage />;
}
```

```tsx
// Infinite scroll for AsyncSelect in another domain
import { useUomsInfinite } from '@/domains/uom';

const { options, hasMore, loadMore, isLoading } = useUomsInfinite({ search });
```
