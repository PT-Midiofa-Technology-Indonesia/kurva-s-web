import { useQuery } from '@tanstack/react-query';
import { enumApi } from '@/shared/api/get-enums';
import type { EnumEndpoint, EnumOption } from '@/shared/types/enum';

const DEFAULT_FALLBACK_OPTIONS: EnumOption[] = [{ label: 'No options available', value: '' }];

export const ENUM_QUERY_KEY = {
  base: ['enums'] as const,
  contractTypes: () => [...ENUM_QUERY_KEY.base, 'contract-types'] as const,
  employeeTypes: () => [...ENUM_QUERY_KEY.base, 'employee-types'] as const,
  financeReportTypes: () => [...ENUM_QUERY_KEY.base, 'finance-report-types'] as const,
  salaryTypes: () => [...ENUM_QUERY_KEY.base, 'salary-types'] as const,
  taxResourceTypes: () => [...ENUM_QUERY_KEY.base, 'tax-resource-types'] as const,
  genders: () => [...ENUM_QUERY_KEY.base, 'genders'] as const,
  userTypes: () => [...ENUM_QUERY_KEY.base, 'user-types'] as const,
  officeTypes: () => [...ENUM_QUERY_KEY.base, 'office-types'] as const,
  warehouseTypes: () => [...ENUM_QUERY_KEY.base, 'warehouse-types'] as const,
  positionSpecializations: () => [...ENUM_QUERY_KEY.base, 'position-specializations'] as const,
  companyPositionLevels: () => [...ENUM_QUERY_KEY.base, 'company-position-levels'] as const,
  workPlacements: () => [...ENUM_QUERY_KEY.base, 'work-placements'] as const,
  approvalRequestStatuses: () => [...ENUM_QUERY_KEY.base, 'approval-request-statuses'] as const,
  attendanceStatuses: () => [...ENUM_QUERY_KEY.base, 'attendance-statuses'] as const,
  deliveryOrderStatus: () => [...ENUM_QUERY_KEY.base, 'delivery-order-status'] as const,
  deliveryOrderSourceType: () => [...ENUM_QUERY_KEY.base, 'delivery-order-source-type'] as const,
  loadingOrderStatus: () => [...ENUM_QUERY_KEY.base, 'loading-order-status'] as const,
  loadingOrderSourceType: () => [...ENUM_QUERY_KEY.base, 'loading-order-source-type'] as const,
  paymentRequestStatuses: () => [...ENUM_QUERY_KEY.base, 'payment-request-status'] as const,
  paymentSourceTypes: () => [...ENUM_QUERY_KEY.base, 'payment-source-type'] as const,
  paymentMethods: () => [...ENUM_QUERY_KEY.base, 'payment-methods'] as const,
  billingTypes: () => [...ENUM_QUERY_KEY.base, 'billing-types'] as const,
  billingStatuses: () => [...ENUM_QUERY_KEY.base, 'billing-statuses'] as const,
  billingPaymentMethods: () => [...ENUM_QUERY_KEY.base, 'billing-payment-methods'] as const,
  pickupOrderStatus: () => [...ENUM_QUERY_KEY.base, 'pickup-order-status'] as const,
  pickupOrderType: () => [...ENUM_QUERY_KEY.base, 'pickup-order-type'] as const,
  projectSourceCategories: () => [...ENUM_QUERY_KEY.base, 'project-source-categories'] as const,
  purchaseOrderStatuses: () => [...ENUM_QUERY_KEY.base, 'purchase-order-status'] as const,
  purchaseOrderDraftStatuses: () =>
    [...ENUM_QUERY_KEY.base, 'purchase-order-draft-status'] as const,
  depreciationMethods: () => [...ENUM_QUERY_KEY.base, 'depreciation-methods'] as const,
  allocationTypes: () => [...ENUM_QUERY_KEY.base, 'allocation-type'] as const,
  assetRegistrationStatuses: () => [...ENUM_QUERY_KEY.base, 'asset-registration-statuses'] as const,
  costRequestStatuses: () => [...ENUM_QUERY_KEY.base, 'cost-request-status'] as const,
  costRequestTypes: () => [...ENUM_QUERY_KEY.base, 'cost-request-type'] as const,
  resourceAllocationStatuses: () => [...ENUM_QUERY_KEY.base, 'resource-allocation-status'] as const,
  resourceUnitStatuses: () => [...ENUM_QUERY_KEY.base, 'resource-unit-status'] as const,
};

export const useEnum = (endpoint: EnumEndpoint, select?: (data: EnumOption[]) => EnumOption[]) => {
  return useQuery({
    queryKey: [...ENUM_QUERY_KEY.base, endpoint],
    queryFn: () => enumApi.get(endpoint),
    select: (response) => {
      const data = response.data;
      const selected = select ? select(data) : data;
      return selected.length > 0 ? selected : DEFAULT_FALLBACK_OPTIONS;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useContractTypes = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('contract-types', select);

export const useEmployeeTypes = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('employee-types', select);

export const useSalaryTypes = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('salary-types', select);

export const useFinanceReportTypes = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('finance-report-types', select);

export const useTaxInvoiceStatuses = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('tax-invoice-status', select);

export const useTaxResourceTypes = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('tax-resource-types', select);

export const useGenders = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('genders', select);

export const useUserTypes = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('user-types', select);

export const useOfficeTypes = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('office-types', select);

export const useWarehouseTypes = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('warehouse-types', select);

export const usePositionSpecializations = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('position-specializations', select);

export const useCompanyPositionLevels = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('company-position-levels', select);

export const useUomGroups = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('uom-groups', select);

export const useWorkPlacements = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('work-placements', select);

export const useApprovalRequestStatuses = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('approval-request-statuses', select);

export const useAttendanceStatuses = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('attendance-statuses', select);

export const useDeliveryOrderStatuses = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('delivery-order-status', select);

export const useDeliveryOrderSourceTypes = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('delivery-order-source-type', select);

export const useLoadingOrderStatuses = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('loading-order-status', select);

export const useLoadingOrderSourceTypes = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('loading-order-source-type', select);

export const usePaymentRequestStatuses = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('payment-request-status', select);

export const usePaymentSourceTypes = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('payment-source-type', select);

export const usePaymentMethods = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('payment-methods', select);

export const useBillingTypes = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('billing-types', select);

export const useBillingStatuses = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('billing-statuses', select);

export const useBillingPaymentMethods = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('billing-payment-methods', select);

export const usePickupOrderStatuses = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('pickup-order-status', select);

export const usePickupOrderTypes = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('pickup-order-type', select);

export const useDepreciationMethods = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('depreciation-methods', select);

export const useAssetRegistrationStatuses = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('asset-registration-statuses', select);

export const useAllocationTypes = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('allocation-type', select);

export const useResourceAllocationStatuses = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('resource-allocation-status', select);

export const useResourceUnitStatuses = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('resource-unit-status', select);

export const useCostRequestStatuses = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('cost-request-status', select);

export const useCostRequestTypes = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('cost-request-type', select);

export const usePurchaseOrderStatuses = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('purchase-order-status', select);

export const usePurchaseOrderDraftStatuses = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('purchase-order-draft-status', select);

export const useProjectSourceCategories = (select?: (data: EnumOption[]) => EnumOption[]) =>
  useEnum('project-source-categories', select);
