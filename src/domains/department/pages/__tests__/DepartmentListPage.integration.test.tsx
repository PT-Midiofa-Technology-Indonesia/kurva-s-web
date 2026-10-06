import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@/utils/test-utils';
import { DEPARTMENT_LABELS } from '../../constants';
import { DepartmentListPage } from '../DepartmentListPage';

describe('DepartmentListPage Integration', () => {
  it('renders without crashing', () => {
    render(<DepartmentListPage />);
  });

  it('displays page title as heading', async () => {
    render(<DepartmentListPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        DEPARTMENT_LABELS.LIST.TITLE
      );
    });
  });

  it('shows search input', async () => {
    render(<DepartmentListPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
  });

  it('displays status filter', async () => {
    render(<DepartmentListPage />);
    await waitFor(() => {
      expect(screen.getByText('Semua Status')).toBeInTheDocument();
    });
  });

  it('fetches and displays the mock data', async () => {
    render(<DepartmentListPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('renders table column headers', async () => {
    render(<DepartmentListPage />);
    await waitFor(() => {
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('handles search input typing', async () => {
    const user = userEvent.setup();
    render(<DepartmentListPage />);

    const searchInput = await screen.findByPlaceholderText('Search...');
    await user.type(searchInput, 'IT');

    await waitFor(() => {
      expect(searchInput).toHaveValue('IT');
    });
  });
});
