import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/utils/test-utils';
import { LoginPage } from '../LoginPage';

describe('LoginPage Integration', () => {
  it('renders without crashing', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /Selamat Datang/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    server.use(
      http.post(getApiPath('/auth/login'), () => {
        return HttpResponse.json({
          success: true,
          message: 'Login successful',
          data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
        });
      })
    );

    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/Masukkan email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/Masukkan password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /Masuk/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it.skip('displays error message when login fails', async () => {
    server.use(
      http.post(getApiPath('/auth/login'), () => {
        return HttpResponse.json(
          {
            success: false,
            message: 'Invalid credentials',
            data: null,
            errorCode: 'INVALID_CREDENTIALS',
          },
          { status: 400 }
        );
      })
    );

    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/Masukkan email/i), 'wrong@example.com');
    await user.type(screen.getByPlaceholderText(/Masukkan password/i), 'wrongpass');

    await user.click(screen.getByRole('button', { name: /Masuk/i }));

    // Check that an error message appears in the form
    await waitFor(
      () => {
        expect(screen.getByText(/INVALID_CREDENTIALS/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
