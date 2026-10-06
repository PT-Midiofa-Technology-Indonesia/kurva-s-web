import { HttpResponse, http } from 'msw';

import type { ApiPaginatedResponse, ApiResponse } from '@/shared/types/api';

const h = (path: string) => `/api/v1${path}`;

const mockApprovalRequestListItem = {
  id: 'ar-001',
  code: 'AR001',
  approvalWorkflowId: 'wf-001',
  approvableType: null,
  approvableId: null,
  companyId: 'company-001',
  requestedBy: 'user-001',
  currentStepOrder: 1,
  status: 'in_progress',
  payload: {
    name: 'Anisa Liliandari',
    gender: 'Perempuan',
    birthPlace: 'Tangerang',
    birthDate: '1997-01-24',
    birthDateFormatted: '24 Januari 1997',
    phone: '+6288876771234',
    email: 'anisa@proton.me',
    type: 'Employee',
    status: 'Aktif',
    province: 'DI Yogyakarta',
    city: 'Sleman',
    district: 'Seyegan',
    village: 'Margokaton',
    addressDetail: 'Jl. Kebon Agung No.16, Margokaton, Seyegan, Sleman',
  },
  finalDecidedAt: null,
  finalDecidedBy: null,
  notes: 'Pengajuan karyawan baru bagian Operasional.',
  isActive: true,
  department: 'Operasional',
  createdAtFormatted: '12 Juni 2026 05:47 WIB',
  waktuPengajuanFormatted: '12 Juni 2026 05:47 WIB',
  workflow: { id: 'wf-001', name: 'Penambahan Karyawan Baru', code: 'WF001' },
  company: { id: 'company-001', name: 'PT Maju Jaya Lancar Satu' },
  requestor: { id: 'user-001', name: 'Admin', department: 'Operasional' },
  finalDecider: null,
  createdAt: '2026-06-12T05:47:44+00:00',
  updatedAt: '2026-06-12T05:47:44+00:00',
};

const mockApprovalRequestDetail = {
  ...mockApprovalRequestListItem,
  steps: [
    {
      id: 'step-001',
      approvalRequestId: 'ar-001',
      stepOrder: 1,
      name: 'Persetujuan HR Manager',
      approverType: 'role',
      approverId: 'role-001',
      approverName: 'HR Manager',
      status: 'in_progress',
      decidedBy: null,
      decidedAt: null,
      decidedAtFormatted: null,
      comment: null,
      decider: null,
      createdAt: '2026-06-12T05:47:44+00:00',
      updatedAt: '2026-06-12T05:47:44+00:00',
    },
    {
      id: 'step-002',
      approvalRequestId: 'ar-001',
      stepOrder: 2,
      name: 'Persetujuan Direktur',
      approverType: 'role',
      approverId: 'role-002',
      approverName: 'Direktur',
      status: 'pending',
      decidedBy: null,
      decidedAt: null,
      decidedAtFormatted: null,
      comment: null,
      decider: null,
      createdAt: '2026-06-12T05:47:44+00:00',
      updatedAt: '2026-06-12T05:47:44+00:00',
    },
  ],
  histories: [
    {
      id: 'hist-001',
      approvalRequestId: 'ar-001',
      stepOrder: null,
      action: 'submit',
      actorId: 'user-001',
      comment: 'Pengajuan karyawan baru bagian Operasional.',
      actor: { id: 'user-001', name: 'Admin' },
      createdAt: '2026-06-12T05:47:44+00:00',
      createdAtFormatted: '12 Juni 2026 05:47 WIB',
    },
  ],
};

export const approvalRequestHandlers = [
  http.get(h('/approval-requests'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);

    return HttpResponse.json<ApiPaginatedResponse<any>>(
      {
        success: true,
        message: 'Data pengajuan persetujuan berhasil diambil.',
        data: [mockApprovalRequestListItem],
        meta: {
          currentPage: page,
          perPage,
          total: 1,
          lastPage: 1,
          from: 1,
          to: 1,
        },
        links: {
          first: h(`/approval-requests?page=1&perPage=${perPage}`),
          last: h(`/approval-requests?page=1&perPage=${perPage}`),
          prev: null,
          next: null,
        },
      },
      { status: 200 }
    );
  }),

  http.get(h('/approval-requests/:id'), () => {
    return HttpResponse.json<ApiResponse<any>>(
      {
        success: true,
        message: 'Detail pengajuan persetujuan berhasil diambil.',
        data: mockApprovalRequestDetail,
      },
      { status: 200 }
    );
  }),

  http.post(h('/approval-requests/:id/approve'), () => {
    return HttpResponse.json<ApiResponse<null>>(
      { success: true, message: 'Pengajuan berhasil disetujui.', data: null },
      { status: 200 }
    );
  }),

  http.post(h('/approval-requests/:id/reject'), () => {
    return HttpResponse.json<ApiResponse<null>>(
      { success: true, message: 'Pengajuan berhasil ditolak.', data: null },
      { status: 200 }
    );
  }),
];
