# Users

User management and administration — create, view, edit, and manage user accounts with role and employee associations.

## Structure

```
users/
├── api/
│   ├── get-users.ts              # GET /users (paginated list)
│   ├── get-user.ts               # GET /users/:id
│   ├── create-user.ts            # POST /users
│   ├── update-user.ts            # PUT /users/:id
│   ├── update-user-status.ts     # PATCH /users/:id/status
│   └── delete-user.ts            # DELETE /users/:id
├── components/
│   └── UserForm.tsx              # Shared create/edit form component
├── hooks/
│   ├── use-users.ts                  # useQuery for paginated list
│   ├── use-user.ts                   # useQuery for single user
│   ├── use-create-user.ts            # useMutation for create
│   ├── use-update-user.ts            # useMutation for update
│   ├── use-update-user-status.ts     # useMutation for status toggle
│   ├── use-delete-user.ts            # useMutation for delete
│   ├── use-employees-infinite.ts     # Infinite-scroll hook for employee AsyncSelect
│   ├── use-roles-infinite.ts         # Infinite-scroll hook for role AsyncSelect
│   ├── use-user-management-page.ts   # Page-level hook for list page
│   ├── use-create-user-page.ts       # Page-level hook for create page
│   ├── use-edit-user-page.ts         # Page-level hook for edit page
│   └── use-detail-user-page.ts       # Page-level hook for detail page
├── mocks/
│   └── options.ts                    # Mock select options for development
├── pages/
│   ├── UserManagementPage.tsx    # List page with search, filter, pagination
│   ├── CreateUserPage.tsx        # Create user form page
│   ├── EditUserPage.tsx          # Edit user form page
│   └── DetailUserPage.tsx        # Read-only detail page
├── schemas/
│   └── user.schema.ts            # Zod validation schemas
├── types/
│   └── index.ts                  # User, UserListItem types
├── constants/
│   └── index.ts                  # USER_LABELS, form field configs
└── index.ts                      # Public barrel exports
```

## Key Files

- `api/update-user-status.ts` — PATCH endpoint for toggling a user's active/inactive status
- `hooks/use-employees-infinite.ts` — Fetches employees from the `manpower` domain for the employee `AsyncSelect` on the user form
- `hooks/use-roles-infinite.ts` — Fetches roles for the role `AsyncSelect` on the user form
- `hooks/use-edit-user-page.ts` — Orchestrates edit page: loads existing user data, shows confirm dialog before saving, handles server field errors

## Exports

- `UserManagementPage` — List page with search, pagination, status filter, and delete
- `CreateUserPage` — Create user form page
- `EditUserPage` — Edit user form page (loads existing data, confirm-before-save dialog)
- `DetailUserPage` — Read-only user detail page
- `useUsers` / `useUser` — List and single-item query hooks
- `useCreateUser` / `useDeleteUser` — Mutation hooks
- `useUserManagementPage` — Page-level hook for list (search, pagination, delete confirm)
- `useCreateUserPage` — Page-level hook for create form
- `useEditUserPage` — Page-level hook for edit form
- `useDetailUserPage` — Page-level hook for detail view
- `USER_LABELS` — UI label constants
- `User` / `UserListItem` — TypeScript types
- `CreateUserPayload` — Mutation payload type
- `GetUsersParams` / `GetUsersResponse` / `GetUserResponse` — API types

## Usage Example

```tsx
import { UserManagementPage } from '@/domains/users';

// app/(protected)/user-management/user/page.tsx
export default function Page() {
  return <UserManagementPage />;
}
```

```tsx
import { EditUserPage } from '@/domains/users';

// app/(protected)/user-management/user/[id]/edit/page.tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditUserPage userId={id} />;
}
```

## Related Domains

- **auth** — Authentication and session management; shares the `User` entity concept
- **role-permissions** — Roles referenced in the user form via `useRolesInfinite`
- **manpower** — Employee records referenced in the user form via `useEmployeesInfinite`
