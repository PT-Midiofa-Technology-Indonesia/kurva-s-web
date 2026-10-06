# Master Data

Namespace domain grouping all master data sub-domains. Each sub-domain manages a distinct reference entity used across the application.

## Structure

```
master-data/
└── job-position/
    ├── api/
    ├── components/
    │   └── __tests__/
    ├── constants/
    ├── hooks/
    ├── pages/
    │   └── __tests__/
    ├── schemas/
    └── types/
```

## Sub-Domains

| Sub-domain | Description |
|---|---|
| `job-position` | Job position master data (in progress — no files yet) |

## Notes

- `master-data/` is a namespace directory; it has no own `index.ts` or barrel exports.
- Each sub-domain follows the standard domain structure: `api/`, `hooks/`, `components/`, `pages/`, `schemas/`, `types/`, `constants/`.
- Import from the specific sub-domain path, e.g. `@/domains/master-data/job-position`.

## Usage Example

```tsx
// Import from the specific sub-domain, not the namespace root
import { useJobPositions } from '@/domains/master-data/job-position';
```
