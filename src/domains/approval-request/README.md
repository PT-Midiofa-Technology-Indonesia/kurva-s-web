# Approval Request

Manages approval requests: listing, viewing details, and taking approve/reject actions.

## Structure

```
approval-request/
├── api/
│   ├── get-approval-requests.ts       # GET /v1/approval-requests (paginated list)
│   ├── get-approval-request.ts        # GET /v1/approval-requests/:id (detail)
│   ├── approve-approval-request.ts    # POST /v1/approval-requests/:id/approve
│   └── reject-approval-request.ts     # POST /v1/approval-requests/:id/reject
├── components/
│   ├── ApprovalRequestRejectDrawer.tsx  # Right-side drawer for the reject action (FormGenerator pattern)
│   └── ApprovalDetailContent.tsx        # Generic detail renderer (title, summary, table) for BE `detail` field
├── hooks/
│   ├── use-approval-requests.ts             # React Query paginated list hook
│   ├── use-approval-request.ts              # React Query detail hook
│   ├── use-approve-approval-request.ts      # Approve mutation hook
│   ├── use-reject-approval-request.ts       # Reject mutation hook
│   ├── use-approval-request-page.ts         # List page orchestration hook
│   └── use-approval-request-detail-page.ts  # Detail page orchestration hook
├── pages/
│   ├── ApprovalRequestListPage.tsx    # List page with company and status filters
│   └── ApprovalRequestDetailPage.tsx  # Detail page with payload, steps, and history
├── schemas/
│   └── index.ts    # Zod schemas for approve/reject forms
├── types/
│   └── index.ts    # ApprovalRequest, ApprovalRequestDetail, ApprovalRequestStep, ApprovalRequestHistory, ApprovalDetail, DetailFormat
├── constants/
│   └── index.ts    # Labels, status options
└── index.ts        # Public barrel exports
```

## Key Files

- `api/approve-approval-request.ts` — Fires a direct approve action with no comment required
- `api/reject-approval-request.ts` — Posts rejection with a mandatory reason comment
- `components/ApprovalRequestRejectDrawer.tsx` — Drawer opened on reject; uses FormGenerator with Zod validation
- `components/ApprovalDetailContent.tsx` — Generic renderer for BE `detail` field (title, summary label:value, optional table with format-aware styling)
- `hooks/use-approval-request-detail-page.ts` — Orchestrates approve/reject actions, drawer state, and navigation for the detail page
- `pages/ApprovalRequestDetailPage.tsx` — Renders payload, approval steps, and step history; exposes approve/reject buttons

## Exports

- `ApprovalRequestListPage` — list page component
- `ApprovalRequestDetailPage` — detail page component
- `useApprovalRequests` — paginated list hook
- `useApprovalRequest` — detail hook
- `useApproveApprovalRequest` — approve mutation hook
- `useRejectApprovalRequest` — reject mutation hook
- `useApprovalRequestPage` — list page orchestration hook
- `useApprovalRequestDetailPage` — detail page orchestration hook
- `APPROVAL_REQUEST_QUERY_KEYS` — React Query key factory
- API functions: `getApprovalRequests`, `getApprovalRequest`, `approveApprovalRequest`, `rejectApprovalRequest`
- Types: `ApprovalRequest`, `ApprovalRequestDetail`, `ApprovalRequestStep`, `ApprovalRequestHistory`, `ApprovalDetail`, `DetailFormat`, `DetailSummaryItem`, `DetailTable`, `DetailTableColumn`
- Schemas and constants re-exported from `schemas/` and `constants/`

## Usage Example

```tsx
// List page
import { ApprovalRequestListPage } from '@/domains/approval-request';
<ApprovalRequestListPage />

// Detail page
import { ApprovalRequestDetailPage } from '@/domains/approval-request';
<ApprovalRequestDetailPage approvalRequestId={id} />
```
