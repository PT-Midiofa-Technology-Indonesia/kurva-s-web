import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tabs } from './Tabs';
import type { TabItem } from './types';

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('./TabPanel', () => ({
  TabPanel: ({ children, isActive }: any) =>
    isActive ? <div data-testid="tab-panel">{children}</div> : null,
}));

describe('Tabs', () => {
  const tabItems: TabItem[] = [
    { key: 'tab1', label: 'Tab 1', content: 'Content 1' },
    { key: 'tab2', label: 'Tab 2', content: 'Content 2' },
    { key: 'tab3', label: 'Tab 3', content: 'Content 3' },
  ];

  it('renders tab buttons', () => {
    render(<Tabs items={tabItems} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('renders first tab as active by default', () => {
    render(<Tabs items={tabItems} />);
    const firstButton = screen.getByText('Tab 1').closest('button');
    expect(firstButton?.className).toContain('bg-slate-100');
  });

  it('changes active tab on button click', async () => {
    const user = userEvent.setup();
    render(<Tabs items={tabItems} />);

    const secondButton = screen.getByText('Tab 2').closest('button');
    await user.click(secondButton!);

    expect(secondButton?.className).toContain('bg-slate-100');
  });

  it('uses defaultActiveKey in uncontrolled mode', () => {
    render(<Tabs items={tabItems} defaultActiveKey="tab2" />);
    const secondButton = screen.getByText('Tab 2').closest('button');
    expect(secondButton?.className).toContain('bg-slate-100');
  });

  it('respects controlled activeKey prop', () => {
    const { rerender } = render(<Tabs items={tabItems} activeKey="tab1" onChange={vi.fn()} />);
    expect(screen.getByText('Tab 1').closest('button')?.className).toContain('bg-slate-100');

    rerender(<Tabs items={tabItems} activeKey="tab2" onChange={vi.fn()} />);
    expect(screen.getByText('Tab 2').closest('button')?.className).toContain('bg-slate-100');
  });

  it('calls onChange handler when tab clicked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Tabs items={tabItems} onChange={handleChange} />);
    const secondButton = screen.getByText('Tab 2').closest('button');
    await user.click(secondButton!);

    expect(handleChange).toHaveBeenCalledWith('tab2');
  });

  it('renders tabs with left icon', () => {
    const itemsWithIcon: TabItem[] = [
      {
        key: 'tab1',
        label: 'Tab 1',
        leftIcon: <span data-testid="left-icon">🏠</span>,
        content: 'Content 1',
      },
    ];
    render(<Tabs items={itemsWithIcon} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(<Tabs items={tabItems} className="custom-class" />);
    const tabsNav = container.querySelector('.flex.flex-row.items-center');
    expect(tabsNav?.className).toContain('custom-class');
  });

  it('renders first tab button by default', () => {
    render(<Tabs items={tabItems} />);
    const firstTabButton = screen.getByText('Tab 1').closest('button');
    expect(firstTabButton).toBeInTheDocument();
    expect(firstTabButton?.className).toContain('bg-slate-100');
  });
});
