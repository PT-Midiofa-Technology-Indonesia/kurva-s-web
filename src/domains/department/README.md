# department Domain

Master data for departments. Provides a read-only list page with search, pagination, and infinite-scroll select support for use in other domain forms.

## Structure

```
department/
├── api/
│   └── get-departments.ts          # GET /v1/departments
├── constants/
│   └── index.ts                    # Labels and column configs
├── hooks/
│   ├── use-department-page.ts      # Page hook for list page
│   ├── use-departments-infinite.ts # Infinite query for async selects
│   └── use-departments.ts          # Paginated list query
├── pages/
│   └── DepartmentListPage.tsx      # List page with search and filter
├── types/
│   └── index.ts                    # Department type
└── index.ts                        # Barrel exports
```

## Key Files

- `api/get-departments.ts` — fetches paginated department list; supports `search`, `page`, `perPage`, `sortBy`, `sortOrder`
- `hooks/use-departments.ts` — React Query hook for paginated list
- `hooks/use-departments-infinite.ts` — infinite query hook for use in `AsyncSelect` components across other domains
- `hooks/use-department-page.ts` — all list page logic (search state, pagination, query params)
- `pages/DepartmentListPage.tsx` — list page; 100% JSX, no logic

## Exports

- `DepartmentListPage` — list page component
- `useDepartments` — paginated list query hook
- `useDepartmentsInfinite` — infinite query hook for async selects
- `UseDepartmentsInfiniteOptions` — options type for `useDepartmentsInfinite`
- `useDepartmentPage` — list page hook

## Usage Example

```tsx
// Route page
import { DepartmentListPage } from '@/domains/department';

export default function Page() {
  return <DepartmentListPage />;
}
```

```tsx
// Infinite select in another domain's form
import { useDepartmentsInfinite } from '@/domains/department';

const { departments, fetchNextPage } = useDepartmentsInfinite({ search });
```
