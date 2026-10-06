import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { KPIDetailPage } from '../KPIDetailPage';

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams('month=8&year=2026&companyId=company-1');
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/human-resource/kpi/1',
  useSearchParams: () => mockSearchParams,
}));

const mockEmployeeDetail = {
  employee: {
    id: '1',
    name: 'John Doe',
    nik: 'NIK001',
    email: 'john.doe@example.com',
    position: 'Software Engineer',
    department: 'Engineering',
  },
  period: {
    month: 1,
    year: 2024,
  },
  score: 85,
  grade: {
    grade: 'A',
    description: 'Sangat Baik',
  },
  pillars: [
    {
      id: 'p1',
      code: 'productiv',
      name: 'Produktivitas',
      weight: 40,
      score: 90,
      percentage: 98,
      components: [],
    },
    {
      id: 'p2',
      code: 'attend',
      name: 'Kehadiran',
      weight: 30,
      score: 100,
      percentage: 100,
      components: [],
    },
  ],
  rewards: [],
  punishments: [],
};

const mockHistoryResponse = {
  data: [
    {
      id: 'h1',
      period: '2024-01',
      score: 85,
      grade: 'A',
      productivity: '98%',
      attendance: '100%',
      quality: '100%',
    },
  ],
};

const mockProjectHistoryResponse = {
  data: [
    {
      id: 'pr1',
      projectName: 'Website Redesign',
      role: 'Frontend Lead',
      startDate: '2024-01-01',
      status: 'Selesai',
    },
  ],
};

function getApiPath(path: string) {
  return `http://localhost:3000/api/v1${path}`;
}

describe('KPIDetailPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams('month=8&year=2026&companyId=company-1');
    server.use(
      http.get(getApiPath('/performance/employees/:id'), () => {
        return HttpResponse.json({ data: mockEmployeeDetail });
      }),
      http.get(getApiPath('/performance/employees/:id/history'), () => {
        return HttpResponse.json(mockHistoryResponse);
      }),
      http.get(getApiPath('/performance/employees/:id/project-history'), () => {
        return HttpResponse.json(mockProjectHistoryResponse);
      }),
      http.get(getApiPath('/performance/employees/:id/violations'), () => {
        return HttpResponse.json({ data: [] });
      })
    );
  });

  it('renders employee info (name, position, etc)', async () => {
    render(<KPIDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });
  });

  it('displays back button (navigates to list)', async () => {
    const user = userEvent.setup();
    render(<KPIDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/human-resource/kpi?month=8&year=2026');
    });
  });

  it('shows period filter', async () => {
    render(<KPIDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /aug 2026/i })).toBeInTheDocument();
    });
  });

  it('displays metric cards and summary banner', async () => {
    render(<KPIDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Produktivitas')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Kehadiran')[0]).toBeInTheDocument();
      expect(screen.getByText('Kualitas Kerja')).toBeInTheDocument();
      expect(screen.getByText('Pelanggaran')).toBeInTheDocument();
      expect(screen.getByText('Total Penilaian')).toBeInTheDocument();
      expect(screen.getByText('Grade A')).toBeInTheDocument();
    });
  });

  it('displays history tabs', async () => {
    render(<KPIDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('HISTORY PENILAIAN')).toBeInTheDocument();
      expect(screen.getByText('HISTORY PELANGGARAN')).toBeInTheDocument();
      expect(screen.getByText('HISTORY PROJECT')).toBeInTheDocument();
    });
  });

  it('does not fetch detail and history when period params are invalid', async () => {
    mockSearchParams = new URLSearchParams('month=13&year=2026&companyId=company-1');
    let detailRequests = 0;
    let historyRequests = 0;

    server.use(
      http.get(getApiPath('/performance/employees/:id'), () => {
        detailRequests += 1;
        return HttpResponse.json({ data: mockEmployeeDetail });
      }),
      http.get(getApiPath('/performance/employees/:id/history'), () => {
        historyRequests += 1;
        return HttpResponse.json(mockHistoryResponse);
      })
    );

    render(<KPIDetailPage />);

    await waitFor(() => {
      expect(detailRequests).toBe(0);
      expect(historyRequests).toBe(0);
    });
  });
});
