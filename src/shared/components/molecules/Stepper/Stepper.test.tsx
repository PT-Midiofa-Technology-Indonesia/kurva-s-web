import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Stepper } from './Stepper';
import type { StepItem } from './types';

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

const defaultSteps: StepItem[] = [
  { key: 'a', label: 'Step A', content: <div data-testid="content-a">Content A</div> },
  { key: 'b', label: 'Step B', content: <div data-testid="content-b">Content B</div> },
  { key: 'c', label: 'Step C', content: <div data-testid="content-c">Content C</div> },
];

describe('Stepper', () => {
  it('renders all step labels', () => {
    render(<Stepper items={defaultSteps} />);
    expect(screen.getByText('Step A')).toBeInTheDocument();
    expect(screen.getByText('Step B')).toBeInTheDocument();
    expect(screen.getByText('Step C')).toBeInTheDocument();
  });

  it('shows three step buttons with numbers', () => {
    render(<Stepper items={defaultSteps} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveTextContent('1');
    expect(buttons[1]).toHaveTextContent('2');
    expect(buttons[2]).toHaveTextContent('3');
  });

  it('shows first step content by default', () => {
    render(<Stepper items={defaultSteps} />);
    expect(screen.getByTestId('content-a')).toBeVisible();
    expect(screen.queryByTestId('content-b')).not.toBeInTheDocument();
  });

  it('respects defaultActiveKey', () => {
    render(<Stepper items={defaultSteps} defaultActiveKey="b" />);
    expect(screen.getByTestId('content-b')).toBeVisible();
    expect(screen.queryByTestId('content-a')).not.toBeInTheDocument();
  });

  it('mounts content once when activated (preserves state)', () => {
    const { rerender } = render(<Stepper items={defaultSteps} defaultActiveKey="a" />);

    expect(screen.getByTestId('content-a')).toBeVisible();

    rerender(<Stepper items={defaultSteps} activeKey="b" />);
    expect(screen.getByTestId('content-a')).not.toBeVisible();
    expect(screen.getByTestId('content-b')).toBeVisible();
  });

  it('calls onChange when completed step clicked with stepClickable', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Stepper items={defaultSteps} defaultActiveKey="b" onChange={handleChange} stepClickable />
    );

    await user.click(screen.getAllByRole('button')[0]);
    expect(handleChange).toHaveBeenCalledWith('a');
  });

  it('disables pending step buttons when not clickable', () => {
    render(<Stepper items={defaultSteps} defaultActiveKey="a" />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toBeDisabled();
    expect(buttons[2]).toBeDisabled();
  });

  it('renders connector elements between steps', () => {
    const { container } = render(<Stepper items={defaultSteps} />);
    // 3 steps → 2 connectors
    const connectors = container.querySelectorAll('.h-\\[2px\\]');
    expect(connectors.length).toBe(2);
  });

  it('applies active aria-current to current step', () => {
    render(<Stepper items={defaultSteps} defaultActiveKey="a" />);
    expect(screen.getAllByRole('button')[0]).toHaveAttribute('aria-current', 'step');
  });

  it('applies custom className to root element', () => {
    const { container } = render(<Stepper items={defaultSteps} className="custom-stepper" />);
    expect(container.firstChild).toHaveClass('custom-stepper');
  });

  it('shows loading fallback when isLoading is true', () => {
    const loadingSteps: StepItem[] = [
      { key: 'a', label: 'Step A', isLoading: true, content: <div>Loaded</div> },
    ];
    render(<Stepper items={loadingSteps} />);
    // Should show skeleton, not content
    expect(screen.queryByText('Loaded')).not.toBeInTheDocument();
  });

  it('handles empty items gracefully', () => {
    const { container } = render(<Stepper items={[]} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
