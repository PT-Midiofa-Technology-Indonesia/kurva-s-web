import { HttpResponse, http } from 'msw';

const h = (path: string) => `/api/v1${path}`;

const mockUoms = [
  {
    id: '1',
    code: 'M',
    group: 'length',
    name: 'Meter',
    description: 'Satuan panjang SI',
    isActive: true,
    createdAt: '2026-05-19T00:00:00.000Z',
    updatedAt: '2026-05-19T00:00:00.000Z',
  },
  {
    id: '2',
    code: 'KG',
    group: 'weight',
    name: 'Kilogram',
    description: 'Satuan berat SI',
    isActive: false,
    createdAt: '2026-05-19T00:00:00.000Z',
    updatedAt: '2026-05-19T00:00:00.000Z',
  },
];

export const uomHandlers = [
  http.get(h('/uoms'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);

    const total = mockUoms.length;
    const lastPage = Math.ceil(total / perPage) || 1;
    const data = mockUoms.slice((page - 1) * perPage, page * perPage);

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

  http.get(h('/uoms/:id'), ({ params }) => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Detail satuan ukuran berhasil diambil.',
        data: {
          id: params.id,
          code: 'M',
          group: 'length',
          name: 'Meter',
          description: 'Satuan panjang SI',
          isActive: true,
          createdAt: '2026-05-19T00:00:00.000Z',
          updatedAt: '2026-05-19T00:00:00.000Z',
        },
      },
      { status: 200 }
    );
  }),

  http.post(h('/uoms'), () => {
    return HttpResponse.json(
      { success: true, message: 'Satuan ukuran berhasil ditambahkan.', data: { id: '3' } },
      { status: 201 }
    );
  }),

  http.put(h('/uoms/:id'), () => {
    return HttpResponse.json({ success: true, message: 'Satuan ukuran berhasil diperbarui.' });
  }),

  http.delete(h('/uoms/:id'), () => {
    return HttpResponse.json({ success: true, message: 'Satuan ukuran berhasil dihapus.' });
  }),
];
