# Architecture — Complete Reference

Curva Frontend uses **Domain Driven Design (DDD)**, **Atomic Design Pattern**, and **SOLID Principles** with **Clean Architecture Layers**.

---

## Design Patterns Overview

### 1. Domain Driven Design (DDD)

Code organized by business domains under `src/domains/`. Each domain owns its full vertical slice.

**Structure:**

```
src/domains/<domain>/
├── api/              # HTTP calls (one file per operation)
├── hooks/            # React Query hooks
├── services/         # Pure business logic
├── components/       # Domain-specific UI
├── pages/            # Page-level components
├── schemas/          # Zod validation
├── types/            # Domain types
├── constants/        # Domain constants
└── store/            # Zustand stores
```

**Key Rule**: Domain logic stays inside domain. Never in `src/shared/`.

---

### 2. Atomic Design Pattern

Shared UI components in hierarchy: atoms → molecules → organisms → templates.

**Pyramid:**

```
Templates (page layouts)
    ↑
Organisms (complex components: forms, nav, tables)
    ↑
Molecules (simple combos: form fields, search bar)
    ↑
Atoms (basic elements: button, input, label)
```

Lives in `src/shared/components/{atoms,molecules,organisms,templates}/`.

---

### 3. Clean Architecture Layers

Dependencies flow **one direction only**: Components → Hooks → Services → API → HTTP.

```
Layer 4 (Frameworks): app/, proxy.ts — Next.js routing only
    ↑
Layer 3 (Adapters): api/, components/ — Convert between formats
    ↑
Layer 2 (Use Cases): hooks/ — Orchestrate with React Query
    ↑
Layer 1 (Entities): types/, services/ — Pure business logic
```

**Never go backwards** — API never imports hooks, services never import React.

---

## SOLID Principles (Mandatory)

All code must follow these five principles. See checklist below.

## Anti over-DRY / Avoid Premature Abstraction

This codebase optimizes for **single source of truth**, not maximum reuse.

### Rules

- Prefer duplication over wrong abstraction when flows only look similar but differ in reset rules, permissions, tabs, query params, loading states, or navigation.
- Do **not** create shared hooks/components/services for only 2 pages. Extract shared code only after at least 3 concrete call sites match in data shape, side effects, and lifecycle.
- If an abstraction needs many flags, variants, optional callbacks, or page-specific branching, stop. Keep behavior local to page/domain.
- Before deduplicating, write source-of-truth precedence explicitly in code comments or README, e.g. `URL companyId > persisted store > first option`.
- "Looks repetitive" alone is not valid reason to abstract. Valid reason: same responsibility, same behavior, same change cadence.

### PR / AI Checklist

Ask before extracting shared code:

1. Is behavior truly identical, not only UI shape?
2. Are reset rules, permissions, query-param semantics, and lifecycle same?
3. Will abstraction remove bugs, or only reduce lines?
4. Can future change land in one place without adding branches/flags?
5. If 1 flow changes later, will other flows stay unaffected?

If any answer is "no" or "not sure", keep code local.

### Example: bad vs good abstraction

**Bad** ❌ — force 2 similar pages into 1 shared handler even though reset behavior differs:

```typescript
function handleCompanyChange(companyId: string) {
  updateQueryParam("companyId", companyId);
  setQueryParams({
    page: 1,
    status: undefined,
    momId: undefined,
    tab: undefined,
  });
}
```

Problem:

- works for one page
- silently breaks another page that must preserve `tab`
- adds hidden coupling between unrelated flows

**Good** ✅ — share source of truth, keep page-specific reset local:

```typescript
const { handleCompanyChange: handleSharedCompanyChange } = useCompanyFilter();

function handleCompanyChange(companyId: string) {
  handleSharedCompanyChange(companyId);
  setQueryParams({ momId: undefined, page: 1 });
}
```

Reason:

- company source stays shared
- reset semantics stay local
- future page-specific changes do not leak to other modules

### 1. Single Responsibility Principle (SRP)

Each file has **ONE reason to change**.

| File Type          | Responsibility                 | What It Can't Do                  |
| ------------------ | ------------------------------ | --------------------------------- |
| `api/*.ts`         | HTTP calls only                | No business logic, no React       |
| `services/*.ts`    | Pure business logic            | No React hooks, no HTTP           |
| `hooks/*.ts`       | Orchestration with React Query | No axios calls, no rendering      |
| `components/*.tsx` | Rendering only                 | No API calls, no business logic   |
| `store/*.ts`       | UI state only                  | Never API state (use React Query) |

**Bad** ❌:

```typescript
export function useUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    axios.get("/users").then((res) => {
      const transformed = res.data.map((u) => ({
        ...u,
        name: u.name.toUpperCase(),
      }));
      setUsers(transformed);
    });
  }, []);
  return { users };
}
```

**Good** ✅:

```typescript
// api/get-users.ts — HTTP only
export async function getUsers() {
  const response = await api.get("/users");
  return response.data;
}

// services/user-transformer.ts — Logic only
export function transformUser(user: User): User {
  return { ...user, name: user.name.toUpperCase() };
}

// hooks/use-users.ts — Orchestration only
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    select: (data) => data.map(transformUser),
  });
}
```

---

### 2. Open/Closed Principle (OCP)

Open for extension, **closed for modification**.

- Define form fields in constants (add field = new constant, no component changes)
- Add services without modifying existing ones
- Compose hooks, don't modify them

**Bad** ❌:

```typescript
function UserForm({ type }: { type: 'create' | 'edit' | 'admin' }) {
  if (type === 'create') return <form>{/* fields */}</form>
  if (type === 'edit') return <form>{/* different fields */}</form>
  if (type === 'admin') return <form>{/* even more fields */}</form>
}
```

**Good** ✅:

```typescript
export const USER_FORM_FIELDS = {
  create: [{ name: 'email' }, { name: 'password' }],
  edit: [{ name: 'email' }, { name: 'name' }],
  admin: [{ name: 'email' }, { name: 'role' }]
}

function UserForm({ type }: { type: 'create' | 'edit' | 'admin' }) {
  return <FormGenerator fields={USER_FORM_FIELDS[type]} />
}
```

---

### 3. Liskov Substitution Principle (LSP)

Subtypes must be substitutable for supertypes.

- All fetch hooks return consistent `{ data, isLoading, error }`
- All API responses follow same envelope structure
- Component interfaces are compatible

**Bad** ❌:

```typescript
function useUsers() {
  return { users, loading, error };
}
function useRoles() {
  return { data, isLoading, isError };
}
// Inconsistent keys — consumers must check both patterns
```

**Good** ✅:

```typescript
function useUsers() {
  return { data, isLoading, error };
}
function useRoles() {
  return { data, isLoading, error };
}
// Consumers work with both identically
```

---

### 4. Interface Segregation Principle (ISP)

Clients shouldn't depend on what they don't use.

- Component props: Only pass what's needed (not entire objects)
- Hook dependencies: Only depend on data you use
- Types: Only include fields the client uses

**Bad** ❌:

```typescript
interface User {
  id: string
  name: string
  email: string
  permissions: Permission[]
  metadata: UserMetadata
  auditLog: AuditEntry[]
}

function UserCard(user: User) {
  return <div>{user.name}</div> // Only uses name!
}
```

**Good** ✅:

```typescript
interface UserCardProps {
  name: string
}

function UserCard({ name }: UserCardProps) {
  return <div>{name}</div>
}

// Or use Pick for reusability:
function UserCard({ user }: { user: Pick<User, 'name'> }) {
  return <div>{user.name}</div>
}
```

---

### 5. Dependency Inversion Principle (DIP)

Depend on **abstractions**, not concretions.

- Components never import axios directly
- Components never import API layer directly
- Hooks wrap API layer — components depend on hooks (abstraction)
- Services are abstractions — hooks depend on contracts, not implementations

**Dependency Flow** (correct):

```
Components
    ↓ (depends on)
Hooks (abstractions)
    ├→ Services (abstractions)
    ├→ API (adapters)
    └→ Types (entities)
```

**Bad** ❌:

```typescript
function UserList() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    axios.get('/users').then(res => setUsers(res.data))
  }, [])

  return <div>{users.map(u => <div>{u.name}</div>)}</div>
}
```

**Good** ✅:

```typescript
function UserList() {
  const { data: users } = useUsers() // Abstraction
  return <div>{users.map(u => <div>{u.name}</div>)}</div>
}

// useUsers depends on service abstraction
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    select: transformUsers
  })
}

// Service is pure, testable
export function transformUsers(raw: RawUser[]): User[] {
  return raw.map(u => ({ ...u, name: u.name.toUpperCase() }))
}

// API handles HTTP
export async function getUsers(): Promise<RawUser[]> {
  const response = await api.get('/users')
  return response.data
}
```

---

## Testability Rules

All code must be testable in isolation.

### 1. Services Must Be Pure Functions

No side effects, no external dependencies.

```typescript
// ✅ Testable — pure function
export function calculateUserDiscount(user: User, items: Item[]): number {
  const itemsTotal = items.reduce((sum, item) => sum + item.price, 0);
  return user.memberSince < 30 ? itemsTotal * 0.1 : 0;
}

// ❌ Not testable — has side effects
export function calculateDiscount(user: User) {
  const items = await fetchItems(); // ← side effect
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### 2. Hooks Must Be Testable via React Testing Library

```typescript
// ✅ Testable — clear inputs/outputs
export function useUsers() {
  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
  return { data };
}

// Test it:
it("should fetch users", async () => {
  const { result } = renderHook(() => useUsers());
  await waitFor(() => expect(result.current.data).toBeDefined());
});
```

### 3. API Layer Must Be Mockable in Tests

Mock the module at test level — no mock data in production code.

```typescript
jest.mock("@/domains/user/api/get-users", () => ({
  getUsers: jest.fn(() => Promise.resolve([{ id: "1", name: "Test" }])),
}));
```

---

## Services vs Inline Logic

When to create a service file vs inline logic in hook:

| Situation                       | Decision                          |
| ------------------------------- | --------------------------------- |
| Logic is 1–2 lines, used once   | Inline in `select` or `onSuccess` |
| Logic is 5+ lines               | Create `services/` file           |
| Logic is reused in 2+ places    | Create `services/` file           |
| Logic is pure business rule     | Create `services/` file           |
| Logic needs isolated unit tests | Create `services/` file           |

---

## Dependency Graph

What can import what (arrows point to dependencies):

```
app/ (Routes)
    ↓
pages/ (Page components)
    ↓
sections/ (Page sections — optional)
    ↓
components/ (UI components)
    ↓
hooks/ (React Query orchestration)
├→ services/ (Pure business logic) ← never goes up
├→ api/ (HTTP calls) ← never goes up
└→ types/ (Domain entities) ← never goes up

shared/components/ (Atoms/molecules/organisms)
    ↓
shared/hooks/ (Utility hooks)
    ↓
shared/lib/ (axios, query-client, utils)
    ↓
shared/types/ (Shared types)

⚠️ CRITICAL: No backwards dependencies!
- api/*.ts never imports hooks
- services/*.ts never imports React/hooks
- shared/* never imports domain-specific code
```

---

## Code Review Checklist

Before committing, verify:

- [ ] **SRP**: Does each file have ONE reason to change?
- [ ] **OCP**: Can I add features without modifying existing code?
- [ ] **LSP**: Are my types/interfaces consistent with similar code?
- [ ] **ISP**: Am I using all the props/types I depend on?
- [ ] **DIP**: Do I depend on abstractions (hooks, services), not implementations (axios)?
- [ ] **Layers**: Does my dependency flow go only in one direction?
- [ ] **Testability**: Can I test this in isolation without mocking the world?
- [ ] **Documentation**: Does my domain have a README?

---

## See Also

- [CLAUDE.md](../CLAUDE.md) — Project overview, conventions, quick links
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) — Pattern decision tree
- [patterns/](./patterns/) — Implementation patterns (API, Forms, Lists, etc.)
