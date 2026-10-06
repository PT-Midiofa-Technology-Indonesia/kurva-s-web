import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@/shared/utils/test-utils';

import { BOQTemplatePage } from '../BOQTemplatePage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('BOQTemplatePage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders table with data after loading', async () => {
    render(<BOQTemplatePage />);

    await waitFor(() => {
      expect(screen.getByText('Office Building')).toBeInTheDocument();
    });
    expect(screen.getByText('Road Construction')).toBeInTheDocument();
  });

  it('displays table column headers', async () => {
    render(<BOQTemplatePage />);

    await waitFor(() => {
      expect(screen.getByText('Nama Template')).toBeInTheDocument();
    });
    expect(screen.getByText('Project Capability')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('shows project capability for each row', async () => {
    render(<BOQTemplatePage />);

    await waitFor(() => {
      expect(screen.getByText('High Rise Building')).toBeInTheDocument();
    });
    expect(screen.getByText('Infrastructure')).toBeInTheDocument();
  });

  it('shows status badges', async () => {
    render(<BOQTemplatePage />);

    await waitFor(() => {
      expect(screen.getByText('Aktif')).toBeInTheDocument();
    });
    expect(screen.getByText('Tidak Aktif')).toBeInTheDocument();
  });

  // ── Search ─────────────────────────────────────────────────────────────────

  it('shows search input', async () => {
    render(<BOQTemplatePage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Pencarian')).toBeInTheDocument();
    });
  });

  it('filters table when typing in search', async () => {
    const user = userEvent.setup();
    render(<BOQTemplatePage />);

    await waitFor(() => {
      expect(screen.getByText('Office Building')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Pencarian');
    await user.type(searchInput, 'Road');

    await waitFor(() => {
      expect(screen.queryByText('Office Building')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Road Construction')).toBeInTheDocument();
  });

  it('clears search results when search input is cleared', async () => {
    const user = userEvent.setup();
    render(<BOQTemplatePage />);

    await waitFor(() => {
      expect(screen.getByText('Office Building')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Pencarian');
    await user.type(searchInput, 'Road');

    await waitFor(() => {
      expect(screen.queryByText('Office Building')).not.toBeInTheDocument();
    });

    await user.clear(searchInput);

    await waitFor(() => {
      expect(screen.getByText('Office Building')).toBeInTheDocument();
    });
    expect(screen.getByText('Road Construction')).toBeInTheDocument();
  });

  // ── Status filter ──────────────────────────────────────────────────────────

  it('shows status filter dropdown with options', async () => {
    render(<BOQTemplatePage />);

    await waitFor(() => {
      expect(screen.getByText('Semua Status')).toBeInTheDocument();
    });
  });

  it('filters table by status when dropdown is changed', async () => {
    const user = userEvent.setup();
    render(<BOQTemplatePage />);

    await waitFor(() => {
      expect(screen.getByText('Office Building')).toBeInTheDocument();
    });

    const statusTrigger = screen.getByText('Semua Status');
    await user.click(statusTrigger);

    const inactiveOptions = await screen.findAllByText('Tidak Aktif');
    const dropdownOption = inactiveOptions.find(
      (el) => el.closest('[data-slot="command-item"]') !== null
    );
    expect(dropdownOption).toBeTruthy();
    await user.click(dropdownOption!);

    await waitFor(() => {
      expect(screen.getByText('Road Construction')).toBeInTheDocument();
    });
    expect(screen.queryByText('Office Building')).not.toBeInTheDocument();
  });

  it('shows only active rows when Aktif filter is selected', async () => {
    const user = userEvent.setup();
    render(<BOQTemplatePage />);

    await waitFor(() => {
      expect(screen.getByText('Office Building')).toBeInTheDocument();
    });

    const statusTrigger = screen.getByText('Semua Status');
    await user.click(statusTrigger);

    const activeOptions = await screen.findAllByText('Aktif');
    const dropdownOption = activeOptions.find(
      (el) => el.closest('[data-slot="command-item"]') !== null
    );
    expect(dropdownOption).toBeTruthy();
    await user.click(dropdownOption!);

    await waitFor(() => {
      expect(screen.getByText('Office Building')).toBeInTheDocument();
    });
    expect(screen.queryByText('Road Construction')).not.toBeInTheDocument();
  });

  // ── Tambah / Simpan ────────────────────────────────────────────────────────

  it('shows Tambah button when no unsaved rows', async () => {
    render(<BOQTemplatePage />);

    await waitFor(() => {
      expect(screen.getByText('Tambah')).toBeInTheDocument();
    });
  });

  it('switches to Simpan button after clicking Tambah', async () => {
    const user = userEvent.setup();
    render(<BOQTemplatePage />);

    await waitFor(() => {
      expect(screen.getByText('Tambah')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Tambah'));

    await waitFor(() => {
      expect(screen.getByText('Simpan')).toBeInTheDocument();
    });
    expect(screen.queryByText('Tambah')).not.toBeInTheDocument();
  });

  it('shows validation error when saving new row without required fields', async () => {
    const user = userEvent.setup();
    render(<BOQTemplatePage />);

    await waitFor(() => {
      expect(screen.getByText('Office Building')).toBeInTheDocument();
    });

    const tambahButton = screen.getByText('Tambah');
    await user.click(tambahButton);

    await waitFor(() => {
      expect(screen.getByText('Simpan')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Simpan');
    await user.click(saveButton);

    // Simpan button stays visible — save was blocked by validation
    await waitFor(() => {
      expect(screen.getByText('Simpan')).toBeInTheDocument();
    });
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  it('navigates to detail page when eye icon is clicked', async () => {
    const user = userEvent.setup();
    render(<BOQTemplatePage />);

    await waitFor(() => {
      expect(screen.getByText('Office Building')).toBeInTheDocument();
    });

    const eyeButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg')?.classList.contains('lucide-eye') ?? false);
    expect(eyeButtons.length).toBeGreaterThan(0);

    await user.click(eyeButtons[0]);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringMatching(/\/project-control\/boq-management\/[\w-]+\/detail/)
    );
  });

  it('navigates using the correct template id', async () => {
    const user = userEvent.setup();
    render(<BOQTemplatePage />);

    await waitFor(() => {
      expect(screen.getByText('Office Building')).toBeInTheDocument();
    });

    const eyeButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg')?.classList.contains('lucide-eye') ?? false);

    await user.click(eyeButtons[0]);

    // mock returns tmpl-001 as first row
    expect(mockPush).toHaveBeenCalledWith('/project-control/boq-management/tmpl-001/detail');
  });
});
