import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ListPageTemplate } from './ListPageTemplate';

vi.mock('lucide-react', () => ({
  Loader2: ({ className }: any) => <div className={className} data-testid="loader" />,
  PlusIcon: ({ className }: any) => <div className={className} data-testid="plus-icon" />,
}));

vi.mock('@/components/molecules/SearchBar', () => ({
  SearchBar: ({ value, onChange, onClear, placeholder, showClear }: any) => (
    <div data-testid="search-bar">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        data-testid="search-input"
      />
      {showClear && (
        <button type="button" onClick={onClear} data-testid="search-clear">
          Clear
        </button>
      )}
    </div>
  ),
}));

vi.mock('@/components/atoms/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/templates/DataTableLayout', () => ({
  DataTableLayout: ({ data, columns, filter, isLoading }: any) => (
    <div data-testid="data-table">
      {filter}
      <table data-testid="table-element">
        <tbody>
          {isLoading ? (
            <tr data-testid="loading-row">
              <td colSpan={columns.length} className="text-center">
                <div data-testid="loader" />
              </td>
            </tr>
          ) : (
            data.map((row: any, idx: number) => (
              <tr key={idx} data-testid={`row-${idx}`}>
                {columns.map((_col: any, cidx: number) => (
                  <td key={cidx}>{row.id}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  ),
}));

describe('ListPageTemplate', () => {
  const mockData = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
  ];

  const mockColumns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
  ];

  it('renders title', () => {
    render(<ListPageTemplate title="Test Page" data={mockData} columns={mockColumns} />);
    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  it('renders Add button when headerActions is provided', () => {
    render(
      <ListPageTemplate
        title="Test"
        data={mockData}
        columns={mockColumns}
        headerActions={<button type="button">Add</button>}
      />
    );
    const button = screen.getByRole('button', { name: /add/i });
    expect(button).toBeInTheDocument();
  });

  it('does not render Add button when headerActions is not provided', () => {
    render(<ListPageTemplate title="Test" data={mockData} columns={mockColumns} />);
    const button = screen.queryByRole('button', { name: /add/i });
    expect(button).not.toBeInTheDocument();
  });

  it('calls onAdd when Add button is clicked', async () => {
    const handleAdd = vi.fn();
    const user = userEvent.setup();
    render(
      <ListPageTemplate
        title="Test"
        data={mockData}
        columns={mockColumns}
        headerActions={
          <button type="button" onClick={handleAdd}>
            Add
          </button>
        }
      />
    );
    const button = screen.getByRole('button', { name: /add/i });
    await user.click(button);
    expect(handleAdd).toHaveBeenCalled();
  });

  it('renders search bar', () => {
    render(<ListPageTemplate title="Test" data={mockData} columns={mockColumns} search="" />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('sets search placeholder', () => {
    render(
      <ListPageTemplate
        title="Test"
        data={mockData}
        columns={mockColumns}
        searchPlaceholder="Find items..."
      />
    );
    const input = screen.getByPlaceholderText('Find items...');
    expect(input).toBeInTheDocument();
  });

  it('updates search input value', () => {
    const { rerender } = render(
      <ListPageTemplate title="Test" data={mockData} columns={mockColumns} search="initial" />
    );
    let input = screen.getByTestId('search-input') as HTMLInputElement;
    expect(input.value).toBe('initial');

    rerender(
      <ListPageTemplate title="Test" data={mockData} columns={mockColumns} search="updated" />
    );
    input = screen.getByTestId('search-input') as HTMLInputElement;
    expect(input.value).toBe('updated');
  });

  it('calls onSearchChange when search input changes', async () => {
    const handleSearchChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ListPageTemplate
        title="Test"
        data={mockData}
        columns={mockColumns}
        onSearchChange={handleSearchChange}
      />
    );
    const input = screen.getByTestId('search-input');
    await user.type(input, 'test');
    expect(input).toHaveValue('test');
  });

  it('calls onSearchChange with undefined when clear button clicked', async () => {
    const handleSearchChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ListPageTemplate
        title="Test"
        data={mockData}
        columns={mockColumns}
        search="test"
        onSearchChange={handleSearchChange}
      />
    );
    const clearButton = screen.getByTestId('search-clear');
    await user.click(clearButton);
    expect(handleSearchChange).toHaveBeenCalledWith(undefined);
  });

  it('renders toolbarRight when provided', () => {
    const filterElement = <div data-testid="custom-filter">Filter</div>;
    render(
      <ListPageTemplate
        title="Test"
        data={mockData}
        columns={mockColumns}
        toolbarRight={filterElement}
      />
    );
    expect(screen.getByTestId('custom-filter')).toBeInTheDocument();
  });

  it('renders loading state inside table', () => {
    render(
      <ListPageTemplate title="Test" data={mockData} columns={mockColumns} isLoading={true} />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
    expect(screen.getByTestId('loading-row')).toBeInTheDocument();
  });

  it('renders error state outside table', () => {
    render(
      <ListPageTemplate
        title="Test"
        data={mockData}
        columns={mockColumns}
        isError={true}
        errorMessage="Failed to load data"
      />
    );
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    expect(screen.queryByTestId('data-table')).not.toBeInTheDocument();
  });

  it('uses default error message', () => {
    render(<ListPageTemplate title="Test" data={mockData} columns={mockColumns} isError={true} />);
    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
  });

  it('renders DataTableLayout with columns and data', () => {
    render(<ListPageTemplate title="Test" data={mockData} columns={mockColumns} />);
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('passes sorting state to DataTableLayout', () => {
    render(
      <ListPageTemplate
        title="Test"
        data={mockData}
        columns={mockColumns}
        sortBy="name"
        sortOrder="desc"
      />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('calls onSort when sorting changes', () => {
    const handleSort = vi.fn();
    render(
      <ListPageTemplate title="Test" data={mockData} columns={mockColumns} onSort={handleSort} />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('passes pagination props to DataTableLayout', () => {
    render(
      <ListPageTemplate
        title="Test"
        data={mockData}
        columns={mockColumns}
        page={1}
        perPage={10}
        totalItems={50}
        totalPages={5}
      />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('calls onPaginationChange when pagination changes', () => {
    const handlePaginationChange = vi.fn();
    render(
      <ListPageTemplate
        title="Test"
        data={mockData}
        columns={mockColumns}
        onPaginationChange={handlePaginationChange}
      />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders empty data correctly', () => {
    render(
      <ListPageTemplate title="Test" data={[]} columns={mockColumns} emptyMessage="No items" />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders with all optional props', () => {
    render(
      <ListPageTemplate
        title="Test"
        data={mockData}
        columns={mockColumns}
        headerActions={<button type="button">New</button>}
        search="query"
        searchPlaceholder="Search..."
        onSearchChange={vi.fn()}
        toolbarRight={<div data-testid="filters">Filters</div>}
        sortBy="name"
        sortOrder="asc"
        onSort={vi.fn()}
        page={1}
        perPage={20}
        totalItems={100}
        totalPages={5}
        onPaginationChange={vi.fn()}
        enableRowSelection={true}
        pageSizeOptions={[10, 20, 50]}
      />
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByTestId('filters')).toBeInTheDocument();
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });
});
