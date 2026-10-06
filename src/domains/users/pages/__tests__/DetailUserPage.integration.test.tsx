import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { DetailUserPage } from '../DetailUserPage';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ userId: '1' }),
  useRouter: () => ({ push: mockPush, back: vi.fn() }),
}));

describe('DetailUserPage Integration', () => {
  it('renders without crashing', () => {
    render(<DetailUserPage />);
  });

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/users/:id'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<DetailUserPage />);

    await waitFor(() => {
      expect(screen.getByText(/Item tidak ditemukan/i)).toBeInTheDocument();
    });
  });
});
