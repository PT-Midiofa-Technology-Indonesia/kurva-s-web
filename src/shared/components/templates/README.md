# Templates - Page Layout Skeletons

Full page layout skeletons. Domain pages render inside these templates.

## Templates

### AuthLayout
Centered card layout for login/register pages.

```typescript
import { AuthLayout } from '@/components/templates';

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
```

### DashboardLayout
Sidebar + Navbar + main content area. The base layout for dashboard pages.

```typescript
import { DashboardLayout } from '@/components/templates';

export default function DashboardPage({ children }) {
  return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Navbar />}>
      {children}
    </DashboardLayout>
  );
}
```

### DashboardRouteLayout
Wired variant of `DashboardLayout` with sidebar nav, logout, and profile menu already connected. Use this for standard dashboard routes.

```typescript
import { DashboardRouteLayout } from '@/components/templates';

// No need to pass sidebar/navbar - already wired
export default function UsersPage() {
  return (
    <DashboardRouteLayout>
      <UserList />
    </DashboardRouteLayout>
  );
}
```

### DataTableLayout
Header + toolbar + table area layout.

```typescript
import { DataTableLayout } from '@/components/templates';

<DataTableLayout
  header={<PageHeader title="Users" actions={<Button>Add</Button>} />}
  toolbar={<SearchBar onSearch={handleSearch} />}
  table={<DataTable data={users} columns={columns} />}
/>
```

### DetailDrawerTemplate
Standard wrapper for detail drawer side-panels. Opens from the right side.

```typescript
import { DetailDrawerTemplate } from '@/components/templates';

<DetailDrawerTemplate
  open={isOpen}
  onClose={handleClose}
  title="User Details"
>
  <UserDetail user={user} />
</DetailDrawerTemplate>
```

### FormPageSkeleton
Page-level loading skeleton for create/edit form pages. Renders header + `FormCard` shell + action buttons.

```typescript
import { FormPageSkeleton } from '@/components/templates';

if (isLoading) return <FormPageSkeleton />;          // default 4 fields
if (isLoading) return <FormPageSkeleton fields={6} />; // 6-field layout
```

Props:
- `fields?: number` — Number of form fields to simulate (default: 4)
- `className?: string` — Additional classes

### ListPageSkeleton
Page-level loading skeleton for list pages. Renders header + filter bar + column headers + rows + pagination.

```typescript
import { ListPageSkeleton } from '@/components/templates';

if (isLoading) return <ListPageSkeleton />;           // default 7 rows
if (isLoading) return <ListPageSkeleton rows={10} />; // 10-row layout
```

Props:
- `rows?: number` — Number of table rows to simulate (default: 7)
- `className?: string` — Additional classes

### ListPageTemplate
Complete list page: header, search, filters, table, pagination, delete dialog.

```typescript
import { ListPageTemplate } from '@/components/templates';

<ListPageTemplate
  title="Users"
  description="Manage system users"
  data={users}
  pagination={{ page: 1, perPage: 10, total: 100 }}
  onPaginate={handlePaginate}
  onDelete={handleDelete}
  onAdd={() => router.push('/users/create')}
  columns={columns}
  searchPlaceholder="Search users..."
  emptyMessage="No users found"
/>
```

## Import Pattern

```typescript
// Individual template
import { ListPageTemplate } from '@/components/templates';

// Via barrel (all templates)
import { ListPageTemplate, DashboardLayout, FormPageSkeleton } from '@/components/templates';
```

## Skeleton Usage Guide

### FormPageSkeleton
Use in create/edit pages while fetching initial data:
```typescript
if (isLoading) return <FormPageSkeleton />;
if (isLoading) return <FormPageSkeleton fields={6} />; // more fields
```

### ListPageSkeleton
Use in list pages while fetching data (ListPageTemplate handles this internally):
```typescript
if (isLoading) return <ListPageSkeleton />;
if (isLoading) return <ListPageSkeleton rows={10} />; // more rows
```

## Layout Composition

```
DashboardRouteLayout
├── Sidebar (navigation)
├── Navbar (top bar + profile)
└── Main Content
    ├── PageHeader (title + breadcrumbs + actions)
    ├── ListPageTemplate / DataTableLayout / custom content
    └── DetailDrawerTemplate (optional overlay)
```