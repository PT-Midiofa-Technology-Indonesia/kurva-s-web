import { HttpResponse, http } from 'msw';
import type { ApprovalGroup } from '@/domains/approval-group/types';
import type { ApiPaginatedResponse } from '@/shared/types/api';

const h = (path: string) => `/api/v1${path}`;

const mockApprovalGroups: ApprovalGroup[] = [
  {
    id: '019e4ae1-eb67-72be-a738-865bd2cbdc35',
    groupId: null,
    group: null,
    code: 'APV-MGR',
    name: 'Manager Approval',
    description: 'Grup persetujuan level manajer',
    isActive: true,
    createdAt: '2026-05-21T14:13:00.000000Z',
    updatedAt: '2026-05-21T14:13:00.000000Z',
  },
];

export const approvalGroupHandlers = [
  http.get(h('/approval-groups'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);
    const search = url.searchParams.get('search') || '';

    let filtered = mockApprovalGroups;
    if (search) {
      filtered = mockApprovalGroups.filter(
        (ag) =>
          ag.code.toLowerCase().includes(search.toLowerCase()) ||
          ag.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = filtered.length;
    const lastPage = Math.ceil(total / perPage) || 1;
    const data = filtered.slice((page - 1) * perPage, page * perPage);

    return HttpResponse.json<ApiPaginatedResponse<ApprovalGroup[]>>(
      {
        success: true,
        message: 'Data group approval berhasil diambil.',
        data,
        meta: {
          currentPage: page,
          perPage,
          total,
          lastPage,
          from: total > 0 ? (page - 1) * perPage + 1 : null,
          to: total > 0 ? Math.min(page * perPage, total) : null,
        },
        links: {
          first: h(`/approval-groups?page=1&perPage=${perPage}`),
          last: h(`/approval-groups?page=${lastPage}&perPage=${perPage}`),
          prev: page > 1 ? h(`/approval-groups?page=${page - 1}&perPage=${perPage}`) : null,
          next: page < lastPage ? h(`/approval-groups?page=${page + 1}&perPage=${perPage}`) : null,
        },
      },
      { status: 200 }
    );
  }),
];
