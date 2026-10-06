/**
 * A row of the material stock monitoring list.
 *
 * `available` and `status` are computed by the backend (BR-SM02, BR-SM06) —
 * the frontend renders them as given rather than recomputing, so there is a
 * single source of truth for stock state.
 */
export interface StockMaterialListItem {
  id: string;
  itemCatalogId: string;
  code: string;
  name: string;
  warehouseName: string;
  qtyOnHand: number;
  reserved: number;
  available: number;
  uom: string;
  minThreshold: number | null;
  maxThreshold: number | null;
  lastUpdate: string;
  status: string;
  isDeleted: boolean;
}

export interface StockEquipmentListItem {
  id: string;
  unitCode: string;
  name: string;
  warehouseName: string;
  lastUpdate: string;
  status: string;
  isDeleted: boolean;
}

export interface UpdateStockThresholdPayload {
  minThreshold: number | null;
  maxThreshold: number | null;
}

export type StockMovementItemType = 'material' | 'equipment';

export interface StockMovementItemRef {
  type: StockMovementItemType;
  code: string;
  name: string;
  isDeleted: boolean;
}

export interface StockMovementSourceRef {
  type: string;
  id: string;
  code: string;
  isDeleted: boolean;
}

export interface StockMovementListItem {
  id: string;
  timestamp: string;
  createdAt: string;
  qty: number;
  uom: string;
  movementType: string;
  rawMovementType: string;
  warehouseName: string;
  item: StockMovementItemRef;
  source: StockMovementSourceRef;
  balanceAfter: number;
  user: string;
}
