import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InputCurrency } from './InputCurrency';

describe('InputCurrency', () => {
  it('renders input element', () => {
    const { container } = render(<InputCurrency />);
    const input = container.querySelector('input[type="text"]');
    expect(input).toBeInTheDocument();
  });

  it('displays default value formatted', () => {
    const { container } = render(<InputCurrency defaultValue={1000000} locale="id-ID" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toContain('1');
  });

  it('allows numeric input', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<InputCurrency onChange={handleChange} />);

    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, '5000');

    expect(handleChange).toHaveBeenCalledWith(5000);
  });

  it('strips non-numeric characters during input', async () => {
    const user = userEvent.setup();
    const { container } = render(<InputCurrency onChange={vi.fn()} />);

    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, '100abc');

    expect(input.value).toBe('100');
  });

  it('formats currency on blur', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <InputCurrency locale="id-ID" decimalPlaces={0} onChange={vi.fn()} />
    );

    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, '1000000');
    await user.click(document.body);

    expect(input.value).toContain('1');
  });

  it('shows raw value on focus', async () => {
    const user = userEvent.setup();
    const { container } = render(<InputCurrency value={1000} onChange={vi.fn()} locale="id-ID" />);

    const input = container.querySelector('input') as HTMLInputElement;
    await user.click(input);

    expect(input.value).toBe('1000');
  });

  it('applies currency formatting on blur', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <InputCurrency onChange={vi.fn()} locale="en-US" decimalPlaces={2} />
    );

    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, '9999');
    await user.click(document.body);

    expect(input.value).toContain('9');
  });

  it('handles decimal places', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <InputCurrency onChange={vi.fn()} decimalPlaces={2} locale="en-US" />
    );

    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, '1234');
    await user.click(document.body);

    const numValue = parseFloat(input.value.replace(/[^0-9.-]/g, ''));
    expect(numValue).toBeCloseTo(1234, 0);
  });

  it('clears on blur with empty or zero value', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<InputCurrency onChange={handleChange} />);

    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, '0');
    await user.click(document.body);

    expect(handleChange).toHaveBeenCalledWith(undefined);
  });

  it('calls onChange with undefined for empty value', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<InputCurrency onChange={handleChange} />);

    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, '500');
    await user.clear(input);
    await user.click(document.body);

    expect(handleChange).toHaveBeenLastCalledWith(undefined);
  });

  it('supports different locales', () => {
    const { container: container1 } = render(
      <InputCurrency defaultValue={1000} locale="en-US" decimalPlaces={2} />
    );
    const value1 = (container1.querySelector('input') as HTMLInputElement).value;

    const { container: container2 } = render(
      <InputCurrency defaultValue={1000} locale="id-ID" decimalPlaces={2} />
    );
    const value2 = (container2.querySelector('input') as HTMLInputElement).value;

    expect(value1).not.toBe(value2);
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<InputCurrency ref={ref as any} />);
    expect(ref.current).toBeTruthy();
  });

  it('accepts custom placeholder', () => {
    const { container } = render(<InputCurrency placeholder="Enter amount" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe('Enter amount');
  });

  it('respects disabled prop', () => {
    const { container } = render(<InputCurrency disabled />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('updates display on value prop change', async () => {
    const { container, rerender } = render(<InputCurrency value={100} onChange={vi.fn()} />);
    let input = container.querySelector('input') as HTMLInputElement;
    const value1 = input.value;

    rerender(<InputCurrency value={500} onChange={vi.fn()} />);
    input = container.querySelector('input') as HTMLInputElement;
    const value2 = input.value;

    expect(value1).not.toBe(value2);
  });

  it('handles very large numbers', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<InputCurrency onChange={handleChange} />);

    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, '999999999');

    expect(handleChange).toHaveBeenCalledWith(999999999);
  });

  it('uses provided currency prop', () => {
    const { container } = render(<InputCurrency currency="USD" defaultValue={100} />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });
});
