# List Pages Pattern — Complete Reference

Every domain list/index page uses the same pattern: URL params → hook → `ListPageTemplate`. This provides bookmarkable URLs, SSR support, sorting, filtering, pagination, and search.

---

## Quick Rules

- **Always use `ListPageTemplate`** — It owns the page shell, search, filters, table
- **Domain contributes**: columns, filters, delete dialog
- **Page is 100% UI only** — All logic in a `use-<domain>-page.ts` hook
- **URL params → hook → component** — One-directional data flow
- **Delete dialogs outside template** — Siblings in the JSX tree
- **Columns defined in page** — Type-safe column definitions

---

## File Structure

```
src/domains/<domain>/pages/
└── <Domain>ListPage.tsx         # Page component

src/domains/<domain>/hooks/
└── use-<domain>-list-page.ts   # Data fetch, delete, navigation

src/domains/<domain>/constants/
└── index.ts                     # LIST_PAGE_TITLE, LABELS, etc.

src/shared/components/templates/
└── ListPageTemplate/
    ├── index.tsx               # Template component
    ├── ListPageTemplate.tsx    # Core template
    └── ...
```

---

## Step 1: Create List Page Hook

```typescript
// src/domains/<domain>/hooks/use-<domain>-list-page.ts
import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useResourceList } from './use-resource-list';
import { deleteResource } from '../api/delete-resource';
import type { ListParams } from '../api/get-resources';
import type { Resource } from '../types';

interface UseResourceListPageOptions {
  params: ListParams;
}

export function useResourceListPage({ params }: UseResourceListPageOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch list data
  const { data, isLoading, isError } = useResourceList(params);

  // Delete mutation
  const { mutate: deleteItem, isPending: isDeleting } = useMutation({
    mutationFn: deleteResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources', params] });
    },
  });

  // Navigation callbacks
  const handleAdd = useCallback(() => {
    router.push('/resources/create');
  }, [router]);

  const handleEdit = useCallback((item: Resource) => {
    router.push(`/resources/${item.id}/edit`);
  }, [router]);

  const handleDetail = useCallback((item: Resource) => {
    router.push(`/resources/${item.id}`);
  }, [router]);

  return {
    items: data?.resources ?? [],
    totalItems: data?.meta?.total ?? 0,
    totalPages: data?.meta?.lastPage ?? 1,
    isLoading,
    isError,
    deleteItem,
    isDeleting,
    handleAdd,
    handleEdit,
    handleDetail,
  };
}
```

---

## Step 2: Create List Page Component

```typescript
// src/domains/<domain>/pages/ResourceListPage.tsx
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { ListPageTemplate } from '@/shared/components/templates';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import type { BaseQueryParams } from '@/types/query-params';
import { useResourceListPage } from '../hooks/use-resource-list-page';
import type { Resource } from '../types';
import { ResourceActionsCell } from '../components/ResourceActionsCell';
import { RESOURCE_LIST_LABELS, RESOURCE_COLUMNS } from '../constants';

interface ResourceListUrlParams extends BaseQueryParams {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function ResourceListPage() {
  // 1. URL state
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<ResourceListUrlParams>();

  // 2. Convert URL strings → API types
  const params = useMemo(() => ({
    page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
    perPage: queryParams.perPage ? parseInt(queryParams.perPage, 10) : 10,
    sortBy: queryParams.sortBy ?? 'name',
    sortOrder: queryParams.sortOrder ?? 'asc',
    search: queryParams.search,
    status: queryParams.status === 'active' ? true
          : queryParams.status === 'inactive' ? false
          : undefined,
  }), [queryParams.page, queryParams.perPage, queryParams.sortBy,
       queryParams.sortOrder, queryParams.search, queryParams.status]);

  // 3. Data hook
  const { items, totalItems, totalPages, isLoading, isError, handleAdd, handleEdit, deleteItem, isDeleting }
    = useResourceListPage({ params });

  // 4. Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteItem(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  // 5. Columns
  const columns: ColumnDef<Resource>[] = useMemo(() => [
    { accessorKey: 'name', header: RESOURCE_COLUMNS.NAME, size: 200 },
    { accessorKey: 'status', header: RESOURCE_COLUMNS.STATUS, enableSorting: false },
    { accessorKey: 'createdAt', header: RESOURCE_COLUMNS.CREATED_AT },
    {
      id: 'actions',
      header: RESOURCE_COLUMNS.ACTIONS,
      enableSorting: false,
      enableHiding: false,
      size: 80,
      cell: ({ row }) => (
        <ResourceActionsCell
          row={row}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
        />
      ),
    },
  ], [handleEdit]);

  // 6. Filters
  const statusFilter = (
    <select
      value={queryParams.status ?? 'all'}
      onChange={(e) => updateQueryParam('status', e.target.value === 'all' ? undefined : e.target.value)}
    >
      <option value="all">{RESOURCE_LIST_LABELS.FILTER_ALL}</option>
      <option value="active">{RESOURCE_LIST_LABELS.FILTER_ACTIVE}</option>
      <option value="inactive">{RESOURCE_LIST_LABELS.FILTER_INACTIVE}</option>
    </select>
  );

  return (
    <>
      <ListPageTemplate<Resource>
        title={RESOURCE_LIST_LABELS.PAGE_TITLE}
        onAdd={handleAdd}
        addLabel={RESOURCE_LIST_LABELS.ADD_BUTTON}
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
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={RESOURCE_LIST_LABELS.DELETE_CONFIRM_TITLE}
        description={RESOURCE_LIST_LABELS.DELETE_CONFIRM_DESC}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  );
}
```

---

## Step 3: Create Actions Cell Component

```typescript
// src/domains/<domain>/components/ResourceActionsCell.tsx
'use client';

import { Row } from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { Resource } from '../types';
import { RESOURCE_LIST_LABELS } from '../constants';

interface ResourceActionsCellProps {
  row: Row<Resource>;
  onEdit: (item: Resource) => void;
  onDelete: (item: Resource) => void;
}

export function ResourceActionsCell({ row, onEdit, onDelete }: ResourceActionsCellProps) {
  const item = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center">
        ⋮
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(item)}>
          {RESOURCE_LIST_LABELS.ACTION_EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(item)} className="text-red-600">
          {RESOURCE_LIST_LABELS.ACTION_DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## Step 4: Constants

```typescript
// src/domains/<domain>/constants/index.ts
export const RESOURCE_LIST_LABELS = {
  PAGE_TITLE: 'Resources',
  ADD_BUTTON: 'Add Resource',
  FILTER_ALL: 'All Status',
  FILTER_ACTIVE: 'Active',
  FILTER_INACTIVE: 'Inactive',
  ACTION_EDIT: 'Edit',
  ACTION_DELETE: 'Delete',
  ACTION_DETAIL: 'View Details',
  DELETE_CONFIRM_TITLE: 'Delete Resource?',
  DELETE_CONFIRM_DESC: 'This action cannot be undone.',
  DELETE_SUCCESS: 'Resource deleted successfully',
  DELETE_ERROR: 'Failed to delete resource',
};

export const RESOURCE_COLUMNS = {
  NAME: 'Name',
  STATUS: 'Status',
  CREATED_AT: 'Created',
  ACTIONS: 'Actions',
};
```

---

## ListPageTemplate Props

| Prop | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | Page heading |
| `data` | T[] | ✅ | Array of items to display |
| `columns` | ColumnDef<T>[] | ✅ | TanStack column definitions |
| `onAdd` | () => void | — | Shows "Add" button when provided |
| `addLabel` | string | — | Default: "Add" |
| `isLoading` | boolean | — | Shows spinner, hides table |
| `isError` | boolean | — | Shows error message |
| `search` | string \| undefined | — | Current search value |
| `onSearchChange` | (v: string \| undefined) => void | — | Search input change handler |
| `filters` | ReactNode | — | Any custom filter controls |
| `sortBy` | string | — | Current sort column |
| `sortOrder` | 'asc' \| 'desc' | — | Current sort direction |
| `onSort` | (by: string, order: 'asc' \| 'desc') => void | — | Sort change handler |
| `page` | number | — | Current page (default 1) |
| `perPage` | number | — | Items per page (default 10) |
| `totalItems` | number | — | Total items for pagination |
| `totalPages` | number | — | Total pages for pagination |
| `onPaginationChange` | (page: number, perPage: number) => void | — | Pagination change handler |
| `enableRowSelection` | boolean | — | Default: false |
| `pageSizeOptions` | number[] | — | Default: [10, 20, 30, 50, 100] |

---

## Best Practices Checklist

- [ ] Page uses ListPageTemplate (never custom shells)
- [ ] All data fetch logic in hook (page is 100% UI)
- [ ] URL params converted to API types in useMemo
- [ ] Columns defined in page component (not extracted)
- [ ] Delete dialogs outside ListPageTemplate (as siblings)
- [ ] listPageTemplate receives params.sortBy/.sortOrder (with defaults, not queryParams)
- [ ] All labels in constants (never hardcoded)
- [ ] Actions cell uses DropdownMenu pattern
- [ ] Search cleared by passing undefined (not empty string)
- [ ] Query invalidation on delete success
- [ ] Pagination uses setQueryParams for batch updates
- [ ] Filters prop accepts any ReactNode

---

## Avoid These Patterns

❌ **Custom page shell** — Use ListPageTemplate

❌ **Multiple list components** — One page, one template

❌ **Search input in page** — Handled by ListPageTemplate

❌ **Table header in page** — Handled by TanStack columns

❌ **Hardcoded labels** — Use constants

❌ **Sorting logic in page** — Pass to ListPageTemplate, it handles conversion

❌ **Fresh inline object to page hooks** — Always wrap in `useMemo`

❌ **`'use client'` on any `page.tsx` file** — All `app/**/*.page.tsx` must be Server Components

❌ **Shared components using hooks without `'use client'`** — Any `src/shared/components/**/*.tsx` that uses `useState`, `useEffect`, `forwardRef`, browser APIs, or third-party client libs (`@dnd-kit`) must have `'use client'`

---

## Tabbed Pages

When a page has tabs that conditionally render different content based on URL params (e.g., `?tab=skill`), follow this structure to avoid hydration mismatches:

### File Structure

```
app/(protected)/master-data/skill-master/page.tsx   # Server Component — NO 'use client'
src/domains/skill-master/pages/SkillMasterPage.tsx    # Client Component — tabs + useSearchParams
src/domains/skill-master/pages/SkillLevelListContent.tsx    # Tab content (Client Component)
src/domains/skill-master/pages/SkillCategoryListContent.tsx  # Tab content (Client Component)
src/domains/skill-master/pages/SkillCatalogListContent.tsx    # Tab content (Client Component)
```

### Server Component Page (Correct)

```tsx
// app/(protected)/master-data/skill-master/page.tsx
import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { SkillMasterPage } from '@/domains/skill-master';

// NO 'use client' — all page.tsx files MUST be Server Components
export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <SkillMasterPage />
    </Suspense>
  );
}
```

### Client Component with Tabs

```tsx
// src/domains/skill-master/pages/SkillMasterPage.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { SKILL_MASTER_TABS } from '../constants';
import { SkillLevelListContent } from './SkillLevelListContent';
import { SkillCategoryListContent } from './SkillCategoryListContent';
import { SkillCatalogListContent } from './SkillCatalogListContent';

export function SkillMasterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { queryParams } = useQueryParams();
  const activeTab = queryParams.tab ?? SKILL_MASTER_TABS.SKILL_LEVEL;

  const handleTabChange = (tab: string) => {
    const newTab = tab === SKILL_MASTER_TABS.SKILL_LEVEL ? undefined : tab;
    const url = newTab ? `${pathname}?tab=${newTab}` : pathname;
    router.replace(url, { scroll: false });
  };

  return (
    <div>
      <nav>
        <button onClick={() => handleTabChange(SKILL_MASTER_TABS.SKILL_LEVEL)}>
          Skill Level
        </button>
        <button onClick={() => handleTabChange(SKILL_MASTER_TABS.SKILL_CATEGORY)}>
          Category
        </button>
        <button onClick={() => handleTabChange(SKILL_MASTER_TABS.SKILL)}>
          Skill
        </button>
      </nav>

      {activeTab === SKILL_MASTER_TABS.SKILL_LEVEL && <SkillLevelListContent />}
      {activeTab === SKILL_MASTER_TABS.SKILL_CATEGORY && <SkillCategoryListContent />}
      {activeTab === SKILL_MASTER_TABS.SKILL && <SkillCatalogListContent />}
    </div>
  );
}
```

### Tab Content Component (Stable Options)

```tsx
// src/domains/skill-master/pages/SkillLevelListContent.tsx
'use client';

import { useMemo } from 'react';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { useSkillLevelPage } from '../hooks/use-skill-level-page';

export function SkillLevelListContent() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams();

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'name',
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
    }),
    [queryParams]
  );

  // ✅ WRAP OPTIONS IN useMemo — prevents constant callback recreations
  const pageOptions = useMemo(
    () => ({
      params,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [params, updateQueryParam, setQueryParams]
  );

  const {
    skillLevels,
    totalItems,
    isLoading,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  } = useSkillLevelPage(pageOptions);

  // ... render list
}
```

### Why This Matters

| Pattern | Server Render | Client Hydrate | Result |
|---|---|---|---|
| `'use client'` + `Suspense` | Pre-renders `fallback` only | Renders actual component | ✅ No mismatch |
| `'use client'` (no Suspense) | Pre-renders with empty `useSearchParams` | Re-hydrates with real params | ❌ Hydration mismatch |
| No `Suspense` at all | Attempts SSR of client component | May mismatch | ❌ Hydration mismatch |

**Rule:** All `page.tsx` files in `app/` must be Server Components. Client Components (including those using `useSearchParams`) should be imported and wrapped in `Suspense`.

---

## See Also

- [[QUERY_PARAMS_PATTERN.md]] — URL params handling and conversion
- [[API_PATTERN.md]] — API functions that List pages call
- [[ERROR_HANDLING_PATTERN.md]] — Error display in lists
