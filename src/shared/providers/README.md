# Providers - React Context Providers

React context providers and setup wrappers for the application.

## Providers Component

Main provider wrapper that sets up all app-wide providers.

```typescript
import { Providers } from '@/shared/providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## What's Included

- **QueryClientProvider** — React Query setup with default options
- **ReactQueryDevtools** — Development tools (development only)
- **AuthStoreProvider** — Auth state synchronization
- **Toast notifications** — Global toast setup (if configured)

---

## Usage Pattern

The `Providers` component should wrap the entire application in `app/layout.tsx`.

Do not manually use `QueryClientProvider` elsewhere — use the `Providers` component instead.

---

## Adding New Providers

When adding new context providers:

1. Add provider to the `Providers` component in `index.tsx`
2. Ensure provider is properly typed
3. Test with SSR (server-side rendering)
4. Document provider usage here