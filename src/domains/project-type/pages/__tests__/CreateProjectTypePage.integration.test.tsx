import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/utils/test-utils';
import { PROJECT_TYPE_LABELS } from '../../constants';
import { CreateProjectTypePage } from '../CreateProjectTypePage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('CreateProjectTypePage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    render(<CreateProjectTypePage />);
  });

  it('renders page title', () => {
    render(<CreateProjectTypePage />);
    expect(screen.getByText(PROJECT_TYPE_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<CreateProjectTypePage />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('renders form fields', async () => {
    render(<CreateProjectTypePage />);
    await waitFor(() => {
      expect(screen.getByText(PROJECT_TYPE_LABELS.CREATE.FIELDS.CODE)).toBeInTheDocument();
      expect(screen.getByText(PROJECT_TYPE_LABELS.CREATE.FIELDS.NAME)).toBeInTheDocument();
      expect(screen.getByText(PROJECT_TYPE_LABELS.CREATE.FIELDS.STATUS)).toBeInTheDocument();
    });
  });

  it('renders cancel and save buttons', async () => {
    render(<CreateProjectTypePage />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: PROJECT_TYPE_LABELS.CREATE.BUTTONS.CANCEL })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: PROJECT_TYPE_LABELS.CREATE.BUTTONS.SAVE })
      ).toBeInTheDocument();
    });
  });

  it('save button is disabled when required fields are empty', async () => {
    render(<CreateProjectTypePage />);
    await waitFor(() => {
      const saveButton = screen.getByRole('button', {
        name: PROJECT_TYPE_LABELS.CREATE.BUTTONS.SAVE,
      });
      expect(saveButton).toBeDisabled();
    });
  });

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateProjectTypePage />);

    const cancelButton = await screen.findByRole('button', {
      name: PROJECT_TYPE_LABELS.CREATE.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/master-data/project-type');
  });
});
