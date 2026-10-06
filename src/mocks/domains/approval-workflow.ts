import { HttpResponse, http } from 'msw';

import type { ApiPaginatedResponse, ApiResponse } from '@/shared/types/api';

const h = (path: string) => `/api/v1${path}`;

const mockWorkflowListItem = {
  id: 'wf-001',
  companyId: '1',
  code: 'WF001',
  name: 'Penambahan Karyawan Baru',
  module: 'employee',
  description: null,
  isActive: true,
  stepsCount: 2,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockWorkflowDetail = {
  ...mockWorkflowListItem,
  steps: [
    {
      id: 'step-001',
      approvalWorkflowId: 'wf-001',
      stepOrder: 1,
      name: 'Persetujuan HR Manager',
      approverType: 'role',
      approverId: '1',
      approverName: 'HR Manager',
      picId: 'pic-001',
      picName: 'John Doe',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'step-002',
      approvalWorkflowId: 'wf-001',
      stepOrder: 2,
      name: 'Persetujuan Direktur',
      approverType: 'role',
      approverId: '2',
      approverName: 'Direktur',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
};

export const approvalWorkflowHandlers = [
  http.get(h('/approval-workflows'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);

    return HttpResponse.json<ApiPaginatedResponse<any>>(
      {
        success: true,
        message: 'Data berhasil diambil.',
        data: [mockWorkflowListItem],
        meta: {
          currentPage: page,
          perPage,
          total: 1,
          lastPage: 1,
          from: 1,
          to: 1,
        },
        links: {
          first: h(`/approval-workflows?page=1&perPage=${perPage}`),
          last: h(`/approval-workflows?page=1&perPage=${perPage}`),
          prev: null,
          next: null,
        },
      },
      { status: 200 }
    );
  }),

  http.get(h('/approval-workflows/:id'), () => {
    return HttpResponse.json<ApiResponse<any>>(
      {
        success: true,
        message: 'Data berhasil diambil.',
        data: mockWorkflowDetail,
      },
      { status: 200 }
    );
  }),

  http.get(h('/approval-workflows/options/approvers/:approverType'), () => {
    return HttpResponse.json<ApiResponse<any>>(
      {
        success: true,
        message: 'Data berhasil diambil.',
        data: [
          { value: 'pic-001', label: 'John Doe' },
          { value: 'pic-002', label: 'Jane Smith' },
        ],
      },
      { status: 200 }
    );
  }),

  http.put(h('/approval-workflows/:id'), () => {
    return HttpResponse.json<ApiResponse<any>>(
      {
        success: true,
        message: 'Approval workflow berhasil diperbarui.',
        data: mockWorkflowDetail,
      },
      { status: 200 }
    );
  }),
];
