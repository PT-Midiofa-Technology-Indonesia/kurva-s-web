# Project: Curva Frontend

Modern Next.js frontend application using Domain Driven Design and Atomic Design Pattern.

⚠️ **IMPORTANT**: All code must follow **SOLID Principles and Clean Architecture**. See [.docs/ARCHITECTURE.md](./.docs/ARCHITECTURE.md) — mandatory reading.

## Quick Links

- **[Quick Reference](./.docs/QUICK_REFERENCE.md)** — Pattern decision tree (start here)
- **[Architecture](./.docs/ARCHITECTURE.md)** — DDD, Atomic Design, SOLID Principles, clean layers
- **[API Pattern](./.docs/patterns/API_PATTERN.md)** — Creating API functions
- **[Forms Pattern](./.docs/patterns/FORMS_PATTERN.md)** — Building forms with validation
- **[Schema Pattern](./.docs/patterns/SCHEMA_PATTERN.md)** — Zod schema reuse & deduplication
- **[List Pages Pattern](./.docs/patterns/LIST_PAGES_PATTERN.md)** — Creating list/index pages
- **[Query Params Pattern](./.docs/patterns/QUERY_PARAMS_PATTERN.md)** — URL state management
- **[Error Handling Pattern](./.docs/patterns/ERROR_HANDLING_PATTERN.md)** — Catching and handling errors
- **[DataTable Pattern](./.docs/patterns/DATATABLE_PATTERN.md)** — Excel mode: active cell, range copy/paste, marching ants
- **[File Length Limits](./.docs/practices/07-file-length-limits.md)** — File size limits & refactoring guidance

## Tech Stack

- **Framework**: Next.js 16 (App Router) with `proxy.ts` at root (not middleware.ts)
- **Language**: TypeScript
- **State Management**: Zustand (domain stores in `src/domains/<domain>/store/`)
- **Server State**: TanStack React Query (hooks in `src/domains/<domain>/hooks/`)
- **HTTP Client**: Axios with auth/error interceptors (`src/shared/lib/axios.ts`)
- **UI Components**: shadcn/ui + Tailwind CSS
- **Validation**: Zod (schemas in `src/domains/<domain>/schemas/`)

## Directory Structure

```
app/                          # Next.js App Router (routing only)
│   ├── layout.tsx            # Root layout with providers
│   ├── (auth)/login/page.tsx # Thin re-export of LoginPage
│   └── ...
│
src/
├── domains/                  # Business logic — one folder per domain
│   └── <domain>/
│       ├── api/              # Axios API calls (get-x.ts, create-x.ts …)
│       ├── hooks/            # React Query hooks (use-x.ts)
│       ├── services/         # Pure data transformers / business logic (no React, no HTTP)
│       ├── components/       # Domain-specific UI components
│       ├── sections/         # OPTIONAL: page sections only when page has 3+ distinct UI regions
│       ├── pages/            # Page-level components rendered by app/ routes
│       ├── schemas/          # Zod validation schemas
│       ├── types/            # TypeScript types & interfaces
│       ├── constants/        # Domain constants & form field configs
│       ├── store/            # Zustand store (domain-scoped)
│       └── index.ts          # Public barrel exports
│
├── shared/                   # Cross-domain shared code
│   ├── components/           # Atomic Design UI components
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   ├── templates/
│   │   └── ui/               # shadcn/ui primitives
│   ├── hooks/                # Shared utility hooks (use-debounce.ts …)
│   ├── lib/                  # axios.ts, query-client.ts, utils.ts, fonts.ts
│   ├── providers/            # React context providers (Providers wrapper)
│   ├── types/                # Shared TypeScript types
│   ├── utils/                # Utility functions (cn.ts …)
│   ├── constants/            # App-wide constants
│   └── configs/              # App-wide configuration
│
└── styles/                   # globals.css, design-tokens.md
│
proxy.ts                      # Next.js 16 proxy (auth guards — replaces middleware.ts)
```

## Domain Structure Example — auth

```
src/domains/auth/
├── api/
│   └── login.ts              # authService (login, logout, getMe …)
├── hooks/
│   └── use-login.ts          # useLogin() — React Query useMutation
├── components/
│   └── LoginForm.tsx         # Form card using FormGenerator
├── pages/
│   └── LoginPage.tsx         # Full page component (used by app/auth/login)
├── schemas/
│   └── index.ts              # loginSchema (Zod)
├── types/
│   └── index.ts              # User, LoginCredentials, LoginResponse …
├── constants/
│   └── index.ts              # LOGIN_FORM_FIELDS
├── store/
│   └── index.ts              # useAuthStore (Zustand)
└── index.ts                  # Public barrel: re-exports all public API
```

## Key Files

- `src/shared/lib/axios.ts` — Axios instance with auth/error interceptors
- `src/shared/lib/query-client.ts` — React Query configuration
- `src/shared/lib/utils.ts` — `cn()` classname merger
- `src/shared/lib/fonts.ts` — Font variables
- `src/shared/providers/index.tsx` — QueryClientProvider wrapper
- `app/layout.tsx` — Root layout (imports Providers from shared)

## Strict UI Rules

- **[Constants/Labels]**: DO NOT hardcode text labels or strings directly in UI components (`.tsx`). ALWAYS extract them into the domain's `constants/index.ts` (e.g. `PAYMENT_REQUEST_LABELS`) and reference them dynamically in the components. This is a strict rule to ensure text is centralized and maintainable.

## Key Patterns

See [./.docs/patterns/](./.docs/patterns/) for complete detailed guides:

- **[API_PATTERN.md](./.docs/patterns/API_PATTERN.md)** — One file per operation, explicit mocking, Zod validation, try/catch errors
- **[FORMS_PATTERN.md](./.docs/patterns/FORMS_PATTERN.md)** — FormGenerator, Zod schemas, useFormContext(), disabled submit
- **[LIST_PAGES_PATTERN.md](./.docs/patterns/LIST_PAGES_PATTERN.md)** — ListPageTemplate, use-<domain>-page hook, 100% UI in page
- **[QUERY_PARAMS_PATTERN.md](./.docs/patterns/QUERY_PARAMS_PATTERN.md)** — URL strings → typed API params, useQueryParams hook
- **[ERROR_HANDLING_PATTERN.md](./.docs/patterns/ERROR_HANDLING_PATTERN.md)** — Type errors, extract message/code/fieldErrors, display to user
- **[DATATABLE_PATTERN.md](./.docs/patterns/DATATABLE_PATTERN.md)** — Excel mode: active cell outline, range copy/paste via `triggerCopy`, marching-ants copied range, `border-collapse` range border

## Portal Selection & Global Project Switcher

The app has two **portals**: `company` and `project`. The user picks one on `PortalSelectionPage` (`src/domains/auth/pages/PortalSelectionPage.tsx`) after login.

- **Cookie**: `portal-selection` (`src/shared/lib/portal.ts`) — `{ portal: 'company' | 'project' | null, workspaceId: string | null }`, `js-cookie`-based, client-only (all reads/writes guard `typeof window === 'undefined'`). Exports `getPortal()`, `setPortal(portal, workspaceId?)`, `getWorkspaceId()`, `clearPortal()`. `portal` list itself comes from `GET /workspace` (`useWorkspaces()` in the auth domain) — `code` (`'company' | 'project'`) is the discriminator stored as `portal`; the workspace `id` rides along as `workspaceId` for forwards-compat, unused by any comparison today.
- `proxy.ts` (root) reads this cookie **server-side** to gate protected routes — redirects to `/portal-selection` if `portal` is `null` or holds anything other than `'company'`/`'project'` (the cookie is user-editable, so an unrecognised value counts as unselected). It also bounces an **authenticated** request away from guest-only paths (`/`, `/login`, `/register`, `/forgot-password`) to `/dashboard`, or to `/portal-selection` when no portal is chosen yet — `app/page.tsx` redirects to `/login` unconditionally, so without this guard a logged-in user hitting `/` was thrown back to the login page.
- `DashboardRouteLayout` (`src/shared/components/templates/DashboardRouteLayout/`) reads `getPortal()` in a mount `useEffect` and blocks **all** rendering (`if (!isMounted) return null`) until that effect runs, to avoid a hydration mismatch (cookie is unreadable during SSR). It renders `getPortalSectionGroups(portal)` — it does **not** filter `SIDEBAR_SECTION_GROUPS` itself.

### Portal route ownership (declarative)

**Adding a menu requires exactly one edit: declare `portals` on it in `navigation.tsx`.** The sidebar and the `proxy.ts` route guard both derive from that declaration, so they cannot drift apart.

- **Declaration** (`src/shared/constants/navigation.tsx`): every section carries `portals: PortalType[]` (e.g. `dashboard` → `['company', 'project']`, `project-management` → `['project']`). An **item** may carry its own `portals` to narrow the section's — so one section can live in both portals with different children per portal. An item with no `portals` inherits its section's; its effective portals are always intersected with the section's, so an item can never leak into a portal its section doesn't belong to. Types: `PortalAwareSection` / `PortalAwareMenuItem` / `PortalAwareSectionGroup` (assignable to `Sidebar`'s `SectionGroup[]`, so `Sidebar`/`DashboardLayout` need no change).
- **Derivation** (`src/shared/constants/portal-routes.ts`): `getPortalSectionGroups(portal)` returns the sidebar tree as that portal sees it (sections/items outside the portal dropped, then empty sections and groups dropped). `PORTAL_ALLOWED_PATH_PREFIXES` precomputes each portal's reachable path prefixes at module load, since `proxy.ts` consults it on every request. `filterSectionGroupsByPortal(groups, portal)` is the pure core, split out so it is testable with fixtures.
- **Guard** (`src/shared/lib/portal-guard.ts`): `resolvePortalGuardRedirect(pathname, portal)` is **fail-closed** — a path is allowed only when it sits under a prefix the portal owns, otherwise it redirects to `/dashboard` (`PORTAL_MISMATCH_REDIRECT_PATH`). Matching is prefix-based with a boundary check (`p === prefix || p.startsWith(prefix + '/')`), so nested detail routes work and `/dashboardxyz` is not a false match.
- **`proxy.ts` imports only `portal-routes.ts`, never `navigation.tsx` directly** — `navigation.tsx` carries JSX icons and `lucide-react`, so the one place coupling the edge middleware to a UI file is deliberately centralised. (Accepted trade-off: the icon/React weight rides into the middleware bundle. Bundle impact has **not** been measured; if it ever matters, split the plain data out of `navigation.tsx` — the `portals` declarations already make that a mechanical change.)
- **Hiding a menu hides its page.** Commenting out a menu entry removes its portal ownership, so the fail-closed guard blocks the route too. There is no "hidden but reachable" escape hatch by design.
- **Two safety nets in `portal-routes.test.ts`:**
  - A coverage test walks every `page.tsx` under `app/(protected)` and fails on any route no portal owns — otherwise a page whose menu was forgotten would silently redirect to `/dashboard` in production. Routes meant to be off are acknowledged in `KNOWINGLY_DISABLED_ROUTES` **inside that test file** (currently empty — no protected route is intentionally disabled); the list grants no access and the guard never reads it.
  - A test rejects any item declaring a portal outside its section's, so a typo surfaces instead of vanishing from the menu.
- **Policy-snapshot assertions are intentional.** Tests asserting who reaches what (e.g. company must not reach `/project-management`) fail when a menu moves between portals — for an access-control feature that is the point: changing who can reach what should be a conscious edit, not a side effect. `portal-guard.test.ts` also locks the invariant that **every portal can reach `/dashboard`**; losing that would make every blocked request redirect to a blocked path (infinite loop).

### Project switcher (project portal only)

- When `portal === 'project'`, `DashboardRouteLayout` renders a project-picker dropdown in the `Navbar`, just left of the bell icon, via `Navbar`'s `projectSelectorSlot` prop (same slot pattern already used for `breadcrumbSlot`).
- **Project list source is `useMe()` → `user.projects` (`UserProject[]`, shape `{ id, name, code }`) — NOT `useProjects()`/`getProjects` from the `project-control` domain.** `/auth/me` already returns the user's available projects, so no extra fetch is made for the dropdown.
- **Selection state**: `useSelectedProjectStore` (`src/shared/store/selected-project.ts`) — a Zustand store using the `persist` middleware (localStorage key `selected-project`), decoupled from the `portal-selection` cookie entirely (that cookie only tracks `portal` + `workspaceId` now). Zustand gives reactivity (the Navbar dropdown and the page consuming the selection are siblings under the layout, not parent/child); `persist` gives durability across reloads/tabs without touching `portal.ts`. `clear()` is called from `useLogout` so a stale selection never leaks into the next login session.
- `DashboardRouteLayout` auto-selects (and self-heals, if the stored id is no longer in the list) the first project whenever the project portal has no valid selection — no manual hydration call needed, `persist` rehydrates the store on its own before the component's `isMounted` gate opens.
- `ProjectPortalSelect` (`src/shared/components/molecules/ProjectPortalSelect/`) is the dumb presentational dropdown — takes `{ id, name }[]`, `value`, `onChange`; no domain imports, stays Atomic-Design-compliant like `Navbar` itself.

### Consuming the globally selected project

Pages that need "whichever project the portal is currently on" (as opposed to an explicit route param) read `useSelectedProjectStore((s) => s.selectedProjectId)` and use it **only as a fallback** when no explicit `projectId` prop was passed in — an explicit prop always wins. Reference implementation: `ProgressMonitoringPage` (`src/domains/project-control/pages/ProgressMonitoringPage.tsx`), rendered at two routes:
- `/project-control/project/[id]/progress-monitoring` — explicit `projectId` from the URL route param (always wins, store fallback never kicks in here).
- `/project-management/project-monitoring` — no route param at all; resolves `projectId` entirely from `useSelectedProjectStore`.

**Why this can't live in `app/**/page.tsx`**: `page.tsx` must stay a Server Component (see anti-pattern #1 below), and the Zustand store/cookie are client-only — a Server Component can only read the cookie once per request and can't react to a client-side dropdown change without a full navigation/`router.refresh()`. So the fallback resolution happens **inside** the client page component (`ProgressMonitoringPage`), not in the route's `page.tsx`.

## Adding a New Domain

1. Create `src/domains/<domain>/` with: `api/`, `hooks/`, `services/`, `components/`, `pages/`, `schemas/`, `types/`, `constants/`, `store/`
2. **Create `src/domains/<domain>/README.md`** with overview, structure, exports, examples (MANDATORY)
3. Add domain link to `src/domains/README.md`
4. Run `pnpm run type-check` to verify
5. Start with API functions, then hooks, then components

## Layers & Decisions

**When to use `sections/`**: Only when a page has 3+ distinct UI regions. Skip for simple pages.

**When to use `services/`**: Logic >5 lines, reused in 2+ places, or needs unit tests. Otherwise inline in hooks.

**API file organization**: One file per operation (default). Only group if ≤4 simple operations and all ≤10 lines.

**Shared components**: Atomic Design (atoms → molecules → organisms → templates) in `src/shared/components/`.

**Anti over-DRY / avoid premature abstraction**:
- Prefer duplication over wrong abstraction when flows are only *similar-looking* but have different reset rules, permissions, tabs, or query-param behavior.
- Extract shared hook/component/service only after at least 3 concrete call sites already match in data shape, side effects, and lifecycle.
- If 1 page needs extra branching, hidden flags, optional callbacks, or many `variant` props to fit shared abstraction, stop. Keep page-specific code local.
- Before deduplicating, document source of truth and precedence explicitly in code comments or README, e.g. `URL companyId > persisted store > first option`.
- AI agents must optimize for **single source of truth**, not maximum reuse. Reuse is valid only when it reduces bugs and removes identical behavior.
- Forbidden reason for abstraction: "looks repetitive" alone. Required reason: same responsibility, same behavior, same change cadence.

**Permission-aware UI**: `PermissionGuard` (`src/shared/components/molecules/PermissionGuard/`) is the shared client-only wrapper for hiding or showing action-level UI, tabs, or other component sections based on the current user permissions from `useMe()`. Reuse it on future pages when access should control visibility, and prefer passing `fallback` when the guarded action needs an explicit placeholder state.

**SSR + List pages**: Use `searchParams` prop, `parseParams()` converter, `.server.ts` API file, `HydrationBoundary`. See reference: `src/domains/payment-type/`

### Development Workflow

```bash
pnpm install             # First time setup
pnpm run dev             # Start dev server
pnpm run type-check      # Check TypeScript errors
pnpm run build           # Build for production
```

### Environment Variables

- Copy `.env.example` to `.env.local`
- `NEXT_PUBLIC_API_URL` — Backend API URL (required)
- Prefix with `NEXT_PUBLIC_` to expose to browser

### Path Aliases

| Alias | Resolves to |
|---|---|
| `@/*` | `src/*` |
| `@/shared/*` | `src/shared/*` |
| `@/domains/*` | `src/domains/*` |
| `@/components/*` | `src/shared/components/*` |
| `@/lib/*` | `src/shared/lib/*` |
| `@/hooks/*` | `src/shared/hooks/*` |
| `@/types/*` | `src/shared/types/*` |
| `@/utils/*` | `src/shared/utils/*` |
| `@/styles/*` | `src/styles/*` |

### Conventions

- Hook files: kebab-case (`use-login.ts`, `use-debounce.ts`)
- API files: kebab-case (`get-users.ts`, `create-user.ts`)
- Component files: PascalCase (`LoginForm.tsx`, `Button.tsx`)
- Store imports: always from domain index or `@/domains/<domain>/store`
- Never import `@/stores/*` — stores live in domains now
- Use `pnpm`, not `npm`

### Critical Anti-Patterns (NEVER DO)

These mistakes have caused production bugs including dead UI (buttons not responding) and hydration errors.

**1. ❌ Never put `'use client'` on any `page.tsx` file in `app/`**

```tsx
// BAD — disables SSR, slower initial load, causes hydration issues with tabs
'use client';
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <ClientComponentWithTabs />  {/* uses useSearchParams */}
    </Suspense>
  );
}
```

```tsx
// CORRECT — page.tsx stays a Server Component
// Suspense tells Next.js: skip SSR for this subtree, render on client only
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <ClientComponentWithTabs />
    </Suspense>
  );
}
```

**Why:** `page.tsx` files in the App Router should **always** be Server Components. If a Client Component inside uses `useSearchParams` to decide which subtree to render (tabs, conditional content), the server and client produce different HTML trees → hydration failure → event listeners don't attach.

**Rule of thumb:**
- `app/**/*.tsx` → **Server Component** (no `'use client'`)
- `src/domains/<domain>/pages/*.tsx` → **Client Component** (has `'use client'`, uses hooks)
- `src/domains/<domain>/components/*.tsx` → **Client Component** if interactive, Server if pure UI
- `src/shared/components/**/*.tsx` → **Client Component** if using React hooks (`useState`, `useEffect`, etc.), `forwardRef`, browser APIs (`window`, `document`), or third-party client libraries (`@dnd-kit`, etc.)

**Applies to:** All page routes — list pages, form pages, tabbed pages, detail pages. The only exception is `app/error.tsx` (Next.js requires it to be a Client Component).

**2. ❌ Never use `window.location.pathname` in Next.js**

```tsx
// BAD — not reactive, ignores basePath, breaks during transitions
const basePath = window.location.pathname;
router.push(`${basePath}?tab=xyz`);
```

```tsx
// CORRECT — reactive, router-aware
import { usePathname } from 'next/navigation';
const pathname = usePathname();
router.replace(`${pathname}?tab=xyz`, { scroll: false });
```

**3. ❌ Never pass a fresh inline object to a custom hook on every render**

```tsx
// BAD — new object every render → hook callbacks recreate constantly
const result = useSomePage({
  params,
  onUpdateQueryParam: updateQueryParam,
  onSetQueryParams: setQueryParams,
});
```

```tsx
// CORRECT — stable reference
const pageOptions = useMemo(
  () => ({
    params,
    onUpdateQueryParam: updateQueryParam,
    onSetQueryParams: setQueryParams,
  }),
  [params, updateQueryParam, setQueryParams]
);
const result = useSomePage(pageOptions);
```

**Applies to:** All page hooks (`use-*-page.ts`) and any hook that accepts an options object containing callbacks.

**4. ❌ Never omit `type="button"` on non-submit buttons inside a form**

```tsx
// BAD — <button> inside <form> defaults to type="submit"
// Clicking "Batal" submits the form, triggers Zod validation, blocks navigation
<Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
  Batal
</Button>
```

```tsx
// CORRECT — explicit type="button" prevents form submission
<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
  Batal
</Button>
```

**Why:** A bare `<button>` inside a `<form>` defaults to `type="submit"`. Clicking it submits the form, which fires Zod validation, scrolls to the first error, and prevents `onCancel` from doing its job (navigate back, close drawer, etc.).

**Applies to:** All non-submit buttons rendered inside a form — cancel/back/reset, "Add More" / "Remove" in `useFieldArray`, drawer close (X), any auxiliary action button. See [.docs/patterns/FORMS_PATTERN.md#button-type-required-for-non-submit-buttons](./.docs/patterns/FORMS_PATTERN.md) for the full reference and lint guard recipe.

**5. ❌ Never hand-roll fullscreen toggle logic — use `useFullscreen`**

```tsx
// BAD — reimplements what useFullscreen already provides
const containerRef = useRef<HTMLDivElement>(null);
const [isFullscreen, setIsFullscreen] = useState(false);

useEffect(() => {
  const onChangeFs = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
  document.addEventListener('fullscreenchange', onChangeFs);
  return () => document.removeEventListener('fullscreenchange', onChangeFs);
}, []);

const toggleFullscreen = useCallback(() => {
  if (!containerRef.current) return;
  if (document.fullscreenElement) document.exitFullscreen();
  else containerRef.current.requestFullscreen();
}, []);
```

```tsx
// CORRECT — use the shared hook
import { useFullscreen } from '@/shared/hooks/use-fullscreen';

const { ref: containerRef, isFullscreen, toggleFullscreen } = useFullscreen<HTMLDivElement>();
```

**Why:** `src/shared/hooks/use-fullscreen.ts` already owns the ref, `fullscreenchange` listener, and enter/exit/toggle handlers. Reimplementing it per-component duplicates logic and drifts (e.g. missed event cleanup, inconsistent `isFullscreen` detection). Reference usage: `ProgressMonitoringPage` (`src/domains/project-control/pages/ProgressMonitoringPage.tsx`), `ScheduleView` (`src/domains/project-management/components/ScheduleView.tsx`).

**Applies to:** Any component or page with a fullscreen toggle button (tables, Gantt charts, dashboards, drawers, etc.).

**6. ❌ Never let query-param state drift across duplicate readers, uncontrolled inputs, or mount-time normalization**

```tsx
// BAD — duplicate readers for same key
const searchParams = useSearchParams();
const { queryParams } = useQueryParams<MyUrlParams>();
const activeTab = queryParams.tab ?? searchParams.get('tab') ?? 'overview';
```

```tsx
// BAD — uncontrolled query-bound input
<AsyncSelect defaultValue={queryParams.status ?? undefined} onChange={handleStatusChange} />
```

```tsx
// BAD — writes fallback into URL after first render
const companyId = queryParams.companyId ?? companyOptions[0]?.value;
useEffect(() => {
  if (!queryParams.companyId && companyId) updateQueryParam('companyId', companyId);
}, [companyId, queryParams.companyId, updateQueryParam]);
```

```tsx
// BAD — tab update drops unrelated query params
router.replace(`${pathname}?tab=${tab}`, { scroll: false });
```

```tsx
// CORRECT — one URL-state owner, controlled input, no mount-time normalization, preserve existing params
const { queryParams } = useQueryParams<MyUrlParams>();
const activeTab = queryParams.tab ?? 'overview';
const companyId =
  typeof queryParams.companyId === 'string'
    ? queryParams.companyId
    : companyOptions[0]?.value;

<AsyncSelect value={queryParams.status ?? null} onChange={handleStatusChange} />

const params = new URLSearchParams(searchParams.toString());
params.set('tab', tab);
router.replace(`${pathname}?${params.toString()}`, { scroll: false });
```

**Why:** Duplicate readers create two sources of truth, `defaultValue` breaks restore-from-URL after navigation, mount-time normalization mutates URL after first render, and naive tab URLs drop active filters/search/page state.

**Applies to:** All pages/components that own URL state via `useQueryParams`, especially tab pages, list pages, and detail pages with company/project filters. See [.docs/patterns/QUERY_PARAMS_PATTERN.md](./.docs/patterns/QUERY_PARAMS_PATTERN.md) for the full pattern.

## Agent Workflow Rules

⚠️ **MANDATORY — DO NOT SKIP:**

### Superpowers Skills (invoke before acting)
- **`superpowers:brainstorming`** — invoke before creating any new feature, component, or modifying behavior
- **`superpowers:systematic-debugging`** — invoke before debugging any issue
- **`superpowers:writing-plans`** — invoke when given a spec or multi-step requirements
- **`superpowers:verification-before-completion`** — invoke before claiming work is done, fixed, or passing
- **`superpowers:test-driven-development`** — follow RED-GREEN-REFACTOR during implementation

### Project Constraints
- **Do NOT run `pnpm run type-check` automatically.** Only run when explicitly requested or during the final verification step after the user confirms the work is complete.
- **Do NOT run tests automatically.** Only run when explicitly requested.
- **Do NOT commit changes.** Only commit when explicitly asked by the user.
- **Do NOT push changes.** Only push when explicitly asked by the user.
- **Do NOT mark tasks as complete until the user explicitly confirms the work meets their expectations.** Always ask for confirmation before finalizing.
- **Always ask before executing destructive commands** (e.g., `rm -rf`, database migrations, package reinstalls).

## Code Review Checklist

Before committing, verify against [SOLID_CLEAN_ARCHITECTURE.md](./SOLID_CLEAN_ARCHITECTURE.md):

- **Single Responsibility**: Each file has ONE reason to change?
  - API: HTTP calls only, no business logic
  - Services: Pure functions, no React/HTTP
  - Hooks: Orchestration only, no direct axios
  - Components: Rendering only, no API calls

- **Dependency Inversion**: Code depends on abstractions?
  - Components use hooks (not axios directly)
  - Hooks use services + API abstraction
  - Data flows: Components → Hooks → Services → API

- **Testability**: Can logic be tested in isolation?
  - Services: Pure functions, testable without mocks
  - Hooks: testable with renderHook()
  - API: mockable for tests

- **Documentation**: Every domain has README.md?
  - Overview, structure, exports, examples required

⚠️ Code violating SOLID/Clean Architecture will be rejected during review.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
