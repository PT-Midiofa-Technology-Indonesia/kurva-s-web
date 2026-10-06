export interface VendorGeography {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  type?: string | null;
  provinceId?: string;
  cityId?: string;
  districtId?: string;
  postalCode?: string | null;
}

export interface VendorCatalog {
  id: string;
  groupId: string | null;
  code: string;
  name: string;
  isSubcontractor: boolean;
  isSupplier: boolean;
  isLogistic: boolean;
  npwp: string;
  siupNumber: string;
  phone: string;
  email: string;
  provinceId: string;
  cityId: string;
  districtId: string;
  villageId: string;
  postalCode: string;
  addressDetail: string;
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  province: VendorGeography;
  city: VendorGeography;
  district: VendorGeography;
  village: VendorGeography;
}

export interface VendorCatalogListItem extends VendorCatalog {}

export interface VendorFormInput {
  code: string;
  name: string;
  isSubcontractor: boolean;
  isSupplier: boolean;
  isLogistic: boolean;
  npwp?: string;
  siupNumber?: string;
  phone: string;
  email?: string;
  provinceId: string | null;
  cityId: string | null;
  districtId: string | null;
  villageId: string | null;
  postalCode?: string;
  addressDetail?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  notes?: string;
  isActive: string;
}

// ─── Vendor Item Catalog ────────────────────────────────────────────────────

export interface VendorItemCatalogItemCatalog {
  id: string;
  code: string;
  name: string;
  description?: string;
  uomId?: string | null;
  uom?: {
    id: string;
    name: string;
    code: string;
  } | null;
  isActive: boolean;
}

export interface VendorItemCatalog {
  id: string;
  vendorId: string;
  itemCatalogId: string;
  price: string | number;
  isTaxInclusive: boolean;
  priceUpdatedAt: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  itemCatalog: VendorItemCatalogItemCatalog;
}

export interface VendorItemCatalogListItem extends VendorItemCatalog {}

export interface VendorItemCatalogFormInput {
  itemCatalogId: string;
  price: number;
  isActive: boolean;
}

/**
 * Local draft row used by the Excel-mode item-catalog table.
 * Combines server data with in-progress edits (new rows, dirty rows, deletions).
 */
export interface VendorItemCatalogDraftRow {
  /** Local-only identifier. Prefixed `__draft_` for new rows, equals `id` otherwise. */
  __draftId: string;
  /** Server id, present when the row originated from the backend. */
  id?: string;
  /** Editable fields */
  itemCatalogId: string | null;
  price: number | null;
  isActive: boolean;
  /** Display-only fields derived from the selected item-catalog */
  code: string;
  name: string;
  uomName: string | null;
  /** Local state flags */
  isNew: boolean;
  isDirty: boolean;
  isDeleted: boolean;
}

export interface VendorItemCatalogImportFailedRow {
  row: number;
  errors: string[];
  data: Record<string, unknown>;
}

export interface VendorItemCatalogImportResult {
  message?: string;
  success_count: number;
  failed_count: number;
  failed_rows: VendorItemCatalogImportFailedRow[];
}

// ─── Vendor Capability ────────────────────────────────────────────────────

export interface VendorCapabilitySkillCatalog {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface VendorCapability {
  id: string;
  vendorId: string;
  skillCatalogId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  skillCatalog: VendorCapabilitySkillCatalog;
}

export interface VendorCapabilityListItem extends VendorCapability {}

export interface VendorCapabilityFormInput {
  skillCatalogId: string;
  isActive: boolean;
}

// ─── Vendor Service Coverage ──────────────────────────────────────────────

export interface VendorServiceCoverageProvince {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface VendorServiceCoverageCity {
  id: string;
  provinceId: string;
  code: string;
  name: string;
  type: string | null;
  isActive: boolean;
}

export interface VendorServiceCoverage {
  vendorId: string;
  provinceId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  province: VendorServiceCoverageProvince;
  cities: VendorServiceCoverageCity[];
}

export interface VendorServiceCoverageListItem extends VendorServiceCoverage {}

export interface VendorServiceCoverageSyncFormInput {
  coverages: {
    provinceId: string;
    cityIds: string[];
  }[];
}

// ─── Vendor Offering Document ───────────────────────────────────────────

export interface VendorOfferingDocumentFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedBy?: string | null;
  uploadedAt?: string;
}

export interface VendorOfferingDocument {
  id: string;
  vendorId: string;
  code: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  files?: VendorOfferingDocumentFile[];
  vendor?: VendorCatalog;
  mimeTypes?: string;
}

export interface VendorOfferingDocumentListItem extends VendorOfferingDocument {}

export interface VendorOfferingDocumentFormInput {
  files: File[];
  files__existingIds: string[];
  code: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  description?: string;
  isActive: boolean;
}

// ─── Vendor Fleet Vehicle ───────────────────────────────────────────────

export interface VendorFleetVehicleUom {
  id: string;
  group: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface VendorFleetVehicle {
  id: string;
  vendorId: string;
  name: string;
  code?: string;
  vehicleType: string;
  plateNumber: string;
  brand?: string;
  model?: string;
  yearOfManufacture?: number;
  weightMax?: string | number;
  weightUomId?: string;
  volumeMax?: string | number;
  volumeUomId?: string;
  pricePerTripMin?: string | number;
  pricePerDistanceMin?: string | number;
  pricePerDistanceMax?: string | number;
  distanceValueMin?: string | number;
  distanceValueMax?: string | number;
  distanceUomId?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  vendor?: VendorCatalog;
  weightUom?: VendorFleetVehicleUom;
  volumeUom?: VendorFleetVehicleUom;
  distanceUom?: VendorFleetVehicleUom;
}

export interface VendorFleetVehicleListItem extends VendorFleetVehicle {}

export interface VendorFleetVehicleFormInput {
  name: string;
  code: string;
  vehicleType: string;
  plateNumber: string;
  brand?: string;
  model?: string;
  yearOfManufacture?: number;
  weightMax?: number;
  weightUomId?: string;
  volumeMax?: number;
  volumeUomId?: string;
  pricePerTripMin?: number;
  pricePerDistanceMin?: number;
  pricePerDistanceMax?: number;
  distanceValueMin?: number;
  distanceValueMax?: number;
  distanceUomId?: string;
  notes?: string;
  isActive: boolean;
}

// ─── Vendor Rating ─────────────────────────────────────────────────────────

export interface VendorRatingSummaryCategory {
  categoryId: string | null;
  categoryCode: string;
  categoryName: string;
  avgScore: number;
  count: number;
  isActive: boolean;
}

export interface VendorRatingSummary {
  overallAvg: number | null;
  totalRatings: number;
  lastRatedAt: string | null;
  perCategory: VendorRatingSummaryCategory[];
}

export interface VendorRatingRater {
  id: string;
  name: string;
}

export interface VendorRatingSource {
  type: string;
  id: string;
  label: string | null;
  deleted: boolean;
}

export interface VendorRatingScore {
  categoryId: string | null;
  categoryCode: string;
  categoryName: string;
  categoryStatus: 'active' | 'inactive' | 'deleted';
  score: number;
  note: string | null;
}

export interface VendorRatingHistoryItem {
  id: string;
  ratedAt: string;
  overallScore: number;
  note: string | null;
  ratedBy: VendorRatingRater | null;
  source: VendorRatingSource;
  scores: VendorRatingScore[];
}

export interface VendorRatingHistoryListItem extends VendorRatingHistoryItem {}
