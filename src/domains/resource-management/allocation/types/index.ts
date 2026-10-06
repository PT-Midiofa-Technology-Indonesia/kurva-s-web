import type { Company, ItemCatalog, ResourceUnit, Warehouse } from '../../catalog/types';

export interface Project {
  id: string;
  code: string;
  name: string;
}

export interface AllocatedBy {
  id: string;
  name: string;
}

export interface ReturnedBy {
  id: string;
  name: string;
}

export interface ResourceAllocation {
  id: string;
  code: string;
  project: Project;
  company: Company;
  allocationType: string; // 'unit' | 'quantity'
  resourceUnit: ResourceUnit | null;
  itemCatalog: ItemCatalog | null;
  sourceWarehouse: Warehouse;
  quantity: number | null;
  allocatedFromDate: string; // YYYY-MM-DD
  allocatedToDate: string; // YYYY-MM-DD
  status: string; // 'allocated' | 'returned'
  allocatedBy: AllocatedBy;
  returnedAt: string | null;
  returnedBy: ReturnedBy | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceAllocationListItem extends ResourceAllocation {}

export interface CreateResourceAllocationPayload {
  allocationType: string; // 'unit' | 'quantity'
  warehouseId: string;
  resourceUnitId?: string; // for unit allocation
  itemCatalogId?: string; // for quantity allocation
  quantity?: number; // for quantity allocation
  allocationFromDate: string;
  allocationToDate: string;
  notes?: string;
}

export interface UpdateResourceAllocationPayload {
  allocationType?: string;
  warehouseId?: string;
  resourceUnitId?: string;
  itemCatalogId?: string;
  quantity?: number;
  allocationFromDate?: string;
  allocationToDate?: string;
  notes?: string | null;
}
