'use client';

import { Eye, FileText, Image, Paperclip } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/ui/badge';
import { DetailDrawerTemplate } from '@/shared/components/templates/DetailDrawerTemplate/DetailDrawerTemplate';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import { TASK_DETAIL_DRAWER_LABELS } from '../constants';

export interface TaskHistoryRow {
  id: string;
  task: string;
  assigne: string;
  status: string;
  end: string;
  retry: number;
}

export interface EvidenceFile {
  id: string;
  fileName: string;
  uploadedAt: string;
  type: 'image' | 'document';
}

export interface QCHistoryRow {
  id: string;
  qcTask: string;
  assign: string;
  decision: string;
  end: string;
  evidence: string;
}

export interface TaskDetailData {
  taskName: string;
  taskHistory: TaskHistoryRow[];
  evidenceFiles: EvidenceFile[];
  qcHistory: QCHistoryRow[];
}

interface TaskDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  data: TaskDetailData | null;
}

function getStatusBadgeVariant(
  status: string
): 'success' | 'warning' | 'destructive' | 'secondary' | 'default' {
  switch (status) {
    case 'QC Passed':
      return 'success';
    case 'In Progress':
      return 'warning';
    case 'QC Failed':
      return 'destructive';
    case 'Done - Pending QC':
      return 'warning';
    case 'Not Started':
      return 'secondary';
    default:
      return 'default';
  }
}

export function TaskDetailDrawer({ open, onClose, data }: TaskDetailDrawerProps) {
  return (
    <DetailDrawerTemplate
      open={open}
      onClose={onClose}
      title={TASK_DETAIL_DRAWER_LABELS.TITLE}
      closeLabel="Tutup"
    >
      {data ? (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{data.taskName}</h3>
          </div>

          <Tabs defaultValue="task-history">
            <TabsList className="w-full">
              <TabsTrigger value="task-history" className="flex-1">
                {TASK_DETAIL_DRAWER_LABELS.TABS.TASK_HISTORY}
              </TabsTrigger>
              <TabsTrigger value="evidence-files" className="flex-1">
                {TASK_DETAIL_DRAWER_LABELS.TABS.EVIDENCE_FILES}
              </TabsTrigger>
              <TabsTrigger value="qc-history" className="flex-1">
                {TASK_DETAIL_DRAWER_LABELS.TABS.QC_HISTORY}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="task-history" className="mt-4">
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs font-medium text-slate-500">
                        {TASK_DETAIL_DRAWER_LABELS.TASK_HISTORY_TABLE.TASK}
                      </TableHead>
                      <TableHead className="text-xs font-medium text-slate-500">
                        {TASK_DETAIL_DRAWER_LABELS.TASK_HISTORY_TABLE.ASSIGNE}
                      </TableHead>
                      <TableHead className="text-xs font-medium text-slate-500">
                        {TASK_DETAIL_DRAWER_LABELS.TASK_HISTORY_TABLE.STATUS}
                      </TableHead>
                      <TableHead className="text-xs font-medium text-slate-500">
                        {TASK_DETAIL_DRAWER_LABELS.TASK_HISTORY_TABLE.END}
                      </TableHead>
                      <TableHead className="text-xs font-medium text-slate-500">
                        {TASK_DETAIL_DRAWER_LABELS.TASK_HISTORY_TABLE.RETRY}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.taskHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-slate-400 py-6">
                          No data
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.taskHistory.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-sm text-slate-900">{row.task}</TableCell>
                          <TableCell className="text-sm text-slate-900">{row.assigne}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(row.status)} className="text-xs">
                              {row.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">{row.end}</TableCell>
                          <TableCell className="text-sm text-slate-600">{row.retry}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="evidence-files" className="mt-4">
              {data.evidenceFiles.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">
                  {TASK_DETAIL_DRAWER_LABELS.EVIDENCE_FILES.NO_FILES}
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {groupFilesByDate(data.evidenceFiles).map((group) => (
                    <div key={group.date}>
                      <p className="text-xs font-medium text-slate-500 mb-2">{group.date}</p>
                      <div className="flex flex-col gap-2">
                        {group.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white"
                          >
                            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                              {file.type === 'image' ? (
                                <Image className="w-4 h-4 text-slate-500" />
                              ) : (
                                <FileText className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {file.fileName}
                              </p>
                              <p className="text-xs text-slate-400">{file.uploadedAt}</p>
                            </div>
                            <Button variant="ghost" size="xs" className="shrink-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="qc-history" className="mt-4">
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs font-medium text-slate-500">
                        {TASK_DETAIL_DRAWER_LABELS.QC_HISTORY_TABLE.QC_TASK}
                      </TableHead>
                      <TableHead className="text-xs font-medium text-slate-500">
                        {TASK_DETAIL_DRAWER_LABELS.QC_HISTORY_TABLE.ASSIGN}
                      </TableHead>
                      <TableHead className="text-xs font-medium text-slate-500">
                        {TASK_DETAIL_DRAWER_LABELS.QC_HISTORY_TABLE.DECISION}
                      </TableHead>
                      <TableHead className="text-xs font-medium text-slate-500">
                        {TASK_DETAIL_DRAWER_LABELS.QC_HISTORY_TABLE.END}
                      </TableHead>
                      <TableHead className="text-xs font-medium text-slate-500">
                        {TASK_DETAIL_DRAWER_LABELS.QC_HISTORY_TABLE.EVIDENCE}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.qcHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-slate-400 py-6">
                          No data
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.qcHistory.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-sm text-slate-900">{row.qcTask}</TableCell>
                          <TableCell className="text-sm text-slate-900">{row.assign}</TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(row.decision)}
                              className="text-xs"
                            >
                              {row.decision}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">{row.end}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="xs">
                              <Paperclip className="w-4 h-4" />
                              <span className="ml-1 text-xs">{row.evidence}</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </DetailDrawerTemplate>
  );
}

interface FileGroup {
  date: string;
  files: EvidenceFile[];
}

function groupFilesByDate(files: EvidenceFile[]): FileGroup[] {
  const groups: Record<string, EvidenceFile[]> = {};
  for (const file of files) {
    if (!groups[file.uploadedAt]) {
      groups[file.uploadedAt] = [];
    }
    groups[file.uploadedAt].push(file);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([date, fileList]) => ({ date, files: fileList }));
}
