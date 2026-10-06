import type { NotificationItem } from '../types';

/**
 * resourceType -> detail route builder.
 *
 * Only `approval_request` is confirmed from the API contract; the payment
 * request / billing keys are defensive candidates — an unmatched
 * resourceType simply falls back to the type-based list route below.
 */
const RESOURCE_TYPE_DETAIL_ROUTES: Record<string, (resourceId: string) => string> = {
  approval_request: (resourceId) => `/approval-management/approval-request/${resourceId}`,
  payment_request: (resourceId) => `/finance/payment-requests/${resourceId}`,
  billing: (resourceId) => `/finance/billings/${resourceId}`,
  billing_record: (resourceId) => `/finance/billings/${resourceId}`,
  finance_billing: (resourceId) => `/finance/billings/${resourceId}`,
};

/** type -> list route fallback when no detail route matches. */
const TYPE_LIST_ROUTES: Record<string, string> = {
  approval: '/approval-management/approval-request',
  payment_request: '/finance/payment-requests',
  payment: '/finance/payment-requests',
  billing: '/finance/billings',
};

/**
 * Resolve the route a notification should navigate to.
 *
 * Precedence: resourceType detail route (with resourceId) > type list route.
 * Returns null when neither matches — the caller should only mark it read.
 */
export function getNotificationTargetPath(notification: NotificationItem): string | null {
  if (notification.resourceType && notification.resourceId) {
    const buildDetailRoute = RESOURCE_TYPE_DETAIL_ROUTES[notification.resourceType];
    if (buildDetailRoute) {
      return buildDetailRoute(notification.resourceId);
    }
  }
  return TYPE_LIST_ROUTES[notification.type] ?? null;
}
