import { HttpResponse, http } from 'msw';
import type { ApiPaginatedResponse, ApiResponse } from '@/shared/types/api';

const h = (path: string) => `/api/v1${path}`;

const mockUserListItem = {
  id: '1',
  name: 'Test Item',
  email: 'test@example.com',
  phoneNumber: '628123456789',
  role: { id: '1', name: 'Admin' },
  userType: 'non_employee',
  isActive: true,
};

const mockUserDetail = {
  id: '1',
  name: 'Test Item Detail',
  email: 'test@example.com',
  phoneNumber: '628123456789',
  isActive: true,
  userType: 'non_employee',
  role: { id: '1', name: 'Admin' },
  companyId: null,
  companyName: null,
  employeeId: null,
  employeeName: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const userHandlers = [
  http.get(h('/users'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);

    return HttpResponse.json<ApiPaginatedResponse<any>>(
      {
        success: true,
        message: 'Data retrieved successfully',
        data: [mockUserListItem],
        meta: {
          currentPage: page,
          perPage,
          total: 1,
          lastPage: 1,
          from: 1,
          to: 1,
        },
        links: {
          first: h(`/users?page=1&perPage=${perPage}`),
          last: h(`/users?page=1&perPage=${perPage}`),
          prev: null,
          next: null,
        },
      },
      { status: 200 }
    );
  }),

  http.get(h('/users/:id'), () => {
    return HttpResponse.json<ApiResponse<any>>(
      {
        success: true,
        message: 'Data retrieved successfully',
        data: mockUserDetail,
      },
      { status: 200 }
    );
  }),

  http.put(h('/users/:id'), () => {
    return HttpResponse.json({ success: true, message: 'Updated successfully' });
  }),

  http.post(h('/users'), () => {
    return HttpResponse.json({ success: true, message: 'Created successfully' });
  }),

  http.delete(h('/users/:id'), () => {
    return HttpResponse.json({ success: true, message: 'Deleted successfully' });
  }),
];
