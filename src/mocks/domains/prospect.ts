import { HttpResponse, http } from 'msw';
import type {
  ProspectDetailResponseData,
  ProspectProject,
  ProspectStage,
} from '@/domains/prospect/types';
import type { ApiSuccessResponse } from '@/shared/types/api';

const h = (path: string) => `/api/v1${path}`;

const mockProject: ProspectProject = {
  id: 'proj-001',
  code: 'PRJ-001',
  name: 'Test Project Alpha',
  description: 'A test prospect project',
  currentStage: 'identify',
  currentStageName: 'Identify',
  totalDocumentRequirements: 3,
  totalUploadedDocuments: 1,
  estimatedValue: 100000000,
  projectStartDate: '2026-06-01',
  projectEndDate: '2026-12-31',
  tenderSubmissionDeadline: null,
  outcomeReason: null,
  isActive: true,
  client: { id: 'client-001', name: 'PT. Client ABC' },
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

const mockProjectDetail: ProspectDetailResponseData = {
  project: {
    id: 'proj-001',
    code: 'PRJ-001',
    name: 'Test Project Alpha',
    description: 'A test prospect project',
    currentStage: 'identify',
    currentStageName: 'Identify',
    estimatedValue: 100000000,
    projectStartDate: '2026-06-01',
    projectEndDate: '2026-12-31',
    tenderSubmissionDeadline: null,
    outcomeReason: null,
    isActive: true,
    company: null,
    client: { id: 'client-001', name: 'PT. Client ABC' },
    createdBy: null,
    projectType: null,
    projectCapabilities: [],
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  documents: [
    {
      id: 'doc-req-001',
      isMandatory: true,
      isActive: true,
      documentType: {
        id: 'dt-001',
        code: 'KTP',
        name: 'Kartu Tanda Penduduk',
        allowedFileTypes: 'pdf,jpg,jpeg',
        allowedFileSize: 1024,
      },
      uploadedDocuments: [],
    },
    {
      id: 'doc-req-002',
      isMandatory: false,
      isActive: true,
      documentType: {
        id: 'dt-002',
        code: 'NPWP',
        name: 'Nomor Pokok Wajib Pajak',
        allowedFileTypes: 'pdf',
        allowedFileSize: 2048,
      },
      uploadedDocuments: [
        {
          id: 'uploaded-doc-001',
          fileName: 'npwp.pdf',
          fileSize: 204800,
          mimeType: 'application/pdf',
          url: 'http://example.com/storage/npwp.pdf',
          uploadedBy: { id: 'user-001', name: 'Admin' },
          uploadedAt: '2026-06-01T10:00:00.000Z',
        },
      ],
    },
  ],
  activity: {
    id: null,
    description: null,
    createdBy: null,
    createdAt: null,
    documents: [],
  },
};

const mockStages: ProspectStage[] = [
  {
    stage: 'identify',
    stageName: 'Identify',
    totalProjects: 1,
    projects: [mockProject],
  },
  {
    stage: 'qualify',
    stageName: 'Qualify',
    totalProjects: 0,
    projects: [],
  },
  {
    stage: 'propose',
    stageName: 'Propose',
    totalProjects: 0,
    projects: [],
  },
];

export const prospectHandlers = [
  http.get(h('/prospects'), () => {
    return HttpResponse.json<ApiSuccessResponse<ProspectStage[]>>(
      {
        success: true,
        message: 'Data prospect berhasil diambil.',
        data: mockStages,
      },
      { status: 200 }
    );
  }),

  http.post(h('/projects'), () => {
    return HttpResponse.json<ApiSuccessResponse<ProspectProject>>(
      {
        success: true,
        message: 'Prospect berhasil ditambahkan.',
        data: { ...mockProject, id: 'proj-002', code: 'PRJ-002', name: 'New Prospect' },
      },
      { status: 201 }
    );
  }),

  http.get(h('/projects/:id'), () => {
    return HttpResponse.json<ApiSuccessResponse<ProspectDetailResponseData>>({
      success: true,
      message: 'Detail project berhasil diambil.',
      data: mockProjectDetail,
    });
  }),

  http.post(h('/projects/:id/documents'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Dokumen berhasil diupload.',
      data: mockProjectDetail.documents[1]?.uploadedDocuments[0],
    });
  }),

  http.post(h('/projects/:id/documents/:docId'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Dokumen berhasil diperbarui.',
      data: mockProjectDetail.documents[1]?.uploadedDocuments[0],
    });
  }),

  http.delete(h('/projects/:id/documents/:docId'), () => {
    return HttpResponse.json({ success: true, message: 'Dokumen berhasil dihapus.', data: null });
  }),

  http.post(h('/projects/:id/activities'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Aktivitas berhasil disimpan.',
      data: { id: 'act-001', description: 'Test activity', createdBy: null, createdAt: null },
    });
  }),

  http.post(h('/projects/:id/activities/documents'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Dokumen aktivitas berhasil diupload.',
      data: {
        id: 'act-doc-001',
        name: 'attachment.pdf',
        url: 'http://example.com/attachment.pdf',
        size: 1024,
      },
    });
  }),

  http.delete(h('/projects/:id/activities/documents/:docId'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Dokumen aktivitas berhasil dihapus.',
      data: null,
    });
  }),

  http.patch(h('/projects/:id/stage'), () => {
    return HttpResponse.json({ success: true, message: 'Stage berhasil diperbarui.', data: null });
  }),

  http.get(h('/projects/:id/stage-history'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Riwayat stage berhasil diambil.',
      data: [
        {
          stage: 'identify',
          stageName: 'Prospect Identify',
          enteredAt: '2026-06-01T15:00:00.000Z',
          documents: [
            {
              id: 'sh-doc-001',
              isMandatory: true,
              documentType: { id: 'dt-001', code: 'NPWP', name: 'NPWP' },
              uploadedDocument: [
                {
                  id: 'sh-file-001',
                  fileName: 'NPWP.doc',
                  fileSize: 91648,
                  mimeType: 'application/msword',
                  url: 'http://example.com/storage/npwp.doc',
                },
              ],
            },
            {
              id: 'sh-doc-002',
              isMandatory: true,
              documentType: { id: 'dt-002', code: 'SIUP', name: 'SIUP' },
              uploadedDocument: [
                {
                  id: 'sh-file-002',
                  fileName: 'SIUP.doc',
                  fileSize: 91648,
                  mimeType: 'application/msword',
                  url: 'http://example.com/storage/siup.doc',
                },
              ],
            },
          ],
          activity: {
            id: 'act-sh-001',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            documents: [
              {
                id: 'act-file-001',
                fileName: 'File-2jfn2-asjkdaw.pdf',
                fileSize: 91648,
                url: 'http://example.com/storage/file1.pdf',
              },
              {
                id: 'act-file-002',
                fileName: 'File-2jfn2-asjkdaw.pdf',
                fileSize: 91648,
                url: 'http://example.com/storage/file2.pdf',
              },
            ],
          },
        },
        {
          stage: 'qualify',
          stageName: 'Qualify',
          enteredAt: '2026-06-05T08:54:00.000Z',
          documents: [],
          activity: null,
        },
        {
          stage: 'tender_preparation',
          stageName: 'Tender Preparation',
          enteredAt: '2026-06-10T17:50:00.000Z',
          documents: [],
          activity: null,
        },
      ],
    });
  }),
];
