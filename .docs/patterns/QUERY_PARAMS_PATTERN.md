# Query Parameters Pattern — Complete Reference

All list pages use URL query parameters for state management (filters, search, sort, pagination). This enables bookmarkable URLs, SSR hydration, and proper browser history.

---

## Quick Rules

- **URL params are always strings** — even for booleans and numbers
- **Query param names in camelCase** — `sortBy`, `sortOrder`, `perPage`, not `sort_by`
- **Standard params**: `page`, `perPage`, `sortBy`, `sortOrder`, `search`
- **Domain-specific params** as needed: `status`, `dateFrom`, `dateTo`, etc.
- **Type URL params separately from API params** — URL is strings, API is typed
- **Convert in useMemo** — Keep URL strings separate from API-ready types

---

## Standard Query Parameters

| Name | Type | Example | Usage |
|---|---|---|---|
| `page` | number | `?page=2` | Current page (1-based) |
| `perPage` | number | `?perPage=20` | Items per page |
| `sortBy` | string | `?sortBy=name` | Sort column name |
| `sortOrder` | string | `?sortOrder=asc` | `asc` or `desc` |
| `search` | string | `?search=john` | Free-text search |

---

## Step 1: Define URL Params Type (strings only)

```typescript
// src/domains/<domain>/types/query.ts
import type { BaseQueryParams } from '@/types/query-params';

/**
 * URL query parameters — ALL strings
 * These come directly from the URL bar
 */
export interface MyListUrlParams extends BaseQueryParams {
  status?: string;        // string in URL
  dateFrom?: string;      // ISO date string
  dateTo?: string;        // ISO date string
}
```

---

## Step 2: Use useQueryParams Hook

```typescript
// src/domains/<domain>/pages/MyListPage.tsx
import { useQueryParams } from '@/shared/hooks/use-query-params';
import type { MyListUrlParams } from '../types/query';

export function MyListPage() {
  // Hook handles URL sync automatically
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<MyListUrlParams>();

  // queryParams: { page: "1", perPage: "10", search: "john", status: "active" }
  // ...
}
```

---

## Step 3: Convert URL Strings to API Types

```typescript
// In page component
const params = useMemo(() => ({
  // URL params come in as strings or undefined
  page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
  perPage: queryParams.perPage ? parseInt(queryParams.perPage, 10) : 10,
  sortBy: queryParams.sortBy ?? 'name',        // default sort column
  sortOrder: queryParams.sortOrder ?? 'asc',   // default sort direction
  search: queryParams.search,
  // Boolean conversion
  status: queryParams.status === 'active' ? true
        : queryParams.status === 'inactive' ? false
        : undefined,
  // Date range
  dateFrom: queryParams.dateFrom ? new Date(queryParams.dateFrom) : undefined,
  dateTo: queryParams.dateTo ? new Date(queryParams.dateTo) : undefined,
}), [queryParams]);

// Now `params` has proper types for API call
const { items } = useMyResources(params);
```

---

## Complete List Page Example

```typescript
// src/domains/role-permissions/pages/RolePermissionsPage.tsx
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { ListPageTemplate } from '@/shared/components/templates';
import type { RolePermission } from '../types';
import { useRolePermissionsPage } from '../hooks/use-role-permissions-page';

interface RolePermissionsUrlParams {
  page?: string;
  perPage?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;  // 'active' or 'inactive'
}

export function RolePermissionsPage() {
  // 1. Get URL params
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<RolePermissionsUrlParams>();

  // 2. Convert URL strings → API types
  const params = useMemo(() => ({
    page: queryParams.page ? parseInt(queryParams.page) : 1,
    perPage: queryParams.perPage ? parseInt(queryParams.perPage) : 10,
    sortBy: queryParams.sortBy ?? 'name',
    sortOrder: queryParams.sortOrder ?? 'asc',
    search: queryParams.search,
    status: queryParams.status === 'active' ? true
          : queryParams.status === 'inactive' ? false
          : undefined,
  }), [queryParams.page, queryParams.perPage, queryParams.sortBy, 
       queryParams.sortOrder, queryParams.search, queryParams.status]);

  // 3. Fetch data with converted params
  const { items, totalItems, totalPages, isLoading, isError } = 
    useRolePermissionsPage({ params });

  // 4. Delete handling
  const [deleteTarget, setDeleteTarget] = useState<RolePermission | null>(null);
  const { mutate: deleteRole } = useDeleteRole();
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteRole(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        // List will re-fetch via query invalidation
      },
    });
  };

  // 5. Columns
  const columns: ColumnDef<RolePermission>[] = useMemo(() => [
    { accessorKey: 'name', header: 'Name', size: 200 },
    { accessorKey: 'status', header: 'Status', enableSorting: false },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableHiding: false,
      size: 80,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger>⋮</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteTarget(row.original)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

  // 6. Status filter
  const statusFilter = (
    <select 
      value={queryParams.status ?? 'all'}
      onChange={(e) => updateQueryParam('status', e.target.value === 'all' ? undefined : e.target.value)}
    >
      <option value="all">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  );

  return (
    <>
      <ListPageTemplate<RolePermission>
        title="Role & Permissions"
        onAdd={() => navigateTo('/roles/create')}
        addLabel="Add Role"
        data={items}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        search={queryParams.search}
        onSearchChange={(v) => updateQueryParam('search', v)}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={(by, order) => setQueryParams({ sortBy: by, sortOrder: order })}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={(p, pp) => setQueryParams({ page: p, perPage: pp })}
        filters={statusFilter}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        variant="danger"
        title="Delete Role"
        description="This action cannot be undone."
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
```

---

## useQueryParams Hook

The hook automatically syncs component state with URL:

```typescript
// From @/shared/hooks/use-query-params
const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<MyUrlParams>();

// queryParams: current URL params (always strings or undefined)
console.log(queryParams);
// { page: "1", search: "john" }

// Update single param
updateQueryParam('search', 'jane');
// URL becomes: ?page=1&search=jane

// Update multiple params at once
setQueryParams({ page: 1, sortBy: 'name', sortOrder: 'asc' });
// URL becomes: ?page=1&sortBy=name&sortOrder=asc

// Clear a param by passing undefined
updateQueryParam('search', undefined);
// URL becomes: ?page=1
```

---

## API Parameter Types (typed)

After converting from URL strings, API functions expect proper types:

```typescript
// API function signature (expects typed params)
export async function getResources(params: ListParams): Promise<{ resources; meta }> {
  // params.page is a number (not string)
  // params.perPage is a number
  // params.status is boolean | undefined
  // ...
}

interface ListParams {
  page: number;
  perPage: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
  status?: boolean;  // typed, not string
}
```

---

## Date Range Parameters

For date filters, use `After`/`Before` or `From`/`To` suffixes:

```typescript
// URL params (strings)
interface DateRangeUrlParams {
  dateFrom?: string;    // ISO date string
  dateTo?: string;      // ISO date string
}

// Convert in useMemo
const params = useMemo(() => ({
  dateFrom: queryParams.dateFrom ? new Date(queryParams.dateFrom) : undefined,
  dateTo: queryParams.dateTo ? new Date(queryParams.dateTo) : undefined,
}), [queryParams.dateFrom, queryParams.dateTo]);

// Pass to API
const { items } = useResources({
  ...otherParams,
  createdAfter: params.dateFrom,
  createdBefore: params.dateTo,
});
```

---

## Multi-Value Parameters

For filters with multiple selections, use comma-separated values:

```typescript
// URL: ?tags=admin,user,guest
// Parse: tags.split(',')
const tags = queryParams.tags?.split(',') ?? [];

// Update: pass array
updateQueryParam('tags', ['admin', 'user'].join(','));
```

---

## Best Practices Checklist

- [ ] URL params defined as separate type with string values
- [ ] API params defined as separate type with proper types
- [ ] Conversion in useMemo with defaults
- [ ] useQueryParams hook used for URL sync
- [ ] updateQueryParam for single changes
- [ ] setQueryParams for batch updates
- [ ] Undefined passed to clear params (not empty string)
- [ ] Page defaults to 1, perPage defaults to 10
- [ ] Sort defaults set in useMemo
- [ ] Boolean/enum values converted from string
- [ ] Date ranges with ISO strings in URL
- [ ] ListPageTemplate passes params.sortBy/sortOrder (not queryParams)
- [ ] Exactly one URL-state owner per page/tab flow (`useQueryParams`); avoid duplicate `useSearchParams()` fallbacks for same key
- [ ] Query-bound inputs/selects are controlled with `value`, not `defaultValue`
- [ ] Default runtime fallback values are derived in render/useMemo, not normalized back into URL in mount `useEffect`
- [ ] Tab changes preserve unrelated query params by mutating current `URLSearchParams`, not rebuilding URL from only `?tab=...`

---

## Avoid These Patterns

❌ **Mixing URL and API types**:
```ts
// Wrong: passing string to API that expects number
const { items } = useResources({ page: queryParams.page });
```

❌ **Manual URL manipulation**:
```ts
// Use useQueryParams instead
window.location.href = `?page=2&search=john`;
```

❌ **Empty string instead of undefined**:
```ts
// Wrong
updateQueryParam('search', '');

// Right
updateQueryParam('search', undefined);
```

❌ **Duplicate readers for same query key**:
```ts
// Wrong: two sources of truth for `tab`
const searchParams = useSearchParams();
const { queryParams } = useQueryParams<MyUrlParams>();
const activeTab = queryParams.tab ?? searchParams.get('tab') ?? 'overview';
```

✅ **Single URL-state owner**:
```ts
const { queryParams } = useQueryParams<MyUrlParams>();
const activeTab = queryParams.tab ?? 'overview';
```

❌ **Normalizing fallback into URL after first render**:
```ts
const companyId = queryParams.companyId ?? companyOptions[0]?.value;

useEffect(() => {
  if (!queryParams.companyId && companyId) {
    updateQueryParam('companyId', companyId);
  }
}, [companyId, queryParams.companyId, updateQueryParam]);
```

✅ **Use runtime fallback without mount-time URL write**:
```ts
const companyId =
  typeof queryParams.companyId === 'string'
    ? queryParams.companyId
    : companyOptions[0]?.value;
```

❌ **Query-bound select using `defaultValue`**:
```tsx
<AsyncSelect defaultValue={queryParams.status ?? undefined} onChange={handleStatusChange} />
```

✅ **Query-bound select must be controlled**:
```tsx
<AsyncSelect value={queryParams.status ?? null} onChange={handleStatusChange} />
```

❌ **Tab change drops unrelated query params**:
```ts
router.replace(`${pathname}?tab=${tab}`, { scroll: false });
```

✅ **Preserve existing query params**:
```ts
const params = new URLSearchParams(searchParams.toString());
params.set('tab', tab);
router.replace(`${pathname}?${params.toString()}`, { scroll: false });
```

---

## See Also

- [[LIST_PAGES_PATTERN.md]] — Full list page implementation with ListPageTemplate
- [[API_PATTERN.md]] — API functions that accept these typed parameters
