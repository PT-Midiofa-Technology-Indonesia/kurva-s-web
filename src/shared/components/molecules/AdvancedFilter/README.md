# AdvancedFilter Component

A reusable, configurable filter component with automatic URL parameter synchronization and responsive grid layout.

## Features

- **Responsive Grid Layout**: Fields arranged in 12-column grid with `colSpan` support
- **URL Synchronization**: Filter state automatically synced to URL parameters
- **Zod Validation**: Type-safe validation with Zod schemas
- **Multiple Field Types**: Text, select, date, checkbox, and custom fields
- **Reset Functionality**: Clear all filters and reset to page 1
- **Loading States**: Disable buttons during async operations

## Basic Usage

```tsx
import { AdvancedFilter } from '@/components/molecules';
import { z } from 'zod';

const filterSchema = z.object({
  vendor: z.string().optional(),
  status: z.string().optional(),
});

function MyListPage() {
  const handleApplyFilters = (data) => {
    // Update URL with filter values
    console.log('Filters:', data);
  };

  return (
    <AdvancedFilter
      title="Advanced Filter"
      schema={filterSchema}
      fields={[
        {
          name: 'vendor',
          label: 'Vendor',
          type: 'text',
          placeholder: 'Search...',
          colSpan: 6,
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ],
          colSpan: 6,
        },
      ]}
      defaultValues={{ vendor: '', status: '' }}
      onApply={handleApplyFilters}
      onReset={() => console.log('Reset')}
    />
  );
}
```

## With useFilterParams Hook

Recommended approach for managing filter state:

```tsx
import { AdvancedFilter } from '@/components/molecules';
import { useFilterParams } from '@/hooks/use-filter-params';

function MyListPage() {
  const { filterParams, applyFilters, resetFilters } = useFilterParams();

  return (
    <AdvancedFilter
      title="Advanced Filter"
      schema={filterSchema}
      fields={[...]}
      defaultValues={filterParams}
      onApply={applyFilters}
      onReset={resetFilters}
    />
  );
}
```

## Field Responsive Layout

Support responsive `colSpan` for mobile-first design:

```tsx
{
  name: 'vendor',
  label: 'Vendor',
  type: 'text',
  colSpan: {
    base: 12,    // Full width on mobile
    md: 6,       // Half width on tablet
    lg: 4,       // Third width on desktop
  },
}
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `'Filter'` | Filter header title |
| `schema` | `ZodType<T>` | Required | Zod validation schema |
| `fields` | `FormFieldConfig<T>[]` | Required | Filter field definitions |
| `defaultValues` | `Partial<T>` | `{}` | Initial form values |
| `onApply` | `(data: T) => void` | Required | Apply filter handler |
| `onReset` | `() => void` | Optional | Reset filter handler |
| `isLoading` | `boolean` | `false` | Show loading state on buttons |
| `className` | `string` | Optional | Additional CSS classes |

## Supported Field Types

- `text` — Text input
- `email` — Email input
- `password` — Password input
- `number` — Number input
- `select` — Single select dropdown
- `multi-select` — Multi-select (with chips)
- `date` — Date picker
- `date-range` — Date range picker
- `checkbox` — Checkbox
- `switch` — Toggle switch
- `textarea` — Multi-line text
- `currency` — Currency input

## Advanced Example

See [FILTER_PATTERN.md](../../docs/patterns/FILTER_PATTERN.md) for complete examples including:
- Defining filter fields and schemas
- Creating filter components per domain
- Using `useFilterParams` hook
- Integrating with list pages
- Type-safe filter conversions

## Styling

The component uses Tailwind CSS classes for styling. Key classes:

- Container: `rounded-2xl border border-slate-200 bg-white p-6 shadow-sm`
- Title: `text-sm font-medium text-slate-500`
- Grid: `grid grid-cols-12 gap-x-4 gap-y-4`
- Buttons: Reset (outline), Apply (dark)

Override with `className` prop:

```tsx
<AdvancedFilter
  className="bg-slate-50"
  {...props}
/>
```

## Related Components

- **FormGenerator** — Underlying form rendering engine
- **ListPageTemplate** — Use with filters in list pages
- **useQueryParams** — Base hook for URL parameter management

## See Also

- [FILTER_PATTERN.md](../../docs/patterns/FILTER_PATTERN.md) — Complete filter implementation guide
- [FORMS_PATTERN.md](../../docs/patterns/FORMS_PATTERN.md) — Form building patterns
- [QUERY_PARAMS_PATTERN.md](../../docs/patterns/QUERY_PARAMS_PATTERN.md) — URL parameter management
