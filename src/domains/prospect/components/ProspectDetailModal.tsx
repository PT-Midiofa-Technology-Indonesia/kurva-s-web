'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ChevronRight, X } from 'lucide-react';
import { VisuallyHidden } from 'radix-ui';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { SegmentedControl } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { FileInput } from '@/shared/components/molecules/FileInput';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { formatDate, formatDateTimeLong, formatNumber } from '@/shared/utils/format';

import { uploadActivityDocument } from '../api/upload-activity-document';
import { PROSPECT_LABELS, PROSPECT_READONLY_STAGES } from '../constants';
import { useCreateProjectActivity } from '../hooks/use-create-project-activity';
import { useDeleteActivityDocument } from '../hooks/use-delete-activity-document';
import { useProjectStageHistory } from '../hooks/use-project-stage-history';
import { useProspectDetail } from '../hooks/use-prospect-detail';
import { PROSPECT_QUERY_KEYS, useProspects } from '../hooks/use-prospects';
import { useUpdateProspectStage } from '../hooks/use-update-prospect-stage';
import { ProspectActivityDocumentRow } from './ProspectActivityDocumentRow';
import { ProspectDocumentRow } from './ProspectDocumentRow';
import { ProspectFormDrawer } from './ProspectFormDrawer';
import { ProspectStageHistoryModal } from './ProspectStageHistoryModal';

interface ProspectDetailModalProps {
  projectId: string | null;
  companyId: string | null;
  open: boolean;
  onClose: () => void;
}

const labels = PROSPECT_LABELS.DETAIL;

export function ProspectDetailModal({
  projectId,
  companyId,
  open,
  onClose,
}: ProspectDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'document' | 'aktivitas'>('document');
  const [activityDescription, setActivityDescription] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const [attachmentProgress, setAttachmentProgress] = useState<Map<File, number>>(new Map());
  const [stageHistoryOpen, setStageHistoryOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const uploadingRef = useRef<Set<File>>(new Set());

  const queryClient = useQueryClient();

  const { data, isLoading } = useProspectDetail(projectId);
  const { data: stages } = useProspects(companyId ?? undefined);
  const { data: stageHistory = [] } = useProjectStageHistory(projectId);
  const { mutate: createActivity, isPending: isCreatingActivity } = useCreateProjectActivity(
    projectId ?? ''
  );
  const { mutate: updateStage, isPending: isUpdatingStage } = useUpdateProspectStage(
    companyId ?? ''
  );
  const { mutate: deleteActivityDoc } = useDeleteActivityDocument(projectId ?? '');

  const project = data?.project;
  const documents = data?.documents ?? [];
  const activity = data?.activity;

  useEffect(() => {
    if (activity?.description) {
      setActivityDescription(activity.description);
    }
  }, [activity?.description]);

  const isReadOnly = project ? PROSPECT_READONLY_STAGES.has(project.currentStage) : false;

  const nextStage = (() => {
    if (!stages || !project) return null;
    const idx = stages.findIndex((s) => s.stage === project.currentStage);
    return idx >= 0 && idx < stages.length - 1 ? stages[idx + 1].stage : null;
  })();

  const allMandatoryFilled = documents
    .filter((d) => d.isMandatory)
    .every((d) => d.uploadedDocuments && d.uploadedDocuments.length > 0);

  function handleAttachmentChange(files: File[]) {
    const added = files.filter((f) => !uploadingRef.current.has(f));
    setPendingAttachments(files);

    for (const file of added) {
      if (!projectId) continue;
      uploadingRef.current.add(file);
      uploadActivityDocument({
        projectId,
        file,
        onUploadProgress: (progress) => {
          setAttachmentProgress((prev) => new Map(prev).set(file, progress));
        },
      })
        .then(() => {
          uploadingRef.current.delete(file);
          setAttachmentProgress((prev) => {
            const next = new Map(prev);
            next.delete(file);
            return next;
          });
          setPendingAttachments((prev) => prev.filter((f) => f !== file));
          queryClient.invalidateQueries({ queryKey: PROSPECT_QUERY_KEYS.detail(projectId) });
          queryClient.invalidateQueries({
            queryKey: PROSPECT_QUERY_KEYS.pipeline(companyId ?? ''),
          });
        })
        .catch((error: unknown) => {
          uploadingRef.current.delete(file);
          setAttachmentProgress((prev) => {
            const next = new Map(prev);
            next.delete(file);
            return next;
          });
          setPendingAttachments((prev) => prev.filter((f) => f !== file));
          const fieldErrors = getFieldErrors(error);
          toast.error({ title: fieldErrors?.file?.[0] ?? getErrorMessage(error) });
        });
    }
  }

  function handleSaveActivity() {
    if (!projectId || !activityDescription.trim()) return;
    createActivity(
      { projectId, description: activityDescription.trim() },
      {
        onSuccess: () => {
          toast.success({ title: 'Aktivitas berhasil disimpan' });
          setActivityDescription('');
          queryClient.invalidateQueries({
            queryKey: PROSPECT_QUERY_KEYS.pipeline(companyId ?? ''),
          });
        },
      }
    );
  }

  function handleClose() {
    setActivityDescription('');
    setPendingAttachments([]);
    queryClient.invalidateQueries({
      queryKey: PROSPECT_QUERY_KEYS.pipeline(companyId ?? ''),
    });
    onClose();
  }

  function handleNextStage() {
    if (!project || !nextStage) return;
    updateStage({ projectId: project.id, stage: nextStage }, { onSuccess: handleClose });
  }

  function handleCancelProspect() {
    if (!project) return;
    setIsCancelDialogOpen(false);
    updateStage({ projectId: project.id, stage: 'cancel' }, { onSuccess: handleClose });
  }

  function handleSetToLost() {
    if (!project) return;
    updateStage({ projectId: project.id, stage: 'lost' }, { onSuccess: handleClose });
  }

  function handleSetToWon() {
    if (!project) return;
    updateStage({ projectId: project.id, stage: 'won' }, { onSuccess: handleClose });
  }

  const isResultStage = project?.currentStage === 'result';

  return (
    <>
      {companyId && project && (
        <ProspectFormDrawer
          open={isEditDrawerOpen}
          onClose={() => {
            setIsEditDrawerOpen(false);
            if (projectId) {
              queryClient.invalidateQueries({ queryKey: PROSPECT_QUERY_KEYS.detail(projectId) });
            }
          }}
          companyId={companyId}
          project={project}
        />
      )}
      <ProspectStageHistoryModal
        open={stageHistoryOpen}
        onClose={() => setStageHistoryOpen(false)}
        entries={stageHistory}
      />
      <ConfirmDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        variant="warning"
        title={labels.DIALOG.CANCEL_TITLE}
        description={labels.DIALOG.CANCEL_DESCRIPTION}
        cancelText={labels.DIALOG.CANCEL_CANCEL}
        confirmText={labels.DIALOG.CANCEL_CONFIRM}
        onCancel={() => setIsCancelDialogOpen(false)}
        onConfirm={handleCancelProspect}
      />
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[90vh] w-full max-w-150 flex-col gap-0 p-0 sm:max-w-150"
        >
          <VisuallyHidden.Root>
            <DialogTitle>{labels.MODAL_TITLE}</DialogTitle>
          </VisuallyHidden.Root>

          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-xl font-bold text-slate-900">
              {project?.name ?? 'Detail Prospect'}
            </h2>
            <div className="flex items-center gap-2">
              {!isReadOnly && project && (
                <Button variant="outline" size="sm" onClick={() => setIsEditDrawerOpen(true)}>
                  Edit Detail
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-8 w-8" onClick={handleClose}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <ModalSkeleton />
            ) : project ? (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{project.currentStageName}</Badge>
                </div>

                {/* Basic Info Section */}
                <div className="space-y-2">
                  {project.client?.name && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">Client:</span>
                      <Badge variant="outline">{project.client.name}</Badge>
                    </div>
                  )}
                  {project.projectStartDate && project.projectEndDate && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">Periode:</span>
                      <Badge variant="outline">
                        {formatDate(project.projectStartDate)} -{' '}
                        {formatDate(project.projectEndDate)}
                      </Badge>
                    </div>
                  )}
                  {project.estimatedValue != null && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">Nilai Project:</span>
                      <Badge variant="outline">{formatNumber(project.estimatedValue)}</Badge>
                    </div>
                  )}
                </div>

                {/* Project Type & Capabilities Section */}
                <div className="border-t border-slate-200 pt-5 space-y-4">
                  {project.projectType && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-600">Tipe Project</p>
                      <Badge variant="secondary">{project.projectType.name}</Badge>
                    </div>
                  )}
                  {project.projectCapabilities && project.projectCapabilities.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-600">Kapabilitas Project</p>
                      <div className="flex flex-wrap gap-2">
                        {project.projectCapabilities.map((cap) => (
                          <Badge key={cap.id} variant="secondary">
                            {cap.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description Section */}
                {project.description && (
                  <div className="border-t border-slate-200 pt-5">
                    <p className="mb-2 text-sm font-medium text-slate-600">Deskripsi</p>
                    <p className="text-sm leading-relaxed text-slate-600">{project.description}</p>
                  </div>
                )}

                {stageHistory.length > 0 &&
                  (() => {
                    const last = stageHistory[stageHistory.length - 1];
                    const dateText = last?.enteredAt ? formatDateTimeLong(last.enteredAt) : null;
                    return (
                      <button
                        type="button"
                        onClick={() => setStageHistoryOpen(true)}
                        className="mb-5 w-full rounded-lg border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">
                            {labels.STAGE_HISTORY.LABEL}
                          </span>
                          <ChevronRight size={16} className="text-slate-400" />
                        </div>
                        {last && (
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-sm text-slate-500">{last.stageName}</span>
                            {dateText && <span className="text-xs text-cyan-600">{dateText}</span>}
                          </div>
                        )}
                      </button>
                    );
                  })()}

                {!isReadOnly && (
                  <>
                    <div className="mb-0">
                      <SegmentedControl
                        options={[
                          { value: 'document', label: labels.TABS.DOCUMENT },
                          { value: 'aktivitas', label: labels.TABS.AKTIVITAS },
                        ]}
                        value={activeTab}
                        onChange={(value) => setActiveTab(value as 'document' | 'aktivitas')}
                      />
                      <div className="mt-3 border-b border-slate-200" />
                    </div>

                    <div className={activeTab === 'document' ? 'block' : 'hidden'}>
                      <div className="divide-y divide-slate-100">
                        {documents.length > 0 ? (
                          documents.map((doc) => (
                            <ProspectDocumentRow
                              key={doc.id}
                              doc={doc}
                              projectId={project.id}
                              isReadOnly={isReadOnly}
                              onSuccess={() =>
                                queryClient.invalidateQueries({
                                  queryKey: PROSPECT_QUERY_KEYS.pipeline(companyId ?? ''),
                                })
                              }
                            />
                          ))
                        ) : (
                          <div className="py-8 text-center text-sm text-slate-400">
                            {labels.EMPTY_DOCUMENT}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={activeTab === 'aktivitas' ? 'block' : 'hidden'}>
                      <div className="space-y-5 pt-4">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="activity-description"
                            className="text-sm font-medium text-slate-700"
                          >
                            {labels.ACTIVITY_FORM.DESCRIPTION_LABEL}
                            <span className="text-primary"> *</span>
                          </Label>
                          <Textarea
                            id="activity-description"
                            value={activityDescription}
                            onChange={(e) => setActivityDescription(e.target.value)}
                            placeholder={labels.EMPTY_AKTIVITAS}
                            className="min-h-28 resize-y"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setActivityDescription(activity?.description ?? '')}
                            disabled={isCreatingActivity}
                          >
                            {labels.BUTTONS.FORM_CANCEL}
                          </Button>
                          <Button
                            type="button"
                            disabled={!activityDescription.trim() || isCreatingActivity}
                            onClick={handleSaveActivity}
                          >
                            {labels.BUTTONS.FORM_SAVE}
                          </Button>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-slate-700">
                            {labels.ACTIVITY_FORM.ATTACHMENT_LABEL}
                            <span className="text-primary"> *</span>
                          </Label>
                          <FileInput
                            value={pendingAttachments}
                            onChange={handleAttachmentChange}
                            pendingFiles={pendingAttachments}
                            fileProgress={attachmentProgress}
                          />
                        </div>

                        {activity && activity.documents.length > 0 && (
                          <div className="space-y-2">
                            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                              {activity.documents.map((doc) => (
                                <ProspectActivityDocumentRow
                                  key={doc.id}
                                  doc={doc}
                                  projectId={project.id}
                                  onDelete={({ documentId }) => {
                                    deleteActivityDoc(
                                      { projectId: project.id, documentId },
                                      {
                                        onSuccess: () => {
                                          queryClient.invalidateQueries({
                                            queryKey: PROSPECT_QUERY_KEYS.pipeline(companyId ?? ''),
                                          });
                                        },
                                      }
                                    );
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>

          {!isReadOnly && (
            <div className="flex items-center justify-end gap-3 rounded-b-xl border-t border-slate-200 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                disabled={isUpdatingStage}
                onClick={() => setIsCancelDialogOpen(true)}
              >
                {labels.BUTTONS.CANCEL}
              </Button>
              {isResultStage ? (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isUpdatingStage}
                    onClick={handleSetToLost}
                  >
                    {labels.BUTTONS.SET_TO_LOST}
                  </Button>
                  <Button type="button" disabled={isUpdatingStage} onClick={handleSetToWon}>
                    {labels.BUTTONS.SET_TO_WON}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  disabled={!allMandatoryFilled || !nextStage || isUpdatingStage}
                  onClick={handleNextStage}
                >
                  {labels.BUTTONS.NEXT_STAGE}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ModalSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-28 rounded-md" />
      <Skeleton className="h-7 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-36 rounded-md" />
        <Skeleton className="h-6 w-44 rounded-md" />
        <Skeleton className="h-6 w-40 rounded-md" />
      </div>
      <Skeleton className="h-16 w-full" />
    </div>
  );
}
