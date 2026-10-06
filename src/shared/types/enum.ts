import type { ApiSuccessResponse } from './api';

export interface EnumOption {
  value: string;
  label: string;
}

export type EnumEndpoint =
  | 'allocation-type'
  | 'approval-request-statuses'
  | 'asset-registration-statuses'
  | 'attendance-statuses'
  | 'billing-statuses'
  | 'billing-types'
  | 'billing-payment-methods'
  | 'company-position-levels'
  | 'contract-types'
  | 'cost-request-status'
  | 'cost-request-type'
  | 'delivery-order-source-type'
  | 'delivery-order-status'
  | 'depreciation-methods'
  | 'employee-types'
  | 'finance-report-types'
  | 'genders'
  | 'loading-order-source-type'
  | 'loading-order-status'
  | 'office-types'
  | 'payment-methods'
  | 'payment-request-status'
  | 'payment-source-type'
  | 'pickup-order-status'
  | 'pickup-order-type'
  | 'position-specializations'
  | 'project-source-categories'
  | 'purchase-order-draft-status'
  | 'purchase-order-status'
  | 'resource-allocation-status'
  | 'resource-unit-status'
  | 'salary-types'
  | 'tax-invoice-status'
  | 'tax-resource-types'
  | 'uom-groups'
  | 'user-types'
  | 'warehouse-types'
  | 'work-placements';

export type EnumResponse = ApiSuccessResponse<EnumOption[]>;
