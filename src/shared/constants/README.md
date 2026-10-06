# Constants - App-Wide Configuration

Centralized constants and configuration values used across the application.

## Available Constants

### index.ts - Common Labels and Options

App-wide labels and option values that should be consistent everywhere.

```typescript
import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';
```

#### `COMMON_LABELS`
Standardized labels for UI elements.

```typescript
interface CommonLabels {
  // Status labels
  STATUS: {
    ACTIVE: 'Active';
    INACTIVE: 'Inactive';
  };
  
  // Field labels (used in forms, tables, etc.)
  FIELDS: {
    ID: 'ID';
    NAME: 'Name';
    CODE: 'Code';
    DESCRIPTION: 'Description';
    STATUS: 'Status';
    CREATED_AT: 'Created';
    UPDATED_AT: 'Updated';
    ACTIONS: 'Actions';
    EMAIL: 'Email';
    PASSWORD: 'Password';
    ROLE: 'Role';
  };
  
  // Action labels (buttons, menus)
  ACTIONS: {
    SAVE: 'Save';
    SAVE_CHANGE: 'Save Changes';
    CANCEL: 'Cancel';
    DELETE: 'Delete';
    EDIT: 'Edit';
    VIEW: 'View';
    BACK: 'Back';
    ADD: 'Add';
    CREATE: 'Create';
    CLOSE: 'Close';
    SEARCH: 'Search';
    FILTER: 'Filter';
    SORT: 'Sort';
  };
  
  // State labels
  STATE: {
    LOADING: 'Loading...';
    SAVING: 'Saving...';
    DELETING: 'Deleting...';
  };
  
  // Placeholder text
  PLACEHOLDERS: {
    SEARCH: 'Search...';
    SELECT: 'Select...';
    STATUS: 'Select status';
  };
  
  // List-specific labels
  LIST: {
    EMPTY: 'No data found';
    ACTIONS: {
      EDIT: 'Edit';
      DELETE: 'Delete';
      VIEW: 'View';
    };
  };
}

// Usage
const title = COMMON_LABELS.FIELDS.NAME;        // 'Name'
const saveBtn = COMMON_LABELS.ACTIONS.SAVE;     // 'Save'
const status = COMMON_LABELS.STATUS.ACTIVE;     // 'Active'
const loading = COMMON_LABELS.STATE.LOADING;    // 'Loading...'
```

#### `COMMON_STATUS_OPTIONS`
Standard status dropdown options.

```typescript
interface StatusOption {
  label: string;
  value: 'active' | 'inactive';
}

const COMMON_STATUS_OPTIONS: StatusOption[] = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

// Usage in Select/AsyncSelect
<AsyncSelect
  options={COMMON_STATUS_OPTIONS}
  defaultValue={{ label: 'Active', value: 'active' }}
/>
```

---

### task-status.ts - Task Status Options

Standard task status filter options, shared by any list page that filters by task status (e.g. Task Control in `project-management`).

```typescript
import { TASK_STATUS_OPTIONS } from '@/shared/constants';
```

```typescript
const TASK_STATUS_OPTIONS = [
  { value: 'created', label: 'Created' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'delegated', label: 'Delegated' },
  { value: 'done', label: 'Done' },
  { value: 'qc_passed', label: 'Qc Passed' },
  { value: 'qc_failed', label: 'Qc Failed' },
  { value: 'reopened', label: 'Reopened' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;
```

---

### navigation.tsx - Navigation Configuration

App-wide navigation routes and menu structure.

```typescript
import { NAVIGATION_CONFIG } from '@/shared/constants';
```

#### `NAVIGATION_CONFIG`
Centralized navigation structure for sidebar, menus, breadcrumbs.

```typescript
interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  requiredPermission?: string;
  isAdmin?: boolean;
}

interface NavigationConfig {
  main: NavigationItem[];
  admin: NavigationItem[];
  secondary: NavigationItem[];
}

const NAVIGATION_CONFIG: NavigationConfig = {
  main: [
    { id: 'dashboard', label: 'Dashboard', path: '/' },
    {
      id: 'projects',
      label: 'Projects',
      path: '/projects',
      children: [
        { id: 'projects-list', label: 'All Projects', path: '/projects' },
        { id: 'projects-create', label: 'Create Project', path: '/projects/create' },
      ],
    },
    { id: 'reports', label: 'Reports', path: '/reports' },
  ],
  admin: [
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      isAdmin: true,
      children: [
        { id: 'users', label: 'Users', path: '/settings/users' },
        { id: 'roles', label: 'Roles', path: '/settings/roles' },
        { id: 'project-types', label: 'Project Types', path: '/settings/project-types' },
      ],
    },
  ],
  secondary: [
    { id: 'profile', label: 'Profile', path: '/profile' },
    { id: 'logout', label: 'Logout', path: '/logout' },
  ],
};

// Usage in Sidebar
{NAVIGATION_CONFIG.main.map((item) => (
  <NavItem key={item.id} item={item} />
))}
```

---

## Domain-Specific Constants

While shared constants are in `@/shared/constants`, domain-specific constants should be in each domain:

```typescript
// ✅ Domain-specific
import { USER_LABELS, USER_FORM_FIELDS } from '@/domains/users/constants';

// ✅ Shared constants
import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';
```

### Domain Constant Pattern

Each domain should have `constants/index.ts`:

```typescript
// src/domains/users/constants/index.ts

import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';

export const USER_LABELS = {
  LIST: {
    TITLE: 'Users',
    DESCRIPTION: 'Manage users in the system',
    ADD_BUTTON: 'Add New User',
    EMPTY: 'No users found',
    COLUMNS: {
      NAME: COMMON_LABELS.FIELDS.NAME,
      EMAIL: COMMON_LABELS.FIELDS.EMAIL,
      ROLE: COMMON_LABELS.FIELDS.ROLE,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
      ACTIONS: COMMON_LABELS.FIELDS.ACTIONS,
    },
  },
  CREATE: {
    PAGE_TITLE: 'Create User',
    FIELDS: {
      NAME: COMMON_LABELS.FIELDS.NAME,
      EMAIL: COMMON_LABELS.FIELDS.EMAIL,
      PASSWORD: COMMON_LABELS.FIELDS.PASSWORD,
      ROLE: COMMON_LABELS.FIELDS.ROLE,
      STATUS: COMMON_LABELS.FIELDS.STATUS,
    },
  },
};

export const USER_FORM_FIELDS = [
  {
    name: 'name',
    label: USER_LABELS.CREATE.FIELDS.NAME,
    type: 'text',
    required: true,
  },
  {
    name: 'email',
    label: USER_LABELS.CREATE.FIELDS.EMAIL,
    type: 'email',
    required: true,
  },
  {
    name: 'password',
    label: USER_LABELS.CREATE.FIELDS.PASSWORD,
    type: 'password',
    required: true,
  },
  {
    name: 'role',
    label: USER_LABELS.CREATE.FIELDS.ROLE,
    type: 'select',
    required: true,
  },
  {
    name: 'status',
    label: USER_LABELS.CREATE.FIELDS.STATUS,
    type: 'select',
    options: COMMON_STATUS_OPTIONS,
    required: true,
  },
];

export const STATUS_OPTIONS = COMMON_STATUS_OPTIONS;
```

---

## Usage Patterns

### Pattern 1: Using Common Labels in Components

```typescript
import { COMMON_LABELS } from '@/shared/constants';

export function UserForm() {
  return (
    <form>
      <label>{COMMON_LABELS.FIELDS.NAME}</label>
      <input placeholder={COMMON_LABELS.PLACEHOLDERS.SEARCH} />
      
      <button type="submit">{COMMON_LABELS.ACTIONS.SAVE}</button>
      <button type="button">{COMMON_LABELS.ACTIONS.CANCEL}</button>
    </form>
  );
}
```

### Pattern 2: Using Navigation Config in Sidebar

```typescript
import { NAVIGATION_CONFIG } from '@/shared/constants';
import { usePermissions } from '@/hooks/use-permissions';

export function Sidebar() {
  const { can } = usePermissions();
  
  return (
    <nav>
      {NAVIGATION_CONFIG.main.map((item) => {
        if (item.requiredPermission && !can(item.requiredPermission)) {
          return null;
        }
        return <NavItem key={item.id} item={item} />;
      })}
    </nav>
  );
}
```

### Pattern 3: Combining Shared and Domain Constants

```typescript
import { COMMON_LABELS, COMMON_STATUS_OPTIONS } from '@/shared/constants';
import { USER_LABELS, USER_FORM_FIELDS } from '@/domains/users/constants';

export function UserListHeader() {
  return <h1>{USER_LABELS.LIST.TITLE}</h1>;
}

export function UserStatusFilter() {
  return (
    <select>
      {COMMON_STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
```

---

## Best Practices

### ✅ DO
- **Centralize user-facing strings** — Move from components to constants
- **Use COMMON_LABELS for consistency** — Same label everywhere
- **Extend shared constants in domains** — Don't duplicate
- **Update navigation config** — When adding new routes
- **Use constants in forms** — Form field labels should come from constants
- **Export from index.ts** — Make discoverable

### ❌ DON'T
- **Don't hardcode strings** — Always use constants
- **Don't duplicate labels** — Check shared constants first
- **Don't create random keys** — Use consistent naming
- **Don't modify constants in components** — They should be static
- **Don't nest too deep** — Keep structure readable

---

## Adding New Constants

### When to Add to Shared
- Label used in 2+ domains
- App-wide navigation
- Common status/option values
- Global configuration

### When to Keep in Domain
- Domain-specific labels
- Domain-specific form fields
- Domain-specific options
- Business-specific constants

### Process

1. **Shared constant** — Add to `@/shared/constants`
2. **Domain-specific** — Add to `@/domains/<domain>/constants`
3. **Export** — Always export from index.ts
4. **Document** — Add to this README

---

## Common Shared Constants Checklist

- [ ] `COMMON_LABELS` — Status, actions, fields, placeholders
- [ ] `COMMON_STATUS_OPTIONS` — Active/inactive options
- [ ] `NAVIGATION_CONFIG` — App navigation structure
- [ ] Status enums (if using TypeScript enums)
- [ ] Role enums
- [ ] Permission keys

---

## Related Documentation

- [Components](../components/README.md) — Components use constants
- [Domains](../../domains/README.md) — Domain patterns for constants
- [CLAUDE.md](../../CLAUDE.md) — Architecture and conventions
