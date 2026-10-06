import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/utils/test-utils';
import { PROJECT_TYPE_LABELS } from '../../constants';
import { EditProjectTypePage } from '../EditProjectTypePage';

const mockPush = vi.fn();
const mockParams = { id: '1' };
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockParams,
}));

describe('EditProjectTypePage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
    mockParams.id = '1';
  });

  it('renders without crashing', () => {
    render(<EditProjectTypePage />);
  });

  it('renders page title after loading', async () => {
    render(<EditProjectTypePage />);
    await waitFor(() => {
      expect(screen.getByText(PROJECT_TYPE_LABELS.EDIT.PAGE_TITLE)).toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/project-types/:id'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<EditProjectTypePage />);

    await waitFor(() => {
      expect(screen.getByText(/Project type tidak ditemukan/i)).toBeInTheDocument();
    });
  });
});
