# Shared Hooks

Reusable React hooks for common functionality across domains.

## Available Hooks

### useQueryParams
**File:** `use-query-params.ts`

Manage URL query parameters reactively with React Router's useSearchParams.

```typescript
import { useQueryParams } from '@/hooks/use-query-params';

export function UserList() {
  const { getQueryParams, setQueryParams, updateQueryParams } = useQueryParams();
  
  const params = getQueryParams(); // { page: '1', search: '' }
  
  const handlePageChange = (page: number) => {
    updateQueryParams({ page: page.toString() });
  };
  
  const handleSearch = (search: string) => {
    setQueryParams({ page: '1', search }); // Reset page on search
  };
  
  return <div>{/* ... */}</div>;
}
```

**Features:**
- Get current query parameters as object
- Set query parameters (replace all)
- Update specific query parameters (merge)
- Supports all standard query params: `page`, `perPage`, `search`, `sortBy`, `sortOrder`

**Usage with useUsers:**
```typescript
const params = getQueryParams();
const { data: users } = useUsers({
  page: parseInt(params.page) || 1,
  perPage: parseInt(params.perPage) || 10,
  search: params.search,
  sortBy: params.sortBy,
  sortOrder: params.sortOrder as 'asc' | 'desc',
});
```

---

### useDebounce
**File:** `use-debounce.ts`

Debounce a value to delay updates (useful for search, filtering).

```typescript
import { useDebounce } from '@/hooks/use-debounce';

export function SearchUsers() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300); // 300ms delay
  
  const { data: results } = useUsers({ search: debouncedSearch });
  
  return (
    <>
      <Input 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
        placeholder="Search users..."
      />
      <div>{/* Render results */}</div>
    </>
  );
}
```

**Signature:**
```typescript
const debouncedValue = useDebounce<T>(value: T, delay: number): T;
```

**Parameters:**
- `value` — Value to debounce
- `delay` — Debounce delay in milliseconds (default: 500)

**Returns:**
- Debounced value that updates after delay

---

### usePermissions
**File:** `use-permissions.ts`

Check if current user has specific permissions.

```typescript
import { usePermissions } from '@/hooks/use-permissions';

export function AdminPanel() {
  const { can, canAny, canAll } = usePermissions();
  
  // Check single permission
  if (!can('users.manage')) {
    return <div>Access denied</div>;
  }
  
  // Check if any permission is granted
  const canEditOrDelete = canAny(['users.edit', 'users.delete']);
  
  // Check if all permissions are granted
  const canManageFullyy = canAll(['users.create', 'users.edit', 'users.delete']);
  
  return <div>{/* Admin content */}</div>;
}
```

**Signature:**
```typescript
interface PermissionsHook {
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
  canAll: (permissions: string[]) => boolean;
}
```

**Usage:**
- `can('permission.id')` — Check single permission (returns boolean)
- `canAny(['perm1', 'perm2'])` — Check if any permission exists (OR logic)
- `canAll(['perm1', 'perm2'])` — Check if all permissions exist (AND logic)

**Common Permissions:**
- `users.view` — View users
- `users.create` — Create users
- `users.edit` — Edit users
- `users.delete` — Delete users
- `roles.manage` — Manage roles
- `permissions.manage` — Manage permissions

---

### useBreadcrumbs
**File:** `use-breadcrumbs.ts`

Generate breadcrumb navigation from current route.

```typescript
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';

export function Breadcrumbs() {
  const breadcrumbs = useBreadcrumbs();
  
  return (
    <nav className="flex gap-2">
      {breadcrumbs.map((crumb, i) => (
        <Fragment key={crumb.path}>
          {i > 0 && <span className="text-muted-foreground">/</span>}
          <Link href={crumb.path}>{crumb.label}</Link>
        </Fragment>
      ))}
    </nav>
  );
}
```

**Signature:**
```typescript
interface Breadcrumb {
  label: string;
  path: string;
}

const breadcrumbs: Breadcrumb[] = useBreadcrumbs();
```

**Returns:**
- Array of breadcrumb objects with `label` and `path`
- Automatically generated from URL pathname
- Humanizes path segments (e.g., `/users/123` → "Users" → "123")

---

## Hook Patterns

### Pattern 1: Query Parameters + Data Fetching

```typescript
export function UserManagementPage() {
  const { getQueryParams, updateQueryParams } = useQueryParams();
  const params = getQueryParams();
  
  const { data: users, isLoading } = useUsers({
    page: parseInt(params.page) || 1,
    perPage: parseInt(params.perPage) || 10,
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder as 'asc' | 'desc',
  });
  
  return (
    <DataTable
      data={users}
      onPaginate={(page) => updateQueryParams({ page: page.toString() })}
    />
  );
}
```

### Pattern 2: Debounced Search

```typescript
export function SearchableList() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  const { data: results } = useUsers({ search: debouncedSearch });
  
  return (
    <>
      <SearchBar value={search} onChange={setSearch} />
      <UserList data={results} />
    </>
  );
}
```

### Pattern 3: Permission Checks

```typescript
export function UserActions({ userId }) {
  const { can, canAny } = usePermissions();
  
  return (
    <>
      {can('users.edit') && <Button onClick={handleEdit}>Edit</Button>}
      {canAny(['users.delete', 'users.manage']) && (
        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
      )}
    </>
  );
}
```

---

## Hook Composition

Hooks can be composed to create higher-level functionality:

```typescript
// Combine useQueryParams + useDebounce + useUsers
export function useUserListWithSearch() {
  const { getQueryParams, updateQueryParams } = useQueryParams();
  const [search, setSearch] = useState(getQueryParams().search || '');
  const debouncedSearch = useDebounce(search, 300);
  
  const params = getQueryParams();
  const { data: users, isLoading } = useUsers({
    page: parseInt(params.page) || 1,
    perPage: parseInt(params.perPage) || 10,
    search: debouncedSearch,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder as 'asc' | 'desc',
  });
  
  return {
    users,
    isLoading,
    search,
    setSearch,
    pagination: { page: parseInt(params.page) || 1 },
    onPaginate: (page: number) => updateQueryParams({ page: page.toString() }),
  };
}
```

---

## Creating Custom Hooks

When creating new hooks in shared:

1. **Keep focused** — One responsibility per hook
2. **Reuse built-ins** — Use useQueryParams, useDebounce, etc.
3. **Export from index.ts** — Make discoverable
4. **Add documentation** — Include usage examples
5. **Use TypeScript** — Full type safety
6. **Test thoroughly** — Especially lifecycle and dependencies

**Good hook examples:**
```typescript
// ✅ Focused, reusable
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  
  const setStoredValue = (v: T) => {
    setValue(v);
    localStorage.setItem(key, JSON.stringify(v));
  };
  
  return [value, setStoredValue] as const;
}

// ✅ Composes existing hooks
export function useUserSearch() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data: users } = useUsers({ search: debouncedSearch });
  return { search, setSearch, users };
}
```

---

## Performance Tips

1. **useDebounce before fetching** — Reduce API calls during typing
2. **Memoize expensive computations** — Use useMemo
3. **Avoid re-renders** — Use useCallback for event handlers
4. **Extract custom hooks** — Simplify component logic

```typescript
// ❌ Fetches on every keystroke
const { data: users } = useUsers({ search });

// ✅ Debounce first, then fetch
const debouncedSearch = useDebounce(search, 300);
const { data: users } = useUsers({ search: debouncedSearch });
```

---

## Related Documentation

- [Components](../components/README.md) — Use hooks with components
- [Lib Utilities](../lib/README.md) — Utility functions
- [API Integration](../../DOCUMENTATION_INDEX.md) — Use hooks with domain APIs
