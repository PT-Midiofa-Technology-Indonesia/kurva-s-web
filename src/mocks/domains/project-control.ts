import { HttpResponse, http } from 'msw';
import type { ApiPaginatedResponse, ApiResponse } from '@/shared/types/api';

const h = (path: string) => `/api/v1${path}`;

const mockTemplates = [
  {
    id: 'tmpl-001',
    name: 'Office Building',
    description: null,
    isActive: true,
    projectCapability: { id: 'cap-001', name: 'High Rise Building' },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'tmpl-002',
    name: 'Road Construction',
    description: null,
    isActive: false,
    projectCapability: { id: 'cap-002', name: 'Infrastructure' },
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  },
];

const mockProjectCapabilities = [
  { id: 'cap-001', name: 'High Rise Building', code: 'HRB', isActive: true, description: null },
  { id: 'cap-002', name: 'Infrastructure', code: 'INF', isActive: true, description: null },
  { id: 'cap-003', name: 'Low Rise Building', code: 'LRB', isActive: true, description: null },
  { id: 'cap-004', name: 'Interior Design', code: 'INT', isActive: true, description: null },
  { id: 'cap-005', name: 'Landscape', code: 'LND', isActive: true, description: null },
  { id: 'cap-006', name: 'Mechanical Electrical', code: 'ME', isActive: true, description: null },
  { id: 'cap-007', name: 'Plumbing', code: 'PLM', isActive: true, description: null },
];

const mockProjectManpowerRatingCategories = [
  {
    id: 'rating-cat-001',
    code: 'capability',
    name: 'Capability',
    description: 'Kompetensi teknis dalam menyelesaikan pekerjaan',
    sortOrder: 1,
    isActive: true,
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'rating-cat-002',
    code: 'responsibility',
    name: 'Responsibility',
    description: 'Konsistensi menjalankan tanggung jawab kerja',
    sortOrder: 2,
    isActive: true,
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'rating-cat-003',
    code: 'quality',
    name: 'Quality',
    description: 'Kualitas hasil pekerjaan',
    sortOrder: 3,
    isActive: true,
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'rating-cat-004',
    code: 'timeliness',
    name: 'Timeliness',
    description: 'Ketepatan waktu penyelesaian pekerjaan',
    sortOrder: 4,
    isActive: true,
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-07-15T08:00:00Z',
  },
];

const mockProjectManpowerRows = [
  {
    employee: { id: 'emp-001', code: 'EMP-001', name: 'Mobile Admin' },
    hierarchy: {
      assignmentId: 'assignment-001',
      nodeId: 'node-001',
      assignedAt: '2026-07-01T00:00:00Z',
      position: { id: 'pos-001', code: 'PM-01', name: 'Project Manager', level: 1 },
      parentPosition: { id: 'pos-root', name: 'Direktur', level: 2 },
    },
    rating: {
      id: 'rating-001',
      ratedAt: '2026-07-16T00:00:00Z',
      overallScore: 4.25,
      note: null,
      ratedBy: { id: 'emp-001', name: 'Mobile Admin' },
      source: { type: 'project', id: 'proj-001', label: 'PRJ-001', deleted: false },
      scores: [
        {
          categoryId: 'rating-cat-001',
          categoryCode: 'capability',
          categoryName: 'Capability',
          categoryStatus: 'active',
          score: 4,
          note: null,
        },
        {
          categoryId: 'rating-cat-002',
          categoryCode: 'responsibility',
          categoryName: 'Responsibility',
          categoryStatus: 'active',
          score: 4,
          note: null,
        },
        {
          categoryId: 'rating-cat-003',
          categoryCode: 'quality',
          categoryName: 'Quality',
          categoryStatus: 'active',
          score: 5,
          note: null,
        },
        {
          categoryId: 'rating-cat-004',
          categoryCode: 'timeliness',
          categoryName: 'Timeliness',
          categoryStatus: 'active',
          score: 4,
          note: null,
        },
      ],
    },
  },
  {
    employee: { id: 'emp-002', code: 'EMP-002', name: 'Mobile Staff' },
    hierarchy: {
      assignmentId: 'assignment-002',
      nodeId: 'node-002',
      assignedAt: '2026-07-02T00:00:00Z',
      position: { id: 'pos-002', code: 'SF-01', name: 'Site Foreman', level: 2 },
      parentPosition: { id: 'pos-001', name: 'Project Manager', level: 1 },
    },
    rating: null,
  },
  {
    employee: { id: 'emp-003', code: 'EMP-003', name: 'QS Engineer' },
    hierarchy: {
      assignmentId: 'assignment-003',
      nodeId: 'node-003',
      assignedAt: '2026-07-03T00:00:00Z',
      position: { id: 'pos-003', code: 'QS-01', name: 'QS Engineer', level: 2 },
      parentPosition: { id: 'pos-001', name: 'Project Manager', level: 1 },
    },
    rating: {
      id: 'rating-003',
      ratedAt: '2026-07-15T00:00:00Z',
      overallScore: 4,
      note: null,
      ratedBy: { id: 'emp-001', name: 'Mobile Admin' },
      source: { type: 'project', id: 'proj-001', label: 'PRJ-001', deleted: false },
      scores: [
        {
          categoryId: 'rating-cat-001',
          categoryCode: 'capability',
          categoryName: 'Capability',
          categoryStatus: 'active',
          score: 4,
          note: null,
        },
        {
          categoryId: 'rating-cat-002',
          categoryCode: 'responsibility',
          categoryName: 'Responsibility',
          categoryStatus: 'active',
          score: 4,
          note: null,
        },
        {
          categoryId: 'rating-cat-003',
          categoryCode: 'quality',
          categoryName: 'Quality',
          categoryStatus: 'active',
          score: 4,
          note: null,
        },
        {
          categoryId: 'rating-cat-004',
          categoryCode: 'timeliness',
          categoryName: 'Timeliness',
          categoryStatus: 'active',
          score: 4,
          note: null,
        },
      ],
    },
  },
];

function buildProjectManpowerRatingFromScores(scores: any[]) {
  const total = scores.reduce((sum, item) => sum + Number(item.score ?? 0), 0);
  const overallScore = scores.length > 0 ? Number((total / scores.length).toFixed(2)) : 0;

  return {
    id: `rating-${Math.random().toString(36).slice(2, 10)}`,
    ratedAt: new Date().toISOString(),
    overallScore,
    note: null,
    ratedBy: { id: 'emp-001', name: 'Mobile Admin' },
    source: { type: 'project' as const, id: 'proj-001', label: 'PRJ-001', deleted: false },
    scores: scores.map((item) => {
      const category = mockProjectManpowerRatingCategories.find(
        (entry) => entry.id === item.categoryId
      );
      return {
        categoryId: item.categoryId,
        categoryCode: category?.code ?? item.categoryId,
        categoryName: category?.name ?? item.categoryId,
        categoryStatus: 'active' as const,
        score: Number(item.score ?? 1),
        note: item.note ?? null,
      };
    }),
  };
}

const mockTemplateDetail = {
  id: 'tmpl-001',
  name: 'Office Building',
  description: 'Template for office construction',
  isActive: true,
  projectCapability: { id: 'cap-001', name: 'High Rise Building' },
  items: [
    {
      id: 'item-root',
      boqTemplateId: 'tmpl-001',
      parentId: null,
      sortOrder: 1,
      level: 1,
      code: 'A',
      name: 'Pekerjaan Beton',
      isFinalLevel: false,
      weight: null,
      isActive: true,
      jobItemType: { id: 'jt-001', name: 'Job' },
      children: [
        {
          id: 'item-l2',
          boqTemplateId: 'tmpl-001',
          parentId: 'item-root',
          sortOrder: 1,
          level: 2,
          code: 'A.1',
          name: 'Pondasi',
          isFinalLevel: false,
          weight: null,
          isActive: true,
          jobItemType: { id: 'jt-001', name: 'Job' },
          children: [
            {
              id: 'item-l3',
              boqTemplateId: 'tmpl-001',
              parentId: 'item-l2',
              sortOrder: 1,
              level: 3,
              code: 'A.1.1',
              name: 'Pondasi Batu',
              isFinalLevel: false,
              weight: null,
              isActive: true,
              jobItemType: { id: 'jt-001', name: 'Job' },
              children: [
                {
                  id: 'item-l4',
                  boqTemplateId: 'tmpl-001',
                  parentId: 'item-l3',
                  sortOrder: 1,
                  level: 4,
                  code: 'A.1.1.1',
                  name: 'Galian Pondasi',
                  isFinalLevel: false,
                  weight: null,
                  isActive: true,
                  jobItemType: { id: 'jt-001', name: 'Job' },
                  children: [
                    {
                      id: 'item-leaf-001',
                      boqTemplateId: 'tmpl-001',
                      parentId: 'item-l4',
                      sortOrder: 1,
                      level: 5,
                      code: 'A.1.1.1.1',
                      name: 'Pengadukan Semen dan Pasir',
                      isFinalLevel: true,
                      weight: null,
                      isActive: true,
                      jobItemType: { id: 'jt-001', name: 'Job' },
                      children: [],
                      createdAt: '2026-06-20T04:08:43.000000Z',
                      updatedAt: '2026-06-20T04:08:43.000000Z',
                    },
                  ],
                  createdAt: '2026-06-20T04:08:43.000000Z',
                  updatedAt: '2026-06-20T04:08:43.000000Z',
                },
              ],
              createdAt: '2026-06-20T04:08:43.000000Z',
              updatedAt: '2026-06-20T04:08:43.000000Z',
            },
          ],
          createdAt: '2026-06-20T04:08:43.000000Z',
          updatedAt: '2026-06-20T04:08:43.000000Z',
        },
      ],
      createdAt: '2026-06-20T04:08:43.000000Z',
      updatedAt: '2026-06-20T04:08:43.000000Z',
    },
  ],
  createdAt: '2026-06-20T04:08:43.000000Z',
  updatedAt: '2026-06-20T04:08:43.000000Z',
};

const mockItemCosts = {
  item: {
    id: 'item-leaf-001',
    boqTemplateId: 'tmpl-001',
    parentId: 'item-parent-001',
    sortOrder: 1,
    level: 5,
    code: 'A.1.1.1.1',
    name: 'Pengadukan Semen dan Pasir',
    isFinalLevel: true,
    weight: null,
    isActive: true,
    jobItemType: { id: 'jt-001', name: 'Job' },
    children: [],
    createdAt: '2026-06-20T04:08:43.000000Z',
    updatedAt: '2026-06-20T04:08:43.000000Z',
  },
  costs: [
    {
      category: 'material_cost',
      categoryName: 'Material Cost',
      items: [
        {
          id: 'cost-item-001',
          costCategory: 'material_cost',
          code: 'SM',
          name: 'Semen',
          catalog: { id: 'cat-001', code: 'SM', name: 'Semen' },
        },
        {
          id: 'cost-item-002',
          costCategory: 'material_cost',
          code: 'BM',
          name: 'Bata Merah',
          catalog: { id: 'cat-002', code: 'BM', name: 'Bata Merah' },
        },
      ],
    },
    { category: 'equipment_cost', categoryName: 'Equipment Cost', items: [] },
    { category: 'man_power_cost', categoryName: 'Man Power Cost', items: [] },
    {
      category: 'transport_cost',
      categoryName: 'Transport Cost',
      items: [
        {
          id: 'cost-item-003',
          costCategory: 'transport_cost',
          code: 'P.322',
          name: 'Transport Bata Merah',
          catalog: null,
        },
      ],
    },
    { category: 'preliminery_cost', categoryName: 'Preliminery Cost', items: [] },
  ],
};

export const projectControlHandlers = [
  http.get(h('/boq-templates'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);
    const search = url.searchParams.get('search') || '';
    const isActive = url.searchParams.get('isActive');

    let filtered = mockTemplates;
    if (search) {
      filtered = filtered.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (isActive === 'true') {
      filtered = filtered.filter((t) => t.isActive);
    } else if (isActive === 'false') {
      filtered = filtered.filter((t) => !t.isActive);
    }

    const total = filtered.length;
    const lastPage = Math.ceil(total / perPage) || 1;
    const from = total > 0 ? (page - 1) * perPage + 1 : null;
    const to = total > 0 ? Math.min(page * perPage, total) : null;
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    return HttpResponse.json<ApiPaginatedResponse<any>>(
      {
        success: true,
        message: 'Data retrieved successfully',
        data: paginated,
        meta: { currentPage: page, perPage, total, lastPage, from, to },
        links: {
          first: h(`/boq-templates?page=1&perPage=${perPage}`),
          last: h(`/boq-templates?page=${lastPage}&perPage=${perPage}`),
          prev: page > 1 ? h(`/boq-templates?page=${page - 1}&perPage=${perPage}`) : null,
          next: page < lastPage ? h(`/boq-templates?page=${page + 1}&perPage=${perPage}`) : null,
        },
      },
      { status: 200 }
    );
  }),

  http.post(h('/boq-templates'), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if (!body.name || !body.projectCapabilityId) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Validation failed',
          data: null,
          errorCode: 'VALIDATION_ERROR',
          errors: {
            name: ['Nama template harus diisi'],
            projectCapabilityId: ['Project Capability harus dipilih'],
          },
        },
        { status: 422 }
      );
    }
    return HttpResponse.json<ApiResponse<any>>(
      {
        success: true,
        message: 'BOQ Template berhasil ditambahkan',
        data: {
          id: 'tmpl-new',
          name: body.name,
          description: null,
          isActive: body.isActive,
          createdAt: '2025-06-01T00:00:00Z',
          updatedAt: '2025-06-01T00:00:00Z',
        },
      },
      { status: 201 }
    );
  }),

  http.post(h('/boq-templates/sync'), async ({ request }) => {
    const body = (await request.json()) as { items?: unknown[] };
    const items = body.items ?? [];
    if (items.length === 0) {
      return HttpResponse.json(
        { success: false, message: 'No items to sync', data: null, errorCode: 'VALIDATION_ERROR' },
        { status: 422 }
      );
    }
    const invalidItem = items.find((item: any) => !item.name || !item.projectCapabilityId);
    if (invalidItem) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Validation failed',
          data: null,
          errorCode: 'VALIDATION_ERROR',
          errors: {
            name: ['Nama template harus diisi'],
            projectCapabilityId: ['Project Capability harus dipilih'],
          },
        },
        { status: 422 }
      );
    }
    return HttpResponse.json<ApiResponse<any>>(
      { success: true, message: 'BOQ Template berhasil disinkronisasi', data: null },
      { status: 200 }
    );
  }),

  http.post(h('/boq-templates/:templateId/items/:itemId/costs/sync'), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if (!Array.isArray(body.categories)) {
      return HttpResponse.json(
        { success: false, message: 'Validation failed', data: null, errorCode: 'VALIDATION_ERROR' },
        { status: 422 }
      );
    }
    return HttpResponse.json<ApiResponse<any>>(
      { success: true, message: 'Biaya item BOQ template berhasil disinkronisasi.', data: null },
      { status: 200 }
    );
  }),

  http.get(h('/boq-templates/:templateId/items/:itemId'), () => {
    return HttpResponse.json<ApiResponse<any>>(
      {
        success: true,
        message: 'Data biaya item BOQ template berhasil diambil.',
        data: mockItemCosts,
      },
      { status: 200 }
    );
  }),

  http.delete(h('/boq-templates/:id'), () => {
    return HttpResponse.json<ApiResponse<null>>(
      { success: true, message: 'BOQ Template berhasil dihapus', data: null },
      { status: 200 }
    );
  }),

  http.get(h('/boq-templates/:id'), () => {
    return HttpResponse.json<ApiResponse<any>>(
      {
        success: true,
        message: 'Data BOQ template berhasil diambil.',
        data: mockTemplateDetail,
      },
      { status: 200 }
    );
  }),

  http.get(h('/rating-categories/active'), () => {
    return HttpResponse.json<ApiResponse<any>>(
      {
        success: true,
        message: 'Data berhasil diambil.',
        data: mockProjectManpowerRatingCategories,
      },
      { status: 200 }
    );
  }),

  http.get(h('/projects/:projectId/manpower'), ({ request }) => {
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();

    const filtered = mockProjectManpowerRows.filter((item) => {
      if (!search) return true;
      const searchable = [
        item.employee?.name ?? '',
        item.employee?.code ?? '',
        item.hierarchy.position?.name ?? '',
        item.hierarchy.position?.code ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(search);
    });

    return HttpResponse.json<ApiResponse<any>>(
      {
        success: true,
        message: filtered.length > 0 ? 'Data berhasil diambil.' : 'Data tidak ditemukan.',
        data: filtered,
      },
      { status: 200 }
    );
  }),

  http.get(h('/projects/:projectId/manpower/:employeeId/rating'), ({ params }) => {
    const item = mockProjectManpowerRows.find((row) => row.employee?.id === params.employeeId);

    return HttpResponse.json<ApiResponse<any>>(
      {
        success: true,
        message: 'Data berhasil diambil.',
        data: {
          employee: item?.employee ?? null,
          activeCategories: mockProjectManpowerRatingCategories,
          rating: item?.rating ?? null,
        },
      },
      { status: 200 }
    );
  }),

  http.post(h('/projects/:projectId/manpower/:employeeId/rating'), async ({ request, params }) => {
    const body = (await request.json()) as { ratedAt?: string; categoryScores?: any[] };
    const item = mockProjectManpowerRows.find((row) => row.employee?.id === params.employeeId);

    if (!item) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Employee tidak berada pada hirarki project ini.',
          data: null,
          errorCode: 'VALIDATION_ERROR',
          errors: {
            employeeId: ['Employee tidak berada pada hirarki project ini.'],
          },
        },
        { status: 422 }
      );
    }

    if (!body.ratedAt) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Data yang diberikan tidak valid.',
          data: null,
          errorCode: 'VALIDATION_ERROR',
          errors: {
            ratedAt: ['Tanggal rating wajib diisi.'],
          },
        },
        { status: 422 }
      );
    }

    const categoryScores = body.categoryScores ?? [];
    if (categoryScores.length === 0) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Data yang diberikan tidak valid.',
          data: null,
          errorCode: 'VALIDATION_ERROR',
          errors: {
            categoryScores: ['Skor kategori wajib diisi.'],
          },
        },
        { status: 422 }
      );
    }

    const rating = buildProjectManpowerRatingFromScores(categoryScores);
    rating.ratedAt = `${body.ratedAt}T00:00:00Z`;
    item.rating = rating;

    return HttpResponse.json<ApiResponse<any>>(
      {
        success: true,
        message: 'Rating berhasil disimpan.',
        data: rating,
      },
      { status: 200 }
    );
  }),

  // ── Project BOQ planning handlers ─────────────────────────────────────────

  http.get(h('/projects/:projectId/boq'), () => {
    return HttpResponse.json<ApiResponse<any>>({
      success: true,
      message: 'Data BOQ project berhasil diambil.',
      data: {
        project: {
          id: 'proj-001',
          code: 'PRJ-001',
          name: 'Office Building Project',
          description: 'A sample project',
          currentStage: 'planning',
          currentStageName: 'Planning',
          estimatedValue: 500000000,
          totalValue: 399050000,
          totalValueCco: 319240000,
          limitBudgetPercentage: 80,
          projectStartDate: '2026-01-01',
          projectEndDate: '2026-12-31',
          startedAt: null,
          tenderSubmissionDeadline: null,
          outcomeReason: null,
          isActive: true,
          isRabComplete: true,
          isLimitBudgetComplete: true,
          isCcoComplete: true,
          company: { id: 'comp-001', name: 'PT Test Company' },
          client: { id: 'client-001', name: 'Client ABC' },
          createdBy: { id: 'user-001', name: 'Admin' },
          projectType: { id: 'pt-001', name: 'Interior' },
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        boq: {
          id: 'boq-001',
          projectId: 'proj-001',
          boqTemplateId: 'tmpl-001',
          code: 'BOQ-001',
          name: 'Main BOQ',
          limitBudgetPercentage: '100',
          isRabComplete: true,
          isLimitBudgetComplete: true,
          isCcoComplete: true,
          isActive: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          items: [
            {
              id: 'proj-item-root',
              parentId: null,
              sortOrder: 1,
              level: 1,
              code: 'A',
              name: 'Pekerjaan Beton',
              isFinalLevel: false,
              weight: null,
              scheduleStartDate: null,
              scheduleEndDate: null,
              volumeRab: null,
              volumeCco: null,
              volumeActual: null,
              uomId: null,
              unitPriceMaterialRab: null,
              unitPriceWorkRab: null,
              totalAmountRab: null,
              remarks: null,
              isActive: true,
              jobItemType: { id: 'jt-001', name: 'Job' },
              children: [
                {
                  id: 'proj-item-leaf',
                  parentId: 'proj-item-root',
                  sortOrder: 1,
                  level: 2,
                  code: 'A.1',
                  name: 'Pondasi',
                  isFinalLevel: true,
                  weight: '25',
                  scheduleStartDate: null,
                  scheduleEndDate: null,
                  volumeRab: '100',
                  volumeCco: null,
                  volumeActual: null,
                  uomId: '1',
                  uom: { id: '1', code: 'M', name: 'Meter' },
                  unitPriceMaterialRab: '500000',
                  unitPriceWorkRab: '200000',
                  totalAmountRab: '70000000',
                  remarks: 'Sample remark',
                  isActive: true,
                  jobItemType: { id: 'jt-001', name: 'Job' },
                  children: [],
                },
              ],
            },
          ],
        },
      },
    });
  }),

  http.get(h('/project-management/boq'), () => {
    return HttpResponse.json<ApiResponse<any>>({
      success: true,
      message: 'Data BOQ project berhasil diambil.',
      data: {
        project: {
          id: 'proj-001',
          code: 'PRJ-001',
          name: 'Office Building Project',
          description: 'A sample project',
          currentStage: 'planning',
          currentStageName: 'Planning',
          estimatedValue: 500000000,
          totalValue: 399050000,
          totalValueCco: 319240000,
          limitBudgetPercentage: 80,
          projectStartDate: '2026-01-01',
          projectEndDate: '2026-12-31',
          startedAt: null,
          tenderSubmissionDeadline: null,
          outcomeReason: null,
          isActive: true,
          isRabComplete: true,
          isLimitBudgetComplete: true,
          isCcoComplete: true,
          company: { id: 'comp-001', name: 'PT Test Company' },
          client: { id: 'client-001', name: 'Client ABC' },
          createdBy: { id: 'user-001', name: 'Admin' },
          projectType: null,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        boq: {
          id: 'boq-001',
          projectId: 'proj-001',
          boqTemplateId: 'tmpl-001',
          code: 'BOQ-001',
          name: 'Main BOQ',
          limitBudgetPercentage: '100',
          isRabComplete: true,
          isLimitBudgetComplete: true,
          isCcoComplete: true,
          isActive: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          items: [
            {
              id: 'proj-item-root',
              parentId: null,
              sortOrder: 1,
              level: 1,
              code: 'A',
              name: 'Pekerjaan Beton',
              isFinalLevel: false,
              weight: null,
              scheduleStartDate: null,
              scheduleEndDate: null,
              children: [
                {
                  id: 'proj-item-leaf',
                  parentId: 'proj-item-root',
                  sortOrder: 1,
                  level: 2,
                  code: 'A.1',
                  name: 'Pondasi',
                  isFinalLevel: true,
                  weight: '25',
                  scheduleStartDate: null,
                  scheduleEndDate: null,
                  children: [],
                },
              ],
            },
          ],
        },
      },
    });
  }),

  http.get(h('/projects/:projectId/boq/items/:itemId'), () => {
    return HttpResponse.json<ApiResponse<any>>({
      success: true,
      message: 'Data biaya item berhasil diambil.',
      data: {
        item: {
          id: 'proj-item-leaf',
          parentId: 'proj-item-root',
          sortOrder: 1,
          level: 2,
          code: 'A.1',
          name: 'Pondasi',
          isFinalLevel: true,
          weight: '25',
          isActive: true,
        },
        costs: [
          {
            category: 'material_cost',
            categoryName: 'Material Cost',
            items: [
              {
                id: 'cost-mat-001',
                costCategory: 'material_cost',
                catalogId: 'cat-001',
                code: 'SM',
                name: 'Semen',
                volumeRab: '50',
                uomId: '1',
                uom: { id: '1', name: 'Meter' },
                unitPriceRab: '100000',
                catalog: { id: 'cat-001', code: 'SM', name: 'Semen' },
              },
            ],
          },
          {
            category: 'equipment_cost',
            categoryName: 'Equipment Cost',
            items: [],
          },
          {
            category: 'man_power_cost',
            categoryName: 'Man Power Cost',
            items: [],
          },
          {
            category: 'transport_cost',
            categoryName: 'Transport Cost',
            items: [],
          },
          {
            category: 'preliminery_cost',
            categoryName: 'Preliminery Cost',
            items: [],
          },
        ],
      },
    });
  }),

  http.post(h('/projects/:projectId/boq'), () => {
    return HttpResponse.json<ApiResponse<null>>({
      success: true,
      message: 'BOQ Project berhasil disinkronisasi.',
      data: null,
    });
  }),

  http.post(h('/projects/:projectId/boq/items/sync'), () => {
    return HttpResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Jadwal Project berhasil diperbarui.',
      data: null,
    });
  }),

  http.post(h('/projects/:projectId/boq/items/:itemId/costs/sync'), () => {
    return HttpResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Biaya item BOQ project berhasil disimpan.',
      data: null,
    });
  }),

  http.get(h('/projects/:projectId/boq/catalog-prices'), () => {
    return HttpResponse.json<ApiResponse<any>>({
      success: true,
      message: 'Data catalog prices berhasil diambil.',
      data: [
        {
          item: {
            id: 'proj-item-leaf',
            boqId: 'boq-001',
            parentId: 'proj-item-root',
            sortOrder: 1,
            level: 2,
            code: 'A.1',
            name: 'Pondasi',
            isFinalLevel: true,
            weight: '25',
            limitBudgetPercentage: null,
            volumeRab: '100',
            volumeCco: null,
            volumeActual: null,
            uomId: '1',
            unitPriceMaterialRab: '500000',
            unitPriceMaterialCco: null,
            unitPriceMaterialActual: null,
            unitPriceWorkRab: '200000',
            unitPriceWorkCco: null,
            unitPriceWorkActual: null,
            totalPriceMaterialRab: null,
            totalPriceMaterialCco: null,
            totalPriceMaterialActual: null,
            totalPriceWorkRab: null,
            totalPriceWorkCco: null,
            totalPriceWorkActual: null,
            totalAmountRab: null,
            totalAmountCco: null,
            totalAmountActual: null,
            amountAfterLimitRab: null,
            scheduleStartDate: null,
            scheduleEndDate: null,
            remarks: null,
            isActive: true,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
            taskMonitoring: {
              assignedEmployees: [],
              manpowerTask: 0,
              qcTask: 0,
              totalScheduleDays: 0,
              weightItem: '0',
              totalTask: 0,
              totalDoneTask: 0,
              percentageDoneTask: 0,
              status: 'not_started',
            },
          },
          resumeMaterialCost: [
            {
              catalogId: 'cat-001',
              catalogType: 'item_catalog',
              code: 'SM',
              name: 'Semen',
              volumeRab: '50',
              uom: { id: '1', code: 'M', name: 'Meter' },
              durationRab: null,
              durationCco: null,
              durationAct: null,
              durationUom: null,
              materialCost: {
                id: 'mat-cost-001',
                boqId: 'boq-001',
                costCategory: 'material_cost',
                catalogType: 'item_catalog',
                catalogId: 'cat-001',
                originalPriceRab: '80000',
                markupPercentageRab: '25',
                unitPriceRab: '100000',
                unitPriceCco: null,
                unitPriceActual: null,
                catalog: { id: 'cat-001', code: 'SM', name: 'Semen' },
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z',
              },
              transportCost: {
                id: 'trp-cost-001',
                boqId: 'boq-001',
                costCategory: 'transport_cost',
                catalogType: 'item_catalog',
                catalogId: 'cat-001',
                originalPriceRab: '5000',
                markupPercentageRab: '0',
                unitPriceRab: '5000',
                unitPriceCco: null,
                unitPriceActual: null,
                catalog: { id: 'cat-001', code: 'SM', name: 'Semen' },
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z',
              },
              totalCostMaterial: 4000000,
              totalCostTransport: 250000,
              amount: 4250000,
            },
          ],
          resumeEquipmentCost: [
            {
              catalogId: 'eq-001',
              catalogType: 'equipment_catalog',
              code: 'EXC',
              name: 'Excavator',
              volumeRab: '10',
              uom: { id: '2', code: 'HR', name: 'Hour' },
              durationRab: '8',
              durationCco: null,
              durationAct: null,
              durationUom: { id: '2', code: 'HR', name: 'Hour' },
              equipmentCost: {
                id: 'eq-cost-001',
                boqId: 'boq-001',
                costCategory: 'equipment_cost',
                catalogType: 'equipment_catalog',
                catalogId: 'eq-001',
                originalPriceRab: '500000',
                markupPercentageRab: '10',
                unitPriceRab: '550000',
                unitPriceCco: null,
                unitPriceActual: null,
                catalog: { id: 'eq-001', code: 'EXC', name: 'Excavator' },
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z',
              },
              transportCost: {
                id: 'trp-eq-001',
                boqId: 'boq-001',
                costCategory: 'transport_cost',
                catalogType: 'equipment_catalog',
                catalogId: 'eq-001',
                originalPriceRab: '10000',
                markupPercentageRab: '0',
                unitPriceRab: '10000',
                unitPriceCco: null,
                unitPriceActual: null,
                catalog: { id: 'eq-001', code: 'EXC', name: 'Excavator' },
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z',
              },
              totalCostEquipment: 5500000,
              totalCostTransport: 100000,
              amount: 5600000,
            },
          ],
          totalAmount: 9850000,
        },
      ],
    });
  }),

  http.get(h('/project-capabilities'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '20', 10);

    const filtered = mockProjectCapabilities.filter((c) => c.isActive);
    const total = filtered.length;
    const lastPage = Math.ceil(total / perPage) || 1;
    const from = total > 0 ? (page - 1) * perPage + 1 : null;
    const to = total > 0 ? Math.min(page * perPage, total) : null;
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    return HttpResponse.json<ApiPaginatedResponse<any>>(
      {
        success: true,
        message: 'Data retrieved successfully',
        data: paginated,
        meta: { currentPage: page, perPage, total, lastPage, from, to },
        links: {
          first: h(`/project-capabilities?page=1&perPage=${perPage}`),
          last: h(`/project-capabilities?page=${lastPage}&perPage=${perPage}`),
          prev: page > 1 ? h(`/project-capabilities?page=${page - 1}&perPage=${perPage}`) : null,
          next:
            page < lastPage ? h(`/project-capabilities?page=${page + 1}&perPage=${perPage}`) : null,
        },
      },
      { status: 200 }
    );
  }),
];
