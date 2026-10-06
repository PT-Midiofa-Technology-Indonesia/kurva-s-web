# Vendor Catalog

Vendor master data management for subcontractors, suppliers, and logistics partners with full CRUD and five sub-entity tabs.

## Structure

```
vendor-catalog/
├── api/
│   ├── create-vendor-catalog.ts            # POST /vendors
│   ├── get-vendor-catalogs.ts              # GET /vendors (paginated)
│   ├── get-vendor-catalog.ts               # GET /vendors/:id
│   ├── update-vendor-catalog.ts            # PUT /vendors/:id
│   ├── delete-vendor-catalog.ts            # DELETE /vendors/:id
│   ├── create-vendor-item-catalog.ts       # POST /vendors/:id/item-catalogs
│   ├── get-vendor-item-catalogs.ts         # GET /vendors/:id/item-catalogs
│   ├── get-vendor-item-catalog.ts          # GET /vendors/:id/item-catalogs/:itemId
│   ├── update-vendor-item-catalog.ts       # PUT /vendors/:id/item-catalogs/:itemId
│   ├── delete-vendor-item-catalog.ts       # DELETE /vendors/:id/item-catalogs/:itemId
│   ├── import-item-catalogs.ts             # POST /vendors/:id/item-catalogs/import
│   ├── download-item-catalog-template.ts   # GET /vendors/:id/item-catalogs/template
│   ├── create-vendor-capability.ts         # POST /vendors/:id/capabilities
│   ├── get-vendor-capabilities.ts          # GET /vendors/:id/capabilities
│   ├── get-vendor-capability.ts            # GET /vendors/:id/capabilities/:capId
│   ├── update-vendor-capability.ts         # PUT /vendors/:id/capabilities/:capId
│   ├── delete-vendor-capability.ts         # DELETE /vendors/:id/capabilities/:capId
│   ├── get-vendor-service-coverages.ts     # GET /vendors/:id/service-coverages
│   ├── get-vendor-service-coverage.ts      # GET /vendors/:id/service-coverages/:scId
│   ├── sync-vendor-service-coverages.ts    # POST /vendors/:id/service-coverages (sync)
│   ├── delete-vendor-service-coverage.ts   # DELETE /vendors/:id/service-coverages/:scId
│   ├── create-vendor-offering-document.ts  # POST /vendors/:id/offering-documents
│   ├── get-vendor-offering-documents.ts    # GET /vendors/:id/offering-documents
│   ├── get-vendor-offering-document.ts     # GET /vendors/:id/offering-documents/:docId
│   ├── update-vendor-offering-document.ts  # PUT /vendors/:id/offering-documents/:docId
│   ├── delete-vendor-offering-document.ts  # DELETE /vendors/:id/offering-documents/:docId
│   ├── create-vendor-fleet-vehicle.ts      # POST /vendors/:id/fleet-vehicles
│   ├── get-vendor-fleet-vehicles.ts        # GET /vendors/:id/fleet-vehicles
│   ├── get-vendor-fleet-vehicle.ts         # GET /vendors/:id/fleet-vehicles/:fvId
│   ├── update-vendor-fleet-vehicle.ts      # PUT /vendors/:id/fleet-vehicles/:fvId
│   └── delete-vendor-fleet-vehicle.ts      # DELETE /vendors/:id/fleet-vehicles/:fvId
├── components/
│   ├── VendorCatalogForm.tsx               # Create/edit form with geography cascading
│   ├── VendorCatalogFormFields.tsx         # Reusable form field fragments
│   ├── VendorCatalogFormGeography.tsx      # Geography cascading field group
│   ├── VendorCatalogDetailInfo.tsx         # Detail info card with status toggle
│   ├── VendorItemCatalogList.tsx           # Excel-mode inline-editable item catalog table
│   ├── VendorCapabilityList.tsx            # Capability tab table + drawer trigger
│   ├── VendorCapabilityFormDrawer.tsx      # Add/edit capability slide-over form
│   ├── VendorServiceCoverageList.tsx       # Service coverage tab table + drawer trigger
│   ├── VendorServiceCoverageFormDrawer.tsx # Add/edit service coverage slide-over form
│   ├── VendorOfferingDocumentList.tsx      # Offering document tab table + drawer trigger
│   ├── VendorOfferingDocumentFormDrawer.tsx # Add/edit offering document slide-over form
│   ├── VendorFleetVehicleList.tsx          # Fleet tab table + drawer trigger
│   └── VendorFleetVehicleFormDrawer.tsx    # Add/edit fleet vehicle slide-over form
├── hooks/
│   ├── use-vendor-catalogs.ts              # useQuery for vendor list
│   ├── use-vendor-catalog.ts              # useQuery for single vendor
│   ├── use-create-vendor-catalog.ts        # useMutation for create
│   ├── use-update-vendor-catalog.ts        # useMutation for update
│   ├── use-delete-vendor-catalog.ts        # useMutation for delete
│   ├── use-vendor-catalog-page.ts          # Page-level hook for list page
│   ├── use-create-vendor-catalog-page.ts   # Page-level hook for create page
│   ├── use-edit-vendor-catalog-page.ts     # Page-level hook for edit page
│   ├── use-item-catalog-import-export.ts   # Hook for import/download item catalog template
│   ├── use-vendor-item-catalogs.ts         # useQuery + CRUD mutations for item catalogs
│   ├── use-vendor-item-catalog-page.ts     # Excel-mode page hook for item catalog tab
│   ├── use-vendor-capabilities.ts          # useQuery + CRUD mutations for capabilities
│   ├── use-vendor-capability.ts            # useQuery for single capability
│   ├── use-vendor-capability-page.ts       # Page-level hook for capability tab
│   ├── use-vendor-service-coverages.ts     # useQuery + sync/delete for service coverages
│   ├── use-vendor-service-coverage.ts      # useQuery for single service coverage
│   ├── use-vendor-service-coverage-page.ts # Page-level hook for service coverage tab
│   ├── use-vendor-offering-documents.ts    # useQuery + CRUD mutations for offering docs
│   ├── use-vendor-offering-document.ts     # useQuery for single offering document
│   ├── use-vendor-offering-document-page.ts # Page-level hook for offering document tab
│   ├── use-vendor-fleet-vehicles.ts        # useQuery + CRUD mutations for fleet vehicles
│   ├── use-vendor-fleet-vehicle.ts         # useQuery for single fleet vehicle
│   └── use-vendor-fleet-vehicle-page.ts    # Page-level hook for fleet tab
├── pages/
│   ├── VendorCatalogListPage.tsx           # List page with search, filter, pagination
│   ├── CreateVendorCatalogPage.tsx         # Create vendor page
│   ├── EditVendorCatalogPage.tsx           # Edit vendor page
│   └── DetailVendorCatalogPage.tsx         # Detail page with 5 sub-entity tabs
├── schemas/
│   └── index.ts                            # Zod schemas for all vendor forms
├── types/
│   └── index.ts                            # All vendor TypeScript types
├── constants/
│   └── index.ts                            # Labels, placeholders, option lists
└── index.ts                                # Public barrel exports
```

## Key Files

- `components/VendorItemCatalogList.tsx` — Excel-mode DataTable: users add rows, edit Nama/Harga/Status inline, then commit with **Simpan**; Kode and UoM auto-fill from the item-catalog master
- `api/sync-vendor-service-coverages.ts` — Replaces all service coverages for a vendor in one request (sync pattern, not individual POST)
- `api/import-item-catalogs.ts` / `api/download-item-catalog-template.ts` — Bulk import via file upload and template download
- `hooks/use-vendor-item-catalog-page.ts` — Orchestrates Excel-mode: draft state, batched `Promise.allSettled` create/update/delete, **Batal** discards

## Exports

### Pages
- `VendorCatalogListPage` — List with search, type filters, pagination, and sort
- `CreateVendorCatalogPage` — Create vendor with geography cascading
- `EditVendorCatalogPage` — Edit vendor pre-filled with existing data
- `DetailVendorCatalogPage` — Detail with 5 tabs: Item Catalog, Capabilities, Service Coverage, Offering Documents, Fleet

### Components
- `VendorCatalogForm` / `VendorCatalogFormFields` / `VendorCatalogFormGeography` — Form pieces
- `VendorCatalogDetailInfo` — Detail info card with type badges and status toggle
- `VendorItemCatalogList` — Excel-mode inline-editable item catalog tab
- `VendorCapabilityList` / `VendorCapabilityFormDrawer`
- `VendorServiceCoverageList` / `VendorServiceCoverageFormDrawer`
- `VendorOfferingDocumentList` / `VendorOfferingDocumentFormDrawer`
- `VendorFleetVehicleList` / `VendorFleetVehicleFormDrawer`

### Hooks
- `useVendorCatalogs` / `useVendorCatalog` — List and single query hooks
- `useCreateVendorCatalog` / `useUpdateVendorCatalog` / `useDeleteVendorCatalog`
- `useVendorCatalogPage` / `useCreateVendorCatalogPage` / `useEditVendorCatalogPage`
- `useVendorItemCatalogs` (query + `useCreateVendorItemCatalog` / `useUpdateVendorItemCatalog` / `useDeleteVendorItemCatalog`) / `useVendorItemCatalogPage`
- `useVendorCapabilities` (query + mutations) / `useVendorCapability` / `useVendorCapabilityPage`
- `useVendorServiceCoverages` (`useSyncVendorServiceCoverages` / `useDeleteVendorServiceCoverage`) / `useVendorServiceCoverage` / `useVendorServiceCoveragePage`
- `useVendorOfferingDocuments` (query + mutations) / `useVendorOfferingDocument` / `useVendorOfferingDocumentPage`
- `useVendorFleetVehicles` (query + mutations) / `useVendorFleetVehicle` / `useVendorFleetVehiclePage`

### Types
- `VendorCatalog` / `VendorCatalogListItem` / `VendorFormInput`
- `VendorGeography`
- `VendorItemCatalog` / `VendorItemCatalogListItem` / `VendorItemCatalogFormInput` / `VendorItemCatalogDraftRow` / `VendorItemCatalogItemCatalog`
- `VendorCapability` / `VendorCapabilityListItem` / `VendorCapabilityFormInput` / `VendorCapabilitySkillCatalog`
- `VendorServiceCoverage` / `VendorServiceCoverageListItem` / `VendorServiceCoverageCity` / `VendorServiceCoverageProvince`
- `VendorOfferingDocument` / `VendorOfferingDocumentListItem` / `VendorOfferingDocumentFormInput` / `VendorOfferingDocumentFile`
- `VendorFleetVehicle` / `VendorFleetVehicleListItem` / `VendorFleetVehicleFormInput` / `VendorFleetVehicleUom`

## Usage Example

```tsx
import { VendorCatalogListPage } from '@/domains/vendor-catalog';

export default function Page() {
  return <VendorCatalogListPage />;
}
```

```tsx
import { DetailVendorCatalogPage } from '@/domains/vendor-catalog';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetailVendorCatalogPage vendorId={id} />;
}
```

## Detail Page Tabs

| Tab | Key | Pattern |
|---|---|---|
| Item Catalog | `item-catalog` | Excel-mode inline editing with import/export |
| Capabilities | `capability` | Table + slide-over drawer form |
| Service Coverage | `service-coverage` | Table + slide-over drawer (sync pattern) |
| Offering Documents | `offering-document` | Table + slide-over drawer (multipart file upload) |
| Fleet | `fleet` | Table + slide-over drawer form |

## Related Domains

- **vendor-directory** — Read-only directory view reusing this domain's query hooks and types
- **item-master** — Item catalog reference data used in the Item Catalog tab
- **skill-master** — Skill catalog reference used in the Capabilities tab
- **company** / **office** / **warehouse** — Share the same geography cascading pattern
