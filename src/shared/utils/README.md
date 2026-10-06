# Utils - Utility Functions

General utility functions used across the application.

## Available Utilities

### cn.ts - ClassName Merger

Merge Tailwind CSS classes with conditional support.

```typescript
import { cn } from '@/utils/cn';

const classes = cn(
  'px-4 py-2',
  condition && 'bg-primary',
  disabled && 'opacity-50'
);
```

Uses `clsx` + `tailwind-merge` (twin.macro pattern).

---

### format.ts - Display Formatters

All display formatters in one place. Uses `date-fns` with Indonesian locale (`id`) for dates.

```typescript
import {
  formatDate,
  formatDateLong,
  formatDateTime,
  formatDateTimeLong,
  formatFileSize,
  formatCurrencyIDR,
  formatNumber,
} from '@/shared/utils/format';
```

| Function | Output example | Use case |
|---|---|---|
| `formatDate(value)` | `05 Mar 2025` | Standard date display |
| `formatDateLong(value)` | `5 Maret 2025` | Full Indonesian month name |
| `formatDateTime(value)` | `05 Mar 2025 14:30` | Date + time display |
| `formatDateTimeLong(value)` | `5 Maret 2025 14:30` | Full Indonesian month + time |
| `formatFileSize(bytes?)` | `1.5 MB` | File size display |
| `formatCurrencyIDR(value)` | `Rp 1.500.000` | IDR currency with symbol |
| `formatNumber(value)` | `1.500.000` | Locale number, no currency symbol |
| `parseDateString(str)` | `Date \| undefined` | `"yyyy-MM-dd"` → local-midnight `Date` (for date picker min/max) |

All display date functions accept `string | Date` and return `'-'` on parse error. `formatFileSize` returns `''` for falsy input.

Do **not** create local `formatDate`, `formatFileSize`, `formatCurrency` functions in domain components — import from here instead.

---

### grid.ts - Grid Span Utilities

Tailwind `col-span-*` / `row-span-*` class lookup tables and resolvers used by `FormGenerator` and `AdvancedFilter`. Supports static values and responsive breakpoint objects.

```typescript
import {
  resolveColSpan,
  resolveRowSpan,
  COL,
  ROW,
  BREAKPOINTS,
} from '@/shared/utils/grid';
import type { ColSpan, RowSpan, Breakpoint } from '@/shared/utils/grid';

// number shorthand
resolveColSpan(6);                        // 'col-span-6'

// responsive object
resolveColSpan({ base: 12, md: 6 });      // 'col-span-12 md:col-span-6'

resolveRowSpan(2);                         // 'row-span-2'
resolveRowSpan(undefined);                 // ''
```

Do **not** define local `COL`/`ROW` lookup tables or `resolveColSpan`/`resolveRowSpan` in components — import from here instead.

---

### masks.ts - Input Masks

Phone, and other input formatting masks for form fields.

```typescript
import { maskPhone, formatPhone, noWhitespace } from '@/shared/utils/masks';
```

---

### string.ts - String Utilities

```typescript
import { toTitleCase } from '@/shared/utils/string';

toTitleCase('hello_world');  // 'Hello World'
toTitleCase('fooBar');       // 'Foo Bar'
```

---

### file-download.ts - File Download

Trigger a browser file download from a `Blob`.

```typescript
import { downloadFile } from '@/shared/utils/file-download';

downloadFile(blob, 'report.pdf');
```

---

### test-utils.tsx - Test Utilities

Helper functions for testing React components with all providers wired up.

```typescript
import { render, screen } from '@/utils/test-utils';
```

---

## Usage

```typescript
import { formatDate, formatCurrencyIDR } from '@/shared/utils/format';
import { cn } from '@/lib/utils';    // via lib/utils.ts re-export
import { cn } from '@/utils/cn';    // direct import
```

---

---

## Adding New Utilities

Add cross-domain utilities here when used by 2+ domains.

For domain-specific utilities, use `src/domains/<domain>/services/` instead.
