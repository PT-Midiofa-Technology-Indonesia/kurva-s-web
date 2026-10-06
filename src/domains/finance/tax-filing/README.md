# Tax Filing

Domain for managing tax filing list and detail flows.

## Structure

```
tax-filing/
├── api/
│   ├── get-tax-filing.ts      # GET /v1/finance/tax-filings/:id
│   ├── get-tax-filings.ts     # GET /v1/finance/tax-filings (paginated list)
│   ├── get-tax-types.ts       # GET /v1/tax-types (dropdown options)
│   └── tax-filing-mutations.ts
├── components/
│   ├── TaxFilingCards.tsx
│   └── TaxFilingDrawers.tsx
├── constants/
│   └── index.ts
├── hooks/
│   ├── index.ts
│   ├── use-tax-filing-detail-page.ts
│   ├── use-tax-filing-mutations.ts
│   ├── use-tax-filing-page.ts
│   └── use-tax-filings.ts     # list, detail, and tax type query hooks
├── pages/
│   ├── __tests__/
│   │   └── TaxFilingListPage.integration.test.tsx
│   ├── TaxFilingDetailPage.tsx
│   └── TaxFilingListPage.tsx
├── types/
│   └── index.ts
└── index.ts
```

## List Filters

- Company selector from `useCompanyFilter()`; list API receives selected company as `X-Company-Id` header.
- Tax Period uses month input and maps to `taxPeriod` query param.
- Tax Type dropdown consumes `GET /v1/tax-types`, maps `{ id, name }` to `AsyncSelect` options, and maps selected value to `taxTypeId` query param.
- Status dropdown uses `TAX_FILING_STATUS_OPTIONS` and maps to `status` query param.

## API

- `getTaxFilings(params)` calls `GET /v1/finance/tax-filings` with pagination, search, `taxPeriod`, `taxTypeId`, and `status` as query params.
- `companyId` is stripped from query params and sent only as `X-Company-Id`.
- `getTaxTypes()` calls `GET /v1/tax-types` for dropdown options.

## Routes

| Route | Page |
|---|---|
| `/finance/tax-filing` | `TaxFilingListPage` |
| `/finance/tax-filing/:id` | `TaxFilingDetailPage` |
