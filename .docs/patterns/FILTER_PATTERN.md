# Advanced Filter Pattern — Complete Reference

The `AdvancedFilter` component provides a global, reusable filter UI with automatic URL parameter synchronization. Use it for list pages, dashboards, or any page requiring advanced filtering.

---

## Quick Rules

- **Use AdvancedFilter** for multi-field filters on list pages
- **Define filter fields in constants** — `src/domains/<domain>/constants/filter-fields.ts`
- **Define schema with Zod** — `src/domains/<domain>/schemas/<entity>-filter.schema.ts`
- **Use useFilterParams hook** — Manages URL params automatically
- **All filter values in URL** — Enables shareable/bookmarkable filter states
- **Reset clears to page 1** — Resets pagination when filters change

---

## Directory Structure

```
src/domains/<domain>/
├── constants/
│   └── filter-fields.ts       # Filter field definitions
├── schemas/
│   └── <entity>-filter.schema.ts  # Zod filter validation
├── components/
│   └── <Entity>Filter.tsx      # Filter component using AdvancedFilter
├── hooks/
│   └── use-<entity>-filter.ts  # useFilterParams hook integration
└── pages/
    └── <Entity>ListPage.tsx    # Page using filter
```

---

## Step 1: Define Filter Fields (constants)

```typescript
// src/domains/vendor/constants/filter-fields.ts
import type { FormFieldConfig } from '@/components/organisms/FormGenerator/types';

export interface VendorFilterFields {
  vendor?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const VENDOR_FILTER_FIELDS: FormFieldConfig<VendorFilterFields>[] = [
  {
    name: 'vendor',
    label: 'Vendor',
    type: 'text',
    placeholder: 'Search vendor...',
    colSpan: 6,
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Pending', value: 'pending' },
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

export const VENDOR_FILTER_LABELS = {
  TITLE: 'Advanced Filter',
  RESET: 'Reset',
  APPLY: 'Apply',
};
```

---

## Step 2: Define Filter Schema (Zod)

```typescript
// src/domains/vendor/schemas/vendor-filter.schema.ts
import { z } from 'zod';

export const vendorFilterSchema = z.object({
  vendor: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  // Date fields: accept both Date objects (from date picker) and strings (from URL)
  // Then transform to ISO string for URL params
  dateFrom: z.union([z.date(), z.string()]).optional().transform((val) =>
    val instanceof Date ? val.toISOString() : val
  ),
  dateTo: z.union([z.date(), z.string()]).optional().transform((val) =>
    val instanceof Date ? val.toISOString() : val
  ),
});

export type VendorFilterInput = z.infer<typeof vendorFilterSchema>;
```

**Why the transform?**
- Date picker fields return `Date` objects from the form
- URL parameters require ISO string format
- The transform automatically converts `Date` → string, leaving strings as-is

---

## Step 3: Create Filter Component

```typescript
// src/domains/vendor/components/VendorFilter.tsx
'use client';

import { AdvancedFilter } from '@/components/molecules';
import type { VendorFilterInput } from '../schemas/vendor-filter.schema';
import { vendorFilterSchema } from '../schemas/vendor-filter.schema';
import { VENDOR_FILTER_FIELDS, VENDOR_FILTER_LABELS } from '../constants/filter-fields';

interface VendorFilterProps {
  defaultValues?: Partial<VendorFilterInput>;
  onApply: (filters: VendorFilterInput) => void;
  onReset?: () => void;
  isLoading?: boolean;
}

export function VendorFilter({
  defaultValues,
  onApply,
  onReset,
  isLoading,
}: VendorFilterProps) {
  return (
    <AdvancedFilter<VendorFilterInput>
      title={VENDOR_FILTER_LABELS.TITLE}
      schema={vendorFilterSchema}
      fields={VENDOR_FILTER_FIELDS}
      defaultValues={defaultValues}
      onApply={onApply}
      onReset={onReset}
      isLoading={isLoading}
    />
  );
}
```

---

## Step 4: Create Filter Hook

```typescript
// src/domains/vendor/hooks/use-vendor-filter.ts
'use client';

import { useCallback, useMemo } from 'react';
import { useFilterParams } from '@/hooks/use-filter-params';
import type { VendorFilterInput } from '../schemas/vendor-filter.schema';

export interface VendorListParams {
  page: number;
  perPage: number;
  search?: string;
  vendor?: string;
  status?: 'active' | 'inactive' | 'pending';
  dateFrom?: Date;
  dateTo?: Date;
}

export function useVendorFilter() {
  const { filterParams, applyFilters, resetFilters, currentPage } = 
    useFilterParams<VendorFilterInput>();

  // Convert URL string params to typed API params
  const params = useMemo(() => ({
    page: currentPage,
    perPage: 10,
    vendor: filterParams.vendor,
    status: filterParams.status as 'active' | 'inactive' | 'pending' | undefined,
    dateFrom: filterParams.dateFrom ? new Date(filterParams.dateFrom) : undefined,
    dateTo: filterParams.dateTo ? new Date(filterParams.dateTo) : undefined,
  }), [
    currentPage,
    filterParams.vendor,
    filterParams.status,
    filterParams.dateFrom,
    filterParams.dateTo,
  ]);

  const handleApplyFilters = useCallback(
    (filterData: VendorFilterInput) => {
      applyFilters(filterData);
    },
    [applyFilters]
  );

  return {
    filterParams,
    params,
    applyFilters: handleApplyFilters,
    resetFilters,
    currentPage,
  };
}
```

---

## Step 5: Use in List Page

```typescript
// src/domains/vendor/pages/VendorListPage.tsx
'use client';

import { useMemo } from 'react';
import { ListPageTemplate } from '@/components/templates';
import { VendorFilter } from '../components/VendorFilter';
import { useVendorFilter } from '../hooks/use-vendor-filter';
import { useVendors } from '../hooks/use-vendors';

export function VendorListPage() {
  // 1. Get filter params from URL
  const { filterParams, params, applyFilters, resetFilters } = useVendorFilter();

  // 2. Fetch data with filter params
  const { vendors, totalItems, totalPages, isLoading } = useVendors(params);

  // 3. Prepare filter default values from URL
  const filterDefaults = useMemo(() => ({
    vendor: filterParams.vendor || '',
    status: filterParams.status || '',
    dateFrom: filterParams.dateFrom || '',
    dateTo: filterParams.dateTo || '',
  }), [filterParams]);

  return (
    <div className="space-y-4">
      {/* Filter Component */}
      <VendorFilter
        defaultValues={filterDefaults}
        onApply={applyFilters}
        onReset={resetFilters}
        isLoading={isLoading}
      />

      {/* List Template */}
      <ListPageTemplate
        title="Vendors"
        data={vendors}
        columns={[
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'status', header: 'Status' },
          { accessorKey: 'createdAt', header: 'Created' },
        ]}
        isLoading={isLoading}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </div>
  );
}
```

---

## useFilterParams Hook

The `useFilterParams` hook manages URL-based filter state:

```typescript
const {
  filterParams,           // Current URL filter params (strings)
  applyFilters,          // Function to apply filter and reset to page 1
  resetFilters,          // Function to clear all filters
  updateFilterParam,     // Update single filter param
  currentPage,           // Current page number
  getTypedFilterParams,  // Get typed filter params
} = useFilterParams<FilterType>();

// Apply filters (resets to page 1)
applyFilters({ vendor: 'Acme', status: 'active' });
// URL: ?vendor=Acme&status=active&page=1

// Reset all filters
resetFilters();
// URL: ?page=1

// Update single param
updateFilterParam('vendor', 'Acme');
```

---

## AdvancedFilter Props

```typescript
interface AdvancedFilterProps<T extends FieldValues> {
  title?: string;                    // Filter header title (default: 'Filter')
  schema: ZodType<T>;                // Zod validation schema
  fields: FormFieldConfig<T>[];      // Field definitions with colSpan support
  defaultValues?: Partial<T>;        // Initial form values
  onApply: (data: T) => void;        // Apply filter handler
  onReset?: () => void;              // Reset filter handler
  isLoading?: boolean;               // Show loading state on buttons
  className?: string;                // Additional CSS classes
}
```

---

## Field Configuration with Responsive Grid

Fields support responsive `colSpan`:

```typescript
// Single column (full width)
{
  name: 'vendor',
  label: 'Vendor',
  type: 'text',
  colSpan: 12,
}

// Two columns
{
  name: 'vendor',
  label: 'Vendor',
  type: 'text',
  colSpan: 6,
}

// Three columns
{
  name: 'vendor',
  label: 'Vendor',
  type: 'text',
  colSpan: 4,
}

// Responsive columns
{
  name: 'vendor',
  label: 'Vendor',
  type: 'text',
  colSpan: {
    base: 12,    // Mobile: full width
    md: 6,       // Tablet: half width
    lg: 4,       // Desktop: third
  },
}
```

---

## Filter Value Types

The hook automatically converts filter values to/from strings:

```typescript
// String (no conversion needed)
applyFilters({ vendor: 'Acme' });
// URL: ?vendor=Acme

// Boolean
applyFilters({ isActive: true });
// URL: ?isActive=true

// Number
applyFilters({ minPrice: 100 });
// URL: ?minPrice=100

// Date
applyFilters({ dateFrom: new Date('2024-01-01') });
// URL: ?dateFrom=2024-01-01T00:00:00.000Z

// Array
applyFilters({ tags: ['urgent', 'review'] });
// URL: ?tags=urgent,review
```

---

## Complete Example with Multiple Filters

```typescript
// schemas/project-filter.schema.ts
import { z } from 'zod';

export const projectFilterSchema = z.object({
  name: z.string().optional(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
  teamId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

// constants/filter-fields.ts
export const PROJECT_FILTER_FIELDS: FormFieldConfig[] = [
  {
    name: 'name',
    label: 'Project Name',
    type: 'text',
    placeholder: 'Search projects...',
    colSpan: { base: 12, md: 6, lg: 4 },
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Completed', value: 'completed' },
      { label: 'Archived', value: 'archived' },
    ],
    colSpan: { base: 12, md: 6, lg: 4 },
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
    ],
    colSpan: { base: 12, md: 6, lg: 4 },
  },
  {
    name: 'teamId',
    label: 'Team',
    type: 'select',
    options: [
      { label: 'Team A', value: 'team-a' },
      { label: 'Team B', value: 'team-b' },
    ],
    colSpan: { base: 12, md: 6, lg: 4 },
  },
  {
    name: 'dateFrom',
    label: 'Date From',
    type: 'date',
    colSpan: { base: 12, md: 6, lg: 4 },
  },
  {
    name: 'dateTo',
    label: 'Date To',
    type: 'date',
    colSpan: { base: 12, md: 6, lg: 4 },
  },
];
```

---

## Best Practices Checklist

- [ ] Filter fields defined in constants (never inline)
- [ ] Filter schema defined in separate Zod file
- [ ] useFilterParams hook used (never manual URL manipulation)
- [ ] Filter component accepts form defaults
- [ ] Filter component has loading state
- [ ] colSpan defined for proper responsive layout
- [ ] Date filters use ISO string format
- [ ] Comma-separated values for arrays in URL
- [ ] Numeric strings parsed in hook
- [ ] Pagination resets to page 1 on filter change
- [ ] Reset handler clears all filters

---

## Avoid These Patterns

❌ **Inline field definitions**:
```tsx
const fields = [{ name: 'status', ... }];  // Should be in constants
```

❌ **Manual URL manipulation**:
```ts
window.location.href = `?status=active&page=1`;  // Use applyFilters()
```

❌ **Forgetting to reset pagination**:
```ts
applyFilters({ status: 'active' });  // Still on page 2 if not reset
```

❌ **Mixed URL and API types**:
```ts
// Wrong: passing string from URL to API expecting typed enum
const { data } = useProjects({ status: filterParams.status });
```

---

## See Also

- [[QUERY_PARAMS_PATTERN.md]] — URL parameter management foundation
- [[FORMS_PATTERN.md]] — Form building with FormGenerator
- [[LIST_PAGES_PATTERN.md]] — Full list page implementation
