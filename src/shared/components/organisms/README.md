# Organisms - Complex Components

Complex, feature-rich components composed of multiple molecules and atoms. These are the main building blocks for domain features.

## Components

### DataTable
Full-featured data grid with:
- Sortable columns (click header to sort)
- Drag-and-drop reorder
- Inline editing (double-click cell)
- Pagination controls
- Row selection (checkbox)
- Context menu (right-click row)
- Column resize (drag border)
- Range selection (shift+click)
- **Excel mode** — active cell, keyboard nav, range copy/paste, marching-ants copied range. See [DataTable Excel Mode pattern](../../../../.docs/patterns/DATATABLE_PATTERN.md)

```typescript
import { DataTable } from '@/components/organisms';

<DataTable
  data={users}
  columns={columns}
  pagination={{ page: 1, perPage: 10, total: 100 }}
  onPaginate={handlePaginate}
  onSort={handleSort}
  onRowSelect={handleSelect}
/>
```

### FormGenerator
Schema-driven form builder. Define fields in constants, render with one component.

```typescript
import { FormGenerator } from '@/components/organisms';
import { USER_FORM_FIELDS } from '@/domains/users/constants';

<FormGenerator
  fields={USER_FORM_FIELDS}
  onSubmit={handleSubmit}
  defaultValues={user}
/>
```

### GanttChart
Project timeline Gantt chart for project management.

### KanbanBoard
Full drag-and-drop kanban board for task management.

### Navbar
Application top navigation bar with:
- Logo and app name
- Navigation links
- Search bar
- Notification bell
- User profile dropdown

```typescript
import { Navbar } from '@/components/organisms';
<Navbar />
```

### PermissionsAccordion
Accordion-style permissions display. Expand/collapse permission groups.

### PermissionsManager
Full RBAC permission management UI:
- Role list with permissions
- Permission group tree
- Checkbox for each permission
- Save/cancel actions

### Sidebar
Application sidebar navigation with:
- Logo
- Navigation menu (grouped)
- Collapse/expand
- Active state highlighting

```typescript
import { Sidebar } from '@/components/organisms';
<Sidebar navigation={NAVIGATION_CONFIG.main} />
```

## Import Pattern

```typescript
// Individual organism
import { DataTable } from '@/components/organisms/DataTable';

// Via barrel (all organisms)
import { DataTable, FormGenerator, Sidebar } from '@/components/organisms';
```

## Rules

1. Organisms are complex — may have multiple responsibilities
2. Organisms compose molecules and atoms together
3. Organisms may manage state (but prefer React Query for server state)
4. No business logic — only presentation and user interaction
5. Each organism should be independently usable

## DataTable Column Definition Example

```typescript
import { DataTable, type ColumnDef } from '@/components/organisms/DataTable';

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (info) => <Text>{info.getValue()}</Text>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Button variant="ghost" onClick={() => handleEdit(row.original)}>
        Edit
      </Button>
    ),
  },
];
```

## FormGenerator Field Example

```typescript
import { FormGenerator, type FormField } from '@/components/organisms/FormGenerator';

const fields: FormField[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    colSpan: 6,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    colSpan: 6,
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: ROLE_OPTIONS,
    required: true,
    colSpan: 12,
  },
];
```