# cost-item-type Domain

Master data for cost item types used in project budgeting and cost tracking. Supports full CRUD with list, create, edit, and detail drawer pages.

## Structure

```
cost-item-type/
├── api/
│   ├── create-cost-item-type.ts        # POST /v1/cost-item-types
│   ├── delete-cost-item-type.ts        # DELETE /v1/cost-item-types/{id}
│   ├── get-cost-item-type.ts           # GET /v1/cost-item-types/{id}
│   ├── get-cost-item-types.ts          # GET /v1/cost-item-types
│   └── update-cost-item-type.ts        # PUT /v1/cost-item-types/{id}
├── components/
│   ├── CostItemTypeDetailDrawer.tsx    # Read-only detail drawer
│   └── CostItemTypeForm.tsx            # Shared create/edit form
├── constants/
│   └── index.ts                        # Labels and form field configs
├── hooks/
│   ├── use-cost-item-type-page.ts      # Page hook for list page
│   ├── use-cost-item-type.ts           # Query: single item by id
│   ├── use-cost-item-types.ts          # Query: paginated list
│   ├── use-create-cost-item-type-page.ts  # Page hook for create page
│   ├── use-create-cost-item-type.ts    # Mutation: create
│   ├── use-delete-cost-item-type.ts    # Mutation: delete
│   ├── use-edit-cost-item-type-page.ts # Page hook for edit page
│   └── use-update-cost-item-type.ts    # Mutation: update
├── pages/
│   ├── CostItemTypeListPage.tsx        # List with search, filter, detail drawer
│   ├── CreateCostItemTypePage.tsx      # Create form page
│   └── EditCostItemTypePage.tsx        # Edit form page
├── schemas/
│   └── index.ts                        # Zod create/edit schemas
├── types/
│   └── index.ts                        # CostItemType and related types
└── index.ts                            # Barrel exports
```

## Key Files

- `api/get-cost-item-types.ts` — paginated list with search/filter params
- `api/get-cost-item-type.ts` — single item fetch by id
- `components/CostItemTypeForm.tsx` — shared form used in create and edit pages
- `components/CostItemTypeDetailDrawer.tsx` — read-only drawer opened from the list page
- `hooks/use-cost-item-type-page.ts` — all list page logic (search, pagination, drawer state)
- `hooks/use-create-cost-item-type-page.ts` — create page orchestration
- `hooks/use-edit-cost-item-type-page.ts` — edit page orchestration
- `schemas/index.ts` — Zod schemas for create and edit forms

## Exports

- `CostItemTypeListPage` — list page component
- `CreateCostItemTypePage` — create form page component
- `EditCostItemTypePage` — edit form page component
- `CostItemTypeDetailDrawer` — detail drawer component
- `CostItemTypeForm` — reusable form component
- `useCostItemTypes` — paginated list query hook
- `useCostItemType` — single item query hook
- `useCreateCostItemType` — create mutation hook
- `useUpdateCostItemType` — update mutation hook
- `useDeleteCostItemType` — delete mutation hook
- `useCostItemTypePage` — list page hook
- `useCreateCostItemTypePage` — create page hook
- `useEditCostItemTypePage` — edit page hook

## Usage Example

```tsx
import { CostItemTypeListPage } from '@/domains/cost-item-type';

export default function Page() {
  return <CostItemTypeListPage />;
}
```
