'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { EllipsisVertical, Pencil, PlusIcon, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button, Switch } from '@/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Separator } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { COMMON_LABELS } from '@/shared/constants';
import { VENDOR_CATALOG_LABELS } from '../constants';
import { useVendorCapability } from '../hooks/use-vendor-capability';
import { useVendorCapabilityPage } from '../hooks/use-vendor-capability-page';
import type { VendorCapability } from '../types';
import { VendorCapabilityFormDrawer } from './VendorCapabilityFormDrawer';

function StatusCell({
  item,
  onToggle,
}: {
  item: VendorCapability;
  onToggle: (item: VendorCapability, value: boolean) => void;
}) {
  return (
    <Switch
      checked={item.isActive}
      onCheckedChange={(checked) => onToggle(item, checked)}
      size="sm"
      showLabel
      label={item.isActive ? COMMON_LABELS.STATUS.ACTIVE : COMMON_LABELS.STATUS.INACTIVE}
      labelPosition="right"
    />
  );
}

function ActionsCell({
  item,
  onEdit,
  onDeleteClick,
}: {
  item: VendorCapability;
  onEdit: (item: VendorCapability) => void;
  onDeleteClick: (item: VendorCapability) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <EllipsisVertical className="h-4 w-4 text-slate-950" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(item)}>
          <Pencil className="mr-2 h-4 w-4" />
          {VENDOR_CATALOG_LABELS.CAPABILITY.ACTIONS.EDIT}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={() => onDeleteClick(item)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {VENDOR_CATALOG_LABELS.CAPABILITY.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface VendorCapabilityListProps {
  vendorId: string;
  vendorName: string;
}

export function VendorCapabilityList({ vendorId, vendorName }: VendorCapabilityListProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [search, setSearch] = useState('');
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<{
    item: VendorCapability;
    isActive: boolean;
  } | null>(null);

  const params = useMemo(
    () => ({
      vendorId,
      page,
      perPage,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
      search: search || undefined,
    }),
    [vendorId, page, perPage, search]
  );

  const {
    items,
    totalItems,
    totalPages,
    isLoading,
    isError,
    isSaving,
    isUpdating,
    deleteTarget,
    setDeleteTarget,
    editTarget,
    isDrawerOpen,
    handleAdd,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleStatusToggle,
    handleDrawerClose,
    handleSave,
  } = useVendorCapabilityPage({ params });

  // Fetch vendor-capability detail when editing and drawer is open
  const { data: detailData } = useVendorCapability(
    isDrawerOpen && editTarget ? editTarget.id : null
  );

  const handleStatusRequest = useCallback((item: VendorCapability, isActive: boolean) => {
    setPendingStatus({ item, isActive });
    setIsStatusDialogOpen(true);
  }, []);

  const handleStatusCancel = useCallback(() => {
    setIsStatusDialogOpen(false);
  }, []);

  const handleStatusConfirm = useCallback(() => {
    if (!pendingStatus) return;
    handleStatusToggle(pendingStatus.item, pendingStatus.isActive);
    setIsStatusDialogOpen(false);
  }, [pendingStatus, handleStatusToggle]);

  const columns = useMemo<ColumnDef<VendorCapability>[]>(
    () => [
      {
        accessorKey: 'code',
        header: VENDOR_CATALOG_LABELS.CAPABILITY.COLUMNS.CODE,
        size: 120,
        cell: ({ row }) => row.original.skillCatalog?.code ?? '-',
      },
      {
        accessorKey: 'name',
        header: VENDOR_CATALOG_LABELS.CAPABILITY.COLUMNS.NAME,
        size: 320,
        cell: ({ row }) => row.original.skillCatalog?.name ?? '-',
      },
      {
        id: 'status',
        header: VENDOR_CATALOG_LABELS.CAPABILITY.COLUMNS.STATUS,
        size: 140,
        enableSorting: false,
        cell: ({ row }) => <StatusCell item={row.original} onToggle={handleStatusRequest} />,
      },
      {
        id: 'actions',
        header: VENDOR_CATALOG_LABELS.CAPABILITY.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <ActionsCell item={row.original} onEdit={handleEdit} onDeleteClick={handleDeleteClick} />
        ),
      },
    ],
    [handleDeleteClick, handleEdit, handleStatusRequest]
  );

  const handleSearchChange = (value: string | undefined) => {
    setSearch(value ?? '');
    setPage(1);
  };

  const handlePaginationChange = (newPage: number, newPerPage: number) => {
    setPage(newPage);
    setPerPage(newPerPage);
  };

  return (
    <>
      <ListPageTemplate<VendorCapability>
        title={VENDOR_CATALOG_LABELS.CAPABILITY.TITLE}
        headerActions={
          <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
            {VENDOR_CATALOG_LABELS.CAPABILITY.ADD_BUTTON}
          </Button>
        }
        data={items}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={VENDOR_CATALOG_LABELS.CAPABILITY.EMPTY}
        search={search}
        onSearchChange={handleSearchChange}
        page={page}
        perPage={perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={handlePaginationChange}
        pageSizeOptions={[5, 10, 20, 50, 100]}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={VENDOR_CATALOG_LABELS.CAPABILITY.DIALOG.DELETE_TITLE}
        description={VENDOR_CATALOG_LABELS.CAPABILITY.DIALOG.DELETE_DESCRIPTION}
        cancelText="Cancel"
        confirmText="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmDialog
        open={isStatusDialogOpen}
        onOpenChange={handleStatusCancel}
        variant="default"
        title={VENDOR_CATALOG_LABELS.CAPABILITY.DIALOG.CHANGE_STATUS_TITLE}
        description={VENDOR_CATALOG_LABELS.CAPABILITY.DIALOG.CHANGE_STATUS_DESCRIPTION}
        cancelText={VENDOR_CATALOG_LABELS.CAPABILITY.DIALOG.CHANGE_STATUS_CANCEL}
        confirmText={VENDOR_CATALOG_LABELS.CAPABILITY.DIALOG.CHANGE_STATUS_CONFIRM}
        onCancel={handleStatusCancel}
        onConfirm={handleStatusConfirm}
        isLoading={isUpdating}
      />

      <VendorCapabilityFormDrawer
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        vendorId={vendorId}
        vendorName={vendorName}
        editItem={editTarget}
        detailData={detailData}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </>
  );
}
