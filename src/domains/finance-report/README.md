# Finance Report

Finance Report displays company-scoped cash in/out report data from Finance APIs.

## Routes

- List: `/finance/finance-report`
- Detail: `/finance/finance-report/[id]`

## APIs

- List: `GET /v1/finance/reports`
- Detail: `GET /v1/finance/reports/:id`
- Source type enum: `GET /v1/enums/tax-resource-types`
- Type enum: `GET /v1/enums/finance-report-types`

List requests send `X-Company-Id` when selected company exists. Query params:

- `page`
- `perPage`
- `sortBy`
- `sortOrder`
- `search`
- `source`
- `dateFrom`
- `dateTo`
- `type`

## Structure

```text
finance-report/
├── api/
│   ├── get-finance-report-detail.ts
│   └── get-finance-reports.ts
├── hooks/
│   ├── use-finance-report-detail.ts
│   ├── use-finance-report-list-page.ts
│   └── use-finance-reports.ts
├── pages/
│   ├── FinanceReportDetailPage.tsx
│   └── FinanceReportListPage.tsx
├── schemas/
├── types/
├── constants/
├── __tests__/
├── index.ts
└── README.md
```

## UI notes

- Header above summary cards shows page title and company filter.
- Summary cards show Total Cash In, Total Cash Out, and Net Balance.
- Total Cash In uses `primary` color.
- Total Cash Out uses `destructive` color.
- Net Balance uses `primary` when positive/zero and `destructive` when negative.
- Table toolbar order: Search, Source Type, Date Range, Type.
