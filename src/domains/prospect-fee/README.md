# Prospect Fee

Fee configuration for project capabilities, under the Prospectus menu.

## Overview

Two tabs at `/prospectus/prospect-fee`:

- **Fee** — paginated list of computed fees per project, fetched from `GET /v1/prospect-fees`.
- **Setting Fee** — list of fee configurations per Project Capability, fetched from `GET /v1/prospect-fees/settings`. The eye icon opens `/prospectus/prospect-fee/[id]` and reads `GET /v1/prospect-fees/settings/:id`.

The page is now API-driven. Company selection is preserved in the `companyId` query param so the list and detail views keep the correct `X-Company-Id` header across navigation.

## Structure

```text
api/          HTTP clients for fee lists, settings, setting header, and tier mutations
components/   SettingFeeList, FeeRangeList
hooks/        React Query hooks + query keys
pages/        ProspectFeePage (tab shell with shared company selector), FeeListContent,
              SettingFeeListContent, ProspectFeeSettingDetailPage
services/     Response mappers and tier helpers
constants/    labels and tabs
types/        FeeRow, FeeRange, SettingFeeRow, CompanyOption
```

## Exports

See `index.ts` for the full public barrel — API, hooks, pages, components, types, and constants.

## Example

```tsx
import { ProspectFeePage } from "@/domains/prospect-fee";

export default function Page() {
  return <ProspectFeePage />;
}
```
