import { HttpResponse, http } from 'msw';
import type { ApiPaginatedResponse, ApiResponse } from '@/shared/types/api';

const h = (path: string) => `/api/v1${path}`;

// Generic paginated mock creator for list pages
const genericListPaths = [
  '/companies',
  '/cost-item-types',
  '/warehouses',
  '/vendors',
  '/departments',
  '/document-types',
  '/groups',
  '/item-catalogs',
  '/item-categories',
  '/job-item-types',
  '/item-types',
  '/offices',
  '/payment-types',
  '/project-capabilities',
  '/project-types',
  '/skill-categories',
  '/skill-levels',
  '/skill-catalogs',
  '/positions',
  '/employee-grades',
];

// Generic detail/create/update/delete mock creator
const genericDetailPaths = [
  '/companies',
  '/cost-item-types',
  '/warehouses',
  '/vendors',
  '/departments',
  '/document-types',
  '/groups',
  '/company-positions',
  '/item-catalogs',
  '/item-categories',
  '/job-item-types',
  '/item-types',
  '/offices',
  '/payment-types',
  '/project-capabilities',
  '/project-types',
  '/skill-categories',
  '/skill-levels',
  '/skill-catalogs',
  '/positions',
];

const createDummyItem = () => ({
  id: '1',
  name: 'Test Item',
  code: 'TEST-01',
  isActive: true,
  email: 'test@example.com',
  role: { name: 'Admin' },
  userType: 'Internal',
  groupId: null,
  group: null,
  description: 'Test description',
});

const createCompanyPositionItem = () => ({
  id: '1',
  isActive: true,
  position: {
    id: '1',
    code: 'TEST-01',
    name: 'Test Position',
    level: 1,
    isActive: true,
  },
  department: {
    id: '1',
    code: 'TEST',
    name: 'Test Department',
    isActive: true,
  },
});

export const genericHandlers = [
  // Enum handlers
  http.get(h('/enums/work-placements'), () => {
    return HttpResponse.json<ApiResponse<any>>(
      {
        success: true,
        message: 'Enums retrieved successfully',
        data: {
          workPlacements: [
            { value: 'office', label: 'Kantor' },
            { value: 'remote', label: 'Remote' },
            { value: 'hybrid', label: 'Hybrid' },
          ],
          contractTypes: [
            { value: 'permanent', label: 'Karyawan Tetap' },
            { value: 'contract', label: 'Karyawan Kontrak' },
          ],
          salaryTypes: [
            { value: 'monthly', label: 'Gaji Bulanan' },
            { value: 'daily', label: 'Gaji Harian' },
          ],
        },
      },
      { status: 200 }
    );
  }),

  // Special handler for company-positions tree/diagram (must be before the /:id generic handler)
  http.get(h('/company-positions'), () => {
    return HttpResponse.json<ApiResponse<any>>(
      {
        success: true,
        message: 'Data retrieved successfully',
        data: [
          {
            company: { id: '1', code: 'COMP-001', name: 'PT Test Company', isActive: true },
            companyPositions: [
              {
                id: '1',
                isActive: true,
                position: {
                  id: '1',
                  code: 'POS-001',
                  name: 'Test Position',
                  level: 1,
                  isActive: true,
                },
                department: { id: '1', code: 'DEP-001', name: 'Test Department', isActive: true },
                children: [],
              },
            ],
          },
        ],
      },
      { status: 200 }
    );
  }),

  // Special handler for company-positions/list
  http.get(h('/company-positions/list'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);

    return HttpResponse.json<ApiPaginatedResponse<any>>(
      {
        success: true,
        message: 'Data retrieved successfully',
        data: [createCompanyPositionItem()],
        meta: {
          currentPage: page,
          perPage,
          total: 1,
          lastPage: 1,
          from: 1,
          to: 1,
        },
        links: {
          first: h(`/company-positions/list?page=1&perPage=${perPage}`),
          last: h(`/company-positions/list?page=1&perPage=${perPage}`),
          prev: null,
          next: null,
        },
      },
      { status: 200 }
    );
  }),

  // Generic list handlers
  ...genericListPaths.map((path) =>
    http.get(h(path), ({ request }) => {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);

      const dummyItem = createDummyItem();

      return HttpResponse.json<ApiPaginatedResponse<any>>(
        {
          success: true,
          message: 'Data retrieved successfully',
          data: [dummyItem],
          meta: {
            currentPage: page,
            perPage,
            total: 1,
            lastPage: 1,
            from: 1,
            to: 1,
          },
          links: {
            first: h(`${path}?page=1&perPage=${perPage}`),
            last: h(`${path}?page=1&perPage=${perPage}`),
            prev: null,
            next: null,
          },
        },
        { status: 200 }
      );
    })
  ),

  // Generic detail/create/update/delete handlers
  ...genericDetailPaths.flatMap((path) => [
    http.get(h(`${path}/:id`), () => {
      const dummyItem = createDummyItem();
      return HttpResponse.json<ApiResponse<any>>(
        {
          success: true,
          message: 'Data retrieved successfully',
          data: {
            ...dummyItem,
            id: '1',
            name: 'Test Item Detail',
            phoneNumber: '628123456789',
            roleId: '1',
          },
        },
        { status: 200 }
      );
    }),
    http.put(h(`${path}/:id`), () => {
      return HttpResponse.json({ success: true, message: 'Updated successfully' });
    }),
    http.patch(h(`${path}/:id`), () => {
      return HttpResponse.json({ success: true, message: 'Updated successfully' });
    }),
    http.post(h(path), () => {
      return HttpResponse.json({ success: true, message: 'Created successfully' });
    }),
    http.delete(h(`${path}/:id`), () => {
      return HttpResponse.json({ success: true, message: 'Deleted successfully' });
    }),
  ]),
];
