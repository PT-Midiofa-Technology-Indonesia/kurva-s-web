# Manpower

Manages employee data within the Human Resources module, covering list, create, edit, and detail views including position assignments and other employment settings.

## Structure

```
manpower/
├── api/
│   ├── create-employee-position-assignments.ts
│   ├── create-employee.ts
│   ├── delete-employee.ts
│   ├── get-employee-position-assignments.ts
│   ├── get-employee.ts
│   ├── get-employees.ts
│   └── update-employee.ts
├── components/
│   ├── EmployeeDetailInfo.tsx
│   ├── EmployeeForm.tsx
│   ├── EmployeeOtherSettings.tsx
│   ├── EmployeeOtherSettingsForm.tsx
│   ├── EmployeePositionAssignmentForm.tsx
│   └── EmployeePositionAssignments.tsx
├── constants/
│   └── index.ts
├── hooks/
│   ├── use-company-positions-infinite.ts
│   ├── use-create-employee-page.ts
│   ├── use-create-employee-position-assignments.ts
│   ├── use-create-employee.ts
│   ├── use-delete-employee.ts
│   ├── use-edit-employee-page.ts
│   ├── use-employee-page.ts
│   ├── use-employee-position-assignments.ts
│   ├── use-employee.ts
│   ├── use-employees.ts
│   ├── use-update-employee.ts
│   └── use-work-placement-enums.ts
├── pages/
│   ├── CreateManpowerPage.tsx
│   ├── DetailManpowerPage.tsx
│   ├── EditManpowerPage.tsx
│   └── ManpowerListPage.tsx
├── schemas/
│   ├── employee-form.ts
│   └── position-assignment-form.ts
├── types/
│   └── index.ts
└── index.ts
```

## Key Files

- `api/get-employees.ts` — paginated employee list (`GET /employees`)
- `api/get-employee.ts` — single employee detail (`GET /employees/:id`)
- `api/create-employee.ts` — create employee (`POST /employees`)
- `api/update-employee.ts` — update employee (`PUT /employees/:id`)
- `api/delete-employee.ts` — delete employee (`DELETE /employees/:id`)
- `api/get-employee-position-assignments.ts` — fetch position assignments (`GET /employee/:id/position-assignments`)
- `api/create-employee-position-assignments.ts` — save position assignments (`POST /employee/:id/position-assignments`)
- `components/EmployeeForm.tsx` — shared create/edit form (personal info fields)
- `components/EmployeeDetailInfo.tsx` — detail page section: personal info + inline status toggle
- `components/EmployeePositionAssignments.tsx` — detail page section: company position assignments table
- `components/EmployeeOtherSettings.tsx` — detail page section: work placement, contract type, salary type (badge cells)
- `components/EmployeeOtherSettingsForm.tsx` — drawer form for updating other employment settings
- `components/EmployeePositionAssignmentForm.tsx` — drawer form for adding/editing position assignments (dynamic rows, infinite-scroll company and position selects)
- `hooks/use-employee-page.ts` — all detail-page logic (status toggle, drawer state, position assignments)
- `hooks/use-create-employee-page.ts` — create-page form submission logic
- `hooks/use-edit-employee-page.ts` — edit-page pre-population and submission logic
- `hooks/use-company-positions-infinite.ts` — infinite-scroll query over `/company-positions/list` (used inside `EmployeePositionAssignmentForm`)
- `hooks/use-work-placement-enums.ts` — composes `useWorkPlacements`, `useContractTypes`, `useSalaryTypes` from `@/shared/hooks/use-enums`
- `schemas/employee-form.ts` — Zod schema for create/edit employee form
- `schemas/position-assignment-form.ts` — Zod schema for position assignment drawer

## Exports

- `createEmployee`, `createEmployeePositionAssignments`, `deleteEmployee` — write API functions
- `getEmployee`, `getEmployeePositionAssignments`, `getEmployees`, `updateEmployee` — read/update API functions
- `EmployeeDetailInfo`, `EmployeeForm`, `EmployeeOtherSettings`, `EmployeeOtherSettingsForm`, `EmployeePositionAssignmentForm`, `EmployeePositionAssignments` — UI components
- `useCreateEmployee`, `useCreateEmployeePositionAssignments`, `useDeleteEmployee`, `useUpdateEmployee` — mutation hooks
- `useEmployee`, `useEmployeePositionAssignments`, `useEmployees` — query hooks
- `useCreateEmployeePage`, `useEditEmployeePage`, `useEmployeePage` — page-level hooks
- `useWorkPlacementEnums` — composite enum hook (work placement, contract type, salary type)
- `ManpowerListPage`, `CreateManpowerPage`, `DetailManpowerPage`, `EditManpowerPage` — page components
- Types and constants from `./types` and `./constants`

## Usage Example

```tsx
import {
  ManpowerListPage,
  CreateManpowerPage,
  DetailManpowerPage,
  EditManpowerPage,
} from '@/domains/manpower';

// List page
export default function Page() {
  return <ManpowerListPage />;
}

// Create page
export default function Page() {
  return <CreateManpowerPage />;
}

// Detail page
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetailManpowerPage employeeId={id} />;
}

// Edit page
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditManpowerPage employeeId={id} />;
}
```

The detail page (`DetailManpowerPage`) is composed of three independent section components — `EmployeeDetailInfo`, `EmployeePositionAssignments`, and `EmployeeOtherSettings` — each fetching its own data. Position assignments and other settings are edited through right-side drawers (`EmployeePositionAssignmentForm`, `EmployeeOtherSettingsForm`).
