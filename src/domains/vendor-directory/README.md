# Vendor Directory

A read-only, cross-vendor directory view that aggregates sub-entity records (Item Catalog, Capabilities, Service Coverage, Offering Documents, Fleet) across all vendors on one tabbed page.

## Structure

```
vendor-directory/
├── api/
│   └── index.ts                                  # Re-exports paginated GET endpoints from vendor-catalog
├── hooks/
│   └── index.ts                                  # Re-exports useQuery hooks from vendor-catalog
├── components/
│   ├── VendorDirectoryItemCatalogList.tsx        # Item Catalog tab content
│   ├── VendorDirectoryCapabilityList.tsx         # Capabilities tab content
│   ├── VendorDirectoryServiceCoverageList.tsx    # Service Coverage tab content
│   ├── VendorDirectoryOfferingDocumentList.tsx   # Offering Document tab content
│   └── VendorDirectoryFleetVehicleList.tsx       # Fleet tab content
├── pages/
│   └── VendorDirectoryPage.tsx                   # Main page with 5 tabs + URL-driven tab state
├── types/
│   └── index.ts                                  # VendorDirectory* types (vendor-catalog types + optional vendor field)
├── constants/
│   └── index.ts                                  # Tab keys/labels/order, column headers, status options
└── index.ts                                      # Public barrel exports
```

## Key Files

- `pages/VendorDirectoryPage.tsx` — Renders a 5-tab page; active tab driven by `?tab=` query param; no add/edit/delete actions
- `api/index.ts` — Thin re-export of the corresponding `getVendor*` functions from `vendor-catalog`; the global view omits the `vendorId` filter so the server returns rows across all vendors
- `types/index.ts` — Extends vendor-catalog types with `vendor?: VendorDirectoryVendor | null` for the Nama Vendor column

## Exports

- `VendorDirectoryPage` — 5-tab read-only directory page
- `VendorDirectoryItemCatalogList` — Item Catalog tab content
- `VendorDirectoryCapabilityList` — Capabilities tab content
- `VendorDirectoryServiceCoverageList` — Service Coverage tab content
- `VendorDirectoryOfferingDocumentList` — Offering Document tab content
- `VendorDirectoryFleetVehicleList` — Fleet tab content
- `VENDOR_DIRECTORY_TABS` — Tab key constants (`item-catalog`, `capability`, `service-coverage`, `offering-document`, `fleet`)
- `VENDOR_DIRECTORY_TAB_LABELS` — Human-readable tab labels
- `VENDOR_DIRECTORY_TAB_ORDER` — Visual tab order
- `VENDOR_DIRECTORY_LABELS` — All UI labels (column headers, filter placeholders, empty messages)
- `VENDOR_DIRECTORY_STATUS_OPTIONS` — Status filter options
- `VendorDirectoryTab` — Union type of valid tab keys
- `VendorDirectoryItemCatalog` / `VendorDirectoryCapability` / `VendorDirectoryServiceCoverage` / `VendorDirectoryOfferingDocument` / `VendorDirectoryFleetVehicle` / `VendorDirectoryVendor` — TypeScript types

## Usage Example

```tsx
import { VendorDirectoryPage } from '@/domains/vendor-directory';

// app/(protected)/vendor-management/vendor-directory/page.tsx
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <VendorDirectoryPage initialTab={tab} />
    </Suspense>
  );
}
```

## Tab Structure

| Tab label | `?tab=` value |
|---|---|
| Item Catalog | `item-catalog` (default) |
| Capabilities | `capability` |
| Service Coverage | `service-coverage` |
| Offering Document | `offering-document` |
| Fleet | `fleet` |

## Related Domains

- **vendor-catalog** — Source of truth for all vendor data and CRUD. This domain reuses its API functions, query hooks, and types; never adds mutations of its own.
- **skill-master** — Provides `SkillCatalog` reference rendered in capability rows.
