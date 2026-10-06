# Role Permissions Domain

Role-based access control (RBAC) — manages roles with granular web and mobile permissions, supporting create, edit, detail, and list pages.

## Structure

```
role-permissions/
├── api/
│   ├── create-role.ts            # POST /roles
│   ├── delete-role.ts            # DELETE /roles/:id
│   ├── get-permission-groups.ts  # GET /permissions/groups
│   ├── get-role.ts               # GET /roles/:id
│   ├── get-roles.ts              # GET /roles (paginated)
│   └── update-role.ts            # PUT /roles/:id
├── components/
│   └── RoleForm.tsx              # Reusable role name/description + permissions form
├── constants/
│   └── index.ts                  # ROLE_LABELS
├── hooks/
│   ├── use-create-role-page.ts   # Page-level hook for create page
│   ├── use-create-role.ts        # Mutation: create role
│   ├── use-delete-role.ts        # Mutation: delete role
│   ├── use-detail-role-page.ts   # Page-level hook for detail page
│   ├── use-edit-role-page.ts     # Page-level hook for edit page
│   ├── use-permission-groups.ts  # Query: permission groups (web + mobile)
│   ├── use-role-permissions-page.ts # Page-level hook for list page
│   ├── use-role-with-permissions.ts # Combined query: role + permission groups merged
│   ├── use-roles.ts              # Query: paginated role list
│   └── use-update-role.ts        # Mutation: update role
├── pages/
│   ├── CreateRolePage.tsx        # Create role form page
│   ├── DetailRolePage.tsx        # Read-only role detail page
│   ├── EditRolePage.tsx          # Edit role + permissions page
│   ├── RolePermissionsPage.tsx   # Paginated role list page
│   └── __tests__/
│       ├── CreateRolePage.integration.test.tsx
│       ├── DetailRolePage.integration.test.tsx
│       ├── EditRolePage.integration.test.tsx
│       └── RolePermissionsPage.integration.test.tsx
├── schemas/
│   └── role.schema.ts            # Zod: roleFormSchema
├── services/
│   ├── combine-role-with-permissions.ts  # combineRoleWithPermissions: merges role + permission groups
│   └── transform-permissions.ts         # transformPermissionGroups: maps API groups → UI Permission[]
├── types/
│   └── index.ts                  # Role, Permission, PermissionGroup, PermissionItem, RolePermissionUpdate
└── index.ts                      # Public barrel exports
```

## Key Files

- `api/get-permission-groups.ts` — Fetches permission groups, each containing `web` and `mobile` permission arrays with `sortOrder`
- `hooks/use-role-with-permissions.ts` — Parallel `useQueries` for role + permission groups; calls `combineRoleWithPermissions` to merge them; used by edit and detail pages
- `services/combine-role-with-permissions.ts` — Pure function: given a `Role` and `PermissionGroup[]`, returns `RoleWithPermissions` with resolved permission objects
- `services/transform-permissions.ts` — Pure function: maps `PermissionGroup[]` + selected IDs → `UIPermission[]` (the shape consumed by the shared permissions UI component); filters inactive groups, sorts by `sortOrder`, splits into web/mobile sub-groups
- `components/RoleForm.tsx` — Form component used by create, edit, and detail pages; supports three modes (create / edit / detail)
- `schemas/role.schema.ts` — Zod `roleFormSchema`; exports `roleFormSchema`

## Exports

- `RolePermissionsPage` — Paginated role list page
- `CreateRolePage` — Create role form page
- `EditRolePage` — Edit role and permissions page
- `DetailRolePage` — Read-only role detail page
- `useRoles()` — Query hook for paginated role list; exports `ROLE_QUERY_KEYS`
- `useCreateRole()` — Mutation hook for creating a role
- `useUpdateRole()` — Mutation hook for updating a role
- `useDeleteRole()` — Mutation hook for deleting a role
- `usePermissionGroups()` — Query hook for permission groups; exports `PERMISSION_GROUP_QUERY_KEYS`
- `ROLE_LABELS` — Display label constants
- `roleFormSchema` — Zod validation schema
- `CreateRolePayload` — Type for create payload
- `Role`, `Permission`, `PermissionGroup`, `PermissionItem`, `RolePermissionUpdate` — Core types

## Usage Example

```tsx
// app/(protected)/settings/role-permissions/page.tsx
import { RolePermissionsPage } from '@/domains/role-permissions';

export default function Page() {
  return <RolePermissionsPage />;
}
```

```tsx
// app/(protected)/settings/role-permissions/create/page.tsx
import { CreateRolePage } from '@/domains/role-permissions';

export default function Page() {
  return <CreateRolePage />;
}
```

```tsx
// app/(protected)/settings/role-permissions/[id]/edit/page.tsx
import { EditRolePage } from '@/domains/role-permissions';

export default function Page({ params }: { params: { id: string } }) {
  return <EditRolePage id={params.id} />;
}
```

## Permission Model

Each `PermissionGroup` contains separate `web` and `mobile` permission arrays. The `transformPermissionGroups` service maps this into the UI shape (`UIPermission[]`) used by the shared permissions component, handling sort order and checked state. `combineRoleWithPermissions` resolves a role's `permissionIds` (numeric) back to full permission objects by scanning all groups.

## Related Domains

- **auth** — Uses role permissions for authorization checks
- **shared permissions UI** — `src/shared/components` permissions selector component consumes `UIPermission[]` produced by `transformPermissionGroups`
