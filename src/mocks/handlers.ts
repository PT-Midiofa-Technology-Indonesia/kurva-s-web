/**
 * MSW Handlers — Centralized Import of Domain-Specific Handlers
 *
 * ⚠️ IMPORTANT: When adding/removing domains, update the corresponding file in:
 *   - src/mocks/domains/<domain>.ts
 *
 * Structure:
 *   - domains/role-permissions.ts — Roles and permissions handlers
 *   - domains/manpower.ts — Employee/manpower handlers
 *   - domains/uom.ts — Unit of Measure handlers
 *   - domains/auth.ts — Authentication handlers
 *   - domains/geography.ts — Geographic data handlers
 *   - domains/enums.ts — Enum/dropdown data handlers
 *   - domains/generic.ts — Generic paginated list/detail/CRUD handlers for all other domains
 *   - domains/prospect-document.ts — Prospect stage document handlers
 *   - domains/approval-group.ts — Approval group handlers
 *   - domains/approval-request.ts — Approval request handlers
 *   - domains/approval-workflow.ts — Approval workflow handlers
 *   - domains/procurement.ts — Purchase Request cost-rows/manual/bundle handlers
 */

import { approvalGroupHandlers } from './domains/approval-group';
import { approvalRequestHandlers } from './domains/approval-request';
import { approvalWorkflowHandlers } from './domains/approval-workflow';
import { authHandlers } from './domains/auth';
import { enumHandlers } from './domains/enums';
import { genericHandlers } from './domains/generic';
import { geographyHandlers } from './domains/geography';
import { leaveHandlers } from './domains/leave';
import { logisticHandlers } from './domains/logistic';
import { manpowerHandlers } from './domains/manpower';
import { procurementHandlers } from './domains/procurement';
import { projectControlHandlers } from './domains/project-control';
import { prospectHandlers } from './domains/prospect';
import { prospectDocumentHandlers } from './domains/prospect-document';
import { resourceManagementHandlers } from './domains/resource-management';
import { rolePermissionsHandlers } from './domains/role-permissions';
import { uomHandlers } from './domains/uom';
import { userHandlers } from './domains/users';

export const handlers = [
  ...authHandlers,
  ...rolePermissionsHandlers,
  ...approvalGroupHandlers,
  ...manpowerHandlers,
  ...uomHandlers,
  ...geographyHandlers,
  ...enumHandlers,
  ...userHandlers,
  ...approvalRequestHandlers,
  ...approvalWorkflowHandlers,
  ...prospectDocumentHandlers,
  ...prospectHandlers,
  ...leaveHandlers,
  ...logisticHandlers,
  ...projectControlHandlers,
  ...procurementHandlers,
  ...resourceManagementHandlers,
  // Generic handlers (catch-all for remaining domains)
  ...genericHandlers,
];
