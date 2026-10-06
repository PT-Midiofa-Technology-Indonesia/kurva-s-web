import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { KPIGradeSettingsPage } from '../KPIGradeSettingsPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ gradeId: '1A' }),
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/human-resource/kpi/settings/1A',
  useSearchParams: () => new URLSearchParams('code=1A'),
}));

describe('KPIGradeSettingsPage Integration', () => {
  it('renders grade settings page with rewards, punishments and pillars', async () => {
    server.use(
      http.get(getApiPath('/performance/employee-grades/1A/settings'), () => {
        return HttpResponse.json({
          data: {
            code: '1A',
            gradeSettings: [
              { id: '1', grade: 'A', rewards: [], punishments: [] },
              { id: '2', grade: 'B', rewards: [], punishments: [] },
            ],
            pillars: [
              { id: 'p1', name: 'Produktivitas', components: [] },
              { id: 'p2', name: 'Kehadiran', components: [] },
              { id: 'p3', name: 'Kualitas Kerja', components: [] },
            ],
          },
        });
      })
    );

    render(<KPIGradeSettingsPage />);

    expect(screen.getByText('Setting 1A')).toBeInTheDocument();
    expect(screen.getByText('Reward & punishment per grade')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Produktivitas')).toBeInTheDocument();
      expect(screen.getByText('Kehadiran')).toBeInTheDocument();
      expect(screen.getByText('Kualitas Kerja')).toBeInTheDocument();
    });
  });
});
