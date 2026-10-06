# Advanced Filter Component — Setup & Usage

This document summarizes the new global filter component added to the project.

## What Was Added

### 1. AdvancedFilter Component
**Location**: `src/shared/components/molecules/AdvancedFilter/`

A reusable filter component with:
- Responsive 12-column grid layout (`colSpan` support)
- Zod schema validation
- Apply/Reset buttons with loading states
- Multiple field types (text, select, date, etc.)
- Integrated with FormFieldRenderer for consistency

**Exports**:
- `AdvancedFilter` — Main component
- `AdvancedFilterProps` — Component props interface

**Import**: `import { AdvancedFilter } from '@/components/molecules'`

### 2. useFilterParams Hook
**Location**: `src/shared/hooks/use-filter-params.ts`

A custom hook for managing filter parameters in the URL. Extends `useQueryParams` with:
- `applyFilters()` — Apply filter and reset to page 1
- `resetFilters()` — Clear all filters
- `updateFilterParam()` — Update single param
- `getTypedFilterParams()` — Get typed filter values
- `currentPage` — Current page number
- Automatic string/date/array conversion for URL params

**Usage**:
```typescript
const { filterParams, applyFilters, resetFilters } = useFilterParams<FilterType>();
```

### 3. Documentation
**Location**: `.docs/patterns/FILTER_PATTERN.md`

Complete reference guide including:
- Quick rules and best practices
- Step-by-step implementation guide
- API reference for components and hooks
- Multiple real-world examples
- Responsive grid layout guide

### 4. Storybook Stories
**Location**: `src/shared/components/molecules/AdvancedFilter/AdvancedFilter.stories.tsx`

Stories demonstrating:
- Basic usage
- Multiple rows of filters
- Without title
- Loading state

### 5. Component Tests
**Location**: `src/shared/components/molecules/AdvancedFilter/AdvancedFilter.test.tsx`

Test coverage for:
- Rendering title and fields
- Apply/Reset button behavior
- Form submission
- Loading states
- Default values
- Responsive layout

### 6. README
**Location**: `src/shared/components/molecules/AdvancedFilter/README.md`

Quick reference for:
- Features
- Basic usage
- Field types
- Props reference
- Styling customization

---

## Quick Start

### 1. Create Filter Schema
```typescript
// src/domains/vendors/schemas/vendor-filter.schema.ts
import { z } from 'zod';

export const vendorFilterSchema = z.object({
  vendor: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  // ⚠️ IMPORTANT: Date fields must handle both Date objects and strings
  // Date picker returns Date object, URL params need ISO string
  dateFrom: z.union([z.date(), z.string()]).optional().transform((val) =>
    val instanceof Date ? val.toISOString() : val
  ),
  dateTo: z.union([z.date(), z.string()]).optional().transform((val) =>
    val instanceof Date ? val.toISOString() : val
  ),
});

export type VendorFilterInput = z.infer<typeof vendorFilterSchema>;
```

### 2. Define Filter Fields
```typescript
// src/domains/vendors/constants/filter-fields.ts
import type { FormFieldConfig } from '@/components/organisms/FormGenerator/types';
import type { VendorFilterInput } from '../schemas/vendor-filter.schema';

export const VENDOR_FILTER_FIELDS: FormFieldConfig<VendorFilterInput>[] = [
  {
    name: 'vendor',
    label: 'Vendor Name',
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
  {
    name: 'dateFrom',
    label: 'Date From',
    type: 'date',
    colSpan: 6,
  },
  {
    name: 'dateTo',
    label: 'Date To',
    type: 'date',
    colSpan: 6,
  },
];
```

### 3. Create Filter Hook
```typescript
// src/domains/vendors/hooks/use-vendor-filter.ts
import { useFilterParams } from '@/hooks/use-filter-params';
import type { VendorFilterInput } from '../schemas/vendor-filter.schema';

export function useVendorFilter() {
  const { filterParams, applyFilters, resetFilters, currentPage } = 
    useFilterParams<VendorFilterInput>();

  // Convert URL params to API types
  const params = useMemo(() => ({
    page: currentPage,
    perPage: 10,
    vendor: filterParams.vendor,
    status: filterParams.status as 'active' | 'inactive' | undefined,
    dateFrom: filterParams.dateFrom ? new Date(filterParams.dateFrom) : undefined,
    dateTo: filterParams.dateTo ? new Date(filterParams.dateTo) : undefined,
  }), [currentPage, filterParams]);

  return { params, filterParams, applyFilters, resetFilters };
}
```

### 4. Use in List Page
```typescript
// src/domains/vendors/pages/VendorListPage.tsx
'use client';

import { AdvancedFilter } from '@/components/molecules';
import { useVendorFilter } from '../hooks/use-vendor-filter';
import { useVendors } from '../hooks/use-vendors';
import { VENDOR_FILTER_FIELDS } from '../constants/filter-fields';
import { vendorFilterSchema } from '../schemas/vendor-filter.schema';

export function VendorListPage() {
  const { filterParams, params, applyFilters, resetFilters } = useVendorFilter();
  const { vendors, isLoading } = useVendors(params);

  return (
    <div className="space-y-4">
      <AdvancedFilter
        title="Advanced Filter"
        schema={vendorFilterSchema}
        fields={VENDOR_FILTER_FIELDS}
        defaultValues={filterParams}
        onApply={applyFilters}
        onReset={resetFilters}
        isLoading={isLoading}
      />

      <VendorList vendors={vendors} isLoading={isLoading} />
    </div>
  );
}
```

---

## Key Features

### Responsive Grid Layout
Fields automatically layout in a 12-column grid with `colSpan`:
```typescript
{
  name: 'vendor',
  colSpan: 6,  // Half width
}

// Or responsive:
{
  name: 'vendor',
  colSpan: {
    base: 12,    // Mobile: full width
    md: 6,       // Tablet: half width
    lg: 4,       // Desktop: third width
  },
}
```

### URL Synchronization
All filter values are automatically synced to URL parameters:
```
?vendor=Acme&status=active&dateFrom=2024-01-01&dateTo=2024-12-31&page=1
```

### Type Safety
Zod validation + TypeScript types ensure type-safe filters:
```typescript
// Compiler error: dateFrom is expected to be a string in URL
applyFilters({ dateFrom: new Date() });

// Correct: convert date to string
applyFilters({ dateFrom: new Date().toISOString() });

// Hook handles conversion automatically
const params = useMemo(() => ({
  dateFrom: filterParams.dateFrom ? new Date(filterParams.dateFrom) : undefined,
}), [filterParams.dateFrom]);
```

### Multiple Field Types
- Text inputs (text, email, password)
- Selects (single, multi-select)
- Date pickers (single date, date range)
- Checkboxes and switches
- Custom fields

---

## File Structure

```
src/
├── shared/
│   ├── components/
│   │   └── molecules/
│   │       └── AdvancedFilter/          ← NEW
│   │           ├── AdvancedFilter.tsx
│   │           ├── AdvancedFilter.stories.tsx
│   │           ├── AdvancedFilter.test.tsx
│   │           ├── README.md
│   │           └── index.ts
│   └── hooks/
│       └── use-filter-params.ts         ← NEW
└── domains/
    └── <domain>/
        ├── constants/
        │   └── filter-fields.ts         ← PER-DOMAIN
        ├── schemas/
        │   └── <entity>-filter.schema.ts ← PER-DOMAIN
        ├── hooks/
        │   └── use-<entity>-filter.ts   ← PER-DOMAIN
        └── pages/
            └── <Entity>ListPage.tsx     ← USE FILTER HERE
```

---

## Documentation References

- **Complete Guide**: [.docs/patterns/FILTER_PATTERN.md](.docs/patterns/FILTER_PATTERN.md)
- **Component README**: [src/shared/components/molecules/AdvancedFilter/README.md](src/shared/components/molecules/AdvancedFilter/README.md)
- **Query Params Pattern**: [.docs/patterns/QUERY_PARAMS_PATTERN.md](.docs/patterns/QUERY_PARAMS_PATTERN.md)
- **Forms Pattern**: [.docs/patterns/FORMS_PATTERN.md](.docs/patterns/FORMS_PATTERN.md)

---

## Next Steps

1. **Per-Domain Setup**: For each domain needing filters, create:
   - Filter schema (Zod)
   - Filter fields constants
   - Filter hook with param conversion
   - Use in list page component

2. **Customize Styling**: Override with `className` prop if needed

3. **Add Tests**: Test filter behavior specific to your domain

4. **Document**: Add domain-specific filter docs to domain README

---

## Implementation Checklist

When adding filters to a new list page:

- [ ] Create filter schema (Zod) with all filter fields
- [ ] Define filter fields in constants with `colSpan` layout
- [ ] Create filter hook with URL→API param conversion
- [ ] Add filter component to list page
- [ ] Test filter submission and URL updates
- [ ] Test filter reset
- [ ] Test responsive layout on mobile
- [ ] Document filter fields in domain README
- [ ] Add integration tests for filter + data fetch

---

## Styling

The component uses Tailwind CSS and follows the design from your Figma:

**Container**:
```css
rounded-2xl border border-slate-200 bg-white p-6 shadow-sm
```

**Buttons**:
- Reset: outline variant with X icon
- Apply: dark variant with search icon

Override the entire component styling:
```typescript
<AdvancedFilter
  className="bg-slate-50 p-4"
  {...props}
/>
```

---

## Troubleshooting

### Filter not updating URL?
- Ensure `applyFilters()` is called with form data
- Check that `useFilterParams()` hook is used correctly
- Verify Zod schema matches field names

### Filters not showing in form?
- Check `defaultValues` is passed from `filterParams`
- Ensure field `name` matches schema property
- Verify `type` is a supported field type

### Responsive layout not working?
- Check `colSpan` values (1-12 or object)
- Ensure Tailwind is processing your colSpan values
- Check grid gap spacing

---

## See Also

- [FILTER_PATTERN.md](.docs/patterns/FILTER_PATTERN.md) — Complete pattern guide
- [QUERY_PARAMS_PATTERN.md](.docs/patterns/QUERY_PARAMS_PATTERN.md) — URL params
- [FORMS_PATTERN.md](.docs/patterns/FORMS_PATTERN.md) — Form building
- [AdvancedFilter Component](.docs/ADVANCED_FILTER_SETUP.md) — This document
