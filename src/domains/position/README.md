# Position

Domain for managing job position master data — hierarchical job titles with levels used in HR and organizational structures.

## Structure

```
position/
├── api/
│   ├── create-position.ts    # POST /v1/positions
│   ├── delete-position.ts    # DELETE /v1/positions/:id
│   ├── get-position.ts       # GET /v1/positions/:id
│   ├── get-positions.ts      # GET /v1/positions (paginated list)
│   └── update-position.ts    # PUT /v1/positions/:id
├── components/
│   ├── PositionDetailDrawer.tsx  # Read-only detail drawer with status toggle
│   └── PositionForm.tsx          # Shared create/edit form
├── constants/
│   └── index.ts                  # Labels, form field configs
├── hooks/
│   ├── use-create-position-page.ts  # Create page orchestration
│   ├── use-create-position.ts       # Create mutation
│   ├── use-delete-position.ts       # Delete mutation
│   ├── use-edit-position-page.ts    # Edit page orchestration
│   ├── use-position-page.ts         # List page orchestration
│   ├── use-position.ts              # Single item query
│   ├── use-positions-infinite.ts    # Infinite scroll query for AsyncSelect
│   ├── use-positions.ts             # Paginated list query (defines POSITION_QUERY_KEYS)
│   └── use-update-position.ts       # Update mutation
├── pages/
│   ├── __tests__/
│   │   ├── CreatePositionPage.integration.test.tsx
│   │   ├── EditPositionPage.integration.test.tsx
│   │   └── PositionListPage.integration.test.tsx
│   ├── CreatePositionPage.tsx
│   ├── EditPositionPage.tsx
│   └── PositionListPage.tsx
├── schemas/
│   └── index.ts              # Zod validation schemas
├── types/
│   └── index.ts              # Position, PositionListItem
└── index.ts                  # Barrel exports
```

## Key Files

- `api/get-positions.ts` — paginated list with filters (`page`, `perPage`, `search`, `isActive`)
- `api/get-position.ts` — fetch single position by id
- `hooks/use-positions.ts` — React Query list hook; defines `POSITION_QUERY_KEYS`
- `hooks/use-positions-infinite.ts` — infinite-scroll hook returning `SelectOption[]` for use in `AsyncSelect` dropdowns; accepts `UsePositionsInfiniteOptions`
- `hooks/use-position-page.ts` — full list-page logic (search, filter, drawer, delete)
- `hooks/use-create-position-page.ts` — create-page form submission logic
- `hooks/use-edit-position-page.ts` — edit-page pre-fill and submission logic
- `components/PositionForm.tsx` — shared form for create and edit
- `components/PositionDetailDrawer.tsx` — read-only detail view with status toggle
- `types/index.ts` — `Position` (`id`, `code`, `name`, `level: number`, `description`, `isActive`, `skillCatalogIds`, `createdAt`, `updatedAt`), `PositionListItem`

## Exports

- `getPositions` / `getPosition` / `createPosition` / `updatePosition` / `deletePosition` — API functions
- `usePositions` / `usePosition` — query hooks
- `POSITION_QUERY_KEYS` — query key factory
- `usePositionsInfinite` / `UsePositionsInfiniteOptions` — infinite-scroll hook for `AsyncSelect`
- `useCreatePosition` / `useUpdatePosition` / `useDeletePosition` — mutation hooks
- `usePositionPage` / `useCreatePositionPage` / `useEditPositionPage` — page orchestration hooks
- `PositionForm` includes infinite-scroll multi-select for `skillCatalogIds` via `useSkillCatalogsInfinite`
- `PositionForm` / `PositionDetailDrawer` — UI components
- `PositionListPage` / `CreatePositionPage` / `EditPositionPage` — page components
- `Position` / `PositionListItem` — TypeScript types

## Routes

| Route | Page |
|---|---|
| `/master-data/position` | `PositionListPage` |
| `/master-data/position/create` | `CreatePositionPage` |
| `/master-data/position/:id/edit` | `EditPositionPage` |

## Usage Example

```tsx
import { usePositionsInfinite } from '@/domains/position';
import { AsyncSelect } from '@/shared/components/atoms';

function PositionSelector() {
  const { options, isLoading, hasMore, loadMore } = usePositionsInfinite({
    isActive: true,
    perPage: 10,
  });

  return (
    <AsyncSelect
      options={options}
      isLoading={isLoading}
      hasMore={hasMore}
      onScrollToBottom={loadMore}
    />
  );
}
```
