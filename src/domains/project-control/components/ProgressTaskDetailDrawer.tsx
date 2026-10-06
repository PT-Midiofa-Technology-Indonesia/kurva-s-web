'use client';

import { ChevronsUpDown, Eye, FileText, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';
import { Button } from '@/shared/components/atoms/Button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { cn } from '@/shared/lib/utils';
import type { ProjectBOQItem } from '../api/get-project-boq';
import { useProjectTaskDetailHistory } from '../hooks/use-project-task-detail-history';
import {
  createProgressTaskDetailViewModel,
  type EvidenceFileRow,
  groupFilesByDate,
  type ProgressStatus,
  type QcHistoryRow,
  type TaskHistoryRow,
} from '../services/progress-task-detail.service';

interface ProgressDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  item: ProjectBOQItem | null;
  isFullscreen?: boolean;
}

function getStatusBadgeClass(status: ProgressStatus): string {
  switch (status) {
    case 'QC Passed':
    case 'Selesai':
      return 'bg-green-100 text-green-600 hover:bg-green-100';
    case 'QC Failed':
      return 'bg-red-100 text-red-600 hover:bg-red-100';
    case 'In Progress':
      return 'bg-yellow-100 text-yellow-600 hover:bg-yellow-100';
    case 'Not Started':
      return 'bg-muted text-muted-foreground hover:bg-muted';
    default:
      return '';
  }
}

function SortableHead({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      {children}
      <ChevronsUpDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
    </span>
  );
}

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function DrawerLoadingState() {
  return (
    <div className="flex min-h-70 items-center justify-center rounded-xl border border-border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Memuat detail progress...
      </div>
    </div>
  );
}

interface ProgressTaskDetailHeaderProps {
  code: string;
  status: ProgressStatus;
  weight: string;
  subItemCount: number;
  title: ReactNode;
  closeButton: ReactNode;
}

function ProgressTaskDetailHeader({
  code,
  status,
  weight,
  subItemCount,
  title,
  closeButton,
}: ProgressTaskDetailHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-4">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-md">
            {code}
          </Badge>
          <Badge className={cn('rounded-md border-0', getStatusBadgeClass(status))}>{status}</Badge>
          <Badge variant="secondary" className="rounded-md">
            Bobot: {weight}
          </Badge>
          <Badge variant="secondary" className="rounded-md">
            Sub-item: {subItemCount}
          </Badge>
        </div>
        {title}
      </div>
      {closeButton}
    </div>
  );
}

function StatusBadge({ status }: { status: ProgressStatus }) {
  return <Badge className={cn('rounded-md border-0', getStatusBadgeClass(status))}>{status}</Badge>;
}

function TaskHistoryTable({ rows }: { rows: TaskHistoryRow[] }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-14 px-6 text-muted-foreground">
              <SortableHead>Task</SortableHead>
            </TableHead>
            <TableHead className="h-14 px-6 text-muted-foreground">
              <SortableHead>Assigne</SortableHead>
            </TableHead>
            <TableHead className="h-14 px-6 text-muted-foreground">
              <SortableHead>Status</SortableHead>
            </TableHead>
            <TableHead className="h-14 px-6 text-muted-foreground">
              <SortableHead>End</SortableHead>
            </TableHead>
            <TableHead className="h-14 px-6 text-muted-foreground">
              <SortableHead>Retry</SortableHead>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                Belum ada task history
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-transparent">
                <TableCell className="px-6 py-4 font-medium text-foreground">{row.task}</TableCell>
                <TableCell className="px-6 py-4">{row.assign}</TableCell>
                <TableCell className="px-6 py-4">
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="px-6 py-4">{row.end}</TableCell>
                <TableCell className="px-6 py-4">{row.retry}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function QcHistoryTable({ rows }: { rows: QcHistoryRow[] }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-14 px-6 text-muted-foreground">
              <SortableHead>QC Task</SortableHead>
            </TableHead>
            <TableHead className="h-14 px-6 text-muted-foreground">
              <SortableHead>Assign</SortableHead>
            </TableHead>
            <TableHead className="h-14 px-6 text-muted-foreground">
              <SortableHead>Decision</SortableHead>
            </TableHead>
            <TableHead className="h-14 px-6 text-muted-foreground">
              <SortableHead>End</SortableHead>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                Belum ada QC history
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-transparent">
                <TableCell className="px-6 py-4 font-medium text-foreground">
                  {row.qcTask}
                </TableCell>
                <TableCell className="px-6 py-4">{row.assign}</TableCell>
                <TableCell className="px-6 py-4">
                  <StatusBadge status={row.decision} />
                </TableCell>
                <TableCell className="px-6 py-4">{row.end}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function EvidenceFileList({ rows, emptyLabel }: { rows: EvidenceFileRow[]; emptyLabel: string }) {
  if (rows.length === 0) {
    return <EmptyTab label={emptyLabel} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {groupFilesByDate(rows).map((group) => (
        <div key={group.date}>
          <p className="mb-2 text-xs font-medium text-muted-foreground">{group.date}</p>
          <div className="flex flex-col gap-2">
            {group.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                  {file.type === 'image' ? (
                    <ImageIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{file.fileName}</p>
                  <p className="text-xs text-muted-foreground">{file.fileSize}</p>
                </div>
                <Button variant="ghost" size="xs" aria-label={`Lihat ${file.fileName}`}>
                  <a href={file.filePath} target="_blank" rel="noreferrer">
                    <Eye className="size-4 text-brand-500" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface ProgressTaskDetailTabsProps {
  isFetching: boolean;
  taskRows: TaskHistoryRow[];
  evidenceRows: EvidenceFileRow[];
  qcRows: QcHistoryRow[];
  qcEvidenceRows: EvidenceFileRow[];
}

function ProgressTaskDetailTabs({
  isFetching,
  taskRows,
  evidenceRows,
  qcRows,
  qcEvidenceRows,
}: ProgressTaskDetailTabsProps) {
  return (
    <Tabs defaultValue="task-history" className="mt-4 min-h-0 flex-col flex-1 gap-0">
      <TabsList className="h-auto justify-start gap-2 border-b border-border bg-transparent px-5 pb-2 pt-0 w-full">
        <TabsTrigger value="task-history" className="h-8 flex-none rounded-lg px-3 text-slate-950">
          Task History
        </TabsTrigger>
        <TabsTrigger
          value="evidence-files"
          className="h-8 flex-none rounded-lg px-3 text-slate-950"
        >
          Evidence Files
        </TabsTrigger>
        <TabsTrigger value="qc-history" className="h-8 flex-none rounded-lg px-3 text-slate-950">
          QC History
        </TabsTrigger>
        <TabsTrigger
          value="qc-evidence-files"
          className="h-8 flex-none rounded-lg px-3 text-slate-950"
        >
          QC Evidence Files
        </TabsTrigger>
      </TabsList>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <TabsContent value="task-history">
          {isFetching ? <DrawerLoadingState /> : <TaskHistoryTable rows={taskRows} />}
        </TabsContent>
        <TabsContent value="evidence-files">
          {isFetching ? (
            <DrawerLoadingState />
          ) : (
            <EvidenceFileList rows={evidenceRows} emptyLabel="Belum ada evidence files" />
          )}
        </TabsContent>
        <TabsContent value="qc-history">
          {isFetching ? <DrawerLoadingState /> : <QcHistoryTable rows={qcRows} />}
        </TabsContent>

        <TabsContent value="qc-evidence-files">
          {isFetching ? (
            <DrawerLoadingState />
          ) : (
            <EvidenceFileList rows={qcEvidenceRows} emptyLabel="Belum ada evidence files" />
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
}

export function ProgressTaskDetailDrawer({
  open,
  onClose,
  item,
  isFullscreen = false,
}: ProgressDetailDrawerProps) {
  const { data, isFetching } = useProjectTaskDetailHistory(open ? item?.id : undefined);
  const detail = useMemo(() => createProgressTaskDetailViewModel(item, data), [item, data]);
  const dialogContainer =
    isFullscreen &&
    typeof document !== 'undefined' &&
    document.fullscreenElement instanceof HTMLElement
      ? document.fullscreenElement
      : undefined;

  const tabs = (
    <ProgressTaskDetailTabs
      isFetching={isFetching}
      taskRows={detail.taskRows}
      evidenceRows={detail.evidenceRows}
      qcRows={detail.qcRows}
      qcEvidenceRows={detail.qcEvidenceRows}
    />
  );

  if (isFullscreen) {
    return (
      <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
        <DialogContent
          showCloseButton={false}
          container={dialogContainer}
          className="flex max-h-[calc(100vh-32px)] max-w-4xl! flex-col gap-0 overflow-hidden p-0"
        >
          <DialogHeader className="block">
            <ProgressTaskDetailHeader
              code={detail.code}
              status={detail.status}
              weight={detail.weight}
              subItemCount={detail.subItemCount}
              title={
                <DialogTitle className="text-2xl font-semibold text-foreground">
                  {detail.title}
                </DialogTitle>
              }
              closeButton={
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="size-7 p-0"
                    aria-label="Close"
                  >
                    <X />
                  </Button>
                </DialogClose>
              }
            />
          </DialogHeader>
          {tabs}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={(value) => !value && onClose()} direction="right">
      <DrawerContent
        data-vaul-no-drag
        className="inset-y-0! right-0! left-auto! mt-0! h-full! w-162! max-w-[calc(100vw-16px)]! rounded-none! border-l! bg-background"
      >
        <DrawerHeader className="p-0">
          <ProgressTaskDetailHeader
            code={detail.code}
            status={detail.status}
            weight={detail.weight}
            subItemCount={detail.subItemCount}
            title={
              <DrawerTitle className="text-2xl font-semibold text-foreground">
                {detail.title}
              </DrawerTitle>
            }
            closeButton={
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="size-7 p-0"
                  aria-label="Close"
                >
                  <X />
                </Button>
              </DrawerClose>
            }
          />
        </DrawerHeader>
        {tabs}
      </DrawerContent>
    </Drawer>
  );
}
