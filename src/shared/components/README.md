# Components (Atomic Design Pattern)

This directory contains reusable UI components organized by atomic design hierarchy.

> **For agents:** Always check this file before creating a new component. If a component already exists, use it. If you're creating a new shared component, add it to the appropriate tier, create a `*.stories.tsx` file, and update this README.

## Directory Structure

```
src/shared/components/
├── atoms/                    # Basic building blocks
│   ├── Breadcrumb/
│   ├── Button/
│   ├── Checkbox/
│   ├── DataTableColumnHeader/
│   ├── DataTableEditableCell/
│   ├── Input/                # Input, InputCurrency, InputNumber
│   ├── KanbanCard/
│   ├── PermissionCheckbox/
│   ├── Select/               # AsyncSelect with search/group support
│   ├── Switch/
│   ├── Text/
│   └── index.ts
├── molecules/                # Atoms composed together with behavior
│   ├── Alert/
│   ├── AlertDialog/          # includes ConfirmDialog
│   ├── DataTablePagination/
│   ├── DatePicker/           # single & range modes
│   ├── CustomToast/
│   ├── FileInput/
│   ├── FormCard/             # White card wrapper for forms
│   ├── KanbanColumn/
│   ├── KanbanItem/
│   ├── LoadingSkeleton/      # Generic skeleton (line/paragraph/card/table-row/circle)
│   ├── PageHeader/
│   ├── PaymentExecutionModal/
│   ├── PermissionGroup/
│   ├── PermissionItem/
│   ├── ProfileDropdown/      # includes Dropdown
│   ├── ProgressToast/
│   ├── ProjectPortalSelect/
│   ├── SearchBar/
│   ├── Tabs/                 # Tabs + TabPanel with lazy-fetch pattern
│   ├── WorkDaysSelector/
│   └── index.ts
├── organisms/                # Complex compositions of molecules/atoms
│   ├── DataTable/
│   ├── FormGenerator/
│   ├── GanttChart/
│   ├── KanbanBoard/
│   ├── Navbar/
│   ├── PermissionsAccordion/
│   ├── PermissionsManager/
│   ├── Sidebar/
│   └── index.ts
├── templates/                # Full page layout skeletons
│   ├── AuthLayout/
│   ├── DashboardLayout/
│   ├── DashboardRouteLayout/ # Wired layout with sidebar, navbar, logout
│   ├── DataTableLayout/
│   ├── DetailDrawerTemplate/ # Wrapper for detail drawer pages
│   ├── FormPageSkeleton/     # Loading skeleton for create/edit form pages
│   ├── ListPageSkeleton/     # Loading skeleton for list pages
│   ├── ListPageTemplate/
│   └── index.ts
├── ui/                       # Raw shadcn/ui primitives (use sparingly)
└── README.md
```

---

## Atomic Design Levels

### Atoms

Smallest building blocks — single responsibility, no internal state beyond UI interaction.

| Component                 | Description                                                                              | Key Props                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Button**                | Variants: default, outline, destructive, ghost, ghost-destructive. Sizes: xs, sm, md, lg | `variant`, `size`, `isLoading`, `leftIcon`, `rightIcon`    |
| **Input**                 | Text input with left/right icon slots, error and disabled states                         | `leftIcon`, `rightIcon`, `error`                           |
| **InputCurrency**         | Currency-formatted numeric input                                                         | `value`, `onChange`, `currency`                            |
| **InputNumber**           | Numeric-only input                                                                       | `value`, `onChange`, `min`, `max`                          |
| **Text**                  | Typography atom — 9 sizes, 5 weights, semantic colors                                    | `size`, `weight`, `color`, `as`                            |
| **AsyncSelect**           | Searchable select with groups, async options, multi                                      | `options`, `value`, `onChange`, `isMulti`, `isSearchable`  |
| **Switch**                | Toggle switch                                                                            | `checked`, `onCheckedChange`                               |
| **Checkbox**              | Checkbox with label                                                                      | `checked`, `onCheckedChange`                               |
| **Breadcrumb**            | Breadcrumb nav with items                                                                | `items`                                                    |
| **KanbanCard**            | Card for kanban boards                                                                   | `title`, `description`                                     |
| **PermissionCheckbox**    | Checkbox styled for permission grids                                                     | —                                                          |
| **DataTableColumnHeader** | Sortable column header with drag grip                                                    | `column`, `title`                                          |
| **DataTableEditableCell** | Inline cell editor (input or select)                                                     | `value`, `editType`, `selectOptions`, `onSave`, `onCancel` |

Import path: `@/components/atoms/<ComponentName>` or via barrel `@/components/atoms`

---

### Molecules

Atoms composed together, sometimes with local state.

| Component                          | Description                                                                                                                                                       | Key Props                                                                           |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Alert**                          | Informational alert with variants                                                                                                                                 | `variant`, `title`, `description`                                                   |
| **AlertDialog / ConfirmDialog**    | Modal confirmation dialog                                                                                                                                         | `title`, `description`, `onConfirm`, `onCancel`                                     |
| **DataTablePagination**            | Pagination controls (controlled, no internal state)                                                                                                               | `page`, `perPage`, `total`, `onPageChange`, `onPerPageChange`                       |
| **CustomToast**                    | Toast content with success/error/warning/info/loading/progress variants                                                                                           | `variant`, `title`, `description`, `percent`, `onDismiss`                           |
| **DatePicker**                     | Single date or date range picker                                                                                                                                  | `mode`, `value`, `onChange`, `minDate`, `maxDate`                                   |
| **FileInput**                      | File upload input with preview                                                                                                                                    | `value`, `onChange`, `accept`                                                       |
| **FormCard**                       | White card container for form sections (`bg-white`, border, `rounded-[14px]`, shadow)                                                                             | `children`, `className`                                                             |
| **KanbanColumn**                   | Column wrapper for kanban boards                                                                                                                                  | `title`, `children`                                                                 |
| **KanbanItem**                     | Draggable item inside a kanban column                                                                                                                             | —                                                                                   |
| **LoadingSkeleton**                | Generic skeleton primitives (line/paragraph/card/table-row/circle). Use `FormPageSkeleton` / `ListPageSkeleton` for page-level loading.                           | `variant`, `count`, `width`, `height`                                               |
| **PageHeader**                     | Page title + breadcrumb + action slot                                                                                                                             | `title`, `breadcrumbs`, `actions`                                                   |
| **PaymentExecutionModal**          | Modal form for payment execution flow with method-specific fields and proof upload                                                                                | `open`, `sourceTypeLabel`, `sourceCode`, `amount`, `labels`, `paymentMethodOptions` |
| **PermissionGroup**                | Group header for permission lists                                                                                                                                 | —                                                                                   |
| **PermissionItem**                 | Single permission row with checkboxes                                                                                                                             | —                                                                                   |
| **ProfileDropdown** / **Dropdown** | User profile menu or generic dropdown                                                                                                                             | `items`, `trigger`                                                                  |
| **ProgressToast**                  | Compact progress toast with label and progress bar                                                                                                                | `label`, `percent`                                                                  |
| **ProjectPortalSelect**            | Project selector dropdown for project portal navbar slot                                                                                                          | `projects`, `value`, `onChange`                                                     |
| **SearchBar**                      | Debounced search input with clear button                                                                                                                          | `onDebounce`, `debounce`, `showClear`                                               |
| **Tabs**                           | Tab navigation + lazy-rendered panels in one component. Pass `content` per item — no separate wiring needed. `TabPanel` exported separately for advanced layouts. | see [Tabs Pattern](#tabs-pattern) below                                             |
| **WorkDaysSelector**               | Chip-style work-day multi-select using hidden checkboxes                                                                                                          | `value`, `onChange`, `label`, `disabled`                                            |

Import path: `@/components/molecules/<ComponentName>` or via barrel `@/components/molecules`

---

### Organisms

Complex, feature-rich components composed of multiple molecules and atoms.

| Component                | Description                                                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **DataTable**            | Full-featured data grid: sortable columns, DnD reorder, inline editing, pagination, row selection, context menu, column resize, range selection |
| **FormGenerator**        | Schema-driven form builder. Define fields in constants, render with one component                                                               |
| **GanttChart**           | Project timeline Gantt chart                                                                                                                    |
| **KanbanBoard**          | Full drag-and-drop kanban board                                                                                                                 |
| **Navbar**               | Application top navigation bar                                                                                                                  |
| **PermissionsAccordion** | Accordion-style permissions display                                                                                                             |
| **PermissionsManager**   | Full RBAC permission management UI                                                                                                              |
| **Sidebar**              | Application sidebar navigation                                                                                                                  |

---

### Templates

Full page layout skeletons. Domain pages render inside these.

| Template                 | Description                                                                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **AuthLayout**           | Centered card layout for login/register pages                                                                                           |
| **DashboardLayout**      | Sidebar + Navbar + main content area                                                                                                    |
| **DashboardRouteLayout** | Wired variant of `DashboardLayout` with sidebar nav, logout, and profile menu already connected                                         |
| **DataTableLayout**      | Header + toolbar + table area layout                                                                                                    |
| **DetailDrawerTemplate** | Standard wrapper for detail drawer side-panels                                                                                          |
| **FormPageSkeleton**     | Page-level loading skeleton for create/edit form pages. Renders header + `FormCard` shell + action buttons. Props: `fields` (default 4) |
| **ListPageSkeleton**     | Page-level loading skeleton for list pages. Renders header + filter bar + column headers + rows + pagination. Props: `rows` (default 7) |
| **ListPageTemplate**     | Complete list page: header, search, filters, table, pagination, delete dialog                                                           |

#### Loading skeleton usage

```tsx
// In edit/create pages — show while fetching initial data
import { FormPageSkeleton } from "@/components/templates";

if (isLoading) return <FormPageSkeleton />; // default 4 fields
if (isLoading) return <FormPageSkeleton fields={6} />; // 6-field layout

// In list pages — show while fetching table data (ListPageTemplate handles this internally)
import { ListPageSkeleton } from "@/components/templates";

if (isLoading) return <ListPageSkeleton />; // default 7 rows
```

---

## Tabs Pattern

`Tabs` is a single self-contained component. Pass all tab definitions (label, content, loading state) in the `items` array — no separate `TabPanel` wiring or `activeKey` state required.

### File Structure

```
molecules/Tabs/
├── Tabs.tsx          # Unified component (tab bar + lazy panels)
├── TabPanel.tsx      # Low-level panel — exported for advanced layouts only
├── types.ts          # TabItem interface
├── Tabs.stories.tsx
└── index.ts
```

### TabItem interface

```ts
interface TabItem {
  key: string;
  label: string;
  leftIcon?: ReactNode; // icon left of label (e.g. lucide icon)
  rightIcon?: ReactNode; // icon right of label
  content: ReactNode; // panel content rendered when this tab is active
  isLoading?: boolean; // show skeleton while data is loading
  loadingFallback?: ReactNode; // custom skeleton (overrides default 3-line pulse)
}
```

### Tabs props

| Prop               | Type                    | Required | Description                                                |
| ------------------ | ----------------------- | -------- | ---------------------------------------------------------- |
| `items`            | `TabItem[]`             | ✅       | Tab definitions including content                          |
| `defaultActiveKey` | `string`                | —        | Initial active tab (uncontrolled). Defaults to first item. |
| `activeKey`        | `string`                | —        | Controlled active tab. Pair with `onChange`.               |
| `onChange`         | `(key: string) => void` | —        | Called when a tab is clicked                               |
| `className`        | `string`                | —        | Extra classes on the tab bar row                           |
| `contentClassName` | `string`                | —        | Extra classes on every panel wrapper                       |

### Lazy-mount behaviour

Each panel mounts once on first activation and stays mounted (hidden) afterwards. This means:

- Switching away and back does **not** re-trigger a fetch.
- Scroll position and form state are preserved.

### Usage — Static content (uncontrolled)

```tsx
import { Tabs, type TabItem } from "@/components/molecules";

const TABS: TabItem[] = [
  { key: "overview", label: "Overview", content: <OverviewContent /> },
  { key: "details", label: "Details", content: <DetailsContent /> },
  { key: "history", label: "History", content: <HistoryContent /> },
];

export function ProjectDetailPage() {
  return <Tabs items={TABS} />;
}
```

### Usage — Dynamic fetch per tab (recommended pattern)

Keep `isLoading` and `content` in the page hook; pass them through `items`. Use `enabled: activeTab === 'key'` in React Query so each query only fires when its tab is first opened.

```tsx
// use-project-detail-page.ts
export function useProjectDetailPage(projectId: string) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: overview } = useProjectOverview(projectId);

  const { data: details, isLoading: detailsLoading } = useProjectDetails(
    projectId,
    {
      enabled: activeTab === "details",
    }
  );

  const { data: history, isLoading: historyLoading } = useProjectHistory(
    projectId,
    {
      enabled: activeTab === "history",
    }
  );

  return {
    activeTab,
    setActiveTab,
    overview,
    details,
    detailsLoading,
    history,
    historyLoading,
  };
}
```

```tsx
// ProjectDetailPage.tsx
export function ProjectDetailPage() {
  const {
    activeTab,
    setActiveTab,
    overview,
    details,
    detailsLoading,
    history,
    historyLoading,
  } = useProjectDetailPage(projectId);

  const tabs: TabItem[] = [
    {
      key: "overview",
      label: "Overview",
      content: <ProjectOverview data={overview} />,
    },
    {
      key: "details",
      label: "Details",
      isLoading: detailsLoading,
      content: <ProjectDetails data={details} />,
    },
    {
      key: "history",
      label: "History",
      isLoading: historyLoading,
      content: <ProjectHistory data={history} />,
    },
  ];

  return <Tabs items={tabs} activeKey={activeTab} onChange={setActiveTab} />;
}
```

### Usage — With icons

```tsx
import { BarChart2, Users } from "lucide-react";

const TABS: TabItem[] = [
  {
    key: "overview",
    label: "Overview",
    leftIcon: <BarChart2 className="w-4 h-4" />,
    content: <OverviewContent />,
  },
  {
    key: "members",
    label: "Members",
    leftIcon: <Users className="w-4 h-4" />,
    content: <MembersContent />,
  },
];
```

### Usage — Custom loading skeleton

```tsx
{ key: 'details', label: 'Details', isLoading: detailsLoading, loadingFallback: <MyDetailsSkeleton />, content: <ProjectDetails /> }
```

### Advanced — TabPanel only (split layout)

Use `TabPanel` directly only when the content area is in a different DOM region than the tab bar (e.g., a drawer or a fixed footer panel).

```tsx
import { Tabs, TabPanel } from '@/components/molecules';

// Tab bar lives in the page header
<Tabs items={TAB_ITEMS} activeKey={activeTab} onChange={setActiveTab} />

// Content renders elsewhere (e.g., inside a drawer)
<TabPanel tabKey="details" activeKey={activeTab} isLoading={detailsLoading}>
  <ProjectDetails />
</TabPanel>
```

### Rules

- **Define `items` outside JSX** — in a `const` or in `constants/index.ts`, never inline in the return.
- **Never fetch inside `Tabs`** — all data fetching lives in the page hook.
- **`defaultActiveKey` defaults to the first item** — you rarely need to set it explicitly.
- **Use controlled mode (`activeKey` + `onChange`) only when a parent needs to drive the active tab** (e.g., URL-driven tabs via `useQueryParams`).

---

## Rules for Adding New Shared Components

1. **Choose the right tier:**
   - Atom — single element, no children orchestration
   - Molecule — composes atoms, may have local UI state (open/closed, debounce)
   - Organism — complex feature with multiple responsibilities
   - Template — page skeleton

2. **File structure per component:**

   ```
   ComponentName/
   ├── ComponentName.tsx       # The component
   ├── ComponentName.stories.tsx  # Storybook — REQUIRED
   └── index.ts               # Barrel export
   ```

   For organisms with sub-components, add a `types.ts`.

3. **Storybook stories are mandatory** — include `Default`, an interactive story with `useState`, and stories per meaningful prop/state variation. Use `@storybook/nextjs` and `tags: ['autodocs']`.

4. **Export from the tier's `index.ts`** — both the component and its public types.

5. **No domain logic inside shared components** — no API calls, no domain types, no hardcoded strings. Accept everything via props.

6. **Update this README** when adding a new component.

---

## Storybook

```bash
pnpm run storybook   # http://localhost:6006
```

---

## Styling

All components use Tailwind CSS with design tokens from `src/styles/globals.css`.

- **Colors**: `slate-*`, `brand-*`, `destructive-*` via CSS variables
- **Spacing**: Tailwind scale (base 4px)
- **Border radius**: `rounded-lg` (8px) is the standard for interactive elements
- **Font**: Geist — `text-sm font-medium` for most UI labels
