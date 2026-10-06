# Atoms - Basic Building Blocks

Smallest building blocks in atomic design. Single responsibility, no internal state beyond basic UI interaction.

## Components

### Button
Variants: `default`, `outline`, `destructive`, `ghost`, `ghost-destructive`. Sizes: `xs`, `sm`, `md`, `lg`
```typescript
import { Button } from '@/components/atoms';
<Button variant="outline" size="sm" leftIcon={<Icon />} isLoading={false}>Click</Button>
```

### Input
Text input with left/right icon slots, error and disabled states.
```typescript
import { Input } from '@/components/atoms';
<Input leftIcon={<SearchIcon />} error="Field required" />
```

### InputCurrency
Currency-formatted numeric input.
```typescript
import { InputCurrency } from '@/components/atoms';
<InputCurrency value={1000000} onChange={setValue} currency="Rp" />
```

### InputNumber
Numeric-only input with min/max.
```typescript
import { InputNumber } from '@/components/atoms';
<InputNumber value={0} onChange={setValue} min={0} max={100} />
```

### Text
Typography atom — 9 sizes, 5 weights, semantic colors.
```typescript
import { Text } from '@/components/atoms';
<Text size="xl" weight="semibold" color="muted" as="h1">Title</Text>
```

### AsyncSelect
Searchable select with groups, async options, multi-select.
```typescript
import { AsyncSelect } from '@/components/atoms';
<AsyncSelect options={opts} value={val} onChange={setVal} isMulti isSearchable />
```

### Switch
Toggle switch.
```typescript
import { Switch } from '@/components/atoms';
<Switch checked={val} onCheckedChange={setVal} />
```

### Checkbox
Checkbox with label.
```typescript
import { Checkbox } from '@/components/atoms';
<Checkbox checked={val} onCheckedChange={setVal}>Remember me</Checkbox>
```

### Breadcrumb
Breadcrumb navigation with items.
```typescript
import { Breadcrumb } from '@/components/atoms';
<Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Users', path: '/users' }]} />
```

### KanbanCard
Card for kanban boards.
```typescript
import { KanbanCard } from '@/components/atoms';
<KanbanCard title="Task 1" description="Description" />
```

### PermissionCheckbox
Checkbox styled for permission grids.

### DataTableColumnHeader
Sortable column header with drag grip.
```typescript
import { DataTableColumnHeader } from '@/components/atoms';
<DataTableColumnHeader column={column} title="Name" />
```

### DataTableEditableCell
Inline cell editor (input or select).
```typescript
import { DataTableEditableCell } from '@/components/atoms';
<DataTableEditableCell value={val} editType="input" onSave={save} onCancel={cancel} />
```

### RouteLoader
Route transition loading indicator.

### Select
Standard select dropdown.

## Import Pattern

```typescript
// Individual component
import { Button } from '@/components/atoms/Button';

// Via barrel (all atoms)
import { Button, Input, Text } from '@/components/atoms';
```

## Rules

1. Atoms have no internal state beyond UI interaction
2. Each atom is a single HTML element or simple composition
3. Atoms should be dumb — no business logic, no API calls
4. Compose atoms into molecules for reusable patterns