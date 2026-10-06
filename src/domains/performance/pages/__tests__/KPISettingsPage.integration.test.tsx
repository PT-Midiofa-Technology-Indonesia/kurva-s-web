import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { KPISettingsPage } from '../KPISettingsPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/human-resource/kpi/settings',
  useSearchParams: () => new URLSearchParams(),
}));

describe('KPISettingsPage Integration', () => {
  it('renders page header and tabs', async () => {
    server.use(
      http.get(getApiPath('/performance/company-settings'), () => {
        return HttpResponse.json({
          data: {
            pillars: [
              { performancePillarId: 'p1', code: 'attendance', name: 'Kehadiran', weight: 25 },
              {
                performancePillarId: 'p2',
                code: 'productivity',
                name: 'Produktifitas',
                weight: 25,
              },
              { performancePillarId: 'p3', code: 'quality', name: 'Kualitas Kerja', weight: 25 },
              { performancePillarId: 'p4', code: 'violation', name: 'Pelanggaran', weight: 25 },
            ],
            grades: [
              { performanceGradeId: 'g1', grade: 'A', minScore: 90, maxScore: 100 },
              { performanceGradeId: 'g2', grade: 'B', minScore: 80, maxScore: 89 },
            ],
          },
        });
      }),
      http.get(getApiPath('/performance/employee-grades'), () => {
        return HttpResponse.json({
          data: [],
          meta: { total: 0, currentPage: 1, perPage: 10, lastPage: 1 },
        });
      })
    );

    render(<KPISettingsPage />);

    expect(screen.getByText('Setting KPI')).toBeInTheDocument();
    expect(screen.getByText('SETTING BOBOT PILAR & GRADE')).toBeInTheDocument();
    expect(screen.getByText('SETTING REWARD, PUNISHMENT DAN KOMPONEN')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Bobot pilar utama')).toBeInTheDocument();
      expect(screen.getByText('Kehadiran')).toBeInTheDocument();
    });
  });

  it('handles search input change in grade settings tab', async () => {
    server.use(
      http.get(getApiPath('/performance/employee-grades'), ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search');
        if (search === 'Helper') {
          return HttpResponse.json({
            data: [
              {
                id: '1',
                code: '1A',
                name: 'Helper Junior',
                componentsCount: 3,
                gradesCount: 5,
                status: true,
              },
            ],
            meta: { total: 1, currentPage: 1, perPage: 10, lastPage: 1 },
          });
        }
        return HttpResponse.json({
          data: [],
          meta: { total: 0, currentPage: 1, perPage: 10, lastPage: 1 },
        });
      })
    );

    render(<KPISettingsPage />);

    const gradeTab = screen.getByText('SETTING REWARD, PUNISHMENT DAN KOMPONEN');
    gradeTab.click();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Pencarian')).toBeInTheDocument();
    });
  });
});
