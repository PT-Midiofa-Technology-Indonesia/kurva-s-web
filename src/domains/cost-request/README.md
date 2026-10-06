# Cost Request

Domain for **Expense Management > Cost Request** — Admin-recorded employee expense reimbursements
(transport, meals, accommodation, etc.), either tied to an active Project or general
(Non-Project). Each Cost Request has 1+ line items (description, amount, receipt number, optional
proof files). Submitting a Cost Request auto-creates a linked `payment_request` server-side
(Finance-side processing UI is **out of scope** for this domain).

## Structure

```
cost-request/
├── api/
│   ├── cancel-cost-request.ts    # POST /cost-requests/:id/cancel
│   ├── create-cost-request.ts    # POST /cost-requests (multipart)
│   ├── get-cost-request.ts       # GET /cost-requests/:id (see Open Questions)
│   ├── get-cost-requests.ts      # GET /cost-requests (paginated list)
│   └── update-cost-request.ts    # PUT /cost-requests/:id (multipart, header-only fields)
├── components/
│   ├── CancelCostRequestDialog.tsx       # Fixed-copy ConfirmDialog wrapper
│   ├── CostRequestActionsCell.tsx        # List-row kebab menu (Detail/Cancel)
│   ├── CostRequestFormModal.tsx          # Create AND Edit form (Dialog) — same dialog, both flows
│   ├── CostRequestItemAccordionList.tsx  # Dumb: renders item cards + proof files
│   ├── CostRequestItemStagingRow.tsx     # Dumb: staged item inputs + "+ Add Item"
│   ├── CostRequestSummaryFooter.tsx      # Dumb: total amount + action buttons slot
│   └── CreateCostRequestSplitButton.tsx  # "Create Cost Request" dropdown: Project/Non Project
├── constants/
│   └── index.ts                          # Labels, status/type badge maps, payment method options
├── hooks/
│   ├── use-cancel-cost-request.ts        # Cancel mutation (shared by list row + detail page)
│   ├── use-cost-request.ts               # Single detail query
│   ├── use-cost-request-detail-page.ts   # Detail page orchestration (fetch, edit-modal toggle, cancel)
│   ├── use-cost-request-form-modal.ts    # Shared create/edit form + submit orchestration
│   ├── use-cost-request-items-builder.ts # useFieldArray glue for the items staging/list UX
│   ├── use-cost-request-list-page.ts     # List page orchestration (filters, sort, cancel)
│   ├── use-cost-request-permission.ts    # Isolated `manage_cost_request` permission check (currently unused — see Key decisions)
│   ├── use-cost-requests.ts              # Paginated list query (defines COST_REQUEST_QUERY_KEYS)
│   ├── use-create-cost-request.ts        # Create mutation
│   └── use-update-cost-request.ts        # Update mutation
├── pages/
│   ├── CostRequestDetailPage.tsx
│   └── CostRequestListPage.tsx
├── schemas/
│   └── index.ts                  # costRequestItemSchema, createCostRequestSchema, editCostRequestHeaderSchema
├── services/
│   ├── build-cost-request-form-data.ts   # Pure: form values -> multipart FormData
│   └── compute-total-amount.ts           # Pure: SUM(items.amount)
└── types/
    └── index.ts                  # CostRequest, CostRequestItem, CostRequestStatus, ...
```

## Key decisions

- **No global "selected company" store.** Company scoping is page-local (`companyId` query param
  driving an `X-Company-Id` header on every API call), matching `leave`, `approval-request`, etc.
  — not a shared Zustand store like the project portal's `useSelectedProjectStore`.
- **Request type is chosen before the modal opens** (via `CreateCostRequestSplitButton`'s
  dropdown for create, or fixed from the existing record for edit), not as a field/toggle inside
  the modal — the Project select is only rendered at all when the request type is `'project'`.
- **Edit reuses the Create dialog.** Per explicit product decision, `CostRequestDetailPage`'s Edit
  button opens the same `CostRequestFormModal` used by Create (passing `costRequest` instead of
  `requestType`) rather than an inline in-page edit form. In edit mode, Project/Employee become
  disabled (immutable per the confirmed `PUT` contract) but stay visible for context.
- **No dedicated `/403` page.** `use-cost-request-permission.ts` implements the isolated
  `manage_cost_request` check, but is currently **not wired into any page** — the `manage_cost_request`
  permission isn't seeded in test environments yet, and gating on it silently hid the Create button/dialog
  with no explanation. Re-enable once the permission is confirmed to exist and be granted correctly.
- **No Payment Request UI.** `payment_request` creation/cancellation is a server-side side effect
  of Cost Request submit/cancel; no Finance-facing list/detail page is built here.

## Open questions (flagged in code, verify with backend before relying on them)

- `GET /cost-requests/:id` was not part of the confirmed API contract (only list/create/update/
  cancel were) — assumed to exist at the conventional path.
- `PUT /cost-requests/:id` items[] semantics (full replace vs patch, proof survival for untouched
  items) are unconfirmed — see the `// TODO(backend-confirm)` markers in
  `services/build-cost-request-form-data.ts` and `api/update-cost-request.ts`. Do not wire item
  content edits to production until answered.
- `paymentMethod` options are hardcoded in `constants/index.ts` (`cash`/`transfer`/`check`) pending
  confirmation of whether a dedicated options endpoint exists.
