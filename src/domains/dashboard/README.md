# dashboard Domain

Authenticated landing page shown at `/dashboard`, shared by both portals
(`company` and `project`). The page is decomposed into self-contained section
components (`components/*Section.tsx`) that each own their endpoint hook — a
section that is not mounted never fetches. Visibility is expressed by explicit
composition in `pages/CompanyDashboardPage.tsx` and
`pages/ProjectDashboardPage.tsx`, not by flags:

- **Company**: hero, Project Summary (with the company select), Portfolio
  Progress (metric cards + Project Requires Attention), Cost & Budget
  Performance, KPI gauges, Remaining Budget by Project. The status badges and
  the Progress Distribution card are currently omitted (pending product
  confirmation — re-add `showBadges` / `showProgressDistribution` to the
  `PortfolioProgressSection` usage to restore).
- **Project**: hero, Portfolio Progress (metric cards + status badges),
  S-Curve Project section, Cost & Budget Performance, KPI gauges.

- **Project**: hero, Project Progress (metric cards from `progressCard`),
  S-Curve Project section, Cost & Budget Performance, KPI gauges. All four
  data sections read slices of the single project-overview response
  (`hooks/use-dashboard-project-overview.ts`), so the identical query key
  dedupes them into one network request. Interval state (Weekly/Monthly
  toggle) and project selection (`useSelectedProjectStore`) are owned by
  `pages/ProjectDashboardPage.tsx` and passed down as props. The project
  portal does not require a `companyId` query param.

The S-Curve Project section (`components/SCurveProjectSection.tsx`) is a
multi-line chart (Original Plan / Current Plan / Actual) with a
Weekly/Monthly toggle, summary chips (planned/actual/variance + status
badge), and a per-period percentage table, all rendered from the
`sCurve` slice of the overview response (server labels take precedence,
`DASHBOARD_LABELS.SCURVE` values are fallback).

`pages/DashboardPage.tsx` is a thin switcher: it resolves the portal
(`usePortal`), the user (`useMe`), and the company context
(`useCompanyFilter` — the single URL-state owner), then renders one of the two
composition pages. The company-portal `companyId` guard is skipped for the
project portal.

## Structure

```
dashboard/
├── api/
│   └── get-dashboard.ts   # 5 contract-backed dashboard endpoints (+ project overview)
├── components/
│   ├── CostBudgetSection.tsx # Company-portal cost & budget cards + utilization (own query)
│   ├── DashboardHero.tsx # Shared welcome banner
│   ├── DashboardSectionUI.tsx # SectionHeader, MetricCard, SectionError, EmptyState, skeletons
│   ├── FinanceRemainingSection.tsx # Remaining budget table (own query)
│   ├── KpiGaugeCard.tsx # Shared KPI gauge card (company + project portals)
│   ├── KpiSection.tsx # Company-portal KPI gauges + legend (own query)
│   ├── PortfolioProgressSection.tsx # Company-portal progress cards + optional badges/chart/attention (own query)
│   ├── ProjectCostBudgetSection.tsx # Project-portal cost & budget from overview slice
│   ├── ProjectKpiSection.tsx # Project-portal KPI gauges + server legend from overview slice
│   ├── ProjectProgressCardSection.tsx # Project-portal progress cards from overview slice
│   ├── ProjectSummarySection.tsx # Summary cards + company select (own query)
│   └── SCurveProjectSection.tsx # Project-portal S-Curve chart + table from overview slice
├── constants/
│   └── index.ts           # Section labels and fallback copy
├── hooks/
│   ├── use-dashboard-finance-remaining.ts # Single-endpoint hook
│   ├── use-dashboard-finance-summary.ts # Single-endpoint hook
│   ├── use-dashboard-kpi-summary.ts # Single-endpoint hook
│   ├── use-dashboard-project-overview.ts # Project-overview hook (query key by projectId + interval)
│   ├── use-dashboard-project-progress.ts # Single-endpoint hook (also used by the attention drilldown)
│   └── use-dashboard-project-summary.ts # Single-endpoint hook
├── pages/
│   ├── CompanyDashboardPage.tsx # Company-portal section composition
│   ├── DashboardPage.tsx # Portal switcher (portal + user + company resolution)
│   ├── ProjectDashboardPage.tsx # Project-portal composition (owns projectId + interval state)
│   └── ProjectRequiresAttentionPage.tsx # View-only table for the dashboard attention drilldown
├── services/
│   ├── format.ts # Shared pure formatters (percent, signed percent, compact currency)
│   └── status-color.ts # statusColor string → badge variant / tone / dot / chart color
├── types/
│   └── index.ts           # Dashboard response shapes
└── index.ts               # Barrel exports
```

## Key Files

- `api/get-dashboard.ts` - reads:
  - `/v1/dashboard/project/overview` (project portal: `projectId`, `interval`, `startDate`, `endDate`)
  - `/v1/dashboard/project/summary`
  - `/v1/dashboard/project/progress`
  - `/v1/dashboard/finance/summary`
  - `/v1/dashboard/finance/remaining`
  - `/v1/dashboard/kpi/summary`
- `hooks/use-dashboard-*.ts` - one hook per endpoint, each with its own query key and `enabled: !!companyId` (`use-dashboard-project-overview.ts` is keyed by `projectId` + `interval` with `enabled: !!projectId`)
- `components/*Section.tsx` - own their query, skeleton, and error/retry state; shared UI primitives in `DashboardSectionUI.tsx`
- `pages/DashboardPage.tsx` - portal switcher and company-context guard
- `pages/ProjectRequiresAttentionPage.tsx` - drilldown table and pagination for `requiresAttention`
- `types/index.ts` - typed responses for all dashboard endpoints

## Exports

- `DashboardPage` - portal-switching dashboard component
- `DASHBOARD_LABELS` - display string constants

## Usage Example

```tsx
import { DashboardPage } from '@/domains/dashboard';

export default function Page() {
  return <DashboardPage />;
}
```
