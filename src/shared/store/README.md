# Store - Global Zustand State

Global Zustand stores for client-side state.

## Available Stores

### useNavigationStore

Navigation state including breadcrumbs.

```typescript
import { useNavigationStore } from '@/shared/store/navigation';

const { breadcrumbs, setBreadcrumbs, clearBreadcrumbs } = useNavigationStore();
```

**State:**
- `breadcrumbs: NavItem[] | null` — Current breadcrumb items

**Actions:**
- `setBreadcrumbs(breadcrumbs)` — Set breadcrumb items
- `clearBreadcrumbs()` — Clear breadcrumb items

---

### useSelectedProjectStore

Global project-portal selection — `selectedProjectId: string | null`, persisted independently via zustand's `persist` middleware (localStorage key `selected-project`). Decoupled from the `portal-selection` cookie (which only tracks `portal` + `workspaceId`) — the project selection has its own storage and its own lifecycle.

```typescript
import { useSelectedProjectStore } from '@/shared/store/selected-project';

const selectedProjectId = useSelectedProjectStore((s) => s.selectedProjectId);
const setSelectedProjectId = useSelectedProjectStore((s) => s.setSelectedProjectId);
```

**State:**
- `selectedProjectId: string | null` — Currently selected project (project portal only)

**Actions:**
- `setSelectedProjectId(id)` — Set selection (persisted to localStorage automatically)
- `clear()` — Reset selection to `null`; called from `useLogout` so a stale selection never leaks into the next login session

Used across multiple domains in the project portal (not domain-specific), so it lives here instead of `src/domains/<domain>/store/`. See the "Portal Selection & Global Project Switcher" section in the root `CLAUDE.md` for the full flow.

---

## Domain Stores

Domain-specific stores should be in `@/domains/<domain>/store/` instead of here.

---

## Best Practices

1. **Use for global client state** — Auth tokens, UI state, navigation
2. **Use React Query for server state** — API data, caching
3. **Keep stores focused** — Single responsibility per store
4. **Avoid over-storing** — Not everything needs to be in a store