import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/utils/test-utils';
import { HIERARCHY_MANAGEMENT_LABELS } from '../../constants';
import { EditHierarchyManagementPage } from '../EditHierarchyManagementPage';

const mockPush = vi.fn();
const mockParams = { id: '1' };
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockParams,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/organization/hierarchy/1/edit',
}));

describe('EditHierarchyManagementPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
    mockParams.id = '1';
  });

  it('renders without crashing', () => {
    render(<EditHierarchyManagementPage />);
  });

  it('renders page title after loading', async () => {
    render(<EditHierarchyManagementPage />);
    await waitFor(() => {
      expect(screen.getByText(HIERARCHY_MANAGEMENT_LABELS.EDIT.PAGE_TITLE)).toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/company-positions/:id'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<EditHierarchyManagementPage />);

    await waitFor(() => {
      expect(screen.getByText(/Hierarki tidak ditemukan/i)).toBeInTheDocument();
    });
  });
});
