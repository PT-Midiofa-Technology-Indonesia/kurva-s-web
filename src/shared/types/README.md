# Types - Shared TypeScript Definitions

Cross-domain TypeScript type definitions used throughout the application.

## Available Types

### api.ts - API Types

Standard types for API requests and responses.

```typescript
import { 
  ApiSuccessResponse,
  ApiPaginatedResponse,
  ApiErrorResponse,
  PaginationMeta,
} from '@/types/api';
```

#### `ApiSuccessResponse<T>`
Standard success response for single item responses.

```typescript
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Usage
type GetUserResponse = ApiSuccessResponse<User>;
type CreateUserResponse = ApiSuccessResponse<User>;
```

#### `ApiPaginatedResponse<T>`
Standard response for paginated list endpoints.

```typescript
interface ApiPaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
  links?: {
    first?: string;
    last?: string;
    next?: string;
    prev?: string;
  };
}

interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

// Usage
type GetUsersResponse = ApiPaginatedResponse<User>;
type GetProjectsResponse = ApiPaginatedResponse<Project>;
```

#### `ApiErrorResponse`
Standard error response structure.

```typescript
interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode: string;
  errors?: {
    field?: string;
    message: string;
    code?: string;
  }[];
}

// Usage when catching errors
try {
  await axios.post('/users', data);
} catch (error) {
  const errorData = error.response?.data as ApiErrorResponse;
}
```

---

### permissions.ts - Permission Types

Types for permission and role management.

```typescript
import {
  Permission,
  PermissionGroup,
  PermissionItem,
  UserPermissions,
} from '@/types';
```

#### `Permission`
Single permission definition.

```typescript
interface Permission {
  id: string;              // e.g., 'users.create'
  name: string;            // e.g., 'Create User'
  description?: string;    // Optional description
  category?: string;       // e.g., 'Users'
}

// Usage
const permission: Permission = {
  id: 'users.create',
  name: 'Create User',
  description: 'Can create new users in the system',
  category: 'Users',
};
```

#### `PermissionGroup`
Group of related permissions.

```typescript
interface PermissionGroup {
  id: string;              // e.g., 'users'
  name: string;            // e.g., 'Users'
  description?: string;
  permissions: Permission[];
}

// Usage
const group: PermissionGroup = {
  id: 'users',
  name: 'Users',
  description: 'User management permissions',
  permissions: [
    { id: 'users.view', name: 'View Users' },
    { id: 'users.create', name: 'Create User' },
    { id: 'users.edit', name: 'Edit User' },
    { id: 'users.delete', name: 'Delete User' },
  ],
};
```

#### `PermissionItem`
Permission with metadata.

```typescript
interface PermissionItem extends Permission {
  group?: string;
  isGranted?: boolean;
  isDynamic?: boolean;
}

// Usage in components
const permissionItems: PermissionItem[] = [
  {
    id: 'users.create',
    name: 'Create User',
    group: 'Users',
    isGranted: true,
  },
];
```

#### `UserPermissions`
Permissions granted to a user.

```typescript
interface UserPermissions {
  userId: string;
  permissions: string[];     // Array of permission IDs
  grantedAt: Date;
  expiresAt?: Date;
}

// Usage with usePermissions hook
const userPerms: UserPermissions = {
  userId: 'user-123',
  permissions: ['users.view', 'users.edit'],
  grantedAt: new Date(),
};
```

---

### query-params.ts - Query Parameter Types

Types for URL query parameters.

```typescript
import {
  QueryParamValues,
  SortOrder,
  ListQueryParams,
  PaginationParams,
} from '@/types';
```

#### `QueryParamValues`
Type-safe query parameter values (always strings in URL).

```typescript
interface QueryParamValues {
  [key: string]: string | string[] | undefined;
}

// Usage
const params: QueryParamValues = {
  page: '1',
  perPage: '10',
  search: 'john',
  sortBy: 'name',
  sortOrder: 'asc',
};
```

#### `SortOrder`
Sort direction type.

```typescript
type SortOrder = 'asc' | 'desc';

// Usage
const sortOrder: SortOrder = 'asc';
```

#### `PaginationParams`
Standard pagination parameters (in URL, all strings).

```typescript
interface PaginationParams {
  page?: string;        // Page number as string
  perPage?: string;     // Items per page as string
  sortBy?: string;      // Sort column name
  sortOrder?: 'asc' | 'desc';
}

// Usage with useQueryParams
const params = getQueryParams() as PaginationParams;
const { data } = useUsers({
  page: parseInt(params.page) || 1,
  perPage: parseInt(params.perPage) || 10,
  sortBy: params.sortBy,
  sortOrder: params.sortOrder || 'asc',
});
```

#### `ListQueryParams`
Extended query params with search and filters.

```typescript
interface ListQueryParams extends PaginationParams {
  search?: string;
  filters?: Record<string, string>;
}

// Usage
const params = getQueryParams() as ListQueryParams;
```

---

### index.ts - Type Barrel Exports

```typescript
// Import commonly used types from here
export * from './api';
export * from './permissions';
export * from './query-params';

// Re-export from domain types if shared
export type { User, UserRole } from './user';
```

---

## Common Patterns

### Pattern 1: Type-Safe API Response

```typescript
import type { ApiSuccessResponse, ApiPaginatedResponse } from '@/types';

interface User {
  id: string;
  name: string;
  email: string;
}

// Single item response
type GetUserResponse = ApiSuccessResponse<User>;

// List response
type GetUsersResponse = ApiPaginatedResponse<User>;

// Usage in API function
export async function getUser(id: string): Promise<User> {
  const response = await axios.get<GetUserResponse>(`/users/${id}`);
  return response.data.data;
}
```

### Pattern 2: Permission Type Safety

```typescript
import type { Permission, PermissionGroup } from '@/types';

function renderPermissionGroup(group: PermissionGroup) {
  return (
    <div>
      <h3>{group.name}</h3>
      <ul>
        {group.permissions.map((perm: Permission) => (
          <li key={perm.id}>{perm.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Pattern 3: Query Params Type Safety

```typescript
import type { ListQueryParams } from '@/types';
import { useQueryParams } from '@/hooks/use-query-params';

export function UserList() {
  const { getQueryParams, updateQueryParams } = useQueryParams();
  const params = getQueryParams() as ListQueryParams;
  
  const { data: users } = useUsers({
    page: parseInt(params.page) || 1,
    perPage: parseInt(params.perPage) || 10,
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: (params.sortOrder || 'asc') as 'asc' | 'desc',
  });
  
  return (/* ... */);
}
```

---

## Type Guidelines

### ✅ DO
- **Import from @/types** — Use centralized type definitions
- **Use specific types** — `ApiSuccessResponse<T>` not `any`
- **Export types from index.ts** — Make discoverable
- **Document complex types** — Add JSDoc comments
- **Reuse types** — Don't duplicate type definitions
- **Use type narrowing** — Check types before using
- **Create discriminated unions** — For API responses with different shapes

### ❌ DON'T
- **Don't create duplicate types** — Check @/types first
- **Don't use `any`** — Always use proper types
- **Don't import deep** — Use barrel exports from index.ts
- **Don't hardcode response shapes** — Use ApiSuccessResponse<T>
- **Don't forget to export** — Add to index.ts barrel

---

## Type Checking

Verify types with TypeScript:

```bash
pnpm run type-check
```

---

## Related Documentation

- [API Integration](../../DOCUMENTATION_INDEX.md) — How types are used in API calls
- [Error Handling](../../DOCUMENTATION_INDEX.md) — Error response types
- [Query Params](../../DOCUMENTATION_INDEX.md) — Query parameter types
