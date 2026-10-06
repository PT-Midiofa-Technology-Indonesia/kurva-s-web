# Job Item Type

Master data for job item types, providing full CRUD (list, create, edit, detail, delete) with search, pagination, and status filtering.

## Structure

```
job-item-type/
├── api/
│   ├── create-job-item-type.ts
│   ├── delete-job-item-type.ts
│   ├── get-job-item-type.ts
│   ├── get-job-item-types.ts
│   └── update-job-item-type.ts
├── components/
│   ├── JobItemTypeDetailDrawer.tsx
│   └── JobItemTypeForm.tsx
├── constants/
│   └── index.ts
├── hooks/
│   ├── use-create-job-item-type-page.ts
│   ├── use-create-job-item-type.ts
│   ├── use-delete-job-item-type.ts
│   ├── use-edit-job-item-type-page.ts
│   ├── use-job-item-type-page.ts
│   ├── use-job-item-type.ts
│   ├── use-job-item-types.ts
│   └── use-update-job-item-type.ts
├── pages/
│   ├── CreateJobItemTypePage.tsx
│   ├── EditJobItemTypePage.tsx
│   └── JobItemTypeListPage.tsx
├── schemas/
│   └── index.ts
├── types/
│   └── index.ts
└── index.ts
```

## Key Files

- `api/get-job-item-types.ts` — fetch paginated list (`GET /v1/job-item-types`)
- `api/get-job-item-type.ts` — fetch single item by id (`GET /v1/job-item-types/:id`)
- `api/create-job-item-type.ts` — create a new job item type (`POST /v1/job-item-types`)
- `api/update-job-item-type.ts` — update an existing job item type (`PUT /v1/job-item-types/:id`)
- `api/delete-job-item-type.ts` — delete a job item type (`DELETE /v1/job-item-types/:id`)
- `components/JobItemTypeForm.tsx` — shared create/edit form (used by both create and edit pages)
- `components/JobItemTypeDetailDrawer.tsx` — read-only detail drawer with status toggle
- `hooks/use-job-item-type-page.ts` — all list-page logic (filters, pagination, dialogs)
- `hooks/use-create-job-item-type-page.ts` — create-page form submission logic
- `hooks/use-edit-job-item-type-page.ts` — edit-page pre-population and submission logic

## Exports

- `createJobItemType`, `deleteJobItemType`, `getJobItemTypes`, `updateJobItemType` — API functions
- `JobItemTypeDetailDrawer`, `JobItemTypeForm` — UI components
- `useCreateJobItemType` — mutation hook for create
- `useCreateJobItemTypePage` — page-level hook for create page
- `useDeleteJobItemType` — mutation hook for delete
- `useEditJobItemTypePage` — page-level hook for edit page
- `useJobItemType` — query hook for single item
- `useJobItemTypePage` — page-level hook for list page
- `useJobItemTypes` — query hook for paginated list
- `useUpdateJobItemType` — mutation hook for update
- `CreateJobItemTypePage`, `EditJobItemTypePage`, `JobItemTypeListPage` — page components
- Types and constants from `./types` and `./constants`

## Usage Example

```tsx
import {
  JobItemTypeListPage,
  CreateJobItemTypePage,
  EditJobItemTypePage,
} from '@/domains/job-item-type';

// List page
export default function Page() {
  return <JobItemTypeListPage />;
}

// Create page
export default function Page() {
  return <CreateJobItemTypePage />;
}

// Edit page
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditJobItemTypePage jobItemTypeId={id} />;
}
```
