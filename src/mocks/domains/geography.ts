import { HttpResponse, http } from 'msw';

const h = (path: string) => `/api/v1${path}`;

export const geographyHandlers = [
  http.get(h('/geography/provinces'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Data retrieved successfully',
      data: [
        { id: 'prov-1', name: 'Jawa Barat' },
        { id: 'prov-2', name: 'Jawa Tengah' },
        { id: 'prov-3', name: 'Jawa Timur' },
      ],
    });
  }),

  http.get(h('/geography/provinces/:provinceId/cities'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Data retrieved successfully',
      data: [
        { id: 'city-1', name: 'Bandung' },
        { id: 'city-2', name: 'Bogor' },
      ],
    });
  }),

  http.get(h('/geography/cities/:cityId/districts'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Data retrieved successfully',
      data: [
        { id: 'dist-1', name: 'Cicendo' },
        { id: 'dist-2', name: 'Coblong' },
      ],
    });
  }),

  http.get(h('/geography/districts/:districtId/villages'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Data retrieved successfully',
      data: [
        { id: 'vil-1', name: 'Husein Sastranegara' },
        { id: 'vil-2', name: 'Pajajaran' },
      ],
    });
  }),
];
