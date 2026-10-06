# Performance (KPI Employee Evaluation)

Employee performance evaluation and KPI monitoring domain for the company portal. Provides comprehensive performance tracking with pillar breakdown, reward/punishment history, and project assignments.

## Purpose

This domain manages:
- Employee performance evaluation and KPI scores
- Performance pillar breakdown (attendance, productivity, violations, work quality)
- Grade distribution and scoring system
- Reward and punishment tracking
- Performance history over time
- Project assignment history with performance correlation

**Portal**: Company  
**Permission Base**: `hr.kpi.emp`

## Structure

```
performance/
├── api/
│   ├── get-performance-employees.ts        # GET /v1/performance/employees (paginated list with summary)
│   ├── get-performance-detail.ts           # GET /v1/performance/employees/{employeeId} (detail with pillars)
│   ├── get-performance-by-id.ts            # GET /v1/performance/{performanceId} (by performance ID)
│   ├── get-performance-history.ts          # GET /v1/performance/employees/{employeeId}/history
│   └── get-project-history.ts              # GET /v1/performance/employees/{employeeId}/project-history
├── components/
│   ├── PerformanceEmployeeTable.tsx        # Employee list table with grades and scores
│   ├── PerformanceGradeBadge.tsx           # Grade badge component (A-E with colors)
│   ├── PerformancePillarCard.tsx           # Pillar card with icon, value, percentage
│   ├── PerformancePillarBreakdown.tsx      # Full pillar breakdown with components
│   ├── PerformanceActionList.tsx           # Reward/punishment list component
│   └── PerformanceDetailDrawer.tsx         # Detail drawer with tabs (overview, pillars, rewards, etc.)
├── hooks/
│   ├── use-performance-employees.ts        # useQuery for paginated employee list
│   ├── use-performance-detail.ts           # useQuery for employee performance detail
│   ├── use-performance-by-id.ts            # useQuery for performance by ID
│   ├── use-performance-history.ts          # useQuery for performance history
│   ├── use-project-history.ts              # useQuery for project history
│   └── use-performance-page.ts             # Page-level hook for list page orchestration
├── pages/
│   ├── PerformanceListPage.tsx             # List page with search, filters, summary cards
│   └── __tests__/
│       └── PerformanceListPage.test.tsx    # Page component tests
├── types/
│   └── index.ts                            # All domain types (see below)
├── schemas/
│   └── index.ts                            # Zod validation schemas (if needed for forms)
├── constants/
│   └── index.ts                            # Labels, icons, colors, pillar codes
└── index.ts                                # Public barrel exports
```

## API Endpoints

### Employee Performance List
**Endpoint**: `GET /v1/performance/employees`  
**Returns**: Paginated employee list with performance summary and grade distribution

**Query Parameters**:
- `page`, `perPage` — Pagination
- `search` — Employee name/NIK search
- `period` — Performance period filter
- `grade` — Filter by grade (A/B/C/D/E)
- `departmentId` — Filter by department
- `sortBy`, `sortOrder` — Sorting

**Response**:
```typescript
{
  data: PerformanceEmployee[],        // Employee list with performance summary
  summary: {
    totalEmployees: number,
    averageScore: number,
    gradeDistribution: GradeDistribution[]
  },
  meta: PaginationMeta,
  links: PaginationLinks
}
```

### Employee Performance Detail
**Endpoint**: `GET /v1/performance/employees/{employeeId}`  
**Returns**: Complete performance detail with pillar breakdown and actions

**Response**:
```typescript
{
  data: {
    id: string,
    employee: Employee,
    period: string,
    score: number,
    grade: PerformanceGrade,
    pillars: PerformancePillar[],      // With component breakdown
    rewards: PerformanceAction[],
    punishments: PerformanceAction[],
    createdAt: string,
    updatedAt: string
  }
}
```

### Performance by ID
**Endpoint**: `GET /v1/performance/{performanceId}`  
**Returns**: Performance detail by specific performance record ID

### Performance History
**Endpoint**: `GET /v1/performance/employees/{employeeId}/history`  
**Returns**: Historical performance records for an employee

### Project History
**Endpoint**: `GET /v1/performance/employees/{employeeId}/project-history`  
**Returns**: Project assignment history with performance correlation

## Types

### Core Types
- `Employee` — Employee reference with basic info
- `PerformanceEmployee` — Employee with performance summary
- `PerformanceDetail` — Full performance record with all details
- `PerformanceGrade` — Grade definition (A-E) with score ranges
- `PerformancePillar` — Pillar with total value and components
- `PillarComponent` — Individual component within a pillar
- `PerformanceAction` — Reward or punishment record
- `PerformanceHistory` — Historical performance record
- `ProjectHistory` — Project assignment with performance

### Response Types
- `PerformanceEmployeesResponse` — List endpoint response
- `PerformanceDetailResponse` — Detail endpoint response
- `PerformanceHistoryResponse` — History endpoint response
- `ProjectHistoryResponse` — Project history response

### Filter Types
- `PerformanceEmployeeFilters` — Query parameters for list endpoint

## Constants

### Grade Colors
```typescript
GRADE_COLORS = {
  A: 'text-green-600',
  B: 'text-blue-600',
  C: 'text-yellow-600',
  D: 'text-orange-600',
  E: 'text-red-600',
}
```

### Pillar Codes & Icons
```typescript
PILAR_CODES = {
  ATTENDANCE: 'attendance',
  PRODUCTIVITY: 'productivity',
  VIOLATION: 'violation',
  WORK_QUALITY: 'work_quality',
}

PILAR_ICONS = {
  attendance: CalendarClock,
  productivity: Target,
  violation: AlertTriangle,
  work_quality: Medal,
}
```

## Component Structure

### Atomic Breakdown
- **Atoms**: `PerformanceGradeBadge` (grade indicator)
- **Molecules**: `PerformancePillarCard` (single pillar display)
- **Organisms**: `PerformancePillarBreakdown`, `PerformanceActionList`, `PerformanceEmployeeTable`
- **Templates**: `PerformanceDetailDrawer` (full detail view with tabs)

### Page Components
- `PerformanceListPage` — Main list page with summary cards, search, filters

## Exports

### Components
- `PerformanceListPage` — Main list page
- `PerformanceGradeBadge` — Grade badge
- `PerformancePillarCard` — Pillar card
- `PerformancePillarBreakdown` — Pillar breakdown
- `PerformanceActionList` — Reward/punishment list
- `PerformanceDetailDrawer` — Detail drawer

### Hooks
- `usePerformanceEmployees` — Paginated employee list
- `usePerformanceDetail` — Employee performance detail
- `usePerformanceById` — Performance by ID
- `usePerformanceHistory` — Performance history
- `useProjectHistory` — Project history
- `usePerformancePage` — Page orchestration

### Constants
- `GRADE_COLORS` / `GRADE_BG_COLORS` — Grade color mapping
- `PILAR_CODES` / `PILAR_ICONS` / `PILAR_NAMES` — Pillar definitions
- `PERFORMANCE_LABELS` — All UI labels
- `PROJECT_STATUS_LABELS` / `PROJECT_STATUS_COLORS` — Project status
- `ACTION_TYPE_LABELS` / `ACTION_TYPE_COLORS` — Action type styling

### Types
- `Employee`, `PerformanceEmployee`, `PerformanceDetail`
- `PerformancePillar`, `PillarComponent`
- `PerformanceGrade`, `PerformanceAction`
- `PerformanceHistory`, `ProjectHistory`
- `PerformanceEmployeeFilters`

## Usage Example

```tsx
// In app/(protected)/hr/kpi/employees/page.tsx
import { PerformanceListPage } from '@/domains/performance';

export default function Page() {
  return <PerformanceListPage />;
}
```

```tsx
// Using hooks directly
import { usePerformanceEmployees, usePerformanceDetail } from '@/domains/performance';

function MyComponent() {
  const { data, isLoading } = usePerformanceEmployees({
    page: 1,
    perPage: 10,
    grade: 'A'
  });

  const { data: detail } = usePerformanceDetail(employeeId);

  return (
    <div>
      {data?.summary && (
        <div>
          Total: {data.summary.totalEmployees}
          Average: {data.summary.averageScore}
        </div>
      )}
    </div>
  );
}
```

## Related Domains

- **auth** — Employee authentication and user data
- **employee** — Employee master data (if exists)
- **hr** — HR management features
- **project-control** — Project assignments and tracking

## Implementation Notes

1. **Grade System**: Grades A-E with color-coded badges following consistent color scheme
2. **Pillar Icons**: Using lucide-react icons for visual consistency
3. **Permission Base**: `hr.kpi.emp` — wrap protected features with `PermissionGuard`
4. **Pagination**: All list endpoints support standard pagination with meta/links
5. **Search**: Employee search by name/NIK on list endpoint
6. **Portal**: Company portal only — not available in project portal

## Next Steps

1. Implement API layer functions following API_PATTERN.md
2. Create React Query hooks for each endpoint
3. Build atomic components (badge, pillar card)
4. Compose organisms (table, breakdown, action list)
5. Create detail drawer template
6. Build list page with summary cards and filters
7. Add tests for critical components
8. Integrate with navigation (add to company portal menu)
