# Approval Workflow

Manages approval workflow configurations per company — each workflow defines an ordered sequence of approval steps for a specific business module.

## Structure

```
approval-workflow/
├── api/
│   ├── get-approval-workflows.ts    # GET /v1/approval-workflows (list, filtered by companyId)
│   ├── get-approval-workflow.ts     # GET /v1/approval-workflows/:id (detail with steps)
│   ├── get-approver-options.ts      # GET options for approver selection (roles, departments)
│   ├── get-pic-options.ts           # GET options for PIC selection
│   └── update-approval-workflow.ts  # PUT /v1/approval-workflows/:id (update steps)
├── components/
│   └── ApprovalWorkflowSettingsDrawer.tsx  # Right-side drawer for editing workflow steps
├── hooks/
│   ├── use-approval-workflows.ts      # React Query list hook (disabled until companyId is set)
│   ├── use-approval-workflow.ts       # React Query detail hook
│   ├── use-approver-options.ts        # Hook for approver role/department options
│   ├── use-pic-options-infinite.ts    # Infinite scroll hook for PIC options
│   ├── use-update-approval-workflow.ts # Update mutation hook
│   └── use-approval-workflow-page.ts  # Page orchestration hook (company filter, drawer state)
├── pages/
│   └── ApprovalWorkflowListPage.tsx   # List page with company selector and settings drawer
├── schemas/
│   └── index.ts    # Zod schemas for the settings form
├── types/
│   └── index.ts    # ApprovalWorkflow, ApprovalWorkflowStep, and related types
├── constants/
│   └── index.ts    # Labels, STATUS_OPTIONS, APPROVER_TYPE_OPTIONS
└── index.ts        # Public barrel exports
```

## Key Files

- `api/get-approver-options.ts` — Returns role and department options used to populate the approver select in each step row
- `api/get-pic-options.ts` — Returns PIC options for infinite-scroll select
- `components/ApprovalWorkflowSettingsDrawer.tsx` — Fetches full workflow detail (including steps), renders a `useFieldArray` form; approver options are derived from `useApproverOptions` based on `approverType`
- `hooks/use-approval-workflows.ts` — Kept disabled (`enabled: false`) until a `companyId` query param is present
- `hooks/use-pic-options-infinite.ts` — Infinite scroll hook for PIC select in the settings drawer

## Exports

- `ApprovalWorkflowListPage` — list page component
- `useApprovalWorkflows` — paginated list hook
- `useApprovalWorkflow` — detail hook
- `useApproverOptions` — approver options hook
- `usePicOptionsInfinite` — infinite PIC options hook
- `useUpdateApprovalWorkflow` — update mutation hook
- `useApprovalWorkflowPage` — page orchestration hook
- API functions: `getApprovalWorkflows`, `getApprovalWorkflow`, `getApproverOptions`, `getPicOptions`, `updateApprovalWorkflow`
- Schemas and constants re-exported from `schemas/` and `constants/`
- Types re-exported from `types/`

## Usage Example

```tsx
import { ApprovalWorkflowListPage } from '@/domains/approval-workflow';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <ApprovalWorkflowListPage />
    </Suspense>
  );
}
```
