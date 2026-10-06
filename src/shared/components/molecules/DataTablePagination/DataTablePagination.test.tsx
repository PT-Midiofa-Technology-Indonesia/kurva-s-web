import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTablePagination } from './DataTablePagination';

vi.mock('lucide-react', () => ({
  ChevronDown: ({ className }: any) => <div className={className} data-testid="chevron-down" />,
  ChevronLeft: ({ className }: any) => <div className={className} data-testid="chevron-left" />,
  ChevronRight: ({ className }: any) => <div className={className} data-testid="chevron-right" />,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('DataTablePagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    pageSize: 10,
    totalItems: 100,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  };

  it('renders pagination container', () => {
    const { container } = render(<DataTablePagination {...defaultProps} />);
    expect(container.querySelector('.flex.items-center.justify-between')).toBeInTheDocument();
  });

  it('displays rows info correctly', () => {
    render(<DataTablePagination {...defaultProps} />);
    expect(screen.getByText('Showing 1 to 10 of 100 entries')).toBeInTheDocument();
  });

  it('displays correct "from" and "to" values for different pages', () => {
    render(<DataTablePagination {...defaultProps} currentPage={2} />);
    expect(screen.getByText('Showing 11 to 20 of 100 entries')).toBeInTheDocument();
  });

  it('displays zero entries when totalItems is 0', () => {
    render(<DataTablePagination {...defaultProps} totalItems={0} />);
    expect(screen.getByText('Showing 0 to 0 of 0 entries')).toBeInTheDocument();
  });

  it('renders page size selector', () => {
    const { container } = render(<DataTablePagination {...defaultProps} />);
    const select = container.querySelector('select');
    expect(select).toBeInTheDocument();
  });

  it('displays default page size options', () => {
    const { container } = render(<DataTablePagination {...defaultProps} />);
    const select = container.querySelector('select') as HTMLSelectElement;

    const options = Array.from(select.options).map((opt) => opt.value);
    expect(options).toEqual(['10', '20', '30', '50', '100']);
  });

  it('displays custom page size options', () => {
    const { container } = render(
      <DataTablePagination {...defaultProps} pageSizeOptions={[5, 15, 25]} />
    );

    const select = container.querySelector('select') as HTMLSelectElement;
    const options = Array.from(select.options).map((opt) => opt.value);
    expect(options).toEqual(['5', '15', '25']);
  });

  it('calls onPageSizeChange when page size is changed', async () => {
    const handlePageSizeChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <DataTablePagination {...defaultProps} onPageSizeChange={handlePageSizeChange} />
    );

    const select = container.querySelector('select') as HTMLSelectElement;
    await user.selectOptions(select, '20');

    expect(handlePageSizeChange).toHaveBeenCalledWith(20);
  });

  it('renders Previous button', () => {
    render(<DataTablePagination {...defaultProps} />);
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });

  it('renders Next button', () => {
    render(<DataTablePagination {...defaultProps} />);
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('disables Previous button on first page', () => {
    const { container } = render(<DataTablePagination {...defaultProps} currentPage={1} />);

    const buttons = container.querySelectorAll('button');
    const prevButton = Array.from(buttons).find((btn) => btn.textContent.includes('Previous'));
    expect(prevButton).toBeDisabled();
  });

  it('enables Previous button on non-first page', () => {
    const { container } = render(<DataTablePagination {...defaultProps} currentPage={2} />);

    const buttons = container.querySelectorAll('button');
    const prevButton = Array.from(buttons).find((btn) => btn.textContent.includes('Previous'));
    expect(prevButton).not.toBeDisabled();
  });

  it('disables Next button on last page', () => {
    const { container } = render(
      <DataTablePagination {...defaultProps} currentPage={10} totalPages={10} />
    );

    const buttons = container.querySelectorAll('button');
    const nextButton = Array.from(buttons).find((btn) => btn.textContent.includes('Next'));
    expect(nextButton).toBeDisabled();
  });

  it('enables Next button on non-last page', () => {
    const { container } = render(
      <DataTablePagination {...defaultProps} currentPage={1} totalPages={10} />
    );

    const buttons = container.querySelectorAll('button');
    const nextButton = Array.from(buttons).find((btn) => btn.textContent.includes('Next'));
    expect(nextButton).not.toBeDisabled();
  });

  it('calls onPageChange when Previous button clicked', async () => {
    const handlePageChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <DataTablePagination {...defaultProps} currentPage={2} onPageChange={handlePageChange} />
    );

    const buttons = container.querySelectorAll('button');
    const prevButton = Array.from(buttons).find((btn) => btn.textContent.includes('Previous'));
    if (prevButton) {
      await user.click(prevButton);
      expect(handlePageChange).toHaveBeenCalledWith(1);
    }
  });

  it('calls onPageChange when Next button clicked', async () => {
    const handlePageChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <DataTablePagination {...defaultProps} currentPage={1} onPageChange={handlePageChange} />
    );

    const buttons = container.querySelectorAll('button');
    const nextButton = Array.from(buttons).find((btn) => btn.textContent.includes('Next'));
    if (nextButton) {
      await user.click(nextButton);
      expect(handlePageChange).toHaveBeenCalledWith(2);
    }
  });

  it('displays all page numbers when total pages <= 7', () => {
    render(<DataTablePagination {...defaultProps} totalPages={5} />);

    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }
  });

  it('shows ellipsis for large page counts', () => {
    render(<DataTablePagination {...defaultProps} currentPage={1} totalPages={15} />);

    const ellipsisElements = screen.getAllByText('…');
    expect(ellipsisElements.length).toBeGreaterThan(0);
  });

  it('highlights current page', () => {
    render(<DataTablePagination {...defaultProps} currentPage={5} totalPages={10} />);

    const currentPageBtn = screen.getByText('5').closest('button');
    expect(currentPageBtn?.className).toContain('bg-slate-950');
  });

  it('calls onPageChange when page number clicked', async () => {
    const handlePageChange = vi.fn();
    const user = userEvent.setup();
    render(<DataTablePagination {...defaultProps} onPageChange={handlePageChange} />);

    const pageBtn = screen.getByText('3');
    await user.click(pageBtn);

    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('renders chevron icons', () => {
    render(<DataTablePagination {...defaultProps} />);
    expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
  });

  it('renders show label', () => {
    render(<DataTablePagination {...defaultProps} />);
    expect(screen.getByText('Show')).toBeInTheDocument();
  });

  it('handles pagination with ellipsis correctly on current page near end', () => {
    const { container } = render(
      <DataTablePagination {...defaultProps} currentPage={8} totalPages={10} />
    );

    const pageButtons = container.querySelectorAll('button');
    const pageNumbers = Array.from(pageButtons).filter((btn) =>
      /^\d+$/.test(btn.textContent?.trim() ?? '')
    );
    expect(pageNumbers.length).toBeGreaterThan(0);
  });

  it('correctly calculates "to" when on last page with partial items', () => {
    render(
      <DataTablePagination
        {...defaultProps}
        currentPage={10}
        totalPages={10}
        pageSize={10}
        totalItems={95}
      />
    );

    expect(screen.getByText('Showing 91 to 95 of 95 entries')).toBeInTheDocument();
  });

  it('displays correct entries count with custom totalItems', () => {
    render(<DataTablePagination {...defaultProps} totalItems={250} totalPages={25} />);

    expect(screen.getByText('Showing 1 to 10 of 250 entries')).toBeInTheDocument();
  });

  it('maintains state consistency during page navigation', async () => {
    const handlePageChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <DataTablePagination {...defaultProps} currentPage={1} onPageChange={handlePageChange} />
    );

    const pageBtn = screen.getByText('2');
    await user.click(pageBtn);

    expect(handlePageChange).toHaveBeenCalledWith(2);

    rerender(
      <DataTablePagination {...defaultProps} currentPage={2} onPageChange={handlePageChange} />
    );

    expect(screen.getByText('Showing 11 to 20 of 100 entries')).toBeInTheDocument();
  });
});
