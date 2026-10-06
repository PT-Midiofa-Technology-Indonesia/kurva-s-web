# Project Control Domain

Manages Bill of Quantities (BOQ) across four lifecycle stages — Template, Planning, Final, and Execution — plus a top-level management page that houses them all as tabs.

## Status Architecture

Each BOQ project now carries **three independent boolean status fields**:

- `statusBoqPlanning` - tracking Planning stage completion
- `statusBoqFinal` - tracking Final stage completion
- `statusBoqExecution` - tracking Execution stage completion

These are sourced directly from the API response's `statusBoqPlanning`, `statusBoqFinal`, and `statusBoqExecution` fields. The list pages (`BOQPlanningPage`, `BOQFinalPage`, `BOQExecutionPage`) each filter by their specific stage field (e.g., `BOQFinalPage` uses `statusBoqFinal`) and display only the stage-appropriate rows.

The `BOQProjectListItem` type includes all three fields for reference, while the `BOQProjectDetailDrawer` shows each project's stage-specific `settingStatus` via a badge.

## Status Filtering by Stage

Each BOQ list page filters by its stage and displays only projects that match that stage's criteria:

### Planning Page (`BOQPlanningPage`)

- Filters by `statusBoqPlanning` -> maps to `settingStatus` column
- Show all projects (both planning and non-planning) but focus on planning filter
- Use planning-specific filters/actions
- Detail tree shows `Bobot` column like template detail
- Only final-level / leaf items can edit `bobot`; parent rows show rolled-up child total
- Save sync payload includes `weight` from current tree node `bobot`

### Final Page (`BOQFinalPage`)

- Filters by `statusBoqFinal` -> maps to `settingStatus` column
- Show BoQ Final and Limit Budget actions
- Filter by final stage specific status
- Detail tree shows read-only `Bobot` column with parent rollup

### Execution Page (`BOQExecutionPage`)

- Filters by `statusBoqExecution` -> maps to `settingStatus` column
- Show CCO actions only
- Filter by execution stage specific status
- Detail tree shows read-only `Bobot` column with parent rollup

The stage gating logic is handled in `useBOQProjectListPage` hook:

- Each stage maps to its corresponding filter key (`statusBoqPlanning`, `statusBoqFinal`, `statusBoqExecution`)
- Only projects with matching stage status are shown
- Actions are filtered based on project stage status

## Structure

```
project-control/
├── api/
│   ├── get-boq-template.ts              # GET single template detail (with nested item tree)
│   ├── get-boq-template-item-costs.ts   # GET cost items for a specific BOQ item
│   ├── get-boq-templates.ts             # GET paginated BOQ template list
│   ├── get-project-boq.ts              # GET project BOQ with project detail and item tree
│   ├── get-project-boq-catalog-prices.ts  # GET catalog prices (material + equipment resume)
│   ├── get-project-boq-item-costs.ts    # GET cost categories for a project BOQ item
│   ├── sync-boq-template-items.ts       # POST sync tree items for a template
│   ├── sync-boq-templates.ts            # POST to sync (create/update/delete) BOQ templates
│   ├── sync-project-boq-items.ts        # POST sync project BOQ tree items
│   ├── sync-project-boq-item-costs.ts   # POST sync project BOQ item costs
│   └── index.ts
├── components/
│   ├── BOQTemplateInfoCard.tsx          # Read-only info card: name, capability, status
│   ├── BOQTemplateListWithSuggestions.tsx  # Template list with inline item suggestions
│   ├── ProjectBOQInfoCard.tsx           # Read-only project info card (company, client, BOQ status)
│   └── index.ts
├── constants/
│   └── index.ts                         # BOQ_MANAGEMENT_TABS, BOQ_MANAGEMENT_TAB_LABELS, BOQ_PLANNING_PAGE_LABELS
├── hooks/
│   ├── use-boq-template.ts              # Query: single template detail
│   ├── use-boq-template-item-costs.ts   # Query: cost items for a BOQ item
│   ├── use-boq-templates.ts             # Query: BOQ template list
│   ├── use-project-boq.ts              # Query: project BOQ with detail
│   ├── use-project-boq-catalog-prices.ts  # Query: catalog prices for resume
│   ├── use-project-boq-item-costs.ts    # Query: cost categories for project BOQ item
│   ├── use-sync-boq-template-items.ts   # Mutation: sync tree items for a template
│   ├── use-sync-boq-templates.ts        # Mutation: sync templates (create/update/delete)
│   ├── use-sync-project-boq-items.ts    # Mutation: sync project BOQ tree items
│   ├── use-sync-project-boq-item-costs.ts  # Mutation: sync project BOQ item costs
│   └── index.ts
├── pages/
│   ├── BOQManagementPage.tsx            # Root tabbed page (Template / Planning / Final / Execution)
│   ├── BOQPlanningDetailPage.tsx        # Planning detail page (tree + cost dialog + resume)
│   ├── BOQTemplateDetailPage.tsx        # Detail page for a single BOQ template
│   ├── BOQTemplatePage.tsx              # Template tab content
│   ├── BOQPlanningPage.tsx              # Planning tab content
│   ├── BOQFinalPage.tsx                 # Final tab content
│   ├── BOQExecutionPage.tsx             # Execution tab content
│   └── index.ts
├── schemas/                             # Zod validation schemas (empty, TBD)
├── services/                            # Business logic / data transformers (empty, TBD)
├── types/                               # TypeScript types (empty, TBD)
└── index.ts
```

## Key Files

- `api/get-boq-templates.ts` — Fetches paginated template list; exports `getBOQTemplates`, `BOQTemplate`, `GetBOQTemplatesParams`
- `api/get-boq-template.ts` — Fetches a single template with its full nested item tree; exports `getBOQTemplate`, `BOQTemplateDetail`, `BOQTemplateItem`, `BOQTemplateItemJobItemType`
- `api/get-boq-template-item-costs.ts` — Fetches cost categories and items for a specific BOQ item; exports `getBOQTemplateItemCosts`, `BOQTemplateItemCostItem`, `BOQTemplateItemCostCategory`, `BOQTemplateItemCostsData`
- `api/sync-boq-templates.ts` — Synchronizes BOQ templates (create/update/delete); exports `syncBOQTemplates`, `SyncBOQTemplateItem`, `SyncBOQTemplatesPayload`
- `api/sync-boq-template-items.ts` — Synchronizes tree items for a single template; exports `syncBOQTemplateItems`, `SyncBOQTemplateItemPayload`, `SyncBOQTemplateItemsPayload`
- `api/get-project-boq.ts` — Fetches project BOQ with project detail and item tree; exports `getProjectBOQ`, `GetProjectBOResponse`, `ProjectBODetail`, `ProjectBOData`
- `api/get-project-boq-catalog-prices.ts` — Fetches catalog prices (material + equipment resume) for a project BOQ; exports `getProjectBOQCatalogPrices`, `BOQCatalogPriceEntry`, `BOQCatalogPriceMaterialEntry`, `BOQCatalogPriceEquipmentEntry`
- `api/get-project-boq-item-costs.ts` — Fetches cost categories for a project BOQ item; exports `getProjectBOQItemCosts`, `ProjectBOQCostItemDetail`, `ProjectBOQCostCategory`
- `hooks/use-boq-templates.ts` — React Query hook for template list; exports `useBOQTemplates` and `BOQ_TEMPLATES_QUERY_KEYS`
- `hooks/use-boq-template.ts` — React Query hook for single template detail; exports `useBOQTemplate` and `BOQ_TEMPLATE_QUERY_KEYS`
- `hooks/use-boq-template-item-costs.ts` — React Query hook for item cost data; exports `useBOQTemplateItemCosts`
- `hooks/use-sync-boq-templates.ts` — Mutation hook for template synchronization; exports `useSyncBOQTemplates`
- `hooks/use-sync-boq-template-items.ts` — Mutation hook to save the BOQ item tree for a template; exports `useSyncBOQTemplateItems`; invalidates `BOQ_TEMPLATE_QUERY_KEYS.detail(templateId)` on success
- `hooks/use-project-boq.ts` — React Query hook for project BOQ; exports `useProjectBOQ`
- `hooks/use-project-boq-catalog-prices.ts` — React Query hook for catalog prices; exports `useProjectBOQCatalogPrices`, `PROJECT_BOQ_CATALOG_PRICES_QUERY_KEYS`
- `hooks/use-project-boq-item-costs.ts` — React Query hook for project BOQ item cost data; exports `useProjectBOQItemCosts`
- `hooks/use-sync-project-boq-items.ts` — Mutation hook for syncing project BOQ tree items; exports `useSyncProjectBOQItems`; invalidates BOQ query keys + catalog prices on success
- `hooks/use-sync-project-boq-item-costs.ts` — Mutation hook for syncing project BOQ item costs; exports `useSyncProjectBOQItemCosts`; invalidates catalog prices on success
- `components/BOQTemplateListWithSuggestions.tsx` — Compound component combining template list with:
  - Name text input for inline editing
  - Project capability combobox driven by infinite query (`useProjectCapabilitiesInfinite({ isActive: true })` from project-capability domain)
  - Inline editing, range selection, copy/paste, cut/paste, context menu, and marching-ants copy/cut feedback
- `components/BOQTemplateInfoCard.tsx` — Read-only card displaying a template's name, project capability, and active/inactive status badge
- `components/ProjectBOQInfoCard.tsx` — Read-only card displaying project detail (company, client, BOQ name, RAB status)
- `components/InformasiProjectCard.tsx` — Collapsible project summary shared by seven pages (BOQ detail, Schedule, Progress Monitoring, Manpower Planning, Quality Control). Its money row is switched by the optional `financials` prop: omitted, the card shows Estimasi Nilai Project as before; supplied, it shows Nilai Project (RAB), Limit Budget, and Nilai CCO instead. The switch is an explicit prop rather than "render whatever the project object carries" because every caller passes its whole project object — an implicit rule would change the other six pages the moment their endpoint started returning those fields. Limit Budget is rendered as amount plus percentage (`Rp 319.240.000 (80%)`), computed from `totalValue x limitBudgetPercentage`; the API returns no ready-made limit budget amount at project level.
- `constants/index.ts` — `BOQ_MANAGEMENT_TABS` enum, `BOQ_MANAGEMENT_TAB_LABELS` map, `STATUS_OPTIONS`, `BOQ_PLANNING_PAGE_LABELS`
- `pages/BOQManagementPage.tsx` — Tabbed shell page; one of the two public exports via `index.ts`
- `pages/BOQTemplateDetailPage.tsx` — Detail page for a single template (see below)
- `pages/BOQPlanningDetailPage.tsx` — Planning detail page with BOQ tree, cost dialog, and resume dialog

## BOQTemplatePage

Renders a **paginated, searchable, filterable list** of BOQ Templates with inline row editing. This page is the reference implementation for all other BOQ list tabs (Planning, Final, Execution) — they all share the same patterns.

### Data flow

```
useBOQTemplates(params)   → templateRows   (server truth, never mutated)
rows (useState)           → unsaved edits
displayRows               = rows.length > 0 ? rows : templateRows
handleRowsChange          → resolves label→id, sets rows
handleSave                → syncTemplates({ items, deletedIds })
                             → resets rows → server truth restored
```

### Pattern 1 — Dual-state (server vs local draft)

| Variable       | Purpose                                                             |
| -------------- | ------------------------------------------------------------------- |
| `templateRows` | Derived from API via `useMemo`. Read-only.                          |
| `rows`         | Local `useState`. Holds unsaved edits.                              |
| `displayRows`  | `rows.length > 0 ? rows : templateRows` — local wins while editing. |

After a successful save `rows` is reset to `[]` so `templateRows` becomes authoritative again and the "Simpan" button disappears. When replicating: follow this pattern exactly so the save button only appears when there are actual local changes.

### Pattern 2 — Search + pagination (both reset page on filter change)

- `search` is debounced 300 ms (`useDebounce`) before being forwarded to the API hook.
- `statusFilter` holds a string `'all' | 'true' | 'false'`, mapped to `undefined | true | false` for the API.
- Both `handleSearchChange` and `handleStatusChange` call `setPage(1)` to avoid being stuck on page 2+ after narrowing the filter.

When replicating: wrap every free-text field with `useDebounce` and always call `setPage(1)` from every filter handler.

### Pattern 3 — Relation data via infinite-scroll async select

```ts
const { options, hasMore, loadMore } = useProjectCapabilitiesInfinite({
  isActive: true,
  perPage: 20,
});

const projectCapabilityLabelToId = useMemo(() => {
  const map = new Map<string, string>();
  for (const opt of options) map.set(opt.label, opt.value);
  return map;
}, [options]);
```

The inline table cell shows a human-readable name; the API needs the UUID. `handleRowsChange` resolves the selected label back to its id using this map before writing into `rows`.

When replicating: for every relation column (e.g. BOQ category, project type), create an equivalent `use<Domain>Infinite` call and a `label → id` map.

### Pattern 4 — Sync (upsert + delete) in one call

- **Endpoint**: `POST /api/v1/boq-<module>/sync`
- **Payload**: `{ items: SyncItem[], deletedIds: string[] }`
  - `items` — all current rows; new rows carry no `id` (backend assigns one).
  - `deletedIds` — ids present in `templateRows` (server) but absent from current `rows`.
- **Hook**: `useSyncBOQTemplates()` → `mutateAsync` (awaited in `handleSave`).
- On success: invalidates `BOQ_TEMPLATES_QUERY_KEYS.all` + shows toast.

When replicating: name the hook `useSync<Module>s`, define `BOQ_<MODULE>_QUERY_KEYS` in that hook file, and always invalidate `.all` on success.

### flattenTree id convention

`flattenTree` (`src/shared/utils/boq-tree-helpers.ts`) converts the recursive `BOQNode[]` tree into a flat array for the sync API. It uses `originalIdsRef.current` (the set of IDs from the initial API load) to distinguish existing vs new items:

| Field          | Existing item | New item          |
| -------------- | ------------- | ----------------- |
| `id`           | `<api-id>`    | `null`            |
| `tempId`       | `null`        | `<random-id>`     |
| `parentId`     | parent's `id` | `null`            |
| `parentTempId` | `null`        | parent's `tempId` |

New items always send `id: null` — the backend assigns the real ID. The `tempId` carries the client-generated UUID so the backend can reference new items in parent-child relationships.

### Pattern 5 — Navigation to detail page

```ts
const handleView = useCallback(
  (row: BOQTemplateRow) => {
    router.push(`/project-control/boq-management/${row.id}/detail`);
  },
  [router]
);
```

Define the route in `app/` and pass the entity id in the URL. The detail page is `BOQTemplateDetailPage`.

### Pattern 6 — Component layer separation

- **`BOQTemplateListWithSuggestions`** owns: column definitions, row-level validation, Tambah/Simpan button logic, context menu, status badge, async-select for the relation column.
- **`BOQTemplatePage`** owns: server state (hooks), filter/pagination state, navigation.

Props contract between page and list component:

```ts
value: Row[]          // displayRows
onChange: (rows) => void  // handleRowsChange
onSave: (rows) => Promise<void>  // handleSave
isSaving: boolean
isLoading: boolean
// + pagination, filter callbacks
```

When replicating: create `BOQ<Module>List` (or `BOQ<Module>ListWith<Feature>`) receiving exactly these props.

### Mock handlers checklist (src/mocks/domains/project-control.ts)

Add the following MSW handlers for each new module:

| Method   | Path                                                | Notes                                                                 |
| -------- | --------------------------------------------------- | --------------------------------------------------------------------- |
| `GET`    | `/api/v1/boq-<module>`                              | Paginated list; support `search`, `isActive`, `page`, `perPage`       |
| `POST`   | `/api/v1/boq-<module>/sync`                         | Validate required fields; return 422 on missing `name` or relation id |
| `GET`    | `/api/v1/boq-<module>/:id`                          | Return nested tree with `items[]`                                     |
| `POST`   | `/api/v1/boq-<module>/:id/items/sync`               | Accept `{ items, deletedIds }`                                        |
| `POST`   | `/api/v1/boq-<module>/:id/items/:itemId/costs/sync` | Accept `{ categories }`                                               |
| `DELETE` | `/api/v1/boq-<module>/:id`                          | Hard delete                                                           |

### Query key convention

Define `BOQ_<MODULE>_QUERY_KEYS` in the list hook file (`use-boq-<module>s.ts`):

```ts
export const BOQ_PLANNING_QUERY_KEYS = {
  all: ["boq-planning"] as const,
  list: (params?: GetBOQPlanningParams) =>
    [...BOQ_PLANNING_QUERY_KEYS.all, "list", params] as const,
  detail: (id: string) =>
    [...BOQ_PLANNING_QUERY_KEYS.all, "detail", id] as const,
} as const;
```

Mutations must invalidate `.all` on success to refresh both list and detail caches.

### Integration tests

Tests live in `pages/__tests__/BOQTemplatePage.integration.test.tsx` and use MSW handlers from `projectControlHandlers`. Test coverage should include:

- Renders list from mock API
- Column headers visible
- Status badges (Aktif / Tidak Aktif)
- Search filters rows; clearing search restores all rows
- Status dropdown filters by active / inactive / all
- "Tambah" → "Simpan" button swap
- Validation error blocks save when required fields are empty
- Eye icon navigates to the correct detail URL

`BOQTemplateDetailPage` tests live in `pages/__tests__/BOQTemplateDetailPage.integration.test.tsx`. Test coverage should include:

- Renders template info card (name, capability, status)
- BOQ tree section and root node visible
- Back button navigates to list
- Eye icon opens cost dialog for leaf node; dialog shows cost sections and items
- Local search filters tree; preserves ancestor chain; clearing search restores full tree
- Delete confirmation dialog and navigation after delete

`BOQPlanningDetailPage` tests live in `pages/__tests__/BOQPlanningDetailPage.integration.test.tsx`. Test coverage should include:

- Renders project info card (Detail Project title visible by default)
- BOQ tree section and root node visible
- Page header with "BOQ Planning" title
- Generate Quotation and Lihat Resume buttons present
- Generate Quotation button disabled when BOQ not complete
- Back button navigates to management page
- Search filters tree nodes
- Lihat Resume opens resume dialog with material and equipment sections
- Resume dialog shows catalog price data (materials + equipment)
- Eye icon opens cost dialog for leaf node; dialog shows cost sections
- Cost dialog shows material items from API response
- Delete button opens confirmation; confirm navigates back
- Search: keyword hides non-matching branches
- Search: ancestor chain of a matching leaf stays visible
- Search: no match → empty tree
- Search: clearing keyword restores full tree

---

## BOQTemplateDetail (shared template component)

`src/shared/components/templates/BOQ/BOQTemplate/BOQTemplateDetail.tsx` — reusable tree editor used by every BOQ detail page (Template, Planning, Final, Execution). When replicating a detail page, wrap this component instead of re-implementing it.

### Local search (client-side tree filter)

Search is performed entirely on the client — no API round-trip. The `search` state drives a `filteredValue` memo that recursively walks the `BOQNode[]` tree:

```ts
const filteredValue = useMemo(() => {
  const k = search.toLowerCase().trim();
  if (!k) return value; // fast path: no filter
  const filter = (nodes: BOQNode[]): BOQNode[] =>
    nodes.reduce<BOQNode[]>((acc, node) => {
      const filteredChildren = filter(node.children);
      const selfMatches =
        node.name?.toLowerCase().includes(k) ||
        node.jenis?.toLowerCase().includes(k);
      if (selfMatches || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren }); // spread to preserve ancestor chain
      }
      return acc;
    }, []);
  return filter(value);
}, [value, search]);
```

**Rules:**

- A node is **included** if its own `name` or `jenis` matches, OR any descendant matches.
- When a node matches, only the matching subtree of its children is shown (not all original children).
- When the keyword is cleared, `value` is returned by reference — no allocation.
- Both `name` and `jenis` use `?.toLowerCase()` to guard against null API values.

DataTable receives `data={filteredValue}`. The `expanded` state remains `true` (all expanded) so matching nodes at any depth are always visible.

### Fullscreen context menu

The component uses the browser Fullscreen API (`containerRef.current.requestFullscreen()`). Radix UI portals default to `document.body`, which is **outside** the fullscreen subtree and therefore hidden by the browser.

Fix: `contextMenuContainer` prop threads `containerRef.current` into the `ContextMenuContent` portal when fullscreen is active:

```tsx
<DataTable
  contextMenuContainer={isFullscreen ? containerRef.current : undefined}
  ...
/>
```

When replicating: any DataTable with a context menu inside a fullscreen container must pass this prop.

---

## BOQTemplateDetailPage

Renders the full detail view for a single BOQ template, identified by `templateId` prop.

Layout (top to bottom):

1. `PageHeader` — title "Detail Template", back button (navigates to `/project-control/boq-management`), and a destructive "Hapus" button
2. `BOQTemplateInfoCard` — read-only display of template name, project capability, and status
3. `BOQTemplateDetail` — editable BOQ tree (drag-and-drop, inline rename, depth-limited nesting); includes a Save button that calls `useSyncBOQTemplateItems`
4. `BOQTemplateCostDialog` — modal dialog showing cost rows grouped by category for the selected tree node

### Eye icon → cost dialog flow

When the user clicks the eye icon on a `BOQNode` row inside `BOQTemplateDetail`, `onOpenCost(node)` fires:

1. `costNodeId` is set to the node's `id`; `costSectionRows` is reset to `{}`
2. `costDialogOpen` is set to `true`
3. `useBOQTemplateItemCosts(templateId, costNodeId, { enabled: true })` fetches `/v1/boq-templates/{templateId}/items/{itemId}`
4. On response, `costSectionRows` is initialised from the API cost categories (only once, to preserve any local edits)
5. `BOQTemplateCostDialog` renders with the node and its categorised cost rows; each section maps to a `BOQCostSection` (value, label, rows)
6. Closing the dialog resets both `costNodeId` and `costSectionRows`

If the API returns no cost categories, five default sections are rendered: Material Cost, Equipment Cost, Man Power Cost, Transport Cost, and Preliminery Cost.

## BOQ Execution Editability Rules

The Execution detail page (`BOQExecutionDetailPage`) gates CCO/ACT inputs by **BOQ completion**, not by project start:

- **Tree columns** (`boq-execution-columns.tsx`): `volume_cco` and `volume_actual` are editable iff the BOQ is not complete (`isComplete` prop → `canEditVolCco` / `canEditVolActual`). Once complete, both columns (and everything else) are locked. The `startEdAt` prop and the auto-fill of `volume_cco` from `volume_rab` were removed — project start no longer gates editing.
- **Cost item modal** (`BOQExecutionCostDialog`): `editableSuffixes` is built in `BOQExecutionDetailPage` as `new Set(boqIsComplete ? [] : ['cco', 'actual'])`. An empty set disables the whole modal when complete. When the item's `isSideInstruction` flag (from `GET /projects/:projectId/boq/items/:itemId` → `data.item.isSideInstruction`) is true, `'cco'` is removed from the set — every CCO column (volume, duration, unit price) becomes read-only while ACT stays editable.
- **Project Type**: `ProjectBODetail.projectType` is typed as `ProjectBOProjectType | null` (`{ id, name }`) and rendered in `ProjectBOQInfoCard` as "Project Type" (`project.projectType?.name ?? '-'`), alongside Status.

Backend note: `isSideInstruction` is optional — `undefined` is treated as `false` (side-instruction CCO lock only applies when the backend explicitly sends `true`).

## Exports

From `index.ts` (public API):

- `BOQManagementPage` — Root page component rendered by `app/(protected)/project-control/boq-management/page.tsx`
- `BOQTemplateDetailPage` — Detail page component rendered by the single-template route

From sub-barrels (used internally and by `app/` routes):

- `BOQTemplatePage`, `BOQPlanningPage`, `BOQFinalPage`, `BOQExecutionPage` — individual tab pages
- `BOQTemplateListWithSuggestions`, `BOQTemplateInfoCard` — domain components
- `getBOQTemplates`, `getBOQTemplate`, `getBOQTemplateItemCosts`, `syncBOQTemplates`, `syncBOQTemplateItems` — API functions
- `useBOQTemplates`, `useBOQTemplate`, `useBOQTemplateItemCosts`, `useSyncBOQTemplates`, `useSyncBOQTemplateItems` — hooks
- `BOQ_TEMPLATES_QUERY_KEYS`, `BOQ_TEMPLATE_QUERY_KEYS` — query key factories
- `BOQ_MANAGEMENT_TABS`, `BOQ_MANAGEMENT_TAB_LABELS`, `BOQManagementTab` — constants and types

## Loading States

Follows the standard codebase pattern:

| Loading Phase                                     | Mechanism                                                                        | What Renders                                   |
| ------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Initial page load**                             | `Suspense` in `app/` route                                                       | `<ListPageSkeleton />`                         |
| **Template detail load**                          | `isLoading` from `useBOQTemplate`                                                | `<FormPageSkeleton />` inside a padded wrapper |
| **Template not found**                            | `error` or missing `data` from `useBOQTemplate`                                  | `<ItemNotFound />` with message                |
| **Subsequent refetches** (search/filter/paginate) | `placeholderData` on query + `DataTable isLoading`                               | Inline spinner in table body                   |
| **Save success**                                  | `toast.success` in `useSyncBOQTemplates` / `useSyncBOQTemplateItems` `onSuccess` | Sonner toast                                   |
| **Save error**                                    | `toast.error` in `useSyncBOQTemplates` / `useSyncBOQTemplateItems` `onError`     | Sonner toast with API error message            |

## Cross-Domain Dependency

- `**project-capability**` — `BOQTemplatePage` uses `useProjectCapabilitiesInfinite({ isActive: true })` to populate the project capability combobox with infinite-scroll support

## Usage Example

```tsx
// app/(protected)/project-control/boq-management/page.tsx
import { Suspense } from "react";
import { ListPageSkeleton } from "@/shared/components/templates/ListPageSkeleton";
import { BOQManagementPage } from "@/domains/project-control";

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <BOQManagementPage />
    </Suspense>
  );
}
```

```tsx
// app/(protected)/project-control/boq-management/[id]/page.tsx
import { Suspense } from "react";
import { FormPageSkeleton } from "@/shared/components/templates/FormPageSkeleton";
import { BOQTemplateDetailPage } from "@/domains/project-control";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <BOQTemplateDetailPage templateId={params.id} />
    </Suspense>
  );
}
```

```tsx
// Using hooks directly
import {
  useBOQTemplates,
  useSyncBOQTemplates,
} from "@/domains/project-control/hooks";

function MyComponent() {
  const { data, isLoading } = useBOQTemplates({ page: 1, perPage: 10 });
  const { mutateAsync: syncTemplates } = useSyncBOQTemplates();
  // ...
}
```

---

## Project Hierarchy Template

Manages hierarchical project structures (OrgChart-style tree) — templates define reusable position trees, project nodes instantiate them per project. Supports create/edit/delete nodes, tree visualization, and sync from template.

### Structure

```
project-control/
├── api/
│   ├── create-project-hierarchy-node.ts                  # POST create node in project
│   ├── delete-project-hierarchy-node.ts                  # DELETE node from project
│   ├── generate-project-hierarchy-nodes-from-template.ts # POST generate nodes from template
│   ├── get-project-hierarchy-node-detail.ts              # GET single node
│   ├── get-project-hierarchy-nodes.ts                    # GET project nodes (for a project)
│   ├── get-project-hierarchy-template-nodes.ts           # GET template nodes
│   ├── get-project-hierarchy-templates.ts                # GET template list + detail
│   ├── project-hierarchy-template-nodes.ts               # CRUD template nodes (alias)
│   ├── sync-project-hierarchy-templates.ts               # POST sync templates
│   └── update-project-hierarchy-node.ts                  # PUT update node in project
├── components/
│   ├── CreatePositionForm.tsx                             # FormGenerator-based create form
│   ├── HierarchyListWithSuggestions.tsx                   # Inline editable list
│   ├── ProjectDetailDrawer.tsx                            # Detail drawer for project info
│   └── ProjectHierarchyTemplateListWithSuggestions.tsx     # Template list with suggestions
├── constants/
│   └── index.ts                                           # PROJECT_HIERARCHY_TEMPLATE_LABELS, PROJECT_CONTROL_TABS, CREATE_POSITION_PAGE_LABELS, DETAIL_PAGE_LABELS, EDIT_POSITION_PAGE_LABELS, etc.
├── hooks/
│   ├── use-create-project-hierarchy-node-page.ts          # Page hook: create node in project
│   ├── use-create-project-hierarchy-template-node-page.ts # Page hook: create node in template
│   ├── use-delete-project-hierarchy-node.ts               # Mutation: delete node in project
│   ├── use-delete-project-hierarchy-template.ts           # Mutation: delete template
│   ├── use-edit-project-hierarchy-node-page.ts            # Page hook: edit node in project
│   ├── use-edit-project-hierarchy-template-node-page.ts   # Page hook: edit node in template
│   ├── use-project-hierarchy-node-detail.ts               # Query: single node detail (project)
│   ├── use-project-hierarchy-nodes.ts                     # Query: project nodes
│   ├── use-project-hierarchy-nodes-mutations.ts           # Mutations: create/update/delete project nodes
│   ├── use-project-hierarchy-template-nodes.ts            # Mutations: create/update/delete template nodes
│   ├── use-project-hierarchy-template-page.ts             # Page hook: template detail + nodes
│   ├── use-project-hierarchy-templates.ts                 # Query: template list + detail
│   ├── use-project-hierarchy-templates-infinite.ts        # Query: infinite-scroll template list
│   ├── use-sync-project-hierarchy-templates.ts            # Mutation: sync templates
│   └── use-update-project-hierarchy-template.ts           # Mutation: update template metadata
├── pages/
│   ├── CreateProjectHierarchyNodePage.tsx                 # Create node in project context
│   ├── CreateProjectHierarchyTemplateNodePage.tsx         # Create node in template context
│   ├── DetailProjectHierarchyTemplatePage.tsx             # Detail page with OrgChart tree
│   ├── EditProjectHierarchyNodePage.tsx                   # Edit node in project context
│   ├── EditProjectHierarchyTemplateNodePage.tsx           # Edit node in template context
│   ├── HierarchyListPage.tsx                              # List page for hierarchy templates
│   ├── ProjectControlListPage.tsx                         # List page for projects (top-level)
│   ├── ProjectControlPage.tsx                             # Tabbed shell (Hierarki Project Template + Project tabs)
│   ├── ProjectDetailPage.tsx                              # Project detail
│   ├── ProjectHierarchyTemplateListPage.tsx               # Template list tab
│   ├── ProjectListPage.tsx                                # Project list tab
│   └── UseTemplatePage.tsx                                # Generate project nodes from template
├── schemas/
│   └── create-position.schema.ts                          # Zod schema: positionId, parentId, status
├── types/
│   ├── index.ts                                           # Project, ProjectHierarchyTemplateListItem, ProjectHierarchyTemplateNode, ProjectHierarchyTemplateNodePosition, etc.
│   └── project-hierarchy-node.ts                          # ProjectHierarchyNode (project-scoped nodes)
└── index.ts                                               # Public barrel exports
```

### Key Exports

**APIs:**

| Function                                                           | Description                                |
| ------------------------------------------------------------------ | ------------------------------------------ |
| `getProjectHierarchyTemplates(params)`                             | GET paginated template list                |
| `getProjectHierarchyTemplateDetail(id)`                            | GET single template with full node tree    |
| `syncProjectHierarchyTemplates(payload)`                           | POST sync templates (create/update/delete) |
| `deleteProjectHierarchyTemplate(id)`                               | DELETE template                            |
| `createProjectHierarchyTemplateNode(payload)`                      | POST create template node                  |
| `updateProjectHierarchyTemplateNode(id, payload)`                  | PUT update template node                   |
| `deleteProjectHierarchyTemplateNode(id)`                           | DELETE template node                       |
| `generateProjectHierarchyNodesFromTemplate(projectId, templateId)` | POST generate project nodes from template  |

**Pages:**

| Page                                     | Description                                                                              |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| `ProjectControlPage`                     | Tabbed shell — "Hierarki Project Template" tab + "Project" tab                           |
| `ProjectHierarchyTemplateListPage`       | Template list with search/filter, pagination, inline edit, delete                        |
| `DetailProjectHierarchyTemplatePage`     | Detail page with OrgChart-style tree, Tambah Position buttons                            |
| `CreateProjectHierarchyTemplateNodePage` | Form page to add a position node to a template                                           |
| `EditProjectHierarchyTemplateNodePage`   | Form page to edit a template position node                                               |
| `ProjectListPage`                        | Project list with actions (detail, hierarki, progress, working hours, warehouse, cancel) |
| `CreateProjectHierarchyNodePage`         | Form page to add a position node to a project                                            |
| `EditProjectHierarchyNodePage`           | Form page to edit a project position node                                                |

### Node Types

```
ProjectHierarchyTemplateNode — template-scoped node
├── id, projectHierarchyTemplateId, parentId, positionId, position, permissionIds, isActive
├── parent → { id, projectHierarchyTemplateId, positionId, isActive }
├── position → { id, code, name, level, isActive }
└── children → ProjectHierarchyTemplateNode[]

ProjectHierarchyNode — project-scoped node (instantiated from template)
├── id, projectId, parentId, positionId, position, permissionIds, employeeIds, isActive
├── parent → { id, projectId, positionId, isActive }
├── position → { id, code, name, level, isActive }
├── assignments → unknown[]
└── children → ProjectHierarchyNode[]
```

### Tab Structure

`ProjectControlPage` uses `PROJECT_CONTROL_TABS`:

| Tab                | Key                  | Label                     |
| ------------------ | -------------------- | ------------------------- |
| Hierarchy Template | `hierarchy-template` | Hierarki Project Template |
| Project            | `project`            | Project                   |

### Labels

- `PROJECT_HIERARCHY_TEMPLATE_LABELS` — List, dialog, feedback labels
- `CREATE_POSITION_PAGE_LABELS` — Form fields, buttons, toast messages
- `EDIT_POSITION_PAGE_LABELS` — Edit form labels
- `DETAIL_PAGE_LABELS` — Detail page (OrgChart) labels
- `PROJECT_LIST_PAGE_LABELS` — Project list with action menu
- `PROGRESS_MONITORING_PAGE_LABELS` — Progress monitoring table
- `TASK_DETAIL_DRAWER_LABELS` — Task detail tabs

### Related Domains

- **hierarchy-management** — Job position definitions used in template nodes
- **project-capability** — Capability filter for template list
- **manpower** — Employee assignments to project hierarchy nodes

---

## Site Instruction

Site Instruction adds a flag to projects (`isSideInstruction`) and a UI workflow to mark a project as a Site Instruction. This flag triggers **readonly mode** across multiple pages and displays a badge.

### API

`src/domains/project-control/api/create-side-instruction.ts` — Mark a project as a Site Instruction:

```ts
// POST /api/v1/projects/:projectId/side-instructions
await axios.post(getApiPath(`/projects/${projectId}/side-instructions`));
```

Exports `createSideInstruction`.

### Hook

`src/domains/project-control/hooks/use-create-side-instruction.ts`:

```ts
const { mutateAsync: createSideInstruction, isPending } =
  useCreateSideInstruction();

const handleSiteInstruction = async (project: Project) => {
  try {
    await createSideInstruction(project.id);
    toast.success("Project berhasil ditandai sebagai Site Instruction");
  } catch (error) {
    // error handling
  }
};
```

### Modal Component

`src/domains/project-control/components/SiteInstructionConfirmModal.tsx` — Confirmation dialog that appears after clicking the Site Instruction dropdown action:

```tsx
<SiteInstructionConfirmModal
  open={siteInstructionProject !== null}
  onClose={() => setSiteInstructionProject(null)}
  onSubmit={() => {
    if (!siteInstructionProject) return;
    createSideInstruction(siteInstructionProject.id, {
      onSuccess: () => setSiteInstructionProject(null),
    });
  }}
  isLoading={isPending}
/>
```

### Usage

`src/domains/project-control/pages/ProjectListPage.tsx` — Dropdown action on project list items:

```tsx
import { SiteInstructionConfirmModal } from '../components/SiteInstructionConfirmModal';
import { useCreateSideInstruction } from '../hooks/use-create-side-instruction';

const [siteInstructionProject, setSiteInstructionProject] = useState<Project | null>(null);
const sideInstructionMutation = useCreateSideInstruction();

// Dropdown menu item
<DropdownMenuItem onClick={() => onSiteInstruction(row.original)}>
  <SideInstruction className="mr-2" />
  Site Instruction
</DropdownMenuItem>

// Modal
<SiteInstructionConfirmModal
  open={siteInstructionProject !== null}
  onClose={() => setSiteInstructionProject(null)}
  onSubmit={() => {
    if (!siteInstructionProject) return;
    sideInstructionMutation.mutate(siteInstructionProject.id, {
      onSuccess: () => setSiteInstructionProject(null),
    });
  }}
  isLoading={sideInstructionMutation.isPending}
/>
```

### Data Model

Updated types include `isSideInstruction: boolean`:

- `Project` (`src/domains/project-control/types/index.ts`)
- `ProjectListApiItem` (`src/domains/project-control/types/index.ts`)
- `ProjectBODetail` (`src/domains/project-control/types/index.ts`)

---

## Readonly Mode

When `isReadonly` is true (or `isSideInstruction` is true), the app restricts editing and shows informational notices on:

- `SelectWarehouseModal` — Warehouses become read-only
- `SetWorkHoursModal` — Work hours become read-only
- `DetailProjectHierarchyPage` — Shows notice banner at top

The notice banner text comes from `SIDE_INSTRUCTION_READONLY_NOTICE` in `constants/index.ts`:

```ts
export const SIDE_INSTRUCTION_READONLY_NOTICE = "Site instruction";
```

When replicating readonly mode:

1. Accept `readonly?: boolean` prop on modals that contain editable fields
2. Pass `readOnly` to each input/controlled component
3. Show a notice banner at the top of detail pages

---

## SPK Upload

SPK (Surat Perintah Kerja) upload allows project managers to upload requirement documents per project.

### API

`src/domains/project-control/api/upload-spk.ts` — Upload SPK documents:

```ts
interface UploadSPKParams {
  projectId: string;
  spkNumber: string;
  documentTypeId: string;
  files: File[];
}

await axios.postFormData(getApiPath("/projects/:projectId/spk"), payload);
```

Exports `uploadSPK`, `SPKUploadedDocument`, `UploadSPKParams`.

### Hook

`src/domains/project-control/hooks/use-upload-spk.ts`:

```ts
const { mutateAsync: uploadSPK, isPending } = useUploadSPK();

const handleUpload = async (file: File, documentTypeId: string) => {
  await uploadSPK({
    projectId,
    spkNumber: spkNumber.trim(),
    documentTypeId,
    files: [file],
  });
};
```

### Component

`src/domains/project-control/components/SPKUploadSection.tsx` — Per-document upload section:

```tsx
<SPKUploadSection
  projectId={project.id}
  spkRequirementDocuments={project.spkRequirementDocuments ?? []}
  spkNumber={project.spkNumber}
  onChange={(newSpkNumber) => setSpkNumber(newSpkNumber)}
/>
```

Each document shows:

- Upload button (disabled if `isSideInstruction` or readonly status)
- Progress indicator during upload
- Success/error toast feedback

### Data Model

Updated types include:

- `spkNumber?: string` — SPK document number
- `spkRequirementDocuments?: SPKRequirementDocument[]` — List of required document types

From `src/domains/project-control/types/index.ts`:

```ts
export interface Project {
  id: string;
  // ...
  spkNumber?: string;
  spkRequirementDocuments?: SPKRequirementDocument[];
}

export interface SPKRequirementDocument {
  documentTypeId: string;
  documentName: string;
}
```

---

## isFinalLevel Parent Auto-Unset

BOQ tree nodes can be marked as "Level Terakhir" (`isFinalLevel: true`). When a child node is added to a parent that has `isFinalLevel: true`, the parent's flag is automatically unset.

### Utility

`src/shared/components/templates/BOQ/utils/boq-tree.utils.ts`:

```ts
// Set isFinalLevel on a node
export function setNodeAsFinalLevel(
  nodes: BOQNode[],
  nodeId: string
): BOQNode[] {
  return updateNode(nodes, nodeId, { isFinalLevel: true, children: [] });
}

// Unset isFinalLevel on parent when adding a child
export function unsetParentFinalLevel(
  nodes: BOQNode[],
  childId: string
): BOQNode[] {
  const parentId = findParentId(nodes, childId);
  if (!parentId) return nodes;
  return updateNode(nodes, parentId, { isFinalLevel: false });
}
```

The "Jadikan Level Terakhir" button in the BOQ table uses this pattern:

```tsx
// Before adding child to parent
nodes = unsetParentFinalLevel(nodes, parentId);

// Then add child
nodes = addChild(nodes, parentId, newChild);
```

---

## Site Instruction Badge

`src/domains/project-control/components/ProjectBOQInfoCard.tsx` — Displays a "Site Instruction" badge when `isSideInstruction` is true:

```tsx
<ProjectBOQInfoCard
  project={project}
  renderBadge={() =>
    project.isSideInstruction && (
      <Badge
        variant="outline"
        className="bg-amber-100 text-amber-800 border-amber-200"
      >
        <SideInstruction className="mr-1 h-3 w-3" />
        Site Instruction
      </Badge>
    )
  }
/>
```

---

## Note: `useSelectedProjectStore` moved to `@/shared/store/selected-project`

Global project-portal selection state used to live in `store/index.ts` here, but it's consumed by multiple domains across the project portal (not just this one), so it now lives in `src/shared/store/selected-project.ts`. See the "Portal Selection & Global Project Switcher" section in the root `CLAUDE.md` for the full flow, and `src/shared/store/README.md` for the store's API.

`ProgressMonitoringPage` in this domain still consumes it as a fallback when rendered without an explicit `projectId` prop (i.e. at the `/project-management/project-monitoring` route).
