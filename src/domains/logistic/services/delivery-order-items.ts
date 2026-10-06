import type { DeliveryOrderFormValues } from '../schemas';

type FormItem = DeliveryOrderFormValues['items'][number];

export interface RawItemCatalogSource {
  id: string;
  code: string;
  name: string;
  uom?: { code: string } | null;
}

export interface RawResourceUnitSource {
  id: string;
  code: string;
  name: string;
  uom?: { code: string } | null;
}

export interface RawDeliveryOrderItemSource {
  itemType?: string | null;
  itemCatalog?: RawItemCatalogSource | null;
  resourceUnit?: RawResourceUnitSource | null;
  quantity?: number | null;
}

export interface DeliveryOrderItemIdentity {
  itemCatalogId: string;
  resourceUnitId: string;
  itemCode: string;
  itemName: string;
  uom: string;
}

export function resolveItemIdentity(item: RawDeliveryOrderItemSource): DeliveryOrderItemIdentity {
  const catalog = item.itemCatalog ?? null;
  const unit = item.resourceUnit ?? null;

  return {
    itemCatalogId: catalog?.id ?? '',
    resourceUnitId: unit?.id ?? '',
    itemCode: catalog?.code ?? unit?.code ?? '',
    itemName: catalog?.name ?? unit?.name ?? '',
    uom: catalog?.uom?.code ?? unit?.uom?.code ?? '',
  };
}

export function toFormItem(item: RawDeliveryOrderItemSource): FormItem {
  return {
    itemType: item.itemType || 'material',
    ...resolveItemIdentity(item),
    quantity: item.quantity ?? 0,
  };
}

export function getFormItemKey(item: FormItem): string | null {
  const sourceId = item.resourceUnitId || item.itemCatalogId;
  return sourceId ? `${item.itemType}:${sourceId}` : null;
}

export function aggregateItemsFromPOsAndLOs(
  purchaseOrders: { items?: FormItem[] }[] | undefined,
  loadingOrders: { items?: FormItem[] }[] | undefined
): FormItem[] {
  const itemMap = new Map<string, FormItem>();
  let unidentifiedCount = 0;

  const collect = (orders: { items?: FormItem[] }[] | undefined) => {
    orders?.forEach((order) => {
      order.items?.forEach((item) => {
        const key = getFormItemKey(item) ?? `unidentified:${unidentifiedCount++}`;
        const existing = itemMap.get(key);

        if (existing) {
          existing.quantity += item.quantity;
        } else {
          itemMap.set(key, { ...item });
        }
      });
    });
  };

  collect(purchaseOrders);
  collect(loadingOrders);

  return Array.from(itemMap.values());
}
