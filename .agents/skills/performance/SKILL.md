---
name: performance
description: Next.js performance optimization - Core Web Vitals, code splitting, image optimization, bundle analysis, caching strategies
user-invocable: false
---

# Next.js Performance

Complete performance optimization strategy for Core Web Vitals and user experience.

## Core Web Vitals

See [../../.docs/practices/03-performance.md](../../.docs/practices/03-performance.md) for:
- **LCP** (Largest Contentful Paint) < 2.5s - Optimize images, code splitting, server response
- **FID/INP** (Interaction to Next Paint) < 100ms - Reduce JavaScript, debounce handlers
- **CLS** (Cumulative Layout Shift) < 0.1 - Reserve space for images, avoid inserting above content

## Image Optimization

```typescript
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority              // Load above fold
  quality={75}          // 75-85 good default
  sizes="(max-width: 768px) 100vw, 50vw"  // Responsive
  placeholder="blur"    // Show blur while loading
  blurDataURL="..."     // Generate with getBlurDataURL()
/>
```

**Never use raw `<img>` tags** - always use `next/image`.

## Code Splitting

```typescript
// Route-based (automatic per route)
app/users/page.tsx
app/dashboard/page.tsx

// Component-based (lazy load heavy libraries)
const Chart = dynamic(() => import('react-charts'), {
  loading: () => <Skeleton />,
  ssr: false,  // Don't SSR heavy components
})

// Modal-based (only load when opened)
const DeleteDialog = dynamic(() => import('./DeleteDialog'), {
  loading: () => null,
})
```

## Bundle Analysis

```bash
ANALYZE=true pnpm run build  # Generate bundle report
```

Reduce bundle by:
- Importing specific functions, not entire libraries
- Using smaller alternatives (`lodash-es` vs `lodash`)
- Code splitting heavy components with `dynamic()`

## Caching Strategies

**Static Generation** (build-time):
```typescript
export const revalidate = 3600  // Revalidate hourly (ISR)
```

**Dynamic with Cache Headers**:
```typescript
return new Response(JSON.stringify(data), {
  headers: { 'Cache-Control': 'public, s-maxage=300' }
})
```

**React Query Stale Time**:
```typescript
staleTime: 5 * 60 * 1000,     // 5 minutes
gcTime: 10 * 60 * 1000,       // 10 minutes
```

## Request Optimization

**Prefetch Links**:
```typescript
<Link href="/users" prefetch={true}>  // Automatic in production
  Users
</Link>

// Manual prefetch on hover
<button onMouseEnter={() => router.prefetch('/users')}>
  Users
</button>
```

**Debounce Search**:
```typescript
const [search, setSearch] = useState('')
const debouncedSearch = useDebounce(search, 300)

// API call uses debouncedSearch, not search
```

## Font Optimization

```typescript
import { Inter, Poppins } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], preload: true })
const poppins = Poppins({ weight: ['400', '700'], preload: true })

// Use CSS variables
<html className={`${inter.variable} ${poppins.variable}`}>
```

## Database Query Optimization

- **Pagination**: Always paginate, never fetch all
- **Indexing**: Index frequently queried columns
- **Select Fields**: `select: { id, name, email }` not `*`

## Monitoring

```bash
pnpm run build           # Check bundle size
lighthouse-ci            # Automated performance testing
```

Track with Sentry:
```typescript
getCLS(metric => {
  if (metric.value > 0.1) {
    captureMessage(`CLS: ${metric.value}`, 'warning')
  }
})
```

## Performance Checklist

- [ ] Images use `next/image` with `sizes` prop
- [ ] Heavy components lazy-loaded with `dynamic()`
- [ ] Bundle analyzed and optimized
- [ ] No large dependencies
- [ ] Search/filters debounced (300ms)
- [ ] Lists paginated (max 50 per page)
- [ ] Static content cached with `revalidate`
- [ ] Fonts preloaded
- [ ] Web Vitals monitored (Sentry + Lighthouse)

## See Also

- [Error Handling & Observability](../../.docs/practices/02-error-handling.md) — Monitor performance issues
- [Security](../../.docs/practices/04-security.md) — Secure while optimizing
