# Auth

Handles user authentication and session management: login, logout, registration, token refresh, and current user profile.

## Structure

```
auth/
├── api/
│   ├── login.ts           # POST /auth/login
│   ├── logout.ts          # POST /auth/logout
│   ├── register.ts        # POST /auth/register
│   ├── refresh-token.ts   # POST /auth/refresh-token
│   ├── get-me.ts          # GET /auth/me
│   ├── get-workspaces.ts  # GET /workspaces
│   └── set-workspace.ts   # POST /auth/set-workspace
├── components/
│   ├── LoginForm.tsx      # Login form component (FormGenerator pattern)
│   └── PortalSelectionCard.tsx # Single portal choice card
├── hooks/
│   ├── use-login.ts       # useMutation for login
│   ├── use-login-page.ts  # Login page orchestration hook
│   ├── use-logout.ts      # useMutation for logout
│   ├── use-me.ts          # useQuery for current user profile
│   ├── use-set-workspace.ts # useMutation gating portal entry via POST /auth/set-workspace
│   └── use-workspaces.ts  # useQuery for available workspaces (portal list)
├── pages/
│   ├── LoginPage.tsx      # Full login page
│   ├── ProfilePage.tsx    # User profile page
│   └── PortalSelectionPage.tsx # Portal (workspace) selection page
├── schemas/
│   └── index.ts           # loginFormSchema (Zod), LoginFormInput type
├── store/
│   └── index.ts           # useAuthStore (Zustand) — global auth state
├── types/
│   └── index.ts           # User, Workspace, AuthTokenData, LoginCredentials, AuthState, RegisterResponse
├── constants/
│   ├── index.ts           # Form field configs, labels
│   └── portal.ts          # PORTAL_CARD_META (icon/copy per workspace code), toPortalCards()
└── index.ts               # Public barrel exports
```

## Key Files

- `api/login.ts` — Authenticates user; returns access token and user data
- `api/refresh-token.ts` — Called automatically by the Axios interceptor on 401 responses
- `store/index.ts` — Zustand store holding `user`, `token`, `isAuthenticated`, and setters; consumed across the app for sync auth state
- `hooks/use-login-page.ts` — Orchestrates login form submission, redirect on success, and error display
- `pages/ProfilePage.tsx` — Displays current user info fetched via `useMe`

## Exports

- `LoginPage` — full login page component
- `ProfilePage` — user profile page component
- `PortalSelectionPage` — portal (workspace) selection page component
- `LoginForm` — login form component, `LoginFormProps` type
- `PortalSelectionCard` — single portal choice card component
- `useLogin` — login mutation hook
- `useLogout` — logout mutation hook
- `useMe` — current user query hook
- `useWorkspaces` — available workspaces query hook
- `useSetWorkspace` — mutation gating portal entry (`POST /auth/set-workspace`)
- `useAuthStore` — Zustand auth store
- `login`, `logout`, `register`, `refreshToken`, `getMe`, `getWorkspaces`, `setWorkspace` — raw API functions, `SetWorkspacePayload` type
- `loginFormSchema`, `LoginFormInput` — Zod schema and inferred input type
- `PORTAL_CARD_META`, `toPortalCards`, `PortalCardData` — portal-selection UI metadata and merge helper
- Types: `User`, `UserProject`, `Workspace`, `AuthTokenData`, `LoginCredentials`, `AuthState`, `RegisterResponse`

`User.projects: UserProject[]` (`{ id, name, code }`) is the list of projects available to the current user — it's the **sole source** for the project-portal switcher dropdown in the Navbar (see "Portal Selection & Global Project Switcher" in the root `CLAUDE.md`). There is deliberately no separate `useProjects()` fetch for that dropdown; `/auth/me` already returns it.

### Portal selection flow

`GET /workspaces` (`api/get-workspaces.ts`, via `useWorkspaces`) returns the list of workspaces the user can enter — `{ id, name, code, isActive }` where `code` is `'company' | 'project'` (same union as `PortalType` in `@/shared/lib/portal`). `PortalSelectionPage` merges this API data with the frontend-only presentation metadata in `constants/portal.ts` (`PORTAL_CARD_META`, keyed by `code` — icon, label, title) via `toPortalCards()`, filtering out inactive workspaces or codes the frontend doesn't recognize.

Clicking a card does **not** set the cookie directly. It first calls `useSetWorkspace()` → `POST /auth/set-workspace` with `{ workspaceId: card.id }` and gates entry on the result:
- **Success** → response `data` is the confirmed `Workspace` (`{ id, name, code, isActive }`); `setPortal(workspace.code, workspace.id)` writes the cookie **from this response**, not from the clicked card, then navigates to `/dashboard`.
- **Error** (403, 500, or anything else) → cookie is never written, no navigation happens, and `toast.error` shows the message from `getErrorMessage(error)`.

`code` was chosen over `id` as the cookie's portal discriminator because it's already the value every other portal check in the codebase compares against (e.g. `DashboardRouteLayout`'s `portal === 'project'`) — using `id` instead would have required threading a workspace lookup through all of those call sites for no security benefit, since this cookie only drives client-side UI branching (server-side authorization is unaffected either way). The workspace `id` still rides along as `workspaceId` in the cookie for forwards-compat.

## Usage Example

```tsx
import { useLogin, useAuthStore, LoginPage } from '@/domains/auth';

// Use the full page
export default function Page() {
  return <LoginPage />;
}

// Use the mutation hook directly
const { mutate: login, isPending } = useLogin();
login({ email, password });

// Read auth state synchronously
const { user } = useAuthStore();
```
