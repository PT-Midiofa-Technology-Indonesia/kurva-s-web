# error Domain

Static error page components for 404 (Not Found) and 500 (Server Error) routes. Contains SVG icon components and display string constants.

## Structure

```
error/
├── components/
│   ├── Icon404.tsx          # SVG illustration for not-found pages
│   └── Icon500.tsx          # SVG illustration for server-error pages
├── constants/
│   └── index.ts             # ERROR_LABELS (page titles, messages, button text)
├── pages/
│   ├── NotFoundPage.tsx     # 404 full-page component
│   └── ServerErrorPage.tsx  # 500 full-page component
└── index.ts                 # Barrel exports
```

## Key Files

- `pages/NotFoundPage.tsx` — rendered by `app/not-found.tsx`; uses `Icon404`
- `pages/ServerErrorPage.tsx` — rendered by `app/error.tsx`; uses `Icon500`
- `components/Icon404.tsx` — inline SVG illustration for 404 state
- `components/Icon500.tsx` — inline SVG illustration for 500 state
- `constants/index.ts` — `ERROR_LABELS` with all user-facing strings

## Exports

- `NotFoundPage` — 404 full-page component
- `ServerErrorPage` — 500 full-page component
- `ERROR_LABELS` — display string constants

## Usage Example

```tsx
// app/not-found.tsx
import { NotFoundPage } from '@/domains/error';

export default function NotFound() {
  return <NotFoundPage />;
}
```

```tsx
// app/error.tsx
'use client';
import { ServerErrorPage } from '@/domains/error';

export default function Error() {
  return <ServerErrorPage />;
}
```
