import { HttpResponse, http } from 'msw';

const h = (path: string) => `/api/v1${path}`;

const mockResourceUnits = [
  {
    id: 'unit-1',
    code: 'UNIT-001',
    itemCatalog: { id: 'item-1', code: 'ITEM01', name: 'Excavator' },
    company: { id: 'comp-1', code: 'COMP01', name: 'Company A' },
    warehouse: { id: 'wh-1', code: 'WH01', name: 'Main Warehouse' },
    status: 'available',
    acquisitionDate: '2024-01-01',
    acquisitionCost: '500000000',
    notes: 'Main equipment',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockResourceAllocations = [
  {
    id: 'alloc-1',
    code: 'ALLOC-001',
    project: { id: 'proj-1', code: 'PROJ01', name: 'Project A' },
    company: { id: 'comp-1', code: 'COMP01', name: 'Company A' },
    allocationType: 'unit',
    resourceUnit: {
      id: 'unit-1',
      code: 'UNIT-001',
      itemCatalog: { id: 'item-1', code: 'ITEM01', name: 'Excavator' },
      company: { id: 'comp-1', code: 'COMP01', name: 'Company A' },
      warehouse: { id: 'wh-1', code: 'WH01', name: 'Main Warehouse' },
      status: 'allocated',
      acquisitionDate: '2024-01-01',
      acquisitionCost: '500000000',
      notes: null,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    itemCatalog: null,
    sourceWarehouse: { id: 'wh-1', code: 'WH01', name: 'Main Warehouse' },
    quantity: null,
    allocatedFromDate: '2024-01-15',
    allocatedToDate: '2024-12-31',
    status: 'allocated',
    allocatedBy: { id: 'user-1', name: 'John Doe' },
    returnedAt: null,
    returnedBy: null,
    notes: 'Test allocation',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'alloc-2',
    code: 'ALLOC-002',
    project: { id: 'proj-1', code: 'PROJ01', name: 'Project A' },
    company: { id: 'comp-1', code: 'COMP01', name: 'Company A' },
    allocationType: 'quantity',
    resourceUnit: null,
    itemCatalog: { id: 'item-1', code: 'ITEM01', name: 'Diesel' },
    sourceWarehouse: { id: 'wh-1', code: 'WH01', name: 'Main Warehouse' },
    quantity: 1000,
    allocatedFromDate: '2024-01-15',
    allocatedToDate: '2024-12-31',
    status: 'allocated',
    allocatedBy: { id: 'user-1', name: 'John Doe' },
    returnedAt: null,
    returnedBy: null,
    notes: 'Test quantity allocation',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

export const resourceManagementHandlers = [
  http.get(h('/resource-units'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);

    const total = mockResourceUnits.length;
    const lastPage = Math.ceil(total / perPage) || 1;
    const data = mockResourceUnits.slice((page - 1) * perPage, page * perPage);

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
          to: total > 0 ? data.length : null,
        },
        links: { first: null, last: null, prev: null, next: null },
      },
      { status: 200 }
    );
  }),

  http.get(h('/resource-units/:id'), ({ params }) => {
    let unit: Record<string, unknown> | undefined;

    if (params.id === 'unit-1') {
      unit = {
        id: 'unit-1',
        code: 'UNIT-001',
        itemCatalog: { id: 'item-1', code: 'ITEM01', name: 'Excavator' },
        company: { id: 'comp-1', code: 'COMP01', name: 'Company A' },
        warehouse: { id: 'wh-1', code: 'WH01', name: 'Main Warehouse' },
        status: 'available',
        acquisitionDate: '2024-01-01',
        acquisitionCost: '500000000',
        notes: 'Main equipment',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
    } else if (params.id === 'allocatedUnit') {
      unit = {
        id: 'allocatedUnit',
        code: 'UNIT-002',
        itemCatalog: { id: 'item-1', code: 'ITEM01', name: 'Excavator' },
        company: { id: 'comp-1', code: 'COMP01', name: 'Company A' },
        warehouse: { id: 'wh-1', code: 'WH01', name: 'Main Warehouse' },
        status: 'allocated',
        acquisitionDate: '2024-01-01',
        acquisitionCost: '500000000',
        notes: 'Main equipment',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
    } else if (params.id === 'unitNoNotes') {
      unit = {
        id: 'unitNoNotes',
        code: 'UNIT-003',
        itemCatalog: { id: 'item-1', code: 'ITEM01', name: 'Excavator' },
        company: { id: 'comp-1', code: 'COMP01', name: 'Company A' },
        warehouse: { id: 'wh-1', code: 'WH01', name: 'Main Warehouse' },
        status: 'available',
        acquisitionDate: '2024-01-01',
        acquisitionCost: '500000000',
        notes: null,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
    } else {
      unit = mockResourceUnits.find((u) => u.id === params.id);
    }

    if (!unit) {
      return HttpResponse.json(
        { success: false, message: 'Resource unit not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        message: 'Resource unit retrieved successfully',
        data: unit,
      },
      { status: 200 }
    );
  }),

  http.post(h('/resource-units'), () => {
    return HttpResponse.json(
      { success: true, message: 'Resource unit created successfully', data: { id: 'unit-2' } },
      { status: 201 }
    );
  }),

  http.put(h('/resource-units/:id'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Resource unit updated successfully',
    });
  }),

  http.delete(h('/resource-units/:id'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Resource unit deleted successfully',
    });
  }),

  http.get(h('/resource-allocations'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);

    const total = mockResourceAllocations.length;
    const lastPage = Math.ceil(total / perPage) || 1;
    const data = mockResourceAllocations.slice((page - 1) * perPage, page * perPage);

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
          to: total > 0 ? data.length : null,
        },
        links: { first: null, last: null, prev: null, next: null },
      },
      { status: 200 }
    );
  }),

  http.get(h('/resource-allocations/:id'), ({ params }) => {
    const allocation = mockResourceAllocations.find((a) => a.id === params.id);
    if (!allocation) {
      return HttpResponse.json(
        { success: false, message: 'Resource allocation not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        message: 'Resource allocation retrieved successfully',
        data: allocation,
      },
      { status: 200 }
    );
  }),
];
