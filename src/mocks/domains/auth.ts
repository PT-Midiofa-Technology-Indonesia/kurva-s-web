import { HttpResponse, http } from 'msw';

const h = (path: string) => `/api/v1${path}`;

export const authHandlers = [
  http.get(h('/auth/me'), () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'User retrieved successfully',
        data: {
          id: '1',
          name: 'Admin',
          email: 'admin@example.com',
          permissions: [
            'dashboard.company',
            'dashboard.project',
            'md.im.ityp',
            'md.im.ictg',
            'md.im.ictlg',
            'md.sm.slvl',
            'md.sm.sctg',
            'md.sm.sctlg',
            'prosc.fee.his',
            'prosc.fee.stg',
          ],
          companies: [
            {
              id: '1',
              code: 'TEST-01',
              name: 'Test Item',
              isActive: true,
            },
          ],
        },
      },
      { status: 200 }
    );
  }),
];
