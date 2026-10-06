export function validateSelectedPoDraftItems(
  selectedItemIds: string[],
  itemQtyMap: Record<string, number>
): string[] {
  return selectedItemIds.filter((id) => {
    const qty = itemQtyMap[id];
    return typeof qty !== 'number' || Number.isNaN(qty) || qty <= 0;
  });
}
