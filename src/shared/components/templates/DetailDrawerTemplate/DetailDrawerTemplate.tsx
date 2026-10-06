'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/atoms';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';

export interface DetailDrawerTemplateProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  title: string;
  children: ReactNode;
  editLabel?: string;
  closeLabel?: string;
  confirmDialog?: ReactNode;
  customFooter?: ReactNode;
}

export function DetailDrawerTemplate({
  open,
  onClose,
  onEdit,
  title,
  children,
  editLabel = 'Edit',
  closeLabel = 'Tutup',
  confirmDialog,
  customFooter,
}: DetailDrawerTemplateProps) {
  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">{title}</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="xs" className="h-6 w-6 p-0" aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">{children}</div>

        <DrawerFooter className="px-4 py-4 border-t flex flex-wrap gap-3">
          {customFooter}
          {onEdit && (
            <Button onClick={onEdit} className="w-full">
              {editLabel}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="w-full">
            {closeLabel}
          </Button>
        </DrawerFooter>

        {confirmDialog}
      </DrawerContent>
    </Drawer>
  );
}
