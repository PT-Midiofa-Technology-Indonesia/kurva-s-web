# Asset Management

Asset Management covers company-scoped asset registration and global asset category management. `Asset Catalog` and `Asset Category` are route-backed child pages under the top-level Asset Management menu.

## Overview

`Asset Catalog` lists registered assets with search, pagination, sort, and filters for status, category, and warehouse. It uses the backend company context header (`X-Company-Id`) and supports the register flow for eligible units.

The category and warehouse filters read their options from their own endpoints (`AssetCatalogCategoryFilter`, `AssetCatalogWarehouseFilter`), not from the assets on screen. Deriving them from the loaded rows meant a filter only ever offered what fitted on the current page of ten, so a warehouse whose assets sat on page three was unreachable, and picking a value shrank the list of values. Both filters are searchable and page as you scroll, and the warehouse one is scoped to the selected company. Neither offers `In Project`: the API still reports `inProject` per asset and the table, detail drawer and register drawer all label it, but it is not a place you can filter by in this system.

The status filter is still derived from the loaded rows and has the same limitation.

`Asset Category` is global master data. It provides search, status filtering, depreciation-method filtering, detail drawer, create/edit pages, and guarded delete handling for protected categories.

## Structure

```

## Routes

| Page | Route |
| --- | --- |
| Asset Management default | `/asset-management` |
| Asset Catalog | `/asset-management/asset-catalog` |
| Asset Category | `/asset-management/asset-category` |
| Create Asset Category | `/asset-management/asset-category/create` |
| Edit Asset Category | `/asset-management/asset-category/[id]/edit` |

`/asset-management` redirects to Asset Catalog.
asset-management/
├── api/
├── components/
├── constants/
├── hooks/
├── pages/
├── schemas/
├── types/
└── index.ts
```

## Key Exports

### APIs

- `getAssetRegistrations()` - paginated asset catalog list
- `getAssetRegistration()` - single asset registration detail
- `getRegisterableUnits()` - list of units eligible for registration
- `createAssetRegistration()` - create asset registration
- `updateAssetRegistrationNotes()` - edit registration notes
- `getAssetCategories()` - paginated asset category list
- `getAssetCategory()` - single asset category detail
- `createAssetCategory()` - create asset category
- `updateAssetCategory()` - update asset category
- `deleteAssetCategory()` - delete asset category

### Hooks

- `useAssetCatalogPage()` - asset catalog list orchestration
- `useAssetCategoryPage()` - asset category list orchestration
- `useAssetCategoriesInfinite()` - async select options for asset categories
- `useRegisterableUnitsInfinite()` - register drawer unit loader
- `useCreateAssetCategoryPage()` / `useEditAssetCategoryPage()` - create/edit page orchestration

### Pages

- `AssetCatalogPage` - company-scoped asset registration list
- `AssetCategoryPage` - global asset category list
- `CreateAssetCategoryPage` - create form page
- `EditAssetCategoryPage` - edit form page

### Components

- `AssetRegistrationRegisterDrawer` - two-step asset registration drawer
- `AssetRegistrationDetailDrawer` - asset detail drawer with notes update
- `AssetCategoryForm` - shared create/edit category form
- `AssetCategoryDetailDrawer` - category detail drawer with status toggle

## Route Usage

```tsx
import { AssetCatalogPage } from '@/domains/asset-management';

export default function Page() {
  return <AssetCatalogPage />;
}
```

## API Contracts

- `Asset Catalog` requires `X-Company-Id` and supports `status`, `categoryId`, `warehouseId`, `search`, `sortBy`, `sortOrder`, `page`, and `perPage`.
- `Asset Category` is global and supports `search`, `isActive`, `depreciationMethod`, `sortBy`, `sortOrder`, `page`, and `perPage`.
- Register payloads support confirmation retries when the backend returns `CONFIRMATION_REQUIRED`.

## Related Domains

- `company` - supplies the company context for asset catalog
- `warehouse` - supplies warehouse filters and register-drawer search
- `item-master` - supplies item definitions used by registered asset units
