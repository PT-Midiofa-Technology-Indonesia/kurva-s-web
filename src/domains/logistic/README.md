# Logistic Domain

Delivery Order management — list pages and detail pages for DO, Inbound, Outbound.
Loading Order and Pickup Order — company-scoped list, detail, create, and status-action flows.

## Structure

```
logistic/
├── api/
│   ├── get-delivery-orders.ts       # GET /v1/logistic/delivery-orders (list + detail)
│   ├── delete-do-purchase-order.ts  # DELETE /v1/logistic/delivery-orders/:id/purchase-orders/:poId
│   ├── index.ts
│   └── __tests__/                   # Unit tests (X-Company-Id header, path, params)
├── loading-order/
├── pickup-order/
├── hooks/
│   ├── use-delivery-orders.ts       # useDeliveryOrders + useDeliveryOrderDetail queries
│   ├── use-delivery-order-page.ts   # List page orchestration hook
│   ├── use-delete-do-po.ts          # Delete PO mutation
│   └── index.ts
├── components/
│   └── delivery-order-columns.tsx    # Shared column definitions (configurable source/destination)
├── pages/
│   ├── DeliveryOrderListPage.tsx     # List page — used by DO, Inbound, Outbound
│   ├── DeliveryOrderDetailPage.tsx   # Detail page — used by Inbound & Outbound
│   ├── DoDetailPage.tsx             # Detail page — used by Delivery Order (with PO table + edit)
│   └── __tests__/                   # Integration tests
├── services/
│   ├── delivery-order-items.ts      # Item identity resolution + item aggregation (pure)
│   └── __tests__/
├── types/
│   └── index.ts                     # RawDeliveryOrder, DeliveryOrder, mappers
├── constants/
│   └── index.tsx                    # Status options, labels, page configs, badges
├── index.ts                         # Public barrel exports
└── README.md
```

## Exports

```ts
import {
  // Pages
  DeliveryOrderListPage,     // type: 'do' | 'inbond' | 'outbond'
  DeliveryOrderDetailPage,   // id + type for inbound/outbound
  DoDetailPage,              // id for delivery-order (with PO table + delete)

  // Types
  DeliveryOrder,
  DeliveryOrderType,         // 'do' | 'inbond' | 'outbond'
  DeliveryOrderCompany,
  DeliveryOrderWarehouse,
  DeliveryOrderItem,
  DeliveryOrderItemCatalog,
  DeliveryOrderPurchaseOrder,

  // Constants
  LOGISTIC_PAGE_CONFIGS,
  LOGISTIC_LABELS,
} from '@/domains/logistic';
```

## Delivery Order items: catalog vs resource unit

A DO item identifies its goods through **one of two** relations, never both:

- `itemCatalog` — a catalogued material (`itemType: 'material'`).
- `resourceUnit` — a registered equipment unit (`itemType: 'equipment'`).

Both carry their own `uom`, so the resolver reads `itemCatalog.uom` first and falls back to
`resourceUnit.uom`.

A Loading Order created from a resource allocation yields equipment items, so any
`transfer_warehouse` DO can contain them. `services/delivery-order-items.ts` is the single
place that resolves an item to its code/name/uom — form mapping, item aggregation, and the
detail table all go through it, so a new item relation is handled in one edit.

Aggregation keys on `itemType` + the resolved source id (`resourceUnitId` or `itemCatalogId`),
not on `itemCatalogId` alone: equipment items have no catalog id, so keying on the catalog
merged every unit into one row and summed their quantities. Items that resolve to no id at all
are deliberately never merged with each other.

`other_source` is the exception — items there are picked straight from the item catalog, even
when the goods are equipment, because such goods have no resource unit registered yet. That
flow therefore only ever sends `itemCatalogId`.

Status filter options come from `useDeliveryOrderStatuses()` (`@/shared/hooks/use-enums`), backed by `GET /enums/delivery-order-status`.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /v1/logistic/delivery-orders | List delivery orders (?type=do/inbond/outbond) |
| GET | /v1/logistic/delivery-orders/:id | Detail delivery order |
| DELETE | /v1/logistic/delivery-orders/:id/purchase-orders/:poId | Remove PO from DO |

All endpoints accept `X-Company-Id` header.

## Tests

```bash
# Run all logistic tests
pnpm run test src/domains/logistic

# Run specific test
pnpm run test src/domains/logistic/api/__tests__/get-delivery-orders.test.ts
```

## Mocks

MSW handlers in `src/mocks/domains/logistic.ts`. Import and register in `src/mocks/handlers.ts`.
