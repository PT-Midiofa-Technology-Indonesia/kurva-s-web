# Approval Group

Read-only list of approval groups used to configure multi-level approval flows.

## Structure

```
approval-group/
├── api/
│   └── get-approval-groups.ts      # GET /approval-groups (paginated)
├── hooks/
│   ├── use-approval-groups.ts            # React Query paginated list hook
│   ├── use-approval-groups-infinite.ts   # React Query infinite scroll hook
│   └── use-approval-group-page.ts        # Page orchestration hook (search, filter, sort, pagination)
├── pages/
│   └── ApprovalGroupListPage.tsx   # Read-only list page
├── constants/
│   └── index.ts                    # Labels and status options
├── types/
│   └── index.ts                    # ApprovalGroup, ApprovalGroupListItem types
└── index.ts                        # Public barrel exports
```

## Key Files

- `api/get-approval-groups.ts` — Fetches paginated approval groups; query params: `page`, `perPage`, `sortBy`, `sortOrder`, `search`, `isActive`
- `hooks/use-approval-groups.ts` — Paginated React Query hook for list views
- `hooks/use-approval-groups-infinite.ts` — Infinite scroll hook for select/autocomplete consumers
- `hooks/use-approval-group-page.ts` — Orchestrates search, filter, sort, and pagination state for the list page
- `pages/ApprovalGroupListPage.tsx` — Full list page rendered by `app/(protected)/master-data/approval-group/page.tsx`

## Exports

- `ApprovalGroupListPage` — list page component
- `useApprovalGroups` — paginated React Query hook
- `useApprovalGroupsInfinite` — infinite scroll React Query hook
- `useApprovalGroupPage` — page orchestration hook
- `getApprovalGroups` — raw API function
- `UseApprovalGroupsInfiniteOptions` — options type for the infinite hook
- Types and constants re-exported from `types/` and `constants/`

## Usage Example

```tsx
import { ApprovalGroupListPage } from '@/domains/approval-group';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <ApprovalGroupListPage />
    </Suspense>
  );
}
```
