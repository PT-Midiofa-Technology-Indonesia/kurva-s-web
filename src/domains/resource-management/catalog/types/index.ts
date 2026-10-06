export interface ItemCatalog {
  id: string;
  code: string;
  name: string;
}

export interface Company {
  id: string;
  code: string;
  name: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
}

export interface UOM {
  id: string;
  code: string;
  name: string;
}

export interface ResourceUnit {
  id: string;
  itemCatalog: ItemCatalog;
  company: Company;
  code: string;
  warehouse: Warehouse;
  status: string; // 'available' | 'allocated' | 'maintenance' | 'retired'
  acquisitionDate: string; // YYYY-MM-DD
  acquisitionCost: string; // decimal
  notes: string | null;
  isActive: boolean;
  uom?: UOM; // optional, appears in some responses
  qtyAcrossWarehouse?: number; // optional
  createdAt: string;
  updatedAt: string;
}

export interface ResourceUnitListItem extends ResourceUnit {}

export interface CreateResourceUnitPayload {
  itemCatalogId: string;
  warehouseId: string;
  status: string;
  acquisitionDate: string;
  acquisitionCost: string | number;
  notes?: string;
}

export interface UpdateResourceUnitPayload {
  itemCatalogId?: string;
  warehouseId?: string;
  status?: string;
  acquisitionDate?: string;
  acquisitionCost?: string | number;
  notes?: string | null;
}
