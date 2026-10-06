# Employee Grade Domain

Golongan (Employee Grade) master data management — create, list, edit, and delete employee grade/rank definitions.

## Structure

```
employee-grade/
├── api/             # API calls (get, create, update, delete)
├── components/      # Domain-specific UI components
├── hooks/           # React Query hooks
├── pages/           # Page components (list, create, edit)
├── schemas/         # Zod validation schemas
├── types/           # TypeScript type definitions
├── constants/       # Domain constants and form field configs
├── services/        # Business logic (if needed)
├── store/           # Zustand store (if needed)
└── index.ts         # Public barrel exports
```

## Key Exports

### Pages

- `EmployeeGradeListPage` — List page with data table, search, pagination
- `CreateEmployeeGradePage` — Create new grade form
- `EditEmployeeGradePage` — Edit existing grade form (accepts `employeeGradeId` prop)

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employee-grade` | List all grades (paginated) |
| GET | `/employee-grade/{id}` | Get single grade by ID |
| POST | `/employee-grade` | Create new grade |
| PUT | `/employee-grade/{id}` | Update existing grade |
| DELETE | `/employee-grade/{id}` | Delete grade |

### Route Pages (Next.js App Router)

| Route | Page Component |
|-------|----------------|
| `/master-data/employee-grade` | `EmployeeGradeListPage` |
| `/master-data/employee-grade/create` | `CreateEmployeeGradePage` |
| `/master-data/employee-grade/[id]/edit` | `EditEmployeeGradePage` |

## Related Domains

- **employee** — Employee records reference employee grade
- **payroll** — Payroll calculations use grade-based rates
