'use client';

import { FileText, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/atoms';
import { Card } from '@/shared/components/ui';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { formatIDR } from '@/shared/utils/currency';
import { formatFileSize } from '@/shared/utils/format';
import { COST_REQUEST_LABELS } from '../constants';

export interface CostRequestDisplayFile {
  key: string;
  fileName: string;
  fileSize?: number;
  url?: string;
  previewUrl?: string;
  mimeType?: string;
  sourceFile?: File;
}

export interface CostRequestDisplayItem {
  key: string;
  description: string;
  receiptNumber?: string | null;
  amount: number;
  files: CostRequestDisplayFile[];
}

interface CostRequestItemAccordionListProps {
  items: CostRequestDisplayItem[];
  readOnly?: boolean;
  onAddItem?: () => void;
  onRemoveItem?: (index: number) => void;
  onRemoveFile?: (itemIndex: number, file: CostRequestDisplayFile) => void;
}

function isImageFile(file: CostRequestDisplayFile): boolean {
  if (file.mimeType) {
    return file.mimeType.startsWith('image/');
  }

  return /\.(gif|jpe?g|png|webp|bmp|svg)$/i.test(file.fileName.split('?')[0]);
}

function CostRequestFileThumbnail({ file }: { file: CostRequestDisplayFile }) {
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>();

  useEffect(() => {
    if (!file.sourceFile || !isImageFile(file)) {
      setLocalPreviewUrl(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file.sourceFile);
    setLocalPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
      setLocalPreviewUrl((currentUrl) => (currentUrl === objectUrl ? undefined : currentUrl));
    };
  }, [file]);

  const previewUrl = file.previewUrl ?? localPreviewUrl;

  if (isImageFile(file) && previewUrl) {
    return (
      // biome-ignore lint/performance/noImgElement: local object URLs cannot use next/image
      <img
        src={previewUrl}
        alt={file.fileName}
        className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-cover"
      />
    );
  }

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
      <FileText className="h-5 w-5" />
    </span>
  );
}

export function CostRequestItemAccordionList({
  items,
  readOnly = false,
  onAddItem,
  onRemoveItem,
  onRemoveFile,
}: CostRequestItemAccordionListProps) {
  if (items.length === 0) {
    return (
      <div className="space-y-3 ">
        <p className="text-sm text-slate-500 p-20 rounded-lg border border-dashed text-center">
          Belum ada item ditambahkan.
        </p>
        {!readOnly && onAddItem ? (
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={onAddItem}>
            {COST_REQUEST_LABELS.CREATE.ADD_ITEM_TRIGGER}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">
        {COST_REQUEST_LABELS.CREATE.ITEM_LIST_TITLE}
      </p>

      <Accordion type="multiple" className="gap-3" defaultValue={[items[0]?.key]}>
        {items.map((item, index) => (
          <Card className="p-4" key={item.key}>
            <AccordionItem value={item.key}>
              <AccordionTrigger className="cursor-pointer p-0 items-center">
                {item.description}
              </AccordionTrigger>
              <AccordionContent className="p-0 h-fit">
                <hr className="my-3" />
                <div className="space-y-3 ">
                  {item.files.length === 0 ? (
                    <p className="text-xs mb-2! text-black-600 text-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                      {COST_REQUEST_LABELS.VALIDATION.NO_PROOF_WARNING}
                    </p>
                  ) : (
                    item.files.map((file) => (
                      <div
                        key={file.key}
                        className="flex items-center gap-3 rounded-lg p-2 bg-slate-50  border border-slate-200"
                      >
                        <CostRequestFileThumbnail file={file} />
                        <div className="min-w-0 flex-1">
                          {file.url ? (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate text-sm font-medium text-slate-950 hover:underline"
                            >
                              {file.fileName}
                            </a>
                          ) : (
                            <span className="truncate text-sm font-medium text-slate-950">
                              {file.fileName}
                            </span>
                          )}
                          {file.fileSize !== undefined && (
                            <p className="text-xs text-slate-500">
                              {formatFileSize(file.fileSize)}
                            </p>
                          )}
                        </div>
                        {!readOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => onRemoveFile?.(index, file)}
                            aria-label={`Remove ${file.fileName}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))
                  )}

                  <div className="pt-0">
                    <div className="flex items-center justify-between">
                      {item.receiptNumber && (
                        <p className="text-sm text-slate-500 mb-0!">
                          {COST_REQUEST_LABELS.CREATE.RECEIPT_NUMBER}: <br />{' '}
                          <span className="font-medium text-slate-950">{item.receiptNumber}</span>
                        </p>
                      )}
                      <p className="text-sm text-slate-500 text-right">
                        {COST_REQUEST_LABELS.CREATE.AMOUNT}: <br />{' '}
                        <span className="font-medium text-slate-950">{formatIDR(item.amount)}</span>
                      </p>
                    </div>
                    {!readOnly && (
                      <div className="flex justify-end mt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveItem?.(index)}
                          className="text-destructive px-4 w-full"
                        >
                          <Trash2 className="h-4 w-fit" />
                          Hapus Item
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Card>
        ))}
      </Accordion>
      {!readOnly && onAddItem ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={onAddItem}
        >
          {COST_REQUEST_LABELS.CREATE.ADD_ITEM_TRIGGER}
        </Button>
      ) : null}
    </div>
  );
}
