# Project Type Domain

Master data domain for managing project types, providing full CRUD operations with list, create, edit, and detail pages.

## Structure

```
project-type/
├── api/
│   ├── create-project-type.ts  # POST /project-types
│   ├── delete-project-type.ts  # DELETE /project-types/:id
│   ├── get-project-type.ts     # GET /project-types/:id
│   ├── get-project-types.ts    # GET /project-types (paginated + filtered)
│   └── update-project-type.ts  # PUT /project-types/:id
├── components/
│   ├── ProjectTypeDetailDrawer.tsx  # Read-only detail drawer
│   ├── ProjectTypeForm.tsx          # Reusable create/edit form (FormGenerator-based)
│   └── __tests__/
│       ├── ProjectTypeDetailDrawer.integration.test.tsx
│       └── ProjectTypeForm.integration.test.tsx
├── constants/
│   └── index.ts               # Labels, form field definitions
├── hooks/
│   ├── use-create-project-type-page.ts  # Page-level hook for create page
│   ├── use-create-project-type.ts       # Mutation: create
│   ├── use-delete-project-type.ts       # Mutation: delete
│   ├── use-edit-project-type-page.ts    # Page-level hook for edit page
│   ├── use-project-type-page.ts         # Page-level hook for list page
│   ├── use-project-type.ts              # Query: single project type by id
│   ├── use-project-types.ts             # Query: paginated list
│   └── use-update-project-type.ts       # Mutation: update
├── pages/
│   ├── CreateProjectTypePage.tsx        # Create form page
│   ├── EditProjectTypePage.tsx          # Edit form page
│   ├── ProjectTypeListPage.tsx          # Paginated list with search, filter, sort
│   └── __tests__/
│       ├── CreateProjectTypePage.integration.test.tsx
│       ├── EditProjectTypePage.integration.test.tsx
│       └── ProjectTypeListPage.integration.test.tsx
├── schemas/
│   └── index.ts               # Zod schema for project type form
├── types/
│   └── index.ts               # ProjectType, GetProjectTypesParams, etc.
└── index.ts                   # Public barrel exports
```

## Key Files

- `api/get-project-types.ts` — Paginated list with search, sort, and `isActive` filter
- `api/get-project-type.ts` — Fetch single project type by ID
- `hooks/use-project-type-page.ts` — List page logic: delete dialog, detail drawer, search, sort, pagination, filter handlers
- `hooks/use-create-project-type-page.ts` — Create page logic: form submit + navigation
- `hooks/use-edit-project-type-page.ts` — Edit page logic: prefill + form submit + navigation
- `components/ProjectTypeForm.tsx` — Shared form used by both create and edit pages
- `components/ProjectTypeDetailDrawer.tsx` — Read-only slide-over for viewing a project type

## Exports

- `ProjectTypeListPage` — Paginated list page with search, filter, sort, delete, and detail drawer
- `CreateProjectTypePage` — Create form page
- `EditProjectTypePage` — Edit form page (accepts `id` prop)
- `useProjectTypes(params?)` — Query hook for paginated list
- `useProjectType(id)` — Query hook for single item
- `useCreateProjectType()` — Mutation hook for create
- `useUpdateProjectType()` — Mutation hook for update
- `useDeleteProjectType()` — Mutation hook for delete
- `useProjectTypePage(options?)` — Page-level hook: list state, handlers for add/edit/detail/delete/search/sort/paginate
- `useCreateProjectTypePage()` — Page-level hook for create page
- `useEditProjectTypePage(id)` — Page-level hook for edit page
- `createProjectType`, `getProjectType`, `getProjectTypes`, `updateProjectType`, `deleteProjectType` — Raw API functions
- `ProjectType` — Core entity type (from `types/`)

## Usage Example

```tsx
// app/(protected)/master-data/project-type/page.tsx
import { ProjectTypeListPage } from '@/domains/project-type';

export default function Page() {
  return <ProjectTypeListPage />;
}
```

```tsx
// app/(protected)/master-data/project-type/[id]/edit/page.tsx
import { EditProjectTypePage } from '@/domains/project-type';

export default function Page({ params }: { params: { id: string } }) {
  return <EditProjectTypePage id={params.id} />;
}
```
