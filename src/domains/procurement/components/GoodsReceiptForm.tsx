'use client';

import { format } from 'date-fns';
import { useEffect, useMemo, useRef } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useMe } from '@/domains/auth/hooks/use-me';
import { Button, Input } from '@/shared/components/atoms';
import {
  FieldArrayTable,
  type FieldArrayTableColumn,
  FormCard,
} from '@/shared/components/molecules';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { FormGenerator } from '@/shared/components/organisms/FormGenerator';
import { PROCUREMENT_LABELS } from '../constants';
import { useSelectableDoDetail } from '../hooks/use-selectable-do-detail';
import { useSelectableDos } from '../hooks/use-selectable-dos';
import {
  type GoodsReceiptFormValues,
  type GoodsReceiptItemFormValues,
  goodsReceiptSchema,
} from '../schemas/goods-receipt';
import { buildGoodsReceiptPayload } from '../services/build-goods-receipt-payload';
import type { CreateGoodsReceiptPayload } from '../types/goods-receipt';

const GR_LABELS = PROCUREMENT_LABELS.GOODS_RECEIPT;

// -- Sync section: watches the chosen DO and auto-fills the header + items. --
function GoodsReceiptItemsSection({ companyId }: { companyId?: string }) {
  const { control, setValue, formState } = useFormContext<GoodsReceiptFormValues>();
  const deliveryOrderId = useWatch({ control, name: 'deliveryOrderId' });
  const { data: doDetail } = useSelectableDoDetail(deliveryOrderId || undefined, companyId);
  const { replace } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' }) ?? [];

  const lastSyncedDoIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!doDetail || lastSyncedDoIdRef.current === doDetail.id) return;
    lastSyncedDoIdRef.current = doDetail.id;

    setValue('destinationWarehouseName', doDetail.destinationWarehouseName);
    setValue('sourceType', doDetail.sourceType);
    setValue('purchaseOrderCode', doDetail.purchaseOrderCode ?? '-');
    replace(
      doDetail.items.map((item) => ({
        deliveryOrderItemId: item.delivery_order_item_id,
        code: item.code,
        name: item.name,
        doQty: item.doQty,
        quantityReceived: item.doQty,
        quantityRejected: 0,
        uom: item.uom,
        notes: '',
      }))
    );
  }, [doDetail, setValue, replace]);

  const columns: FieldArrayTableColumn<GoodsReceiptItemFormValues>[] = [
    { key: 'code', label: GR_LABELS.FORM.ITEMS_TABLE.CODE, render: (row) => row.code },
    { key: 'name', label: GR_LABELS.FORM.ITEMS_TABLE.ITEM, render: (row) => row.name },
    {
      key: 'doQty',
      label: GR_LABELS.FORM.ITEMS_TABLE.DO_QTY,
      align: 'right',
      render: (row) => row.doQty,
    },
    {
      key: 'quantityReceived',
      label: GR_LABELS.FORM.ITEMS_TABLE.QTY_RECEIVED,
      align: 'right',
      render: (row, idx) => (
        <div className="flex flex-col items-end gap-1">
          <Input
            type="number"
            className="w-24 h-8 text-right"
            value={row.quantityReceived}
            onChange={(e) =>
              setValue(`items.${idx}.quantityReceived`, Number(e.target.value), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          {formState.errors.items?.[idx]?.quantityReceived?.message && (
            <span className="text-xs text-destructive">
              {formState.errors.items[idx]?.quantityReceived?.message as string}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'quantityRejected',
      label: GR_LABELS.FORM.ITEMS_TABLE.QTY_REJECTED,
      align: 'right',
      render: (row, idx) => (
        <div className="flex flex-col items-end gap-1">
          <Input
            type="number"
            className="w-24 h-8 text-right"
            value={row.quantityRejected}
            onChange={(e) =>
              setValue(`items.${idx}.quantityRejected`, Number(e.target.value), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          {formState.errors.items?.[idx]?.quantityRejected?.message && (
            <span className="text-xs text-destructive">
              {formState.errors.items[idx]?.quantityRejected?.message as string}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'quantityNet',
      label: GR_LABELS.FORM.ITEMS_TABLE.QTY_NET,
      align: 'right',
      render: (row) => Math.max(0, (row.quantityReceived ?? 0) - (row.quantityRejected ?? 0)),
    },
    { key: 'uom', label: GR_LABELS.FORM.ITEMS_TABLE.UOM, render: (row) => row.uom },
    {
      key: 'notes',
      label: GR_LABELS.FORM.ITEMS_TABLE.REMARKS,
      render: (row, idx) => (
        <Input
          className="h-8"
          value={row.notes ?? ''}
          onChange={(e) => setValue(`items.${idx}.notes`, e.target.value, { shouldDirty: true })}
        />
      ),
    },
  ];

  if (watchedItems.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-950">{GR_LABELS.FORM.ITEMS_TABLE.TITLE}</h3>
      </div>
      <FieldArrayTable columns={columns} rows={watchedItems} emptyMessage="-" />
    </div>
  );
}

function GoodsReceiptReceivedByField() {
  const { data: user } = useMe();

  return (
    <Input
      id="receivedByLabel"
      label={GR_LABELS.FORM.FIELDS.RECEIVED_BY}
      value={user?.name ? `${user.name} ${GR_LABELS.FORM.RECEIVED_BY_AUTO}` : ''}
      disabled
      showLabel
      showHint={false}
    />
  );
}

function GoodsReceiptFormActions({
  isSubmitting,
  onCancel,
}: {
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<GoodsReceiptFormValues>();

  return (
    <div className="flex justify-end gap-3">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {GR_LABELS.FORM.BATAL}
      </Button>
      <Button type="submit" form="goods-receipt-form" disabled={!formState.isValid || isSubmitting}>
        {GR_LABELS.FORM.SIMPAN}
      </Button>
    </div>
  );
}

interface GoodsReceiptFormProps {
  companyId?: string;
  onSubmit: (payload: CreateGoodsReceiptPayload) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
  externalErrors?: Record<string, string[]>;
}

export function GoodsReceiptForm({
  companyId,
  onSubmit,
  isSubmitting,
  onCancel,
  externalErrors,
}: GoodsReceiptFormProps) {
  const { data: selectableDos = [] } = useSelectableDos({ companyId });

  const doOptions = useMemo(
    () => selectableDos.map((d) => ({ value: d.id, label: d.code })),
    [selectableDos]
  );

  const defaultValues = useMemo<GoodsReceiptFormValues>(
    () => ({
      deliveryOrderId: '',
      destinationWarehouseName: '',
      sourceType: '',
      purchaseOrderCode: '',
      receivedByLabel: '',
      receivedAt: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
      items: [],
    }),
    []
  );

  const fields = useMemo<FormFieldConfig<GoodsReceiptFormValues>[]>(
    () => [
      {
        type: 'select',
        name: 'deliveryOrderId',
        label: GR_LABELS.FORM.FIELDS.DELIVERY_ORDER,
        placeholder: GR_LABELS.FORM.PLACEHOLDERS.DELIVERY_ORDER,
        required: true,
        options: doOptions,
        colSpan: { base: 12, md: 6, lg: 3 },
      },
      {
        type: 'text',
        name: 'destinationWarehouseName',
        label: GR_LABELS.FORM.FIELDS.DESTINATION_WAREHOUSE,
        placeholder: GR_LABELS.FORM.PLACEHOLDERS.FILLED_FROM_DO,
        disabled: true,
        colSpan: { base: 12, md: 6, lg: 3 },
      },
      {
        type: 'text',
        name: 'sourceType',
        label: GR_LABELS.FORM.FIELDS.SOURCE_TYPE,
        placeholder: GR_LABELS.FORM.PLACEHOLDERS.FILLED_FROM_DO,
        disabled: true,
        colSpan: { base: 12, md: 6, lg: 3 },
      },
      {
        type: 'text',
        name: 'purchaseOrderCode',
        label: GR_LABELS.FORM.FIELDS.PURCHASE_ORDER,
        placeholder: GR_LABELS.FORM.PLACEHOLDERS.FILLED_FROM_DO,
        disabled: true,
        colSpan: { base: 12, md: 6, lg: 3 },
      },
      {
        type: 'date',
        name: 'receivedAt',
        label: GR_LABELS.FORM.FIELDS.RECEIVED_AT,
        required: true,
        colSpan: { base: 12, md: 6, lg: 4 },
      },
      {
        type: 'custom',
        colSpan: { base: 12, md: 6, lg: 4 },
        content: <GoodsReceiptReceivedByField />,
      },
      {
        type: 'text',
        name: 'notes',
        label: GR_LABELS.FORM.FIELDS.NOTE,
        placeholder: GR_LABELS.FORM.PLACEHOLDERS.NOTE,
        colSpan: { base: 12, md: 6, lg: 4 },
      },
      {
        type: 'custom',
        colSpan: 12,
        content: <GoodsReceiptItemsSection companyId={companyId} />,
      },
    ],
    [doOptions, companyId]
  );

  const handleSubmit = (values: GoodsReceiptFormValues) => {
    onSubmit(buildGoodsReceiptPayload(values));
  };

  return (
    <FormCard>
      <FormGenerator<GoodsReceiptFormValues>
        id="goods-receipt-form"
        schema={goodsReceiptSchema}
        fields={fields}
        defaultValues={defaultValues}
        mode="onChange"
        onSubmit={handleSubmit}
        externalErrors={externalErrors}
        actions={<GoodsReceiptFormActions isSubmitting={isSubmitting} onCancel={onCancel} />}
      />
    </FormCard>
  );
}
