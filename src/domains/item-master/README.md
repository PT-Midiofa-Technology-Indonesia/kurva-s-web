# Item Master

Manages item master data through a tabbed interface covering Item Type, Item Category, and Item Catalog, with full CRUD for categories and catalogs plus import/export for catalogs.

## Structure

```
item-master/
├── api/
│   ├── create-item-catalog.ts
│   ├── create-item-category.ts
│   ├── delete-item-catalog.ts
│   ├── delete-item-category.ts
│   ├── download-item-master-template.ts
│   ├── get-item-catalog.ts
│   ├── get-item-catalogs.ts
│   ├── get-item-categories.ts
│   ├── get-item-category.ts
│   ├── get-item-types.ts
│   ├── import-item-masters.ts
│   ├── update-item-catalog.ts
│   └── update-item-category.ts
├── components/
│   ├── ItemCatalogDetailDrawer.tsx
│   ├── ItemCatalogForm.tsx
│   ├── ItemCategoryDetailDrawer.tsx
│   └── ItemCategoryForm.tsx
├── constants/
│   └── index.ts
├── hooks/
│   ├── use-create-item-catalog-page.ts
│   ├── use-create-item-catalog.ts
│   ├── use-create-item-category-page.ts
│   ├── use-create-item-category.ts
│   ├── use-delete-item-catalog.ts
│   ├── use-delete-item-category.ts
│   ├── use-edit-item-catalog-page.ts
│   ├── use-edit-item-category-page.ts
│   ├── use-item-catalog-import-export.ts
│   ├── use-item-catalog-tab-page.ts
│   ├── use-item-catalog.ts
│   ├── use-item-catalogs-infinite.ts
│   ├── use-item-catalogs.ts
│   ├── use-item-categories-infinite.ts
│   ├── use-item-categories.ts
│   ├── use-item-category-tab-page.ts
│   ├── use-item-category.ts
│   ├── use-item-type-tab-page.ts
│   ├── use-item-types-infinite.ts
│   ├── use-item-types.ts
│   ├── use-update-item-catalog.ts
│   └── use-update-item-category.ts
├── pages/
│   ├── CreateItemCatalogPage.tsx
│   ├── CreateItemCategoryPage.tsx
│   ├── EditItemCatalogPage.tsx
│   ├── EditItemCategoryPage.tsx
│   ├── ItemCatalogTab.tsx
│   ├── ItemCategoryTab.tsx
│   ├── ItemMasterPage.tsx
│   └── ItemTypeTab.tsx
├── schemas/
│   └── index.ts
├── types/
│   └── index.ts
└── index.ts
```

## Key Files

- `api/get-item-types.ts` — fetch item types list (`GET /v1/item-types`)
- `api/get-item-categories.ts` / `get-item-category.ts` — list and single item category
- `api/get-item-catalogs.ts` / `get-item-catalog.ts` — paginated list and single item catalog
- `api/create-item-catalog.ts` / `update-item-catalog.ts` / `delete-item-catalog.ts` — catalog CRUD
- `api/create-item-category.ts` / `update-item-category.ts` / `delete-item-category.ts` — category CRUD
- `api/download-item-master-template.ts` — download Excel import template
- `api/import-item-masters.ts` — bulk import catalogs via file upload
- `components/ItemCatalogForm.tsx` — shared create/edit form for item catalogs
- `components/ItemCatalogDetailDrawer.tsx` — read-only detail drawer with status toggle for catalogs
- `components/ItemCategoryForm.tsx` — shared create/edit form for item categories
- `components/ItemCategoryDetailDrawer.tsx` — read-only detail drawer with status toggle for categories
- `hooks/use-item-catalog-tab-page.ts` — all list-page logic for the Item Catalog tab
- `hooks/use-item-category-tab-page.ts` — all list-page logic for the Item Category tab
- `hooks/use-item-type-tab-page.ts` — all list-page logic for the Item Type tab
- `hooks/use-item-catalog-import-export.ts` — import and download template orchestration
- `hooks/use-item-catalogs-infinite.ts` / `use-item-categories-infinite.ts` / `use-item-types-infinite.ts` — infinite-scroll queries for async selects

## Exports

- `createItemCatalog`, `updateItemCatalog`, `deleteItemCatalog` — catalog API functions
- `createItemCategory`, `updateItemCategory`, `deleteItemCategory` — category API functions
- `getItemCatalog`, `getItemCatalogs`, `getItemCategory`, `getItemCategories`, `getItemTypes` — read API functions
- `downloadItemMasterTemplate`, `importItemMasters` — import/export API functions
- `ItemCatalogForm`, `ItemCatalogDetailDrawer` — catalog UI components
- `ItemCategoryForm`, `ItemCategoryDetailDrawer` — category UI components
- `useItemCatalog`, `useItemCatalogs`, `useItemCatalogsInfinite` / `UseItemCatalogsInfiniteOptions` — catalog query hooks
- `useItemCategory`, `useItemCategories`, `useItemCategoriesInfinite` / `UseItemCategoriesInfiniteOptions` — category query hooks
- `useItemTypes`, `useItemTypesInfinite` / `UseItemTypesInfiniteOptions` — item type query hooks
- `useCreateItemCatalog`, `useUpdateItemCatalog`, `useDeleteItemCatalog` — catalog mutation hooks
- `useCreateItemCategory`, `useUpdateItemCategory`, `useDeleteItemCategory` — category mutation hooks
- `useItemCatalogTabPage`, `useItemCategoryTabPage`, `useItemTypeTabPage` — tab-level page hooks
- `useCreateItemCatalogPage`, `useEditItemCatalogPage` — catalog form page hooks
- `useCreateItemCategoryPage`, `useEditItemCategoryPage` — category form page hooks
- `useItemCatalogImportExport` — import/export page hook
- `ItemMasterPage` — main tabbed page
- `ItemCatalogTab`, `CreateItemCatalogPage`, `EditItemCatalogPage` — catalog pages
- `ItemCategoryTab`, `CreateItemCategoryPage`, `EditItemCategoryPage` — category pages
- `ItemTypeTab` — item type read-only tab page
- Types and constants from `./types` and `./constants`

## Usage Example

```tsx
import { ItemMasterPage } from '@/domains/item-master';

// app/(protected)/master-data/item-master/page.tsx
export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="paragraph" count={5} />}>
      <ItemMasterPage />
    </Suspense>
  );
}
```

Active tab is stored in the URL as `?tab=<key>`. Supported values: `item-type` (default, omitted from URL), `item-category`, `item-catalog`. Each tab's filters (search, status, pagination) are also managed via URL params through the respective tab-page hook.
