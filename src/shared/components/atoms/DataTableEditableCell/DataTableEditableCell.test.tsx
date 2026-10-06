import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTableEditableCell } from './DataTableEditableCell';

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, onBlur, onKeyDown, ...props }: any) => (
    <input
      type="text"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      {...props}
    />
  ),
}));

vi.mock('@base-ui/react', () => ({
  Combobox: {
    Input: ({ placeholder, className }: any) => (
      <input placeholder={placeholder ?? ''} className={className} />
    ),
  },
}));

vi.mock('@/components/ui/combobox', () => ({
  Combobox: ({ children, onInputValueChange, inputValue }: any) => (
    <div>
      <input
        role="combobox"
        aria-expanded="false"
        value={inputValue ?? ''}
        onChange={(e) => onInputValueChange?.(e.target.value)}
      />
      {children}
    </div>
  ),
  ComboboxContent: ({ children }: any) => <div data-testid="combobox-content">{children}</div>,
  ComboboxItem: ({ children, value }: any) => (
    <div data-testid={`combobox-item-${value}`}>{children}</div>
  ),
  ComboboxList: ({ children }: any) => <div data-testid="combobox-list">{children}</div>,
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div data-testid="popover-wrapper">{children}</div>,
  PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
}));

describe('DataTableEditableCell', () => {
  describe('Input Mode', () => {
    it('renders input for input type', () => {
      const { container } = render(
        <DataTableEditableCell value="test" editType="input" onSave={vi.fn()} onCancel={vi.fn()} />
      );
      const input = container.querySelector('input');
      expect(input).toBeInTheDocument();
    });

    it('displays current value in input', () => {
      const { container } = render(
        <DataTableEditableCell
          value="current value"
          editType="input"
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />
      );
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('current value');
    });

    it('focuses input on mount', () => {
      const { container } = render(
        <DataTableEditableCell value="test" editType="input" onSave={vi.fn()} onCancel={vi.fn()} />
      );
      const input = container.querySelector('input');
      expect(document.activeElement).toBe(input);
    });

    it('calls onSave on blur with updated value', async () => {
      const handleSave = vi.fn();
      const user = userEvent.setup();
      const { container } = render(
        <DataTableEditableCell
          value="initial"
          editType="input"
          onSave={handleSave}
          onCancel={vi.fn()}
        />
      );

      const input = container.querySelector('input') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, 'updated');
      await user.click(document.body);

      expect(handleSave).toHaveBeenCalledWith('updated');
    });

    it('calls onSave on Enter key', async () => {
      const handleSave = vi.fn();
      const user = userEvent.setup();
      const { container } = render(
        <DataTableEditableCell
          value="test"
          editType="input"
          onSave={handleSave}
          onCancel={vi.fn()}
        />
      );

      const input = container.querySelector('input') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, 'new value');
      await user.keyboard('{Enter}');

      expect(handleSave).toHaveBeenCalledWith('new value');
    });

    it('calls onCancel on Escape key', async () => {
      const handleCancel = vi.fn();
      const user = userEvent.setup();
      render(
        <DataTableEditableCell
          value="test"
          editType="input"
          onSave={vi.fn()}
          onCancel={handleCancel}
        />
      );

      await user.keyboard('{Escape}');

      expect(handleCancel).toHaveBeenCalled();
    });

    it('calls onSave on Tab key', async () => {
      const handleSave = vi.fn();
      const user = userEvent.setup();
      const { container } = render(
        <DataTableEditableCell
          value="test"
          editType="input"
          onSave={handleSave}
          onCancel={vi.fn()}
        />
      );

      const input = container.querySelector('input') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, 'tabbed value');
      await user.keyboard('{Tab}');

      expect(handleSave).toHaveBeenCalledWith('tabbed value');
    });

    it('allows editing input value', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DataTableEditableCell
          value="original"
          editType="input"
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const input = container.querySelector('input') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, 'new text');

      expect(input.value).toBe('new text');
    });

    it('handles null/undefined values', () => {
      const { container } = render(
        <DataTableEditableCell
          value={undefined}
          editType="input"
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />
      );
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });

  describe('Select Mode', () => {
    const selectOptions = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
    ];

    it('renders popover for select type', () => {
      render(
        <DataTableEditableCell
          value="active"
          editType="select"
          selectOptions={selectOptions}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />
      );
      expect(screen.getByTestId('popover-wrapper')).toBeInTheDocument();
    });

    it('displays current value label in select', () => {
      render(
        <DataTableEditableCell
          value="inactive"
          editType="select"
          selectOptions={selectOptions}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />
      );
      expect(screen.getAllByText('Inactive').length).toBeGreaterThan(0);
    });

    it('resolves value to label in trigger (not raw value)', () => {
      render(
        <DataTableEditableCell
          value="inactive"
          editType="select"
          selectOptions={selectOptions}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />
      );
      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger.textContent).toContain('Inactive');
      expect(trigger.textContent).not.toContain('inactive');
    });

    it('falls back to placeholder when no matching option exists', () => {
      render(
        <DataTableEditableCell
          value="unknown-uuid"
          editType="select"
          selectOptions={selectOptions}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />
      );
      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger.textContent).toContain('Select');
    });

    it('renders select options', () => {
      render(
        <DataTableEditableCell
          value="active"
          editType="select"
          selectOptions={selectOptions}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />
      );
      const popoverContent = screen.getByTestId('popover-content');
      for (const opt of selectOptions) {
        expect(popoverContent.textContent).toContain(opt.label);
      }
    });

    it('calls onSave when option is selected', async () => {
      const user = userEvent.setup();
      const handleSave = vi.fn();
      render(
        <DataTableEditableCell
          value="active"
          editType="select"
          selectOptions={selectOptions}
          onSave={handleSave}
          onCancel={vi.fn()}
        />
      );
      await user.click(screen.getByText('Inactive'));
      expect(handleSave).toHaveBeenCalledWith('inactive');
    });

    it('handles empty selectOptions', () => {
      render(
        <DataTableEditableCell
          value="test"
          editType="select"
          selectOptions={[]}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />
      );
      expect(screen.getByTestId('popover-wrapper')).toBeInTheDocument();
    });

    it('defaults to empty array for selectOptions', () => {
      render(
        <DataTableEditableCell value="test" editType="select" onSave={vi.fn()} onCancel={vi.fn()} />
      );
      expect(screen.getByTestId('popover-wrapper')).toBeInTheDocument();
    });
  });

  describe('Input styling', () => {
    it('has correct input classes', () => {
      const { container } = render(
        <DataTableEditableCell value="test" editType="input" onSave={vi.fn()} onCancel={vi.fn()} />
      );
      const input = container.querySelector('input');
      expect(input).toHaveClass('h-7');
    });

    it('renders select trigger element', () => {
      render(
        <DataTableEditableCell
          value="test"
          editType="select"
          selectOptions={[]}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />
      );
      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Value conversion', () => {
    it('converts numeric value to string', () => {
      const { container } = render(
        <DataTableEditableCell value={42} editType="input" onSave={vi.fn()} onCancel={vi.fn()} />
      );
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('42');
    });

    it('converts boolean value to string', () => {
      const { container } = render(
        <DataTableEditableCell value={true} editType="input" onSave={vi.fn()} onCancel={vi.fn()} />
      );
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('true');
    });
  });
});

describe('Combobox Mode with onSearch', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('calls comboboxOnSearch with debounced query when user types', () => {
    const onSearch = vi.fn();
    render(
      <DataTableEditableCell
        value=""
        editType="combobox"
        comboboxOptions={['Bata Merah', 'Semen Portland']}
        comboboxOnSearch={onSearch}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'bata' } });
    vi.advanceTimersByTime(300);
    expect(onSearch).toHaveBeenCalledWith('bata');
  });

  it('does not filter options client-side when comboboxOnSearch is provided', () => {
    render(
      <DataTableEditableCell
        value="xyz"
        editType="combobox"
        comboboxOptions={['Bata Merah', 'Pasir Halus']}
        comboboxOnSearch={vi.fn()}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('Bata Merah')).toBeInTheDocument();
    expect(screen.getByText('Pasir Halus')).toBeInTheDocument();
  });

  it('does not call comboboxOnSearch before debounce delay', () => {
    const onSearch = vi.fn();
    render(
      <DataTableEditableCell
        value=""
        editType="combobox"
        comboboxOptions={[]}
        comboboxOnSearch={onSearch}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'p' } });
    vi.advanceTimersByTime(100);
    // Initial empty call happens on mount; the debounced 'p' must not fire yet.
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('');
    expect(onSearch).not.toHaveBeenCalledWith('p');
  });
});
