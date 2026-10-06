export function computeTotalAmount(items: { amount: number }[]): number {
  return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}
