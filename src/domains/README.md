# Domains (Domain Driven Design)

This directory contains domain-specific logic organized by business domains.

## Structure

Each domain typically contains:

- `entities/` - Core business entities
- `repositories/` - Data access abstractions
- `services/` - Business logic and use cases
- `types.ts` - Domain-specific types and interfaces
- `constants.ts` - Domain constants

## Example Domain Structure

```
auth/
├── entities/
│   └── User.ts
├── repositories/
│   └── UserRepository.ts
├── services/
│   └── AuthService.ts
├── types.ts
└── constants.ts
```

## Domains Overview

This project uses Domain Driven Design with the following domains:

### Core Domains

#### User & Access Management

- **[auth](./auth/README.md)** — Authentication, login, logout, token management, user profiles
- **[dashboard](./dashboard/README.md)** — Authenticated landing page with greeting and primary role
- **[users](./users/README.md)** — User management (create, read, update, delete users)
- **[role-permissions](./role-permissions/README.md)** — Role-based access control (RBAC) and permission management

#### Human Resources

- **[attendance](./attendance/README.md)** — Attendance management, bulk input, filtering
- **[manpower](./manpower/README.md)** — Employee management (create, read, update employee data)
- **[overtime](./overtime/README.md)** — Overtime management with rate settings, filtering, and detail view
- **[payroll](./payroll/README.md)** — Payroll components, salary structure per grade, employee salary adjustment, and payroll draft (create, preview, generate)
- **[performance](./performance/README.md)** — KPI employee evaluation with pillar breakdown, rewards, and project history

#### Project Control

- **[project-control](./project-control/README.md)** — Bill of Quantities (BoQ) management with template, planning, final, and execution tabs
- **[project-management](./project-management/README.md)** — Project tasks (BOQ tree), manpower planning with the new assign/QC flow, and quality control review

#### Expense Management

- **[cost-request](./cost-request/README.md)** — Employee expense reimbursement requests (Project / Non-Project), with items, proof files, and payment-request auto-sync

#### Meeting

- **[mom](./mom/README.md)** — Minutes of Meeting (MoM) list, mock data only (no API/schemas yet)
- **[action-item](./action-item/README.md)** — Task Control and Quality Control for MoM action items, mock data only (no API/schemas yet)

#### Master Data Domains

Master data domains follow a consistent CRUD pattern:

- **[project-type](./project-type/README.md)** — Project type definitions and configurations
- **[job-item-type](./job-item-type/README.md)** — Job item type classifications
- **[payment-type](./payment-type/README.md)** — Payment method types
- **[document-type](./document-type/README.md)** — Document type definitions (file types and sizes) with tabbed page (Document Type, Daftar Modul)
- **[cost-item-type](./cost-item-type/README.md)** — Cost category types
- **[project-capability](./project-capability/README.md)** — Project capability specifications
- **[group](./group/README.md)** — Group definitions and configurations
- **[company](./company/README.md)** — Company management with geography and project capabilities
- **[vendor-catalog](./vendor-catalog/README.md)** — Vendor catalog management (subcontractor, supplier, logistic)
- **[vendor-directory](./vendor-directory/README.md)** — Read-only tabbed directory of vendor sub-entities (item catalog, capabilities, service coverage, offering documents, fleet)
- **[warehouse](./warehouse/README.md)** — Warehouse master data with geography and company association
- **[asset-management](./asset-management/README.md)** — Route-backed asset catalog and asset category management with registration flow
|- **[hierarchy-management](./hierarchy-management/README.md)** — Hierarchy job position management with company and department relationships
- **[employee-grade](./employee-grade/README.md)** — Employee grade/rank definitions (Golongan)

#### Logistics

- **[logistic](./logistic/README.md)** — Delivery Order management (DO, Inbound, Outbound)

#### Prospectus

- **[prospect-fee](./prospect-fee/README.md)** — Fee configuration for project capabilities

#### Utility Domains

- **[error](./error/README.md)** — Error handling, error boundaries, error pages
- **[legal](./legal/README.md)** — Public pages (no login) for privacy policy and account deletion request, required for Google Play submission
- **[notification](./notification/README.md)** — In-app notification badges (unread counts per sidebar menu) and mark-as-read

## Domain Structure

### Standard Domain Layout

```
<domain>/
├── api/                    # API calls (one file per operation)
├── components/             # Domain-specific UI components
├── hooks/                  # React Query hooks (one per API operation)
├── pages/                  # Page components (list, create, detail, edit)
├── schemas/                # Zod validation schemas
├── services/               # Business logic and data transformation
├── store/                  # Zustand stores (domain-scoped state)
├── types/                  # TypeScript type definitions
├── constants/              # Domain constants and labels
├── mocks/                  # Mock data for development/testing
├── index.ts                # Public barrel exports
└── README.md               # Domain documentation
```

### Domain File Conventions

**API Files** (kebab-case, one per operation):

- `get-<entity>.ts` — Fetch single item
- `get-<entities>.ts` — Fetch list with pagination
- `create-<entity>.ts` — Create new item
- `update-<entity>.ts` — Update existing item
- `delete-<entity>.ts` — Delete item

**Hook Files** (kebab-case):

- `use-<entities>.ts` — Query hook for list
- `use-<entity>.ts` — Query hook for single item
- `use-create-<entity>.ts` — Mutation hook for create
- `use-update-<entity>.ts` — Mutation hook for update
- `use-delete-<entity>.ts` — Mutation hook for delete
- `use-<page>-page.ts` — Page-level hook with all logic

**Component Files** (PascalCase):

- `<EntityName>Form.tsx` — Form component
- `<EntityName>List.tsx` — List component
- `<EntityName>Card.tsx` — Card display

**Page Files** (PascalCase):

- `<EntityName>ListPage.tsx` — List/management page
- `Create<EntityName>Page.tsx` — Create page
- `Edit<EntityName>Page.tsx` — Edit page
- `Detail<EntityName>Page.tsx` — Detail page

## Key Patterns

### API Layer

- One file per HTTP operation (GET, POST, PUT, DELETE)
- Use axios interceptors for auth and errors
- Always throw errors; don't return error objects

### Hooks Layer

- Wrap API calls with React Query
- One hook per API operation
- Page-level hooks combine multiple hooks
- Provide loading, error, and data states

### Component Layer

- Pure functional components with `"use client"` directive
- Props-based, no internal state management
- Use FormGenerator for forms
- Follow Atomic Design pattern

### State Management

- **Zustand** for global domain state
- **React Query** for server state and caching
- **Local useState** only for UI-specific state

## Cross-Domain Communication

Domains should be loosely coupled:

```typescript
// ❌ Don't: Circular dependencies
// auth domain importing from users domain

// ✅ Do: Import through index.ts
import { getMe, useMe } from "@/domains/auth";
import { useUsers } from "@/domains/users";

// ✅ Do: Share through shared types
import type { User } from "@/types/api";
```

## Related Documentation

- **[CLAUDE.md](../../CLAUDE.md)** — Full project architecture and conventions
- **[DOCUMENTATION_INDEX.md](../../DOCUMENTATION_INDEX.md)** — Complete documentation index

## Adding a New Domain

**⚠️ IMPORTANT:** Every new domain MUST include README.md and be linked in workspace documentation!

### Checklist for New Domain Creation

```bash
# 1. Create domain directory structure
mkdir -p src/domains/<domain-name>/{api,hooks,components,pages,types,constants,schemas}

# 2. Create required files
touch src/domains/<domain-name>/index.ts
touch src/domains/<domain-name>/README.md

# 3. Add basic domain structure in index.ts
# - Export public API (types, hooks, pages)

# 4. Create README.md with:
# - Overview section describing domain purpose
# - Structure showing directory layout
# - Key Exports (APIs, Hooks, Pages, Components, Types)
# - Usage Examples with code samples
# - API Contracts (request/response formats)
# - Related Domains (cross-domain dependencies)
# - Best Practices

# 5. Update documentation (CRITICAL!)
# - Add domain link to DOCUMENTATION_INDEX.md (src/domains overview section)
# - Add domain link to src/domains/README.md (Domains Overview section)
# - Add domain link to main README.md (if major domain)

# 6. Run type check
pnpm run type-check
```

### Step-by-Step Guide

#### 1. Create Directory Structure

```bash
mkdir -p src/domains/my-domain/{api,hooks,components,pages,types,constants,schemas}
```

#### 2. Create index.ts (Public Barrel Exports)

```typescript
// src/domains/my-domain/index.ts
export { getMyData } from "./api/get-my-data";
export { useMyData } from "./hooks/use-my-data";
export { MyPage } from "./pages/MyPage";
export type { MyType } from "./types";
```

#### 3. Create README.md (Use Template Below)

```markdown
# My Domain

Overview of what this domain does.

## Structure

Directory layout...

## Key Exports

### APIs

- `getMyData()` - Description

### Hooks

- `useMyData()` - Description

### Pages

- `MyPage` - Description

### Types

- `MyType` - Description

## Usage Examples

Code examples showing how to use...

## API Contracts

Request/response formats...

## Related Domains

Other domains this connects to...

## Best Practices

Domain-specific guidelines...
```

#### 4. Update Documentation Files

**Update DOCUMENTATION_INDEX.md:**

```markdown
Add to "### Domain & Feature Documentation" section:

- [src/domains/my-domain/README.md](src/domains/my-domain/README.md) — Brief description
```

**Update src/domains/README.md:**

```markdown
Add to "## Domains Overview" section under appropriate category:

- **[my-domain](./my-domain/README.md)** — Brief description
```

**Update main README.md (if major domain):**

```markdown
Add link to documentation section
```

#### 5. Verify Everything Works

```bash
# Check TypeScript types
pnpm run type-check

# Verify all imports work
# Try importing from the domain in another file
import { MyPage, useMyData } from '@/domains/my-domain';
```

### Example: Creating a "Products" Domain

```bash
# Step 1: Create structure
mkdir -p src/domains/products/{api,hooks,components,pages,types,constants,schemas}

# Step 2: Create files
touch src/domains/products/index.ts
touch src/domains/products/README.md

# Step 3: Create index.ts
cat > src/domains/products/index.ts << 'EOF'
export { getProducts } from './api/get-products';
export { getProduct } from './api/get-product';
export { createProduct } from './api/create-product';
export { useProducts } from './hooks/use-products';
export { useProduct } from './hooks/use-product';
export { useCreateProduct } from './hooks/use-create-product';
export { ProductPage } from './pages/ProductPage';
export type { Product } from './types';
EOF

# Step 4: Create README.md with proper structure
# [See template in DOCUMENTATION_INDEX.md]

# Step 5: Update DOCUMENTATION_INDEX.md
# Add: - [src/domains/products/README.md](src/domains/products/README.md) — Product management

# Step 6: Update src/domains/README.md
# Add: - **[products](./products/README.md)** — Product management and catalog

# Step 7: Type check
pnpm run type-check
```

### README.md Template for New Domains

Use this template as starting point:

```markdown
# [Domain Name] Domain

Brief one-line description.

## Overview

1-2 paragraph overview of what this domain does and why.

## Structure

\`\`\`
domain-name/
├── api/ # API calls
├── components/ # Domain-specific UI components
├── hooks/ # React Query hooks
├── pages/ # Page components
├── schemas/ # Zod validation schemas
├── types/ # TypeScript types
├── constants/ # Domain constants
├── services/ # Business logic (if needed)
├── store/ # Zustand store (if needed)
└── index.ts # Public barrel exports
\`\`\`

## Key Exports

### APIs

- \`api-function()\` - Description

### Hooks

- \`useHook()\` - Description

### Pages

- \`PageComponent\` - Description

### Types

- \`TypeName\` - Description

## Usage Examples

\`\`\`typescript
import { api, useHook, PageComponent } from '@/domains/domain-name';
\`\`\`

## API Contracts

### Request/Response Examples

## Related Domains

- **other-domain** - How they interact

## Best Practices

Domain-specific guidelines and patterns.
```

### Documentation Links Checklist

Before marking domain as complete:

- [ ] README.md created in `src/domains/<domain>/`
- [ ] Domain added to `src/domains/README.md` (Domains Overview section)
- [ ] Domain added to `DOCUMENTATION_INDEX.md` (Domain & Feature Documentation section)
- [ ] Main README.md updated (if major domain)
- [ ] All exports in `index.ts`
- [ ] TypeScript types check: `pnpm run type-check`
- [ ] Links are valid and working

### Key Reminders

1. **Documentation is mandatory** — Every domain needs README.md
2. **Consistent structure** — Follow existing domain patterns
3. **Link in three places:**
   - `src/domains/README.md` — Domain overview section
   - `DOCUMENTATION_INDEX.md` — Domain & Feature Documentation section
   - Main `README.md` — If major domain
4. **Copy template from existing domain** — See `auth/`, `users/`, `role-permissions/`
5. **Keep it concise** — Explain purpose, not implementation details

### Troubleshooting

**Q: Where should I put domain-specific components?**  
A: In `domain/components/` (not shared). Only move to `@shared` if used in 2+ domains.

**Q: Should every domain have a store?**  
A: No, only if domain needs global state. Most domains use React Query hooks.

**Q: How do I know if a hook should be shared?**  
A: If 2+ domains need it, move to `@/hooks/`. Check `src/shared/hooks/` first!

**Q: What about API types?**  
A: Domain-specific types stay in domain. Shared types go to `@/types/`.

For more details, see [CLAUDE.md](../../CLAUDE.md) and [src/shared/README.md](../../shared/README.md)
