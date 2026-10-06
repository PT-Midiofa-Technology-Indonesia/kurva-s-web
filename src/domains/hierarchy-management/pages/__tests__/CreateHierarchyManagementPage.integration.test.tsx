import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/utils/test-utils';
import { HIERARCHY_MANAGEMENT_LABELS } from '../../constants';
import { CreateHierarchyManagementPage } from '../CreateHierarchyManagementPage';

const mockPush = vi.fn();
const mockSearchParamsRef = { value: new URLSearchParams('companyId=1') };

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParamsRef.value,
}));

describe('CreateHierarchyManagementPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
    mockSearchParamsRef.value = new URLSearchParams('companyId=1');
  });

  it('renders without crashing', () => {
    render(<CreateHierarchyManagementPage />);
  });

  it('renders page title', () => {
    render(<CreateHierarchyManagementPage />);
    expect(screen.getByText(HIERARCHY_MANAGEMENT_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<CreateHierarchyManagementPage />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('renders form fields', async () => {
    render(<CreateHierarchyManagementPage />);
    await waitFor(() => {
      expect(
        screen.getByText(HIERARCHY_MANAGEMENT_LABELS.CREATE.FIELDS.DEPARTMENT)
      ).toBeInTheDocument();
      expect(
        screen.getByText(HIERARCHY_MANAGEMENT_LABELS.CREATE.FIELDS.POSITION)
      ).toBeInTheDocument();
      expect(
        screen.getByText(HIERARCHY_MANAGEMENT_LABELS.CREATE.FIELDS.STATUS)
      ).toBeInTheDocument();
    });
  });

  it('renders cancel and save buttons', async () => {
    render(<CreateHierarchyManagementPage />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: HIERARCHY_MANAGEMENT_LABELS.CREATE.BUTTONS.CANCEL })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: HIERARCHY_MANAGEMENT_LABELS.CREATE.BUTTONS.SAVE })
      ).toBeInTheDocument();
    });
  });

  it('save button is disabled when required fields are empty', async () => {
    render(<CreateHierarchyManagementPage />);
    await waitFor(() => {
      const saveButton = screen.getByRole('button', {
        name: HIERARCHY_MANAGEMENT_LABELS.CREATE.BUTTONS.SAVE,
      });
      expect(saveButton).toBeDisabled();
    });
  });

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateHierarchyManagementPage />);

    const cancelButton = await screen.findByRole('button', {
      name: HIERARCHY_MANAGEMENT_LABELS.CREATE.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/organization/hierarchy?companyId=1');
  });
});
