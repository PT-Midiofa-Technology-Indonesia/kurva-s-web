import { HttpResponse, http } from 'msw';

const h = (path: string) => `/api/v1${path}`;

const allEmployees = [
  {
    id: '1',
    userId: null,
    code: 'EMP-001',
    fullName: 'John Doe',
    employeeType: 'staff',
    isActive: true,
    gender: 'male',
    birthPlace: 'Jakarta',
    birthDate: '1990-01-15',
    phone: '6281234567890',
    email: 'john@example.com',
    province: null,
    city: null,
    district: null,
    village: null,
    postalCode: null,
    addressDetail: null,
    nik: null,
    npwp: null,
    contractType: null,
    salaryType: null,
    workPlacement: null,
    hireDate: null,
    terminationDate: null,
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2020-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    userId: null,
    code: 'EMP-002',
    fullName: 'Jane Worker',
    employeeType: 'project_worker',
    isActive: true,
    gender: 'female',
    birthPlace: 'Bandung',
    birthDate: '1992-05-20',
    phone: '6281234567891',
    email: 'jane@example.com',
    province: null,
    city: null,
    district: null,
    village: null,
    postalCode: null,
    addressDetail: null,
    nik: null,
    npwp: null,
    contractType: null,
    salaryType: null,
    workPlacement: null,
    hireDate: null,
    terminationDate: null,
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2020-01-01T00:00:00.000Z',
  },
];

const positionAssignments = [
  {
    id: '019eb00c-db1c-73e6-8712-f79f02497254',
    employeeId: '1',
    companyId: '019e5387-20a8-7094-bda4-c029d64757f2',
    companyPositionId: '019ea868-b741-72ba-b719-8a417b2d4438',
    startedAt: '2026-06-10',
    endedAt: null,
    reason: null,
    notes: null,
    isActive: true,
    company: {
      id: '019e5387-20a8-7094-bda4-c029d64757f2',
      code: 'COMWIB',
      name: 'PT. Curva 1',
      npwp: '12.112.121.2-121.212',
      siupNumber: 'ASD1521AJDA',
      phone: '62811111111111',
      email: null,
      postalCode: null,
      addressDetail: 'Kantor WIB',
      isActive: true,
      createdAt: '2026-05-23T06:30:25.000000Z',
      updatedAt: '2026-06-06T02:13:27.000000Z',
    },
    companyPosition: {
      id: '019ea868-b741-72ba-b719-8a417b2d4438',
      isActive: true,
      department: {
        id: '019e4de1-b013-73ba-b1a1-35f4b1eea3eb',
        code: 'BD',
        name: 'Business Development',
        isActive: true,
      },
      position: {
        id: '019ea7af-99bf-7392-8974-ca928e82b792',
        code: 'D0010',
        name: 'Job Position 10',
        level: 1,
        isActive: true,
      },
      createdAt: '2026-06-08T18:04:55.000000Z',
      updatedAt: '2026-06-08T18:04:55.000000Z',
    },
    createdAt: '2026-06-10T12:41:33+07:00',
    updatedAt: '2026-06-10T12:41:33+07:00',
  },
];

const employeeRatingSummary = {
  overallAvg: 4.15,
  totalRatings: 3,
  lastRatedAt: '2026-07-16T10:20:00+00:00',
  perCategory: [
    {
      categoryId: 'cat-1',
      categoryCode: 'capability',
      categoryName: 'Capability',
      avgScore: 4.33,
      count: 3,
      isActive: true,
    },
    {
      categoryId: 'cat-2',
      categoryCode: 'responsibility',
      categoryName: 'Responsibility',
      avgScore: 4,
      count: 3,
      isActive: true,
    },
    {
      categoryId: 'cat-3',
      categoryCode: 'quality',
      categoryName: 'Quality',
      avgScore: 4.12,
      count: 3,
      isActive: true,
    },
    {
      categoryId: 'cat-4',
      categoryCode: 'timeliness',
      categoryName: 'Timeliness',
      avgScore: 4.5,
      count: 3,
      isActive: true,
    },
    {
      categoryId: 'cat-5',
      categoryCode: 'communication',
      categoryName: 'Communication',
      avgScore: 4.25,
      count: 3,
      isActive: true,
    },
  ],
};

const employeeRatings = [
  {
    id: 'rating-1',
    ratedAt: '2026-07-16T00:00:00+00:00',
    overallScore: 4.33,
    note: null,
    ratedBy: { id: 'user-1', name: 'Mobile Admin' },
    source: {
      type: 'project',
      id: 'project-1',
      label: 'PRJ-001',
      deleted: false,
    },
    scores: [
      {
        categoryId: 'cat-1',
        categoryCode: 'capability',
        categoryName: 'Capability',
        categoryStatus: 'active',
        score: 5,
        note: null,
      },
      {
        categoryId: 'cat-2',
        categoryCode: 'responsibility',
        categoryName: 'Responsibility',
        categoryStatus: 'active',
        score: 4,
        note: null,
      },
      {
        categoryId: 'cat-3',
        categoryCode: 'quality',
        categoryName: 'Quality',
        categoryStatus: 'active',
        score: 4,
        note: null,
      },
      {
        categoryId: 'cat-4',
        categoryCode: 'timeliness',
        categoryName: 'Timeliness',
        categoryStatus: 'active',
        score: 4,
        note: null,
      },
      {
        categoryId: 'cat-5',
        categoryCode: 'communication',
        categoryName: 'Communication',
        categoryStatus: 'active',
        score: 5,
        note: null,
      },
    ],
  },
];

export const manpowerHandlers = [
  http.get(h('/employees'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);
    const employeeType = url.searchParams.get('employeeType');

    const filtered = employeeType
      ? allEmployees.filter((e) => e.employeeType === employeeType)
      : allEmployees;

    const total = filtered.length;
    const lastPage = Math.ceil(total / perPage) || 1;
    const data = filtered.slice((page - 1) * perPage, page * perPage);

    return HttpResponse.json(
      {
        success: true,
        message: 'Data retrieved successfully',
        data,
        meta: {
          currentPage: page,
          perPage,
          total,
          lastPage,
          from: total > 0 ? 1 : null,
          to: total > 0 ? total : null,
        },
        links: { first: null, last: null, prev: null, next: null },
      },
      { status: 200 }
    );
  }),

  http.get(h('/employees/:id'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Data retrieved successfully',
      data: allEmployees[0],
    });
  }),

  http.get(h('/employee/:id/position-assignments'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Data penugasan posisi karyawan berhasil diambil.',
      data: positionAssignments,
    });
  }),

  http.get(h('/employees/:id/ratings/summary'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Data ringkasan rating karyawan berhasil diambil.',
      data: employeeRatingSummary,
    });
  }),

  http.get(h('/employees/:id/ratings'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '20', 10);

    const total = employeeRatings.length;
    const lastPage = Math.ceil(total / perPage) || 1;
    const data = employeeRatings.slice((page - 1) * perPage, page * perPage);

    return HttpResponse.json({
      success: true,
      message: 'Data riwayat rating karyawan berhasil diambil.',
      data,
      meta: {
        currentPage: page,
        perPage,
        total,
        lastPage,
        from: total > 0 ? 1 : null,
        to: total > 0 ? total : null,
      },
      links: { first: null, last: null, prev: null, next: null },
    });
  }),

  http.post(h('/employee/:id/position-assignments'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Penugasan posisi berhasil disimpan',
    });
  }),

  http.post(h('/employees'), () => {
    return HttpResponse.json({ success: true, message: 'Created successfully', data: { id: '3' } });
  }),

  http.put(h('/employees/:id'), () => {
    return HttpResponse.json({ success: true, message: 'Updated successfully' });
  }),

  http.delete(h('/employees/:id'), () => {
    return HttpResponse.json({ success: true, message: 'Deleted successfully' });
  }),
];
