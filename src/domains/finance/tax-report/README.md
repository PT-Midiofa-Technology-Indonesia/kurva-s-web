# Tax Report

Domain for managing tax report list and detail flows.

## Structure

```
tax-report/
├── api/
│   ├── get-tax-report.ts      # GET /v1/finance/tax-report/:id
│   ├── get-tax-reports.ts     # GET /v1/finance/tax-report (paginated list)
│   └── get-tax-types.ts       # GET /v1/tax-types (dropdown options)
├── components/
│   ├── TaxManagementTabs.tsx
│   └── TaxReportCards.tsx
├── constants/
│   └── index.ts
├── hooks/
│   ├── use-tax-report-detail-page.ts
│   ├── use-tax-report-page.ts
│   └── use-tax-reports.ts     # list and tax type query hooks
├── pages/
│   ├── __tests__/
│   │   └── TaxReportListPage.integration.test.tsx
│   ├── TaxReportDetailPage.tsx
│   └── TaxReportListPage.tsx
├── types/
│   └── index.ts
└── index.ts
```

## List Filters

- Company selector from `useCompanyFilter()`; list API receives selected company as `X-Company-Id` header.
- Document Date Range maps to `startDate` and `endDate` query params.
- Source dropdown uses `TAX_REPORT_SOURCE_OPTIONS` and maps to `source` query param.
- Tax Type dropdown consumes `GET /v1/tax-types`, maps `{ id, name }` to `AsyncSelect` options, and maps selected value to `taxTypeId` query param.
- Status dropdown uses `TAX_REPORT_STATUS_OPTIONS` and maps to `status` query param.

## API

- `getTaxReports(params)` calls `GET /v1/finance/tax-report` with pagination, search, `source`, `taxTypeId`, `status`, `startDate`, and `endDate` as query params.
- `companyId` is stripped from query params and sent only as `X-Company-Id`.
- `getTaxTypes()` calls `GET /v1/tax-types` for dropdown options.

## Routes

| Route | Page |
|---|---|
| `/finance/tax-report` | `TaxReportListPage` |
| `/finance/tax-report/:id` | `TaxReportDetailPage` |
