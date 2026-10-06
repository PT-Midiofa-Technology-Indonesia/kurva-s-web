# Project Capability

Domain for managing project capability master data — the skill or service categories that define what types of work a project can deliver.

## Structure

```
project-capability/
├── api/
│   ├── create-project-capability.ts    # POST /v1/project-capabilities
│   ├── delete-project-capability.ts    # DELETE /v1/project-capabilities/:id
│   ├── get-project-capabilities.ts     # GET /v1/project-capabilities (paginated list)
│   ├── get-project-capability.ts       # GET /v1/project-capabilities/:id
│   └── update-project-capability.ts    # PUT /v1/project-capabilities/:id
├── components/
│   ├── ProjectCapabilityDetailDrawer.tsx  # Read-only detail drawer with status toggle
│   └── ProjectCapabilityForm.tsx          # Shared create/edit form
├── constants/
│   └── index.ts                           # Labels, form field configs
├── hooks/
│   ├── use-create-project-capability-page.ts  # Create page orchestration
│   ├── use-create-project-capability.ts       # Create mutation
│   ├── use-delete-project-capability.ts       # Delete mutation
│   ├── use-edit-project-capability-page.ts    # Edit page orchestration
│   ├── use-project-capabilities-infinite.ts   # Infinite scroll query for AsyncSelect
│   ├── use-project-capabilities.ts            # Paginated list query (defines PROJECT_CAPABILITY_QUERY_KEYS)
│   ├── use-project-capability-page.ts         # List page orchestration
│   ├── use-project-capability.ts              # Single item query
│   └── use-update-project-capability.ts       # Update mutation
├── pages/
│   ├── __tests__/
│   │   ├── CreateProjectCapabilityPage.integration.test.tsx
│   │   ├── EditProjectCapabilityPage.integration.test.tsx
│   │   └── ProjectCapabilityListPage.integration.test.tsx
│   ├── CreateProjectCapabilityPage.tsx
│   ├── EditProjectCapabilityPage.tsx
│   └── ProjectCapabilityListPage.tsx
├── schemas/
│   └── index.ts                        # Zod validation schemas
├── types/
│   └── index.ts                        # ProjectCapability, ProjectCapabilityListItem
└── index.ts                            # Barrel exports
```

## Key Files

- `api/get-project-capabilities.ts` — paginated list with filters (`page`, `perPage`, `search`, `isActive`)
- `api/get-project-capability.ts` — fetch single project capability by id
- `hooks/use-project-capabilities.ts` — React Query list hook; defines `PROJECT_CAPABILITY_QUERY_KEYS`
- `hooks/use-project-capabilities-infinite.ts` — infinite-scroll hook returning `SelectOption[]` for `AsyncSelect` dropdowns; accepts `UseProjectCapabilitiesInfiniteOptions`
- `hooks/use-project-capability-page.ts` — full list-page logic (search, filter, drawer, delete)
- `hooks/use-create-project-capability-page.ts` — create-page form submission logic
- `hooks/use-edit-project-capability-page.ts` — edit-page pre-fill and submission logic
- `components/ProjectCapabilityForm.tsx` — shared form for create and edit
- `components/ProjectCapabilityDetailDrawer.tsx` — read-only detail view with status toggle
- `types/index.ts` — `ProjectCapability` (`id`, `code`, `name`, `description`, `isActive`, `createdAt`, `updatedAt`), `ProjectCapabilityListItem`

## Exports

- `getProjectCapabilities` / `getProjectCapability` / `createProjectCapability` / `updateProjectCapability` / `deleteProjectCapability` — API functions
- `useProjectCapabilities` / `useProjectCapability` — query hooks
- `PROJECT_CAPABILITY_QUERY_KEYS` — query key factory (via `use-project-capabilities.ts`)
- `useProjectCapabilitiesInfinite` / `UseProjectCapabilitiesInfiniteOptions` — infinite-scroll hook for `AsyncSelect`
- `useCreateProjectCapability` / `useUpdateProjectCapability` / `useDeleteProjectCapability` — mutation hooks
- `useProjectCapabilityPage` / `useCreateProjectCapabilityPage` / `useEditProjectCapabilityPage` — page orchestration hooks
- `ProjectCapabilityListPage` / `CreateProjectCapabilityPage` / `EditProjectCapabilityPage` — page components

## Routes

| Route | Page |
|---|---|
| `/master-data/project-capability` | `ProjectCapabilityListPage` |
| `/master-data/project-capability/create` | `CreateProjectCapabilityPage` |
| `/master-data/project-capability/:id/edit` | `EditProjectCapabilityPage` |

## Usage Example

```tsx
import { useProjectCapabilitiesInfinite } from '@/domains/project-capability';
import { AsyncSelect } from '@/shared/components/atoms';

function ProjectCapabilitySelector() {
  const { options, isLoading, hasMore, loadMore } = useProjectCapabilitiesInfinite({
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
