# Next.js Performance

Complete performance optimization strategy for Curva Frontend (Next.js 16).

---

## Core Web Vitals

### Largest Contentful Paint (LCP) — < 2.5s

**What it is**: Time until largest content element loads

**How to improve**:
- Image optimization (next/image with sizes)
- Code splitting (lazy load components)
- Server-render critical content
- Reduce server response time

```typescript
// ✅ Good: Optimized image
import Image from 'next/image'

export function HeroImage() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      priority  // Load above fold
      quality={75}
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  )
}

// ❌ Bad: Raw img tag
export function HeroImage() {
  return <img src="/hero.jpg" alt="Hero" />
}
```

---

### First Input Delay (FID) / Interaction to Next Paint (INP) — < 100ms

**What it is**: Delay from user input to browser responding

**How to improve**:
- Reduce JavaScript
- Defer non-critical JS
- Use Web Workers for heavy computation
- Optimize event handlers

```typescript
// ✅ Good: Debounced search
import { debounce } from '@/shared/hooks/use-debounce'

export function SearchInput() {
  const [query, setQuery] = useState('')

  const handleSearch = debounce((value: string) => {
    setQuery(value)
    // API call
  }, 300)

  return <input onChange={(e) => handleSearch(e.target.value)} />
}

// ❌ Bad: Search on every keystroke
export function SearchInput() {
  const [query, setQuery] = useState('')

  const handleSearch = (value: string) => {
    setQuery(value)
    // API call on every character!
  }

  return <input onChange={(e) => handleSearch(e.target.value)} />
}
```

---

### Cumulative Layout Shift (CLS) — < 0.1

**What it is**: Unexpected layout shifts during page load

**How to improve**:
- Reserve space for images/ads
- Avoid inserting content above existing content
- Avoid interactions without user gesture
- Use font-display: swap

```typescript
// ✅ Good: Reserved space for image
export function ArticleImage() {
  return (
    <div style={{ width: 400, height: 300, position: 'relative' }}>
      <Image
        src="/article.jpg"
        alt="Article"
        fill
        sizes="(max-width: 768px) 100vw, 400px"
      />
    </div>
  )
}

// ❌ Bad: Image causes layout shift
export function ArticleImage() {
  return <img src="/article.jpg" alt="Article" width={400} />
}
```

---

## Code Splitting & Lazy Loading

### Route-Based Code Splitting (Automatic)

```typescript
// app/users/page.tsx automatically code-split
// Every route gets its own bundle

import UserListPage from '@/domains/user/pages/UserListPage'

export default function Page() {
  return <UserListPage />
}
```

### Component-Based Code Splitting

```typescript
// src/shared/components/organisms/UserChart.tsx
// Heavy chart library → lazy load

import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-charts'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false,  // Don't SSR heavy components
})

export function UserChart() {
  return <Chart data={data} />
}

// Usage
const UserChartLazy = dynamic(
  () => import('./UserChart').then(mod => mod.UserChart),
  { loading: () => <Skeleton /> }
)
```

### Modal/Dialog Code Splitting

```typescript
// ✅ Good: Only load modal when needed
import dynamic from 'next/dynamic'

const DeleteDialog = dynamic(
  () => import('./DeleteDialog'),
  { loading: () => null }
)

export function UserList() {
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  return (
    <>
      <Table />
      {deleteTarget && (
        <DeleteDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}
```

---

## Image Optimization

### Best Practices

```typescript
import Image from 'next/image'

export function UserAvatar({ user }: { user: User }) {
  return (
    <Image
      src={user.avatarUrl}
      alt={user.name}
      width={64}
      height={64}
      sizes="64px"
      quality={80}
      placeholder="blur"
      blurDataURL="data:image/..." // Generate with getBlurDataURL()
    />
  )
}
```

**Key optimizations**:
- Use `next/image` (not `<img>`)
- Specify `width` & `height`
- Use `sizes` prop for responsive
- Set `quality` (75-85 good default)
- Use `placeholder="blur"` with `blurDataURL`
- Compress images server-side

### Image Size Guidelines

| Context | Width | Quality | Format |
|---|---|---|---|
| Thumbnail (avatar) | 64-128px | 75 | WebP |
| Card image | 300-400px | 80 | WebP |
| Hero banner | 1200px+ | 85 | WebP |
| Background | Full width | 70 | WebP |

---

## Bundle Size Optimization

### Analyze Bundle

```bash
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# .env.local
ANALYZE=true pnpm run build
```

### Reduce Bundle

```typescript
// ❌ Bad: Import entire library
import _ from 'lodash'
const result = _.debounce(fn, 300)

// ✅ Good: Import specific function
import { debounce } from 'lodash-es'
const result = debounce(fn, 300)

// ✅ Better: Use smaller alternative
import { debounce } from '@/shared/hooks/use-debounce'
const result = debounce(fn, 300)
```

### Check Package Size

```bash
# Check package size before installing
npm view <package> dist.uncompressed

# Or use bundlephobia.com
```

### Tree Shaking

```typescript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  webpack: (config, { isServer }) => {
    // Ensure tree-shaking
    config.optimization.usedExports = true
    return config
  },
})
```

---

## Request Optimization

### Prefetch Smart Links

```typescript
// app/layout.tsx
import Link from 'next/link'

// Link prefetches by default (only production)
<Link href="/users" prefetch={true}>
  Users
</Link>

// Manual prefetch
import { useRouter } from 'next/navigation'

export function HoverPrefetch() {
  const router = useRouter()

  return (
    <button
      onMouseEnter={() => router.prefetch('/users')}
      onClick={() => router.push('/users')}
    >
      Users
    </button>
  )
}
```

### Request Batching (React Query)

```typescript
// src/shared/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      gcTime: 10 * 60 * 1000,       // 10 minutes (formerly cacheTime)
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})
```

### Debounce Search

```typescript
// src/shared/hooks/use-debounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// Usage
export function SearchUsers() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data } = useUsers({ search: debouncedSearch })

  return (
    <>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      {/* Results from debouncedSearch */}
    </>
  )
}
```

---

## Server-Side Rendering (SSR) Performance

### Static Generation (Best)

```typescript
// app/docs/[slug]/page.tsx
export const revalidate = 3600  // Revalidate every hour

export default async function DocPage({
  params: { slug },
}: {
  params: { slug: string }
}) {
  const doc = await getDoc(slug)
  return <DocView doc={doc} />
}
```

### Incremental Static Regeneration (ISR)

```typescript
// app/users/page.tsx
export const revalidate = 60  // Revalidate every 60 seconds

export default async function UsersPage() {
  const users = await getUsers()
  return <UserList users={users} />
}
```

### Dynamic with Cache Headers

```typescript
// app/api/users/route.ts
export async function GET() {
  const users = await db.users.findAll()

  return new Response(JSON.stringify(users), {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
```

---

## Font Optimization

### Google Fonts Optimization

```typescript
// app/layout.tsx
import { Inter, Poppins } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  preload: true,
})

const poppins = Poppins({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  preload: true,
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className={`${inter.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### CSS Variables

```css
/* styles/globals.css */
:root {
  --font-inter: var(--font-inter);
  --font-poppins: var(--font-poppins);
}

body {
  font-family: var(--font-inter);
}

h1, h2, h3 {
  font-family: var(--font-poppins);
}
```

---

## Database Query Optimization

### Pagination (Never fetch all)

```typescript
// ✅ Good: Paginated query
export async function getUsers(page: number = 1, perPage: number = 10) {
  const offset = (page - 1) * perPage
  const users = await db.users
    .findMany({ skip: offset, take: perPage })
  return users
}

// ❌ Bad: Fetch all users
export async function getUsers() {
  const users = await db.users.findMany()  // Could be 100k+ rows!
  return users
}
```

### Indexing

```typescript
// Database index on frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

### Select Only Needed Fields

```typescript
// ✅ Good: Select specific fields
const users = await db.users.findMany({
  select: { id: true, name: true, email: true },
  take: 10,
})

// ❌ Bad: Fetch all fields
const users = await db.users.findMany({ take: 10 })
```

---

## Monitoring & Measurement

### Lighthouse CI

```typescript
// lighthouserc.json
{
  "ci": {
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

### Web Vitals Tracking (via Sentry)

```typescript
// src/shared/lib/web-vitals.ts
import { getCLS, getFID, getLCP } from 'web-vitals'
import { captureMessage } from '@sentry/nextjs'

export function trackWebVitals() {
  getCLS((metric) => {
    if (metric.value > 0.1) {
      captureMessage(`CLS: ${metric.value.toFixed(3)}`, 'warning')
    }
  })

  getFID((metric) => {
    if (metric.value > 100) {
      captureMessage(`FID: ${metric.value.toFixed(0)}ms`, 'warning')
    }
  })

  getLCP((metric) => {
    if (metric.value > 2500) {
      captureMessage(`LCP: ${metric.value.toFixed(0)}ms`, 'warning')
    }
  })
}
```

---

## Performance Checklist

- [ ] Images use `next/image` with sizes
- [ ] Heavy components lazy-loaded with `dynamic()`
- [ ] Bundle analyzed (`npm run build`)
- [ ] No large dependencies (check bundlephobia)
- [ ] Search/filters debounced (300ms)
- [ ] Lists paginated (max 50 items per page)
- [ ] Static content cached (revalidate set)
- [ ] Fonts preloaded
- [ ] Web Vitals monitored (Lighthouse CI + Sentry)
- [ ] Database queries optimized (select, indexes)
- [ ] Code splitting working (check DevTools)

---

## See Also

- [Error Handling & Observability](02-error-handling.md) — Monitor performance issues
- [CLAUDE.md](../CLAUDE.md) — Architecture & conventions
