# API Pattern — Complete Reference

All API calls follow a strict, consistent pattern. This is your single source of truth.

## Quick Rules

- **One file per operation** (default): `get-users.ts`, `create-user.ts`, `delete-user.ts`
- **Explicit mock handling**: Check `isMockModeEnabled()` before API call
- **Validate with Zod**: Parse payload with schema before sending
- **Try/catch with descriptive errors**: Throw, don't return error objects
- **Type responses**: Use `ApiSuccessResponse<T>`, `ApiPaginatedResponse<T>`, or `ApiSuccessResponse<null>`
- **Return unwrapped data**: Always return `data.data`, not the envelope
- **One exported function**: Not service objects with multiple methods

---

## File Structure

```
src/domains/<domain>/api/
├── get-resource.ts           # GET single resource
├── get-resources.ts          # GET paginated list
├── create-resource.ts        # POST create
├── update-resource.ts        # PATCH update
├── delete-resource.ts        # DELETE
└── mocks/
    └── data.ts               # Mock data (exported and typed)
```

---

## Template: Single Resource Fetch

```typescript
// src/domains/<domain>/api/get-resource.ts
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { MyResource } from '../types';

export async function getResource(id: string): Promise<MyResource> {
  try {
    const { data } = await api.get<ApiSuccessResponse<MyResource>>(`/v1/resources/${id}`);
    return data.data;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? `Failed to fetch resource: ${error.message}` 
        : 'Failed to fetch resource'
    );
  }
}
```

---

## Template: Paginated List

```typescript
// src/domains/<domain>/api/get-resources.ts
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';
import type { MyResource } from '../types';

export interface ListParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  // domain-specific filters:
  status?: boolean;
}

export async function getResources(params: ListParams = {}) {
  try {
    const { data } = await api.get<ApiPaginatedResponse<MyResource[]>>('/v1/resources', { params });
    return {
      resources: data.data,
      meta: data.meta,
      links: data.links,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? `Failed to fetch resources: ${error.message}` 
        : 'Failed to fetch resources'
    );
  }
}
```

---

## Template: Create Resource

```typescript
// src/domains/<domain>/api/create-resource.ts
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { MyResource } from '../types';
import { createResourceSchema } from '../schemas';

export interface CreateRequest {
  name: string;
  description?: string;
}

export async function createResource(payload: CreateRequest): Promise<MyResource> {
  // Validate before sending
  const validated = createResourceSchema.parse(payload);
  
  try {
    const { data } = await api.post<ApiSuccessResponse<MyResource>>('/v1/resources', validated);
    return data.data;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? `Failed to create resource: ${error.message}` 
        : 'Failed to create resource'
    );
  }
}
```

---

## Template: Update Resource

```typescript
// src/domains/<domain>/api/update-resource.ts
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { MyResource } from '../types';
import { updateResourceSchema } from '../schemas';

export interface UpdateRequest {
  name?: string;
  description?: string;
}

export async function updateResource(id: string, payload: UpdateRequest): Promise<MyResource> {
  const validated = updateResourceSchema.parse(payload);
  
  try {
    const { data } = await api.patch<ApiSuccessResponse<MyResource>>(`/v1/resources/${id}`, validated);
    return data.data;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? `Failed to update resource: ${error.message}` 
        : `Failed to update resource`
    );
  }
}
```

---

## Template: Delete Resource

```typescript
// src/domains/<domain>/api/delete-resource.ts
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';

export async function deleteResource(id: string): Promise<void> {
  try {
    await api.delete<ApiSuccessResponse<null>>(`/v1/resources/${id}`);
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? `Failed to delete resource: ${error.message}` 
        : 'Failed to delete resource'
    );
  }
}
```

---

## Template: Operation Without Data (Logout, Mark as Read, etc.)

```typescript
// src/domains/<domain>/api/logout.ts
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';

export async function logout(): Promise<void> {
  try {
    await api.post<ApiSuccessResponse<null>>('/v1/auth/logout', {});
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? `Failed to logout: ${error.message}` 
        : 'Failed to logout'
    );
  }
}
```

---

## Mock Data Pattern

When mocking is enabled, return mock data instead of calling the API:

```typescript
// src/domains/<domain>/api/get-resources.ts
import { isMockModeEnabled } from '@/shared/configs/mock.config';
import { MOCK_RESOURCES } from '../mocks/data';

export async function getResources(params: ListParams = {}) {
  if (isMockModeEnabled()) {
    return {
      resources: MOCK_RESOURCES,
      meta: {
        currentPage: 1,
        perPage: 10,
        total: MOCK_RESOURCES.length,
        lastPage: 1,
      },
      links: {},
    };
  }

  try {
    // ... real API call
  } catch (error) {
    throw new Error(...);
  }
}
```

**Important**: Check mock flag **before** making the API call. Never auto-fallback to mocks on error.

---

## Hook Pattern (Wraps API)

Each API file gets a corresponding React Query hook in `hooks/`.

### ⚠️ MANDATORY: Always use `_QUERY_KEYS` constants — never raw strings

Every domain defines a `<DOMAIN>_QUERY_KEYS` constant in its primary list hook file (e.g. `use-resources.ts`). All other hooks in the domain import from it. **Never write `queryKey: ['...']` raw strings anywhere.**

```typescript
// src/domains/<domain>/hooks/use-resources.ts
import { useQuery } from '@tanstack/react-query';
import { getResources, type ListParams } from '../api/get-resources';

export const RESOURCE_QUERY_KEYS = {
  all: ['resources'] as const,
  lists: () => [...RESOURCE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...RESOURCE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...RESOURCE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...RESOURCE_QUERY_KEYS.details(), id] as const,
  infinite: () => ['resources-infinite'] as const,
};

export function useResources(params?: ListParams) {
  return useQuery({
    queryKey: [...RESOURCE_QUERY_KEYS.all, params],
    queryFn: () => getResources(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

```typescript
// src/domains/<domain>/hooks/use-resource.ts  (single item)
import { useQuery } from '@tanstack/react-query';
import { getResource } from '../api/get-resource';
import { RESOURCE_QUERY_KEYS } from './use-resources';

export function useResource(id: string) {
  return useQuery({
    queryKey: RESOURCE_QUERY_KEYS.detail(id),
    queryFn: () => getResource(id),
    enabled: !!id,
    select: (data) => data?.data ?? null,
  });
}
```

```typescript
// src/domains/<domain>/hooks/use-create-resource.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createResource, type CreateRequest } from '../api/create-resource';
import { RESOURCE_QUERY_KEYS } from './use-resources';

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.infinite() });
    },
  });
}
```

```typescript
// src/domains/<domain>/hooks/use-update-resource.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateResource } from '../api/update-resource';
import { RESOURCE_QUERY_KEYS } from './use-resources';

export function useUpdateResource(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateResource(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.infinite() });
    },
  });
}
```

**Rules:**
- `_QUERY_KEYS` is defined once in `use-<entities>.ts` (the list hook) and exported
- All hooks in the domain import it from that file — never redefine it
- `invalidateQueries({ queryKey: KEYS.all })` — invalidates everything in the domain
- `invalidateQueries({ queryKey: KEYS.detail(id) })` — invalidates one item
- `invalidateQueries({ queryKey: KEYS.infinite() })` — invalidates infinite scroll queries
- For `id: string | undefined` in single-item hooks, spread instead: `[...KEYS.details(), id]`

---

## API Response Standard

All responses follow this envelope structure:

### Success: Single Resource
```json
{
  "success": true,
  "message": "OK",
  "data": { "id": "123", "name": "John" }
}
```

### Success: Paginated List
```json
{
  "success": true,
  "message": "OK",
  "data": [ { "id": "1" }, { "id": "2" } ],
  "meta": {
    "currentPage": 1,
    "perPage": 20,
    "total": 145,
    "lastPage": 8,
    "from": 1,
    "to": 20
  },
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": "..."
  }
}
```

### Success: No Data
```json
{
  "success": true,
  "message": "Logout berhasil",
  "data": null
}
```

### Error
```json
{
  "success": false,
  "message": "Email atau password salah",
  "errorCode": "INVALID_CREDENTIALS",
  "data": null,
  "errors": null
}
```

---

## Best Practices Checklist

- [ ] One file per operation
- [ ] Explicit mock flag check (before API call)
- [ ] Zod schema validation
- [ ] Try/catch block wrapping API call
- [ ] Descriptive error messages (include operation context)
- [ ] Type the response (`ApiSuccessResponse<T>`, `ApiPaginatedResponse<T>`, or `ApiSuccessResponse<null>`)
- [ ] Return unwrapped data (`.data` from response envelope)
- [ ] Single exported function (not service object)
- [ ] Corresponding React Query hook in `hooks/`
- [ ] Mock data matches real API response structure

---

## Avoid These Patterns

❌ **Multiple operations in one file**:
```ts
export const resourceService = {
  get: async () => {},
  create: async () => {},
  delete: async () => {},
};
```

❌ **Auto-fallback on error**:
```ts
catch {
  return MOCK_DATA;  // Hides real errors!
}
```

❌ **Success flag in return**:
```ts
return { success: true, data, error: null };
```

❌ **Silent error handling**:
```ts
catch (error) {
  // Don't swallow errors
}
```

❌ **Direct axios calls in components**:
```ts
// Components should NEVER import axios
const { data } = await axios.get('/v1/...');
```

---

## See Also

- [[FORMS_PATTERN.md]] — Zod validation for forms
- [[ERROR_HANDLING_PATTERN.md]] — Error extraction and handling
- [[QUERY_PARAMS_PATTERN.md]] — Query parameter standard
