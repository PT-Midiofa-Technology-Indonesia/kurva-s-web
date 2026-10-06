export interface ItemType {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemTypeListItem extends ItemType {}

export interface ItemCategoryItemType {
  id: string;
  name: string;
}

export interface ItemCategory {
  id: string;
  groupId: string | null;
  group: null;
  itemTypeId: string;
  itemType: ItemCategoryItemType | null;
  parentId: string | null;
  parent: ItemCategoryListItem | null;
  children?: ItemCategoryListItem[];
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemCategoryListItem extends Omit<ItemCategory, 'children' | 'parent' | 'group'> {
  parent: null;
  group: null;
}

// Item Catalog
export interface ItemCatalogUom {
  id: string;
  name: string;
  code: string;
}

export interface ItemCatalogItemType {
  id: string;
  name: string;
}

export interface ItemCatalogItemCategory {
  id: string;
  name: string;
}

export interface ItemCatalog {
  id: string;
  groupId: string | null;
  group: null;
  itemTypeId: string;
  itemType: ItemCatalogItemType | null;
  itemCategoryId: string;
  itemCategory: ItemCatalogItemCategory | null;
  uomId: string;
  uom: ItemCatalogUom | null;
  code: string;
  name: string;
  description: string;
  isAllocatable: boolean;
  isAsset: boolean;
  isStock: boolean;
  isSensitive: boolean;
  defaultPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemCatalogVendor {
  id: string;
  price: number;
  isTaxInclusive: boolean;
  priceUpdatedAt: string;
}

export interface ItemCatalogListItem extends Omit<ItemCatalog, 'group'> {
  group: null;
  vendor?: ItemCatalogVendor | null;
}

export interface ItemCatalogImportFailedRow {
  row: number;
  errors: string[];
  data: Record<string, unknown>;
}

export interface ItemCatalogImportResult {
  message?: string;
  success_count: number;
  failed_count: number;
  failed_rows: ItemCatalogImportFailedRow[];
}
