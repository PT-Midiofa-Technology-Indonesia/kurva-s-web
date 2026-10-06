'use client';

import { Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Button } from '@/components/atoms';
import { ItemNotFound, PageHeader } from '@/shared/components/molecules';
import { Tabs } from '@/shared/components/molecules/Tabs';
import { VendorCapabilityList } from '../components/VendorCapabilityList';
import { VendorCatalogDetailInfo } from '../components/VendorCatalogDetailInfo';
import { VendorFleetVehicleList } from '../components/VendorFleetVehicleList';
import { VendorItemCatalogList } from '../components/VendorItemCatalogList';
import { VendorOfferingDocumentList } from '../components/VendorOfferingDocumentList';
import { VendorRatingTab } from '../components/VendorRatingTab';
import { VendorServiceCoverageList } from '../components/VendorServiceCoverageList';
import { VENDOR_CATALOG_LABELS } from '../constants';
import { useDeleteVendorCatalog } from '../hooks/use-delete-vendor-catalog';
import { useUpdateVendorCatalog } from '../hooks/use-update-vendor-catalog';
import { useVendorCatalog } from '../hooks/use-vendor-catalog';

const ConfirmDialogDynamic = dynamic(
  () =>
    import('@/shared/components/molecules/AlertDialog').then((m) => ({
      default: m.ConfirmDialog,
    })),
  { ssr: false, loading: () => null }
);

function ItemCatalogTab({ vendorId }: { vendorId: string }) {
  return <VendorItemCatalogList vendorId={vendorId} />;
}

function CapabilitiesTab({ vendorId, vendorName }: { vendorId: string; vendorName: string }) {
  return <VendorCapabilityList vendorId={vendorId} vendorName={vendorName} />;
}

function ServiceCoverageTab({ vendorId, vendorName }: { vendorId: string; vendorName: string }) {
  return <VendorServiceCoverageList vendorId={vendorId} vendorName={vendorName} />;
}

function OfferingDocumentTab({ vendorId, vendorName }: { vendorId: string; vendorName: string }) {
  return <VendorOfferingDocumentList vendorId={vendorId} vendorName={vendorName} />;
}

function FleetTab({ vendorId, vendorName }: { vendorId: string; vendorName: string }) {
  return <VendorFleetVehicleList vendorId={vendorId} vendorName={vendorName} />;
}

export function DetailVendorCatalogPage() {
  const params = useParams<{ id?: string }>();
  const resolvedVendorId = params.id ?? '';
  const router = useRouter();
  const { data: vendorData, isLoading } = useVendorCatalog(resolvedVendorId);
  const { mutate: updateVendorCatalog, isPending: isUpdatingStatus } = useUpdateVendorCatalog();
  const { mutate: deleteVendorCatalog } = useDeleteVendorCatalog();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(false);

  const handleBack = () => router.push('/vendor-management/vendor-catalog');
  const handleEdit = () =>
    router.push(`/vendor-management/vendor-catalog/${resolvedVendorId}/edit`);

  const handleStatusToggle = (isActive: boolean) => {
    setPendingStatus(isActive);
    setIsStatusDialogOpen(true);
  };

  const handleStatusCancel = () => {
    setIsStatusDialogOpen(false);
  };

  const handleStatusConfirm = () => {
    updateVendorCatalog(
      { id: resolvedVendorId, payload: { isActive: pendingStatus } },

      {
        onSuccess: () => {
          setIsStatusDialogOpen(false);
        },
        onError: () => {
          setIsStatusDialogOpen(false);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteVendorCatalog(resolvedVendorId, {
      onSuccess: () => router.push('/vendor-management/vendor-catalog'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="h-10 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-96 animate-pulse rounded-lg bg-slate-100" />
      </div>
    );
  }

  const vendor = vendorData?.data ?? null;

  if (!vendor) {
    return <ItemNotFound message={VENDOR_CATALOG_LABELS.DETAIL.NOT_FOUND} onBack={handleBack} />;
  }

  const tabItems = [
    {
      key: 'item-catalog',
      label: 'Item Catalog',
      content: <ItemCatalogTab vendorId={resolvedVendorId} />,
    },
    {
      key: 'capabilities',
      label: 'Capabilities',
      content: <CapabilitiesTab vendorId={resolvedVendorId} vendorName={vendor.name} />,
    },
    {
      key: 'service-coverage',
      label: 'Service Coverage',
      content: <ServiceCoverageTab vendorId={resolvedVendorId} vendorName={vendor.name} />,
    },
    {
      key: 'offering-document',
      label: 'Offering Document',
      content: <OfferingDocumentTab vendorId={resolvedVendorId} vendorName={vendor.name} />,
    },
    {
      key: 'fleet',
      label: 'Fleet',
      content: <FleetTab vendorId={resolvedVendorId} vendorName={vendor.name} />,
    },
    {
      key: 'rating',
      label: VENDOR_CATALOG_LABELS.RATING.TITLE,
      content: <VendorRatingTab vendorId={resolvedVendorId} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={VENDOR_CATALOG_LABELS.DETAIL.PAGE_TITLE}
        onBack={handleBack}
        actions={
          <Button
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
            className="h-9 px-4 text-sm gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {VENDOR_CATALOG_LABELS.DETAIL.DELETE_BUTTON}
          </Button>
        }
      />

      <VendorCatalogDetailInfo
        vendor={vendor}
        vendorId={resolvedVendorId}
        onEdit={handleEdit}
        onStatusToggle={handleStatusToggle}
      />

      <div className="rounded-lg border bg-white">
        <Tabs items={tabItems} defaultActiveKey="item-catalog" />
      </div>

      <Suspense fallback={null}>
        {isDeleteOpen && (
          <ConfirmDialogDynamic
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            variant="danger"
            title={VENDOR_CATALOG_LABELS.DIALOG.DELETE_TITLE}
            description={VENDOR_CATALOG_LABELS.DIALOG.DELETE_DESCRIPTION}
            cancelText="Cancel"
            confirmText="Delete"
            onCancel={() => setIsDeleteOpen(false)}
            onConfirm={handleDelete}
          />
        )}
        {isStatusDialogOpen && (
          <ConfirmDialogDynamic
            open={isStatusDialogOpen}
            onOpenChange={handleStatusCancel}
            variant="default"
            title={VENDOR_CATALOG_LABELS.DETAIL.DIALOG.CHANGE_STATUS_TITLE}
            description={VENDOR_CATALOG_LABELS.DETAIL.DIALOG.CHANGE_STATUS_DESCRIPTION}
            cancelText={VENDOR_CATALOG_LABELS.DETAIL.DIALOG.CHANGE_STATUS_CANCEL}
            confirmText={VENDOR_CATALOG_LABELS.DETAIL.DIALOG.CHANGE_STATUS_CONFIRM}
            onCancel={handleStatusCancel}
            onConfirm={handleStatusConfirm}
            isLoading={isUpdatingStatus}
          />
        )}
      </Suspense>
    </div>
  );
}
