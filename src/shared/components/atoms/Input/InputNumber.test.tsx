import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InputNumber } from './InputNumber';

describe('InputNumber', () => {
  it('renders input element', () => {
    const { container } = render(<InputNumber />);
    const input = container.querySelector('input[type="text"]');
    expect(input).toBeInTheDocument();
  });

  it('displays default value', () => {
    const { container } = render(<InputNumber defaultValue={42} />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('42');
  });

  it('displays controlled value', () => {
    const { container } = render(<InputNumber value={100} onChange={vi.fn()} />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('100');
  });

  it('allows numeric input', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<InputNumber onChange={handleChange} />);

    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, '123');

    expect(handleChange).toHaveBeenCalledWith(123);
  });

  it('allows decimal input', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<InputNumber onChange={handleChange} />);

    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, '123.45');

    expect(handleChange).toHaveBeenCalledWith(123.45);
  });

  it('rejects non-numeric characters', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<InputNumber onChange={handleChange} />);

    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, 'abc');

    expect(input.value).toBe('');
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('rejects negative numbers when allowNegative is false', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<InputNumber allowNegative={false} onChange={handleChange} />);

    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, '-50');

    expect(input.value).toBe('50');
  });

  it('allows negative numbers when allowNegative is true', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<InputNumber allowNegative={true} onChange={handleChange} />);

    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, '-50');

    expect(handleChange).toHaveBeenCalledWith(-50);
  });

  it('formats decimal places on blur', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<InputNumber decimalPlaces={2} onChange={handleChange} />);

    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, '123.456');
    await user.click(document.body);

    expect(input.value).toBe('123.46');
  });

  it('clears input on empty blur', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<InputNumber onChange={handleChange} />);

    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, '123');
    await user.clear(input);
    await user.click(document.body);

    expect(input.value).toBe('');
    expect(handleChange).toHaveBeenCalledWith(undefined);
  });

  it('allows typing but validates on blur', async () => {
    const user = userEvent.setup();
    const { container } = render(<InputNumber onChange={vi.fn()} />);

    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, '123.45');

    expect(parseFloat(input.value)).toBe(123.45);
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<InputNumber ref={ref as any} />);
    expect(ref.current).toBeTruthy();
  });

  it('accepts custom placeholder', () => {
    const { container } = render(<InputNumber placeholder="Enter number" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe('Enter number');
  });

  it('respects disabled prop', () => {
    const { container } = render(<InputNumber disabled />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('handles value prop updates', () => {
    const { container, rerender } = render(<InputNumber value={10} onChange={vi.fn()} />);
    let input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('10');

    rerender(<InputNumber value={20} onChange={vi.fn()} />);
    input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('20');
  });
});
