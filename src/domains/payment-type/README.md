# Payment Type

Domain for managing payment type master data — the payment methods available for use across the system (e.g. cash, bank transfer).

## Structure

```
payment-type/
├── api/
│   ├── create-payment-type.ts    # POST /v1/payment-types
│   ├── delete-payment-type.ts    # DELETE /v1/payment-types/:id
│   ├── get-payment-type.ts       # GET /v1/payment-types/:id
│   ├── get-payment-types.ts      # GET /v1/payment-types (paginated list)
│   └── update-payment-type.ts    # PUT /v1/payment-types/:id
├── components/
│   ├── PaymentTypeDetailDrawer.tsx  # Read-only detail drawer
│   └── PaymentTypeForm.tsx          # Shared create/edit form
├── constants/
│   └── index.ts                     # Labels, form field configs
├── hooks/
│   ├── use-create-payment-type-page.ts  # Create page orchestration
│   ├── use-create-payment-type.ts       # Create mutation
│   ├── use-delete-payment-type.ts       # Delete mutation
│   ├── use-edit-payment-type-page.ts    # Edit page orchestration
│   ├── use-payment-type-page.ts         # List page orchestration
│   ├── use-payment-type.ts              # Single item query
│   ├── use-payment-types.ts             # Paginated list query (defines PAYMENT_TYPE_QUERY_KEYS)
│   └── use-update-payment-type.ts       # Update mutation
├── pages/
│   ├── __tests__/
│   │   ├── CreatePaymentTypePage.integration.test.tsx
│   │   ├── EditPaymentTypePage.integration.test.tsx
│   │   └── PaymentTypeListPage.integration.test.tsx
│   ├── CreatePaymentTypePage.tsx
│   ├── EditPaymentTypePage.tsx
│   └── PaymentTypeListPage.tsx
├── schemas/
│   └── index.ts                  # Zod validation schemas
├── types/
│   └── index.ts                  # PaymentType, PaymentTypeListItem
└── index.ts                      # Barrel exports
```

## Key Files

- `api/get-payment-types.ts` — paginated list with filters (`page`, `perPage`, `search`, `isActive`)
- `api/get-payment-type.ts` — fetch single payment type by id
- `hooks/use-payment-types.ts` — React Query list hook; defines `PAYMENT_TYPE_QUERY_KEYS`
- `hooks/use-payment-type-page.ts` — full list-page logic (search, filter, drawer, delete)
- `hooks/use-create-payment-type-page.ts` — create-page form submission logic
- `hooks/use-edit-payment-type-page.ts` — edit-page pre-fill and submission logic
- `components/PaymentTypeForm.tsx` — shared form for create and edit
- `components/PaymentTypeDetailDrawer.tsx` — read-only detail view with status toggle
- `types/index.ts` — `PaymentType` (`id`, `code`, `name`, `description`, `isActive`, `createdAt`, `updatedAt`), `PaymentTypeListItem`

## Exports

- `getPaymentTypes` / `getPaymentType` / `createPaymentType` / `updatePaymentType` / `deletePaymentType` — API functions
- `usePaymentTypes` / `usePaymentType` — query hooks
- `useCreatePaymentType` / `useUpdatePaymentType` / `useDeletePaymentType` — mutation hooks
- `usePaymentTypePage` / `useCreatePaymentTypePage` / `useEditPaymentTypePage` — page orchestration hooks
- `PaymentTypeForm` / `PaymentTypeDetailDrawer` — UI components
- `PaymentTypeListPage` / `CreatePaymentTypePage` / `EditPaymentTypePage` — page components
- `PaymentType` / `PaymentTypeListItem` — TypeScript types

## Routes

| Route | Page |
|---|---|
| `/master-data/payment-type` | `PaymentTypeListPage` |
| `/master-data/payment-type/create` | `CreatePaymentTypePage` |
| `/master-data/payment-type/:id/edit` | `EditPaymentTypePage` |

## Usage Example

```tsx
import { usePaymentTypes, useCreatePaymentType } from '@/domains/payment-type';

function PaymentTypeSelector() {
  const { data, isLoading } = usePaymentTypes({ isActive: true });
  // ...
}
```
