# Procurement Domain

Purchase Request → Purchase Planning → Purchase Order → **Goods Receipt**.

## Goods Receipt

Confirms physical receipt of goods against a `in_transit` Delivery Order (1 DO ↔ 1 GR). On
create, the backend cascades: `stock_movements` (in), DO status → `received`, PO
`received_quantity` (if sourced from a PO), and shipping-cost distribution. The frontend only
collects the form and renders the result — all cascades happen server-side.

### Structure

- `types/goods-receipt.ts` — `GoodsReceiptListItem`, `SelectableDo(Detail)`,
  `GoodsReceiptDetail`, `CreateGoodsReceiptPayload`. The API mixes casing: list/create
  responses are camelCase, `selectable-dos/{id}` items and the create request body are
  snake_case — types mirror the wire format exactly.
- `schemas/goods-receipt.ts` — `goodsReceiptSchema`. Enforces `quantityReceived ≤ doQty`
  (BR-GR02) and `quantityRejected ≤ quantityReceived` (BR-GR10) per row.
- `services/build-goods-receipt-payload.ts` — pure form-values → snake_case payload mapper.
  Drops `received_by` (backend defaults it to the current user) and empty notes fields.
- `api/get-goods-receipts.ts`, `get-selectable-dos.ts`, `get-selectable-do-detail.ts`,
  `create-goods-receipt.ts`, `get-goods-receipt-detail.ts` (`GET /goods-receipts/{id}`) — one
  file per operation.
- `hooks/use-goods-receipts.ts` — exports `GOODS_RECEIPT_QUERY_KEYS`, `useGoodsReceipts`,
  `useGoodsReceiptDetail(id, companyId)`. Plus `use-selectable-dos.ts`,
  `use-selectable-do-detail.ts`, `use-create-goods-receipt.ts`, `use-goods-receipt-page.ts`
  (list orchestration).
- `components/GoodsReceiptForm.tsx` — header via `FormGenerator`, items table via
  `FieldArrayTable` synced from the selected DO's preview.
- `pages/GoodsReceiptListPage.tsx`, `GoodsReceiptCreatePage.tsx`, `GoodsReceiptDetailPage.tsx`.

`GoodsReceiptDetailPage` always fetches its own data from `GET /goods-receipts/{id}` — the
response already carries item-level `quantityReceived/Rejected/Net`, so no other source (list
endpoint, DO preview, create-response cache) needs to be consulted. `useCreateGoodsReceipt`
still seeds this query's cache via `setQueryData` right after `POST /goods-receipts` purely as
an optimization to avoid a redundant round trip on the create → detail redirect; `staleTime:
Infinity` on the query is intentional (a GR is immutable once created, BR-GR11) and safe either
way since a fresh fetch would return byte-identical data.

### Business rules

| Code    | Rule                                                                    |
| ------- | ----------------------------------------------------------------------- |
| BR-GR01 | 1 DO ↔ 1 GR — enforced by `selectable-dos` only listing un-received DOs |
| BR-GR02 | `quantity_received` ≤ DO item quantity — hard blocked client-side       |
| BR-GR10 | Rejected qty is recorded but never added to stock                       |
| BR-GR11 | No edit/cancel after commit — detail page is fully read-only            |

## Local Tax Calculation

Any component that computes tax amounts locally (no backend-precomputed `taxAmount`) must
follow one rule so the displayed rows always add up to the displayed total:

- **Round per tax item with `Math.round`, then sum the rounded values.**

Helpers live in `services/tax-rounding.ts` (`roundTaxAmount`, `sumRoundedTaxAmounts`), covered
by `services/__tests__/tax-rounding.test.ts`.

- `PoTaxSection.tsx` (Purchase Planning Step 5 Finalize): `roundTaxAmount((baseAmount * rate) / 100)` per tax.
- `PurchaseOrderDetailPage.tsx` (PO Detail invoice summary): `roundTaxAmount(tax.taxAmount)` per invoice tax; total menggunakan `detail.grandTotal`; DPP dari `detail.totalAmount`.

Why: without per-item rounding, unrounded floats (277.5, 610.5, …) sum to 6.554 while each
displayed row rounds to 278 + 611 + … = 6.555. `formatIDR` shows whole rupiah, so the rows and
the total must agree.

Only these two components calculate locally. All other `v1/tax-types` consumers
(`PurchaseOrderInvoiceDrawer`, finance billing `Step4Payment`, `BillingRecordDetailPage`) pick
tax types/rates for input or display backend-precomputed amounts — no local math.
