# Company

Manages company records within the organization structure, including CRUD operations, department management, and detail views.

## Structure

```
company/
├── api/
│   ├── get-companies.ts                # GET /companies (paginated list)
│   ├── get-company.ts                  # GET /companies/:id (single company)
│   ├── create-company.ts               # POST /companies
│   ├── update-company.ts               # PUT /companies/:id
│   ├── delete-company.ts               # DELETE /companies/:id
│   ├── create-company-departments.ts   # POST /companies/:id/departments
│   └── delete-company-department.ts    # DELETE /companies/:id/departments/:deptId
├── components/
│   ├── CompanyForm.tsx          # Shared create/edit form (geography cascades, NPWP mask)
│   ├── CompanyDetailInfo.tsx    # Read-only detail view of a company
│   ├── CompanyDepartments.tsx   # Department list section inside detail view
│   └── AddDepartmentDrawer.tsx  # Drawer for adding departments to a company
├── hooks/
│   ├── index.ts                        # Re-exports all hooks
│   ├── use-companies.ts                # Paginated list hook
│   ├── use-companies-infinite.ts       # Infinite scroll hook (for selects)
│   ├── use-company.ts                  # Single company detail hook
│   ├── use-create-company.ts           # Create mutation hook
│   ├── use-update-company.ts           # Update mutation hook
│   ├── use-delete-company.ts           # Delete mutation hook
│   ├── use-create-company-departments.ts  # Add departments mutation hook
│   ├── use-delete-company-department.ts   # Remove department mutation hook
│   ├── use-company-page.ts             # List page orchestration hook
│   ├── use-create-company-page.ts      # Create page orchestration hook
│   └── use-edit-company-page.ts        # Edit page orchestration hook
├── pages/
│   ├── CompanyListPage.tsx     # List page with table, filters, and actions
│   ├── CreateCompanyPage.tsx   # Create new company form page
│   ├── DetailCompanyPage.tsx   # Detail page with departments section
│   └── EditCompanyPage.tsx     # Edit existing company form page
├── schemas/
│   └── index.ts    # Zod validation schemas for create/edit forms
├── types/
│   └── index.ts    # Company, CompanyListItem, and related types
├── constants/
│   └── index.ts    # Form field configs, labels
└── index.ts        # Public barrel exports
```

## Key Files

- `api/create-company-departments.ts` — Batch-adds departments to an existing company
- `api/delete-company-department.ts` — Removes a single department from a company
- `components/CompanyForm.tsx` — Cascading geography selects (Province → City → District → Village), NPWP input mask, project capabilities multi-select
- `components/AddDepartmentDrawer.tsx` — Drawer with FormGenerator for adding a department; used inside DetailCompanyPage
- `hooks/use-companies-infinite.ts` — Infinite scroll hook consumed by async selects in other domains
- `pages/DetailCompanyPage.tsx` — Shows company info via `CompanyDetailInfo` and department list via `CompanyDepartments`

## Exports

- `CompanyListPage`, `CreateCompanyPage`, `DetailCompanyPage`, `EditCompanyPage` — page components
- `useCompanies` — paginated list hook
- `useCompaniesInfinite` — infinite scroll hook
- `useCompany` — single company hook
- `useCreateCompany` — create mutation hook
- `useUpdateCompany` — update mutation hook
- `useDeleteCompany` — delete mutation hook
- `useCreateCompanyDepartments` — add departments mutation hook
- `useDeleteCompanyDepartment` — remove department mutation hook
- `useCompanyPage`, `useCreateCompanyPage`, `useEditCompanyPage` — page orchestration hooks
- API functions: `getCompanies`, `getCompany`, `createCompany`, `updateCompany`, `deleteCompany`
- Types and constants re-exported from `types/` and `constants/`

## Usage Example

```tsx
import { CompanyListPage, useCompaniesInfinite } from '@/domains/company';

// Full list page
export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <CompanyListPage />
    </Suspense>
  );
}

// Infinite select in another domain
const { data, fetchNextPage } = useCompaniesInfinite({ search });
```
