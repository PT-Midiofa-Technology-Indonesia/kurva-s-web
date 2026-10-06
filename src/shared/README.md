# Shared (@shared) - Reusable Components, Hooks, and Utilities

**IMPORTANT:** Always check this directory first before creating new components, hooks, or utilities in domains!

## Overview

The `@shared` directory contains cross-domain reusable code: UI components, hooks, utilities, type definitions, and constants. Every domain should leverage these shared resources to maintain consistency and reduce duplication.

## 📋 Quick Navigation

| Category | Purpose | Location |
|----------|---------|----------|
| **API** | Shared API functions (enums, geography) | [api/](./api/README.md) |
| **UI Components** | Atomic Design components (atoms, molecules, organisms) | [components/](./components/README.md) |
| **React Hooks** | Shared utility hooks (debounce, query params, permissions) | [hooks/](./hooks/README.md) |
| **Library Utils** | HTTP client, API helpers, query client config | [lib/](./lib/README.md) |
| **Providers** | React context providers, wrappers | [providers/](./providers/README.md) |
| **Schemas** | Reusable Zod validation schemas | [schemas/](./schemas/README.md) |
| **Store** | Global Zustand stores (navigation) | [store/](./store/README.md) |
| **Type Definitions** | Shared TypeScript types, API types, permissions | [types/](./types/README.md) |
| **Constants** | App-wide constants, labels, navigation config | [constants/](./constants/README.md) |
| **Utils** | Utility functions (cn, masks, string helpers) | [utils/](./utils/README.md) |

## Directory Structure

```
src/shared/
├── api/                    # Shared API functions
│   ├── get-enums.ts        # Enum endpoint API
│   ├── get-geography.ts    # Geography endpoint API
│   └── README.md           # API documentation
│
├── components/            # Reusable UI components (Atomic Design)
│   ├── atoms/             # Basic building blocks (Button, Input, Text, etc.)
│   ├── molecules/         # Simple combinations (Alert, DatePicker, etc.)
│   ├── organisms/         # Complex components (DataTable, FormGenerator, etc.)
│   ├── templates/         # Page layouts (ListPageTemplate, DashboardLayout, etc.)
│   ├── ui/                # shadcn/ui primitives (don't use directly)
│   └── README.md          # Component documentation
│
├── hooks/                 # Reusable React hooks
│   ├── use-debounce.ts    # Debounce hook
│   ├── use-permissions.ts # Permission checking
│   ├── use-query-params.ts # URL query params management
│   ├── use-breadcrumbs.ts # Breadcrumb generation
│   └── README.md          # Hook documentation
│
├── lib/                   # Core library utilities
│   ├── axios.ts           # HTTP client with interceptors
│   ├── api-error.ts       # Error handling utilities
│   ├── api-response.ts    # API response types
│   ├── api-config.ts      # API configuration
│   ├── query-client.ts    # React Query configuration
│   ├── query-params.ts    # Query parameter helpers
│   ├── utils.ts           # General utilities (cn, etc.)
│   └── README.md          # Lib documentation
│
├── providers/             # React context providers
│   ├── index.tsx          # QueryClientProvider wrapper
│   └── README.md          # Provider documentation
│
├── schemas/               # Reusable Zod validation schemas
│   ├── common.ts          # Common field schemas (code, name, etc.)
│   ├── email.ts           # Email validation schema
│   ├── is-active.ts       # Active status schema
│   ├── phone.ts           # Phone validation schema
│   └── README.md          # Schema documentation
│
├── store/                 # Global Zustand stores
│   ├── navigation.ts      # Navigation store (breadcrumbs)
│   └── README.md          # Store documentation
│
├── types/                 # Shared TypeScript types
│   ├── api.ts             # API response/request types
│   ├── enum.ts            # Enum types
│   ├── permissions.ts     # Permission types
│   ├── query-params.ts    # Query parameter types
│   └── index.ts           # Type barrel exports
│
├── constants/             # App-wide constants
│   ├── index.ts           # Common labels, status options
│   └── navigation.tsx     # Navigation configuration
│
├── utils/                 # Utility functions
│   ├── cn.ts              # Classname merger (cn)
│   ├── masks.ts           # Formatting masks
│   ├── string.ts          # String utilities
│   ├── test-utils.tsx     # Test utilities
│   └── README.md          # Utils documentation
│
└── README.md              # This file
```

## 🎯 Before Creating New Code

**ALWAYS CHECK SHARED FIRST!**

### Creating a New Component?

1. Check [components/](./components/README.md) for existing atoms, molecules, organisms
2. Does something similar already exist? → **Use it!**
3. Can you compose existing components? → **Compose them!**
4. Only create new if truly unique

**Check these locations:**
- `@/components/atoms/*` - Form fields, buttons, badges, etc.
- `@/components/molecules/*` - Alert dialogs, dropdowns, date pickers
- `@/components/organisms/*` - DataTable, FormGenerator, PermissionsManager
- `@/components/templates/*` - ListPageTemplate, DashboardLayout

### Using a Hook?

1. Check [hooks/](./hooks/README.md) for existing hooks
2. `useQueryParams()` - URL param management
3. `useDebounce()` - Debouncing values
4. `usePermissions()` - Check user permissions
5. `useBreadcrumbs()` - Generate breadcrumbs

### Need a Utility?

1. Check [lib/](./lib/README.md) for existing helpers
2. `axios` - HTTP requests (with auth interceptors)
3. `getErrorMessage()`, `getFieldErrors()` - Error handling
4. `cn()` - Tailwind classname merging
5. Query parameter helpers

### Using API Types?

1. Check [types/](./types/README.md) for existing types
2. `ApiSuccessResponse<T>` - Success response type
3. `ApiErrorResponse` - Error response type
4. `Permission`, `PermissionGroup` - Permission types

### Need Constants?

1. Check [constants/](./constants/README.md) for common values
2. `COMMON_LABELS` - Status, actions, field names
3. `COMMON_STATUS_OPTIONS` - Active/inactive options
4. `NAVIGATION_CONFIG` - App navigation structure

## 📚 Detailed Documentation

### [API - Shared API Functions](./api/README.md)
Cross-domain API functions for common backend endpoints:
- `enumApi.get()` — Fetch enum values by endpoint
- `geographyApi.getProvinces()`, `.getCities()`, `.getDistricts()`, `.getVillages()` — Geographic data

**Import Pattern:** `@/shared/api/<api-file>`

### [Components - Atomic Design Pattern](./components/README.md)
Reusable UI components organized by atomic design hierarchy:
- **Atoms** — Basic building blocks (Button, Input, Text, Checkbox, Switch, Select, etc.)
- **Molecules** — Simple combinations (Alert, DataTablePagination, DatePicker, SearchBar, etc.)
- **Organisms** — Complex components (DataTable, FormGenerator, PermissionsManager, Sidebar, Navbar, etc.)
- **Templates** — Page layouts (ListPageTemplate, DashboardLayout, AuthLayout, etc.)

**Import Pattern:** `@/components/<level>/<ComponentName>`

### [Hooks - Utility Hooks](./hooks/README.md)
Reusable React hooks for common functionality:
- `useQueryParams()` — Manage URL query parameters
- `useDebounce()` — Debounce values
- `usePermissions()` — Check user permissions
- `useBreadcrumbs()` — Generate breadcrumbs from routes

**Import Pattern:** `@/hooks/use-<hook-name>`

### [Lib - Core Utilities](./lib/README.md)
Core library functions and configurations:
- `axios` — HTTP client with auth/error interceptors
- `apiError.ts` — Error extraction and handling (getErrorMessage, getFieldErrors, getErrorCode)
- `apiResponse.ts` — Response type definitions and helpers
- `apiConfig.ts` — API path configuration (getApiPath)
- `queryClient.ts` — React Query configuration
- `queryParams.ts` — URL parameter utilities
- `utils.ts` — General utilities (cn for Tailwind classes)

**Import Pattern:** `@/lib/<utility-name>`

### [Providers - Context Setup](./providers/README.md)
React context providers and setup wrappers:
- `Providers` component wraps app with QueryClientProvider, ReactQueryDevtools

### [Schemas - Zod Validation](./schemas/README.md)
Reusable Zod validation schemas for cross-domain use:
- `codeRequiredSchema`, `nameRequiredSchema` — Required field schemas
- `codeWithMaxSchema`, `nameWithMaxSchema` — With max length validation
- `simpleCreateSchema`, `simpleEditSchema` — Simple CRUD schemas
- `isActiveSchema` — Active status validation
- Email and phone validation schemas

**Import Pattern:** `@/shared/schemas/<schema-name>`

### [Store - Global State](./store/README.md)
Zustand stores for global client state:
- `useNavigationStore()` — Navigation state (breadcrumbs)

### [Types - Shared Type Definitions](./types/README.md)
TypeScript type definitions used across domains:
- `ApiSuccessResponse<T>` — Standard success response envelope
- `ApiPaginatedResponse<T>` — Paginated list response
- `ApiErrorResponse` — Error response structure
- `EnumEndpoint`, `EnumResponse` — Enum types
- `Permission`, `PermissionGroup` — Permission types
- `QueryParamValues` — Query parameter types

**Import Pattern:** `@/types` or `@/types/api`

### [Utils - Utility Functions](./utils/README.md)
General utility functions:
- `cn()` — Tailwind classname merger (clsx + twMerge)
- Formatting masks (phone, currency)
- String utilities (humanize, slugify)
- Test utilities

**Import Pattern:** `@/utils/<utility-name>`

### [Constants - App-Wide Values](./constants/README.md)
Constants and configuration values:
- `COMMON_LABELS` — Status, action, field labels (STATUS, ACTIONS, FIELDS, etc.)
- `COMMON_STATUS_OPTIONS` — Active/inactive dropdown options
- `NAVIGATION_CONFIG` — App navigation routes and structure
- User-facing strings (move from components to constants!)

**Import Pattern:** `@/shared/constants` or domain-specific `@/domains/<domain>/constants`

## ✅ Best Practices - Before Creating Code

### ✅ DO
- **Check @/components/* first** for existing UI components
- **Reuse atoms** to build molecules and organisms
- **Use FormGenerator** for all forms (don't build manual forms)
- **Use ListPageTemplate** for all list pages
- **Leverage shared hooks** (useQueryParams, useDebounce, etc.)
- **Share constants** across domains via @/shared/constants
- **Use shared types** (ApiSuccessResponse, ApiErrorResponse)
- **Reference this README** when unsure what's available

### ❌ DON'T
- **Don't create new components** if something similar exists in @/components
- **Don't build forms manually** — use FormGenerator
- **Don't hardcode strings** — use constants
- **Don't duplicate hooks** — check @/hooks first
- **Don't import from ui/** directly — use atom wrappers
- **Don't create utilities in domains** if they're cross-domain
- **Don't duplicate types** — use shared @/types

## 🔍 Quick Reference

### Common Imports

```typescript
// Components
import { Button, Input, Text } from '@/components/atoms';
import { Alert, DatePicker } from '@/components/molecules';
import { DataTable, FormGenerator, PermissionsManager } from '@/components/organisms';
import { ListPageTemplate, DashboardLayout } from '@/components/templates';

// Hooks
import { useQueryParams } from '@/hooks/use-query-params';
import { useDebounce } from '@/hooks/use-debounce';
import { usePermissions } from '@/hooks/use-permissions';

// Lib utilities
import axios from '@/lib/axios';
import { getErrorMessage, getFieldErrors } from '@/lib/api-error';
import { cn } from '@/lib/utils';

// Types
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/api';
import type { Permission, PermissionGroup } from '@/types';

// Constants
import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';

// Stores
import { useAuthStore } from '@/shared/stores';
```

## 🎓 Examples

### Example 1: Check Components Before Creating

**❌ Wrong:** Create custom UserTable in domain
```typescript
// src/domains/users/components/UserTable.tsx
export function UserTable({ users }) {
  return <table>...</table>; // Manual table code
}
```

**✅ Right:** Use shared DataTable
```typescript
import { DataTable } from '@/components/organisms';
import { columns } from './columns'; // Shared definition

export function UserTable({ users, onEdit, onDelete }) {
  return <DataTable data={users} columns={columns} contextMenu={/* ... */} />;
}
```

### Example 2: Use FormGenerator for Forms

**❌ Wrong:** Manual form with individual inputs
```typescript
export function CreateUserForm() {
  return (
    <form>
      <Input label="Name" />
      <Input label="Email" />
      <Select label="Role" />
      <Button>Save</Button>
    </form>
  );
}
```

**✅ Right:** Use FormGenerator
```typescript
import { FormGenerator } from '@/components/organisms';
import { CREATE_USER_FORM_FIELDS } from './constants';

export function CreateUserForm() {
  return <FormGenerator fields={CREATE_USER_FORM_FIELDS} onSubmit={handleSubmit} />;
}
```

### Example 3: Use ListPageTemplate for List Pages

**❌ Wrong:** Manual list page layout
```typescript
export function UserList() {
  return (
    <div>
      <h1>Users</h1>
      <Button>Add User</Button>
      <DataTable />
      <Pagination />
    </div>
  );
}
```

**✅ Right:** Use ListPageTemplate
```typescript
import { ListPageTemplate } from '@/components/templates';

export function UserList() {
  const { data, pagination, onPaginate, onDelete, onAdd } = useUserManagementPage();
  
  return (
    <ListPageTemplate
      title={USER_LABELS.LIST.TITLE}
      data={data}
      pagination={pagination}
      onPaginate={onPaginate}
      onDelete={onDelete}
      onAdd={onAdd}
      columns={columns}
    />
  );
}
```

## 📖 Full Documentation Index

See [DOCUMENTATION_INDEX.md](../../DOCUMENTATION_INDEX.md) for complete documentation of:
- All shared components (atoms, molecules, organisms, templates)
- All shared hooks
- All library utilities
- All type definitions
- All constants

## 🚀 When to Contribute to Shared

Add to @shared when:
- ✅ Component/hook/util is used in **2+ domains**
- ✅ Component is generic and domain-agnostic
- ✅ Hook is utility-focused (no domain-specific logic)
- ✅ Type is used across domains
- ✅ Constant applies app-wide

Don't add to @shared when:
- ❌ Only used in one domain → keep in domain
- ❌ Domain-specific business logic → keep in domain
- ❌ Highly specialized component → keep in domain
- ❌ Experimental/not stable → keep in domain until proven

## 💡 Tips

1. **Use path aliases** — Import with `@/` prefix, not relative paths
2. **Check barrel exports** — Use `index.ts` for clean imports
3. **Read existing code** — Copy patterns from similar implementations
4. **Reference this README** — When adding to shared, document in related README
5. **Keep it DRY** — Three similar lines = consider extracting to shared
