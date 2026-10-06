import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/utils/test-utils';
import { GROUP_LABELS } from '../../constants';
import { EditGroupPage } from '../EditGroupPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: mockPush }),
}));

describe('EditGroupPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    render(<EditGroupPage />);
  });

  it('renders page title after loading', async () => {
    render(<EditGroupPage />);
    await waitFor(() => {
      expect(screen.getByText(GROUP_LABELS.EDIT.PAGE_TITLE)).toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/groups/:id'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<EditGroupPage />);

    await waitFor(() => {
      expect(screen.getByText(/Group tidak ditemukan/i)).toBeInTheDocument();
    });
  });
});
