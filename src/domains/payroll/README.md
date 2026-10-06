# Payroll Domain

Manages payroll setup and payroll run — payroll components, salary structure per grade, per-employee salary adjustment, and payroll draft (create → preview → generate/cancel). All data is company-scoped through the `X-Company-Id` header.

## Overview

The domain is rendered as a single tabbed page (`PayrollPage`) with four tabs, plus one standalone detail route for a payroll draft:

| Tab | Purpose |
|---|---|
| Payroll Component | Read-only master list of salary components (pokok, tunjangan, variable, lembur, potongan) |
| Salary Structure | Per grade × salary type (monthly/daily/hourly) component amounts; completeness is derived, not set |
| Employee Salary Adjustment | Per-employee override of the structure amounts, with reason |
| Payroll Draft | Payroll run list; create a draft, preview it, then generate or cancel |

An employee only appears as adjustable once they have a grade and a salary type (`isPayrollReady`); otherwise the drawer shows a notice instead of an editable grid.

## Structure

```
payroll/
├── api/
│   ├── cancel-payroll-draft.ts                  # POST cancel a draft
│   ├── create-employee-salary-adjustment.ts     # POST create adjustment
│   ├── create-payroll-draft.ts                  # POST create draft
│   ├── delete-employee-salary-adjustment.ts     # DELETE adjustment by employee
│   ├── generate-payroll-draft.ts                # POST generate a draft
│   ├── get-employee-salary-adjustment-detail.ts # GET adjustment grid for one employee
│   ├── get-employee-salary-adjustments.ts       # GET paginated employee list
│   ├── get-payroll-components.ts                # GET paginated components
│   ├── get-payroll-draft-preview.ts             # GET draft preview (manpower + skipped)
│   ├── get-payroll-draft.ts                     # GET single draft with items
│   ├── get-payroll-drafts.ts                    # GET paginated draft list
│   ├── get-salary-structure-detail.ts           # GET structure for grade + salary type
│   ├── get-salary-structure-grades.ts           # GET grade list with completeness
│   ├── update-employee-salary-adjustment.ts     # PUT update adjustment
│   └── update-salary-structure.ts               # POST upsert structure items
├── components/
│   ├── CreateDraftModal.tsx                     # Create draft form modal (FormGenerator)
│   ├── EmployeeSalaryAdjustmentDrawer.tsx       # Adjustment grid drawer (create/edit)
│   ├── EmployeeSalaryAdjustmentFilterDrawer.tsx # Filter drawer (golongan, has adjustment)
│   ├── PayrollDraftPreview.tsx                  # Preview table + skipped employees
│   ├── PayrollDraftSnapshot.tsx                 # Generated result grouped per employee
│   ├── PayrollValueInput.tsx                    # Rupiah or percent input, picked by valueType
│   └── SalaryStructureFormDrawer.tsx            # Edit structure amounts per component
├── constants/
│   └── index.ts                                 # TAB_OPTIONS, PAYROLL_LABELS, PAYROLL_DRAFT_LABELS,
│                                                # ADJUSTMENT_LABELS, CATEGORY_BADGE, COMPLETENESS_BADGE
├── hooks/
│   ├── query-keys.ts                            # PAYROLL_QUERY_KEYS (shared by every hook)
│   ├── use-cancel-payroll-draft.ts              # Mutation: cancel
│   ├── use-create-employee-salary-adjustment.ts # Mutation: create adjustment
│   ├── use-create-payroll-draft.ts              # Mutation: create draft
│   ├── use-delete-employee-salary-adjustment.ts # Mutation: delete adjustment
│   ├── use-employee-salary-adjustment-detail.ts # Query: adjustment grid
│   ├── use-employee-salary-adjustment-page.ts   # Page hook: adjustment tab list
│   ├── use-employee-salary-adjustments.ts       # Query: paginated employee list
│   ├── use-generate-payroll-draft.ts            # Mutation: generate
│   ├── use-payroll-components.ts                # Query: paginated components
│   ├── use-payroll-draft-detail-page.ts         # Page hook: draft detail + confirm dialogs
│   ├── use-payroll-draft-page.ts                # Page hook: draft tab list + create
│   ├── use-payroll-draft-preview.ts             # Query: draft preview
│   ├── use-payroll-draft.ts                     # Query: single draft
│   ├── use-payroll-drafts.ts                    # Query: paginated draft list
│   ├── use-payroll-page.ts                      # Page hook: component tab list
│   ├── use-salary-structure-detail.ts           # Query: structure detail
│   ├── use-salary-structure-grades.ts           # Query: grade list
│   ├── use-salary-structure-page.ts             # Page hook: salary structure tab list
│   ├── use-update-employee-salary-adjustment.ts # Mutation: update adjustment
│   └── use-update-salary-structure.ts           # Mutation: update structure
├── pages/
│   ├── EmployeeSalaryAdjustmentTab.tsx          # Tab: employee adjustment list
│   ├── PayrollComponentTab.tsx                  # Tab: payroll component list
│   ├── PayrollDraftDetailPage.tsx               # Route page: draft detail
│   ├── PayrollDraftTab.tsx                      # Tab: payroll draft list
│   ├── PayrollPage.tsx                          # Route page: tab shell (SegmentedControl)
│   └── SalaryStructureTab.tsx                   # Tab: salary structure list
├── schemas/
│   └── index.ts                                 # createPayrollDraftSchema (Zod)
├── services/
│   ├── format-payroll-value.ts                  # Format/describe/validate a fixed or percent value
│   ├── build-payroll-tab-params.ts              # Query string for a tab change, resetting list position
│   ├── group-payroll-draft-items.ts             # Group draft items per employee + subtotal
│   ├── is-adjustable-row.ts                     # Did the structure actually configure this component?
│   ├── parse-payroll-item-errors.ts             # Map positional API item errors onto component ids
│   └── salary-structure-form.ts                 # Structure row validation, per salary type
├── types/
│   └── index.ts                                 # Domain types (see below)
└── index.ts                                     # Public barrel exports
```

## Key Exports

### APIs

| Function | Description |
|---|---|
| `getPayrollComponents(params)` | GET paginated components (`page`, `perPage`, `search`, `sortBy`, `sortOrder`, `category`) |
| `getSalaryStructureGrades(params)` | GET grade list with per-salary-type completeness |
| `getSalaryStructureDetail(gradeId, salaryType)` | GET structure items for one grade + salary type; returns `null` when not set up |
| `getSalaryStructureItems(data)` | Helper — safe `data?.items ?? []` |
| `updateSalaryStructure(payload)` | POST upsert structure items for a grade + salary type |
| `getEmployeeSalaryAdjustments(params)` | GET paginated employee list (`search`, `sortBy`, `sortOrder`, `gradeId[]`, `hasAdjustment`) |
| `getEmployeeSalaryAdjustmentDetail(employeeId, companyId)` | GET the adjustment grid for one employee |
| `createEmployeeSalaryAdjustment(payload)` | POST create adjustment |
| `updateEmployeeSalaryAdjustment(employeeId, payload)` | PUT update adjustment |
| `deleteEmployeeSalaryAdjustment(employeeId, companyId)` | DELETE all adjustments of one employee |
| `getPayrollDrafts(params)` | GET paginated drafts (`periodType`, `status`, `periodStart`, `periodEnd`) |
| `getPayrollDraft({ id, companyId })` | GET single draft with its items |
| `getPayrollDraftPreview({ id, companyId })` | GET preview — eligible manpower plus skipped employees and the reason |
| `createPayrollDraft(payload)` | POST create draft (maps camelCase form values to snake_case body) |
| `generatePayrollDraft({ id, companyId })` | POST generate — draft becomes `generated` |
| `cancelPayrollDraft({ id, companyId })` | POST cancel — draft becomes `cancelled` |

### Hooks

| Hook | Type | Description |
|---|---|---|
| `usePayrollComponents(params)` | Query | Paginated components |
| `useSalaryStructureGrades(params)` | Query | Grade list |
| `useSalaryStructureDetail(gradeId, salaryType)` | Query | Structure detail; enabled when `gradeId` truthy |
| `useUpdateSalaryStructure()` | Mutation | Update structure |
| `useEmployeeSalaryAdjustments(params, companyId)` | Query | Employee list; enabled when `companyId` truthy |
| `useEmployeeSalaryAdjustmentDetail(employeeId, companyId, enabled)` | Query | Adjustment grid; enabled when both ids truthy |
| `useCreateEmployeeSalaryAdjustment()` | Mutation | Create — invalidates the employee list |
| `useUpdateEmployeeSalaryAdjustment()` | Mutation | Update — invalidates list and detail |
| `useDeleteEmployeeSalaryAdjustment()` | Mutation | Delete — invalidates list and detail |
| `usePayrollDrafts(params, companyId)` | Query | Draft list; enabled when `companyId` truthy |
| `usePayrollDraft(id, companyId)` | Query | Single draft |
| `usePayrollDraftPreview(id, companyId, enabled)` | Query | Preview; only fetched while the draft is still `draft` |
| `useCreatePayrollDraft()` | Mutation | Create — invalidates the draft list |
| `useGeneratePayrollDraft()` | Mutation | Generate — writes the new detail into cache and drops the stale preview |
| `useCancelPayrollDraft()` | Mutation | Cancel — surfaces a specific toast when the draft was already finalized |
| `usePayrollComponentPage({ params })` | Page hook | Component tab list state |
| `useSalaryStructurePage({ params })` | Page hook | Salary structure tab list state |
| `useEmployeeSalaryAdjustmentPage({ params, companyId })` | Page hook | Adjustment tab list state |
| `usePayrollDraftPage({ params, companyId, setQueryParams })` | Page hook | Draft list, search/sort/pagination handlers, create-then-navigate |
| `usePayrollDraftDetailPage(draftId)` | Page hook | Draft detail, preview, grouped items, generate/cancel confirmation flow |

All hooks read their cache keys from `PAYROLL_QUERY_KEYS` in `hooks/query-keys.ts`.

### Pages

| Page | Description |
|---|---|
| `PayrollPage` | Tab shell; the active tab lives in the `tab` query param (`payroll-component` is the default and is omitted from the URL) |

| `PayrollComponentTab` | Component list with search and category filter |
| `SalaryStructureTab` | Grade list with monthly/daily/hourly completeness badges, opens `SalaryStructureFormDrawer` |
| `EmployeeSalaryAdjustmentTab` | Employee list with search, golongan/has-adjustment filter, edit and delete actions |
| `PayrollDraftTab` | Draft list with filters, create modal, row navigation to the detail route |
| `PayrollDraftDetailPage` | Draft detail, preview or generated snapshot, generate/cancel actions |

### Components

| Component | Description |
|---|---|
| `CreateDraftModal` | Create-draft form (period type, period start/end, notes) validated by `createPayrollDraftSchema` |
| `SalaryStructureFormDrawer` | Edit default/min/max amount per component for one grade + salary type |
| `EmployeeSalaryAdjustmentDrawer` | Adjustment grid per component; shows a notice when the employee is not payroll-ready or the structure is incomplete, and disables Save in the former case |
| `EmployeeSalaryAdjustmentFilterDrawer` | Checkbox filter for golongan (multi) and has-adjustment (single) |
| `PayrollValueInput` | Renders `InputCurrency` for a `fixed` component and `InputNumber` with a `%` suffix for a `percentage` one; the only place that branch lives |
| `PayrollDraftPreview` | Eligible manpower table plus the skipped-employee lists |
| `PayrollDraftSnapshot` | Generated result grouped per employee with subtotals |

### Services

| Function | Description |
|---|---|
| `formatPayrollValue(value, valueType)` | `"Rp 5.000.000"` for `fixed`, `"5%"` for `percentage`, `"-"` when empty or unparseable |
| `getPayrollValueBasis(valueType, baseScope, baseComponentName)` | `"dari Total Bruto"` / `"dari Gaji Pokok"`, or `null` for a fixed component |
| `validatePayrollValue(value, valueType)` | Error message or `null` — percentages must sit in 0–100, fixed amounts must not be negative |
| `buildPayrollTabParams(currentSearch, tab)` | Query string for switching tabs — drops `page`/`search`/`sortBy`/`sortOrder`, keeps `perPage` and each tab's own filters |
| `isAdjustableRow(row)` | Whether the salary structure configured this component, so the adjustment drawer can leave the rest out |
| `validateStructureItem(item)` / `collectStructureErrors(data)` | Validate one structure row, or a whole salary type's tab keyed by component id |
| `findFirstTypeWithErrors(errorsByType, order)` | Which salary type to jump to so its error is on screen |
| `parsePayrollItemErrors(fieldErrors, componentIds)` | Turns the API's positional `items.0.default_amount` keys into errors keyed by component id, using the submitted payload order |
| `hasPayrollRowErrors(fieldErrors)` | Whether any error points at a row, as opposed to the form-wide `items` error |
| `groupPayrollDraftItems(items)` | Group draft items per employee and compute each subtotal |
| `getPayrollSignedAmount(item)` | Signed amount for one item; falls back to `amount × (isDeduction ? -1 : 1)` when `signedAmount` is unusable |
| `parsePayrollMoney(value)` | Parse a money string/number, `0` when not finite |

### Types

| Type | Description |
|---|---|
| `PayrollComponent` | Component master row (`code`, `name`, `category`, `sortOrder`, `isDeduction`, `isConfigurable`) |
| `PayrollComponentCategory` | `'pokok' \| 'tunjangan' \| 'variable' \| 'lembur' \| 'potongan'` |
| `SalaryType` | `'monthly' \| 'daily' \| 'hourly'` |
| `PayrollValueType` | `'fixed' \| 'percentage'` — whether a component's amounts are rupiah or percent |
| `PayrollBaseScope` | `'gross' \| 'component' \| null` — what a percentage is taken of |
| `SalaryStructureGrade` | Grade row with a `CompletenessStatus` per salary type |
| `SalaryStructureDetail` / `SalaryStructureDetailItem` | Structure for one grade + salary type and its component rows, each with `is_applicable` / `is_mandatory` |
| `EmployeeSalaryAdjustment` | Employee row; `grade` and `salaryType` are nullable until set in Employee Detail |
| `EmployeeSalaryAdjustmentDetail` | `employee`, `hasAdjustment`, `incomplete`, and the `grid` of components |
| `PayrollDraftSummary` / `PayrollDraftDetail` | Draft list row and its detail with `items` |
| `PayrollDraftItem` | One component line of a draft, per employee; `referenceCount` is decimal — attendance days for `daily`, worked hours for `hourly`, `null` for `monthly` and for percentage components |
| `PayrollDraftPreview` | `manpower`, `skipped_no_company`, `skipped_no_grade_or_type` |
| `PayrollDraftStatus` | `'draft' \| 'generated' \| 'cancelled'` |
| `PeriodeType` | `'monthly' \| 'daily' \| 'hourly'` |

### Labels

- `PAYROLL_LABELS` — page title, component tab, salary structure tab, filter
- `PAYROLL_DRAFT_LABELS` — draft tab columns, empty state, create modal, actions
- `ADJUSTMENT_LABELS` — adjustment tab columns, filters, actions, dialog, drawer form, notices
- `CATEGORY_BADGE` / `COMPLETENESS_BADGE` — badge class and label per category / completeness
- `TAB_OPTIONS` / `DEFAULT_TAB` — tab definitions used by `PayrollPage`

## Usage Examples

```tsx
// app/(protected)/human-resource/payroll/page.tsx
import { PayrollPage } from '@/domains/payroll';

export default function Page() {
  return <PayrollPage />;
}
```

```tsx
// app/(protected)/human-resource/payroll/draft/[id]/page.tsx
import { Suspense } from 'react';
import { PayrollDraftDetailPage } from '@/domains/payroll';
import { FormPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<FormPageSkeleton fields={6} />}>
      <PayrollDraftDetailPage />
    </Suspense>
  );
}
```

```tsx
// Inside the domain — company id comes from the shared company filter
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useEmployeeSalaryAdjustmentPage } from '../hooks/use-employee-salary-adjustment-page';

function MyTab() {
  const { companyId } = useCompanyFilter();
  const pageOptions = useMemo(() => ({ params, companyId }), [params, companyId]);
  const { employees, totalItems, isLoading } = useEmployeeSalaryAdjustmentPage(pageOptions);
  // ...
}
```

## API Contracts

Every endpoint below is company-scoped through the `X-Company-Id` header, except the salary-structure endpoints, which are global master data.

### GET `/human-resource/payroll-components`

**Query params**: `page`, `perPage`, `search`, `sortBy`, `sortOrder`, `category`

**Response**: paginated `PayrollComponent[]`

`isConfigurable: false` marks a component whose amount is derived by the backend and cannot be set by hand. The backend scopes this by category — everything under `lembur` — so today it covers the single `overtime` component, whose amount is summed from `done` overtime entries in the payroll period.

Such components are already filtered out server-side of both the salary structure `items[]` and the adjustment `grid[]`, so the two forms never render them and no client-side filtering is needed. Sending one back with an amount filled in is rejected with `422`; sending it with a null amount is ignored. Only this list endpoint returns every component, which is why the flag exists here.

### Saving the salary structure across its salary-type tabs

The structure drawer holds one form per salary type, but the API takes a single `(grade, salaryType)` pair per request. Saving therefore sends **one request per salary type the user actually edited**, in tab order, and a type leaves the pending set as soon as its request succeeds — so a later failure never re-sends what already saved. Tabs that were merely opened are not sent at all.

Validation runs over every pending tab before the first request, not only the visible one. When a tab other than the current one fails, the drawer switches to it so the message is on screen, and the toast names that tab instead of saying something generic. Server errors are stored per salary type for the same reason: a rejection on one tab must never paint itself onto another tab's identical component id.

Because one save can now span several requests, the success toast lives in the drawer rather than in `useUpdateSalaryStructure` — otherwise editing two tabs would announce success twice.

### Why a tab change resets the list position

All four tabs read the same URL keys — `page`, `perPage`, `search`, `sortBy`, `sortOrder` — because each is an ordinary list page. Carrying every param across a tab change therefore dropped the next tab on the previous tab's page number, kept a search that meant nothing there, and sent a sort column the next endpoint does not have. `buildPayrollTabParams` clears those four on every switch.

What it deliberately keeps: `perPage`, a preference rather than a position, harmless once the page resets to the first; and every tab-specific filter (`category`, `gradeId`, `hasAdjustment`, `periodType`, `status`, `periodStart`, `periodEnd`), so returning to a tab does not lose the filter set there. This is narrower than the rule in QUERY_PARAMS_PATTERN.md, which says a tab change preserves unrelated params — that rule exists to stop filters being dropped, and filters are exactly what is still preserved here.

### Fixed and percentage components

A component's amounts are either rupiah (`valueType: 'fixed'`) or percent (`valueType: 'percentage'`), and `baseScope` says what a percentage is taken of — `gross` (every non-deduction component for that employee and period) or `component` (the one named by `baseComponentName`). Today `pph21` is a percentage of gross and `bpjs` a percentage of basic salary; everything else is fixed.

**The unit applies to every amount of that component** — `default`, `min`, and `max` alike, in the structure and in the adjustment. A percentage component's range is a range of percentages, not of rupiah, which is why the structure drawer's column headers are plain `Min` / `Max` / `Default` rather than naming IDR. An adjustment always inherits the unit of the structure it overrides; the two can never disagree.

The backend rejects a percentage outside 0–100 with `422`; `validatePayrollValue` catches the same case in the browser first.

### How a rejected save reaches the inputs

The API reports item errors by their position in the payload (`items.0.default_amount`), while both drawers key their errors by component id. The submitted payload carries `payroll_component_id` at every index, so `parsePayrollItemErrors` resolves one to the other without relying on the order of anything else.

The save hooks stay quiet when the rejection points at rows — those messages belong on the inputs, and a generic toast above them is noise. A form-wide `items` error names no row, so it still gets a toast; `hasPayrollRowErrors` is what separates the two. Editing a row clears the server's complaint about that row, so a stale message never outlives the value it described.

### Which components a grade gets

The salary structure `items[]` carries two more flags per row: `is_applicable` (does this grade get this component at all) and `is_mandatory` (if true, applicability is locked). Today only `basic_salary` is mandatory, because it makes up the gross that `pph21` is taken from and is the direct base of `bpjs`.

The adjustment drawer shows only the components the structure actually configured, decided by `isAdjustableRow`. A grade half-way through setup keeps the components that are ready adjustable rather than locking the whole employee, and when nothing is ready the notice is left to speak for itself. The API reports an unset component as `0` with no bounds rather than `null`, which is why the check looks at the range as well — a zero default that carries a real range is a component that starts at nothing but may be raised, and stays adjustable.

The drawer renders `is_applicable` as a checkbox; unchecking it clears and disables that row's amounts. **Rows that do not apply are still sent** — that row is what records the "this grade does not get this" decision, so filtering it out would silently drop the answer. Completeness is computed by the backend ignoring non-applicable rows, so a grade that deliberately uses three of eight components now reads Complete rather than being stuck at Incomplete.

That derivation replaced a manual override switch the drawer used to carry. The override always beat the calculation and could never be lifted, so a grade that had been touched once reported a status that no longer matched its data. There is nothing to set from the client any more: `completeness` on the grade list is read-only, and saving the structure invalidates that list so the badges follow the new amounts.

The three endpoints spell these fields differently, matching the payload each already used: the component list is camelCase (`valueType`, `baseScope`, `baseComponentName`), the salary structure `items[]` is snake_case (`value_type`, `base_scope`, `base_component_name`), and the adjustment `grid[]` is camelCase again.

### GET `/human-resource/salary-structures/grades`

**Response**: paginated `SalaryStructureGrade[]`, each with `completeness: { monthly, daily, hourly }`

### GET `/human-resource/salary-structures/{gradeId}?salaryType=monthly`

**Response**: `SalaryStructureDetail`, or `null` when the structure has not been set up

### POST `/human-resource/salary-structures`

**Payload**: `{ employeeGradeId, salaryType, items: [{ payroll_component_id, default_amount, min_amount, max_amount, is_active }] }`

### GET `/human-resource/employee-salary-adjustments/employees`

**Query params**: `page`, `perPage`, `search`, `sortBy`, `sortOrder`, `gradeId[]`, `hasAdjustment`

**Response**: paginated `EmployeeSalaryAdjustment[]`. `grade` and `salaryType` are `null` for employees not yet set up, and `isPayrollReady` is `false` for them.

### GET / PUT / DELETE `/human-resource/employee-salary-adjustments/{employeeId}`

**PUT payload**: `{ items: [{ payrollComponentId, adjustedAmount, reason? }] }`

**GET response**: `EmployeeSalaryAdjustmentDetail` — `incomplete` is `true` when the grade's salary structure itself is not finished.

### GET / POST `/human-resource/payroll-drafts`

**POST payload** (snake_case): `{ period_type, period_start, period_end, notes }`

**GET query params**: `page`, `perPage`, `search`, `sortBy`, `sortOrder`, `periodType`, `status`, `periodStart`, `periodEnd`

### POST `/human-resource/payroll-drafts/{id}/generate` and `/cancel`

**Response**: the updated `PayrollDraftDetail`

### GET `/human-resource/payroll-drafts/{id}/preview`

**Response**: `{ manpower, skipped_no_company, skipped_no_grade_or_type }`

## Related Domains

- **employee-grade** — the golongan referenced by salary structure and by each employee
- **manpower** — employee master data; grade and salary type are set there, and payroll skips employees missing either
- **attendance** — attendance counts feed the daily/hourly estimate shown in the draft preview
- **company** — company scope for every payroll request, selected through the shared `useCompanyFilter`

## Best Practices

- Read the company id from `useCompanyFilter()`, never from the URL directly; every list query stays disabled until it resolves.
- Keep new cache keys in `hooks/query-keys.ts` so invalidation stays in one place.
- Never format a payroll amount with `formatCurrencyIDR` directly — go through `formatPayrollValue`, or a percentage component will render as rupiah.
- Treat `grade` and `salaryType` as nullable everywhere — the API returns `null` for employees who have not been set up, and rendering them without a guard crashes the list.
- Keep all user-facing text in `constants/index.ts`, not inline in the components.
