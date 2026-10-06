# Hierarchy Management

Master data for job position hierarchy, supporting table, tree, and diagram visualisation modes filtered by company, search, and status.

## Structure

```
hierarchy-management/
├── api/
│   ├── create-hierarchy-management.ts
│   ├── delete-hierarchy-management.ts
│   ├── get-company-positions.ts
│   ├── get-hierarchy-management.ts
│   ├── get-hierarchy-managements-tree.ts
│   ├── get-hierarchy-managements.ts
│   └── update-hierarchy-management.ts
├── components/
│   ├── HierarchyManagementDetailDrawer.tsx
│   ├── HierarchyManagementDiagramView.tsx
│   ├── HierarchyManagementForm.tsx
│   ├── HierarchyManagementTreeView.tsx
│   └── HierarchyStoreCleanup.tsx
├── constants/
│   └── index.ts
├── hooks/
│   ├── index.ts
│   ├── use-company-positions.ts
│   ├── use-create-hierarchy-management-page.ts
│   ├── use-create-hierarchy-management.ts
│   ├── use-delete-hierarchy-management.ts
│   ├── use-edit-hierarchy-management-page.ts
│   ├── use-hierarchy-management-page.ts
│   ├── use-hierarchy-management.ts
│   ├── use-hierarchy-managements-infinite.ts
│   ├── use-hierarchy-managements-tree.ts
│   └── use-hierarchy-managements.ts
│   └── use-update-hierarchy-management.ts
├── pages/
│   ├── CreateHierarchyManagementPage.tsx
│   ├── EditHierarchyManagementPage.tsx
│   └── HierarchyManagementListPage.tsx
├── schemas/
│   └── index.ts
├── store/
│   └── index.ts
├── types/
│   └── index.ts
└── index.ts
```

## Key Files

- `api/get-hierarchy-managements.ts` — paginated list for the table view (`GET /v1/company-positions/list`)
- `api/get-company-positions.ts` — full tree data for tree/diagram views (`GET /v1/company-positions`)
- `api/get-hierarchy-managements-tree.ts` — alternative tree-structured fetch
- `api/get-hierarchy-management.ts` — single item detail (`GET /v1/company-positions/:id`)
- `api/create-hierarchy-management.ts` — create a new company position (`POST /v1/company-positions`)
- `api/update-hierarchy-management.ts` — update an existing position (`PUT /v1/company-positions/:id`)
- `api/delete-hierarchy-management.ts` — delete a position (`DELETE /v1/company-positions/:id`)
- `components/HierarchyManagementForm.tsx` — shared create/edit form (used by both create and edit pages)
- `components/HierarchyManagementDetailDrawer.tsx` — read-only detail drawer with status toggle
- `components/HierarchyManagementTreeView.tsx` — collapsible tree via `OrgTree`, with action menu per node
- `components/HierarchyManagementDiagramView.tsx` — pannable/zoomable org chart via `OrgChart`
- `components/HierarchyStoreCleanup.tsx` — unmount effect that resets domain store state
- `hooks/use-hierarchy-management-page.ts` — all list-page logic (filters, view toggle, dialogs)
- `hooks/use-create-hierarchy-management-page.ts` — create-page form submission logic
- `hooks/use-edit-hierarchy-management-page.ts` — edit-page pre-population and submission logic
- `hooks/use-hierarchy-managements-infinite.ts` — infinite-scroll query (used by async selects)
- `hooks/use-hierarchy-managements-tree.ts` — tree query for the list page tree view
- `store/index.ts` — Zustand store scoped to this domain

## Exports

- `createHierarchyManagement` — API: create a position
- `getHierarchyManagement` — API: fetch single position
- `getHierarchyManagements` — API: fetch paginated list
- `updateHierarchyManagement` — API: update a position
- `useCompanyPositions` — query hook for tree/diagram data grouped by company
- `useHierarchyManagement` — query hook for a single item
- `useHierarchyManagements` — query hook for the paginated table list
- `useHierarchyManagementsInfinite` / `UseHierarchyManagementsInfiniteOptions` — infinite-scroll query + options type
- `useHierarchyManagementsTree` — query hook for tree-structured data
- `useCreateHierarchyManagement` — mutation hook for create
- `useUpdateHierarchyManagement` — mutation hook for update
- `useDeleteHierarchyManagement` — mutation hook for delete
- `useHierarchyManagementPage` — page-level hook (list page)
- `useCreateHierarchyManagementPage` — page-level hook (create page)
- `useEditHierarchyManagementPage` — page-level hook (edit page)
- `HierarchyManagementListPage` — list page with Table / Tree / Diagram toggle
- `CreateHierarchyManagementPage` — create form page
- `EditHierarchyManagementPage` — edit form page (accepts `hierarchyManagementId` prop)
- Types and constants from `./types` and `./constants`

## Usage Example

```tsx
import {
  HierarchyManagementListPage,
  CreateHierarchyManagementPage,
  EditHierarchyManagementPage,
} from '@/domains/hierarchy-management';

// List page
export default function Page() {
  return <HierarchyManagementListPage />;
}

// Create page
export default function Page() {
  return <CreateHierarchyManagementPage />;
}

// Edit page
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditHierarchyManagementPage hierarchyManagementId={id} />;
}
```

The list page stores all filter state in URL params: `companyId`, `view` (`table` | `tree` | `diagram`), `search`, `isActive`, `page`, `perPage`, `sortBy`, `sortOrder`. Company defaults to the first entry from `/v1/companies` and is persisted in the URL.
