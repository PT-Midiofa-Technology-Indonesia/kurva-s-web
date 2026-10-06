# group Domain

Master data for groups. Supports read and update operations with a list page, detail drawer, and edit page. No create or delete API — group records are managed externally.

## Structure

```
group/
├── api/
│   ├── get-group.ts         # GET /v1/groups/{id}
│   ├── get-groups.ts        # GET /v1/groups
│   └── update-group.ts      # PUT /v1/groups/{id}
├── components/
│   ├── GroupDetailDrawer.tsx   # Read-only detail drawer with status display
│   └── GroupForm.tsx           # Edit form component
├── constants/
│   └── index.ts             # Labels and form field configs
├── hooks/
│   ├── index.ts             # Re-exports all hooks
│   ├── use-edit-group-page.ts  # Page hook for edit page
│   ├── use-group-page.ts       # Page hook for list page
│   ├── use-group.ts            # Query: single item by id
│   ├── use-groups.ts           # Query: paginated list
│   └── use-update-group.ts     # Mutation: update
├── pages/
│   ├── EditGroupPage.tsx    # Edit form page
│   └── GroupListPage.tsx    # List with search, filter, detail drawer
├── schemas/
│   └── index.ts             # Zod edit schema
├── types/
│   └── index.ts             # Group type
└── index.ts                 # Barrel exports
```

## Key Files

- `api/get-groups.ts` — paginated list; supports `search`, `page`, `perPage`, `sortBy`, `sortOrder`
- `api/update-group.ts` — update payload and response
- `components/GroupForm.tsx` — form used in the edit page
- `components/GroupDetailDrawer.tsx` — read-only drawer opened from the list page
- `hooks/use-group-page.ts` — all list page logic (search, pagination, drawer state)
- `hooks/use-edit-group-page.ts` — edit page orchestration (prefetch, submit, redirect)

## Exports

- `GroupListPage` — list page component
- `EditGroupPage` — edit form page component
- `GroupDetailDrawer` — detail drawer component
- `GroupForm` — reusable form component
- `useGroups` — paginated list query hook
- `useGroup` — single item query hook
- `useUpdateGroup` — update mutation hook
- `useGroupPage` — list page hook
- `useEditGroupPage` — edit page hook

## Usage Example

```tsx
import { GroupListPage } from '@/domains/group';

export default function Page() {
  return <GroupListPage />;
}
```

```tsx
import { EditGroupPage } from '@/domains/group';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditGroupPage groupId={id} />;
}
```
