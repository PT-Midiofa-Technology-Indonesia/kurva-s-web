import type {
  VendorCapability as VendorCatalogCapability,
  VendorFleetVehicle as VendorCatalogFleetVehicle,
  VendorItemCatalog as VendorCatalogItemCatalog,
  VendorOfferingDocument as VendorCatalogOfferingDocument,
  VendorServiceCoverage as VendorCatalogServiceCoverage,
} from '@/domains/vendor-catalog';

export interface VendorDirectoryVendor {
  id: string;
  code: string;
  name: string;
}

export interface VendorDirectoryItemCatalog extends Omit<VendorCatalogItemCatalog, 'vendor'> {
  vendor?: VendorDirectoryVendor | null;
}

export interface VendorDirectoryCapability extends Omit<VendorCatalogCapability, 'vendor'> {
  vendor?: VendorDirectoryVendor | null;
}

export interface VendorDirectoryServiceCoverage
  extends Omit<VendorCatalogServiceCoverage, 'vendor'> {
  vendor?: VendorDirectoryVendor | null;
}

export interface VendorDirectoryOfferingDocument
  extends Omit<VendorCatalogOfferingDocument, 'vendor'> {
  vendor?: VendorDirectoryVendor | null;
}

export interface VendorDirectoryFleetVehicle extends Omit<VendorCatalogFleetVehicle, 'vendor'> {
  vendor?: VendorDirectoryVendor | null;
}
