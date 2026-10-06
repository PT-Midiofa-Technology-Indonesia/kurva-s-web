export interface BOQDetailRow {
  id: string;
  code: string;
  name: string;
  jenis: string;
  isFinalLevel: boolean;
  volumeRab?: number | null;
  volumeCco?: number | null;
  volumeActual?: number | null;
  uomName?: string | null;
  amountRab?: number | null;
  amountCco?: number | null;
  amountActual?: number | null;
  viewCostCount?: number | null;
  children: BOQDetailRow[];
}

export function mapToBOQDetailRows(items: any[]): BOQDetailRow[] {
  return (items ?? []).map((item) => ({
    id: item.id,
    code: item.code ?? '',
    name: item.name ?? '',
    jenis: item.jobItemType?.name ?? item.jenis ?? '',
    isFinalLevel: item.isFinalLevel ?? false,
    volumeRab: item.volumeRab != null ? Number(item.volumeRab) : null,
    volumeCco: item.volumeCco != null ? Number(item.volumeCco) : null,
    volumeActual: item.volumeActual != null ? Number(item.volumeActual) : null,
    uomName: item.uom?.name ?? item.uomName ?? null,
    amountRab: item.totalAmountRab != null ? Number(item.totalAmountRab) : null,
    amountCco: item.totalAmountCco != null ? Number(item.totalAmountCco) : null,
    amountActual: item.totalAmountActual != null ? Number(item.totalAmountActual) : null,
    viewCostCount: item.viewCostCount ?? null,
    children: mapToBOQDetailRows(item.children ?? []),
  }));
}
