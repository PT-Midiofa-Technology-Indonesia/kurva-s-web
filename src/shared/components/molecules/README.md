# Molecules - Composed Atoms

Atoms composed together, sometimes with local state. More complex than atoms but still focused.

## Components

### Alert
Informational alert with variants (info, success, warning, error).
```typescript
import { Alert } from '@/components/molecules';
<Alert variant="info" title="Note" description="This is an alert" />
```

### AlertDialog / ConfirmDialog
Modal confirmation dialog.
```typescript
import { AlertDialog } from '@/components/molecules';
<AlertDialog
  open={isOpen}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  title="Delete Item"
  description="Are you sure?"
/>
```

### DataTablePagination
Pagination controls (controlled, no internal state).
```typescript
import { DataTablePagination } from '@/components/molecules';
<DataTablePagination
  page={1}
  perPage={10}
  total={100}
  onPageChange={setPage}
  onPerPageChange={setPerPage}
/>
```

### DatePicker
Single date or date range picker.
```typescript
import { DatePicker } from '@/components/molecules';
<DatePicker mode="single" value={date} onChange={setDate} />
<DatePicker mode="range" value={[start, end]} onChange={setRange} />
```

### FileInput
File upload input with preview.
```typescript
import { FileInput } from '@/components/molecules';
<FileInput value={file} onChange={setFile} accept="image/*" />
```

### FormCard
White card container for form sections (`bg-white`, border, `rounded-[14px]`, shadow).
```typescript
import { FormCard } from '@/components/molecules';
<FormCard className="p-6">
  <form>{/* fields */}</form>
</FormCard>
```

### KanbanColumn
Column wrapper for kanban boards.
```typescript
import { KanbanColumn } from '@/components/molecules';
<KanbanColumn title="To Do">{children}</KanbanColumn>
```

### KanbanItem
Draggable item inside a kanban column.

### LoadingSkeleton
Generic skeleton primitives (line/paragraph/card/table-row/circle).
```typescript
import { LoadingSkeleton } from '@/components/molecules';
<LoadingSkeleton variant="line" count={3} />
```

### PageHeader
Page title + breadcrumb + action slot.
```typescript
import { PageHeader } from '@/components/molecules';
<PageHeader
  title="Users"
  breadcrumbs={[{ label: 'Home', path: '/' }]}
  actions={<Button>Add User</Button>}
/>
```

### PermissionGroup
Group header for permission lists.

### PermissionItem
Single permission row with checkboxes.

### ProfileDropdown / Dropdown
User profile menu or generic dropdown.
```typescript
import { ProfileDropdown } from '@/components/molecules';
<ProfileDropdown items={menuItems} trigger={<Avatar />} />
```

### SearchBar
Debounced search input with clear button.
```typescript
import { SearchBar } from '@/components/molecules';
<SearchBar onDebounce={handleSearch} debounce={300} showClear />
```

### Stepper
Multi-step wizard with step indicators + lazy-rendered content panels.
```typescript
import { Stepper } from '@/components/molecules/Stepper';

<Stepper
  items={[
    { key: 'pr', label: 'Pilih PR', content: <PRSelection /> },
    { key: 'items', label: 'Pilih Items', content: <ItemSelection /> },
    { key: 'compare', label: 'Comparison', content: <Comparison /> },
    { key: 'winner', label: 'Pick Winner', content: <PickWinner /> },
    { key: 'finalize', label: 'Finalize', content: <FinalizeForm /> },
  ]}
  defaultActiveKey="items"
/>
/* Controlled + navigation buttons */
const [active, setActive] = useState('pr');
<Stepper items={steps} activeKey={active} onChange={setActive} />
<div className="flex justify-between">
  <button onClick={prev}>Previous</button>
  <button onClick={next}>Next</button>
</div>
```

### Tabs
Tab navigation + lazy-rendered panels. See main components README for full documentation.

### AdvancedFilter
Advanced filter panel with multiple criteria.

### ItemNotFound
Empty state for list items.

### NotFound
404 not found component.

## Import Pattern

```typescript
// Individual component
import { Alert } from '@/components/molecules/Alert';

// Via barrel (all molecules)
import { Alert, DataTablePagination, DatePicker } from '@/components/molecules';
```

## Rules

1. Molecules compose atoms together
2. Molecules may have local UI state (open/closed, debounce)
3. Molecules should still be focused — one clear purpose
4. No API calls or business logic in molecules