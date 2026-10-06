import { HttpResponse, http } from 'msw';
import type { PermissionGroup, Role } from '@/domains/role-permissions/types';
import type { ApiPaginatedResponse, ApiResponse } from '@/shared/types/api';

const h = (path: string) => `/api/v1${path}`;

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    guardName: 'web',
    description: 'Administrator role',
    isActive: true,
    permissionIds: [],
  },
  {
    id: '2',
    name: 'Manager',
    guardName: 'web',
    description: 'Manager role',
    isActive: true,
    permissionIds: [],
  },
  {
    id: '3',
    name: 'User',
    guardName: 'web',
    description: 'Regular user role',
    isActive: true,
    permissionIds: [],
  },
];

const mockPermissions: PermissionGroup[] = [
  {
    groupId: '1',
    groupCode: 'USER_MANAGEMENT',
    groupName: 'User Management',
    description: 'User management permissions',
    sortOrder: 1,
    isActive: true,
    permissions: {
      web: [
        { id: 1, name: 'view_users', description: 'View users', sortOrder: 1 },
        { id: 2, name: 'create_user', description: 'Create user', sortOrder: 2 },
        { id: 3, name: 'edit_user', description: 'Edit user', sortOrder: 3 },
        { id: 4, name: 'delete_user', description: 'Delete user', sortOrder: 4 },
      ],
      mobile: [],
    },
  },
];

export const rolePermissionsHandlers = [
  http.get(h('/roles'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);
    const search = url.searchParams.get('search') || '';

    let filtered = mockRoles;
    if (search) {
      filtered = mockRoles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
    }

    const total = filtered.length;
    const lastPage = Math.ceil(total / perPage) || 1;
    const from = total > 0 ? (page - 1) * perPage + 1 : null;
    const to = total > 0 ? Math.min(page * perPage, total) : null;

    const paginatedRoles = filtered.slice((page - 1) * perPage, page * perPage);

    return HttpResponse.json<ApiPaginatedResponse<Role[]>>(
      {
        success: true,
        message: 'Roles retrieved successfully',
        data: paginatedRoles,
        meta: {
          currentPage: page,
          perPage,
          total,
          lastPage,
          from,
          to,
        },
        links: {
          first: h(`/roles?page=1&perPage=${perPage}`),
          last: h(`/roles?page=${lastPage}&perPage=${perPage}`),
          prev: page > 1 ? h(`/roles?page=${page - 1}&perPage=${perPage}`) : null,
          next: page < lastPage ? h(`/roles?page=${page + 1}&perPage=${perPage}`) : null,
        },
      },
      { status: 200 }
    );
  }),

  http.get(h('/roles/:id'), ({ params }) => {
    const { id } = params;
    const role = mockRoles.find((r) => r.id === String(id));

    if (!role) {
      return HttpResponse.json(
        { success: false, message: 'Role tidak ditemukan' },
        { status: 404 }
      );
    }

    return HttpResponse.json<ApiResponse<Role>>(
      {
        success: true,
        message: 'Role retrieved successfully',
        data: role,
      },
      { status: 200 }
    );
  }),

  http.get(h('/permissions'), () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Permissions retrieved successfully',
        data: mockPermissions,
      },
      { status: 200 }
    );
  }),
];
