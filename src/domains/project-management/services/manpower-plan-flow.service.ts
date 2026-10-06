import type {
  ManpowerCard,
  ManpowerPlanTreeItem,
  QcReportStatus,
} from '../types/manpower-planning';

/** Action the table's action column renders for a row — `null` renders an empty cell. */
export type ManpowerRowAction =
  | 'assign-parent'
  | 'view-parent'
  | 'assign-leaf'
  | 'selesaikan-leaf'
  | 'view-leaf'
  | null;

/**
 * Row action per Figma: locked leaves → null; both backend gates open (`canAssign` + `canComplete`)
 * → 'assign-leaf' (volume not exhausted, more manpower can be added). Pure function — no React, no
 * HTTP (unit-testable).
 */
export function getManpowerRowAction(item: ManpowerPlanTreeItem): ManpowerRowAction {
  if (item.isLeaf) {
    if (!item.isParentAssigned) return null; // gating rule #1
    // Both gates open → next-day re-assign: the backend still accepts manpower and completion.
    if (item.canAssign && item.canComplete) return 'assign-leaf';
    if (item.status === 'Selesai') return 'view-leaf';
    if (item.status === 'Progress') return 'selesaikan-leaf';
    return 'assign-leaf'; // 'Belum Assign'
  }
  return item.status === 'Belum Assign' ? 'assign-parent' : 'view-parent';
}

/**
 * Checkbox column: parents only (sticky note: "checkbox bagi child tidak ada"), and only while the
 * backend's `canAssign` gate is open — a `false` row cannot be bulk-assigned, so it renders no
 * checkbox and never enters the selection.
 */
export function isManpowerRowCheckable(item: ManpowerPlanTreeItem): boolean {
  return !item.isLeaf && item.canAssign;
}

/**
 * Edit action gate — renders next to (not instead of) the row's primary action. The backend's
 * `canEdit` alone is not enough (observed `true` on unassigned rows), so the item must ALSO be
 * assigned already: edit targets existing manpower, an unassigned row has none and must only offer
 * Assign. Pure function, same contract as `isManpowerRowCheckable`.
 */
export function isManpowerRowEditable(item: ManpowerPlanTreeItem): boolean {
  return item.canEdit && item.status !== 'Belum Assign';
}

/** Total qty assigned across manpower cards. */
export function computeTotalAssignedQty(cards: { targetQty: number }[]): number {
  return cards.reduce(
    (sum, card) => sum + (Number.isFinite(card.targetQty) ? card.targetQty : 0),
    0
  );
}

/** Remaining = BOQ volume − achieved − other cards' targets; full → disable other inputs. */
export function isTargetDisabled(
  cardIndex: number,
  cards: { targetQty: number }[],
  volume: number,
  achieved: number
): boolean {
  const total = computeTotalAssignedQty(cards);
  return total - (cards[cardIndex]?.targetQty ?? 0) + achieved >= volume;
}

/** Footer counter: cards with capaian filled OR already Diterima. */
export function computeCompletionCount(
  cards: ManpowerCard[],
  drafts: Record<string, number | null>
): number {
  return cards.filter((c) => c.reportStatus === 'Diterima' || (drafts[c.id] ?? null) !== null)
    .length;
}

/** Card protected from deletion when flagged Perlu Perbaikan. */
export function isCardDeletable(card: ManpowerCard): boolean {
  return !card.needsRepair;
}

/**
 * Employees locked out of one card's Nama select: everyone already picked on another card of the
 * same item — EXCEPT the employee of a QC-rejected (Perlu Perbaikan) card. Their old task was
 * rejected, so they may be re-assigned on a new card; employees of non-rejected cards stay locked
 * (no double assignment).
 */
export function computeTakenEmployeeIds(
  others: { employeeId: string; isRejected: boolean }[]
): Set<string> {
  return new Set(
    others.filter((other) => !other.isRejected && other.employeeId).map((other) => other.employeeId)
  );
}

/**
 * Page-header status filter: a leaf survives when its own status matches; a parent survives only as
 * a container when ANY descendant matches — non-matching leaves are dropped, and so are parents left
 * without matching descendants. Empty filter returns the input tree as-is (same reference).
 */
export function filterManpowerTreeByStatus(
  nodes: ManpowerPlanTreeItem[],
  statusFilter: string
): ManpowerPlanTreeItem[] {
  if (!statusFilter) return nodes;

  const filterByStatus = (children: ManpowerPlanTreeItem[]): ManpowerPlanTreeItem[] =>
    children.flatMap((node) => {
      if (node.isLeaf) return node.status === statusFilter ? [node] : [];

      const matchedChildren = filterByStatus(node.children ?? []);
      return matchedChildren.length > 0 ? [{ ...node, children: matchedChildren }] : [];
    });

  return filterByStatus(nodes);
}

/**
 * Client-side search over the tree — the list endpoint takes no `search`, so the page filters
 * before the status filter. Parents survive when their name/code matched or their subtree matched,
 * so the tree stays navigable. Empty search returns the input tree as-is (same reference).
 */
export function filterManpowerTreeBySearch(
  nodes: ManpowerPlanTreeItem[],
  search?: string
): ManpowerPlanTreeItem[] {
  if (!search?.trim()) return nodes;

  const q = search.toLowerCase();
  const filterNodes = (children: ManpowerPlanTreeItem[]): ManpowerPlanTreeItem[] =>
    children.flatMap((n) => {
      const kids = filterNodes(n.children ?? []);
      return n.name.toLowerCase().includes(q) || n.code.toLowerCase().includes(q) || kids.length
        ? [{ ...n, children: kids.length ? kids : (n.children ?? []) }]
        : [];
    });

  return filterNodes(nodes);
}

// ─── QC Report Flow (new flow) ────────────────────────────────────────────────

/** Action the QC table's action column renders for a row. */
export type QcRowAction = 'claim' | 'review' | 'view';

/**
 * Waiting → claim (+Lihat always available separately); Progress → review (the only state with a
 * Selesaikan button); Selesai & Ditolak → view — a rejected report has nothing to review until the
 * assignee resubmits (which flips the row back to Progress).
 */
export function getQcRowAction(row: { status: QcReportStatus }): QcRowAction {
  switch (row.status) {
    case 'Waiting':
      return 'claim';
    case 'Progress':
      return 'review';
    case 'Ditolak':
      return 'view';
    case 'Selesai':
      return 'view';
  }
}

export function isQcRowCheckable(row: { status: QcReportStatus }): boolean {
  return row.status === 'Waiting'; // bulk assign only for unassigned reports
}
