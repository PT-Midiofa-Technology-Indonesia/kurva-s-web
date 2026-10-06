import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { KanbanItem } from './KanbanItem';

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: ({ id }: any) => ({
    attributes: { 'data-sortable-id': id },
    listeners: { onMouseDown: vi.fn() },
    setNodeRef: vi.fn(),
    transform: null,
    transition: 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => 'none',
    },
  },
}));

vi.mock('lucide-react', () => ({}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('KanbanItem', () => {
  it('renders kanban item', () => {
    const { container } = render(
      <KanbanItem id="item-1">
        <div>Item Content</div>
      </KanbanItem>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <KanbanItem id="item-1">
        <div>Item Content</div>
      </KanbanItem>
    );
    expect(screen.getByText('Item Content')).toBeInTheDocument();
  });

  it('renders as a button element', () => {
    render(
      <KanbanItem id="item-1">
        <div>Item</div>
      </KanbanItem>
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders with item id', () => {
    const { container } = render(
      <KanbanItem id="unique-item-id">
        <div>Item</div>
      </KanbanItem>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('calls onCardClick when card is clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <KanbanItem id="item-1" onCardClick={handleClick}>
        <div data-testid="card-content">Clickable Item</div>
      </KanbanItem>
    );

    const cardContent = screen.getByTestId('card-content');
    await user.click(cardContent);

    expect(handleClick).toHaveBeenCalled();
  });

  it('handles Enter key on card with onCardClick', () => {
    const handleClick = vi.fn();
    render(
      <KanbanItem id="item-1" onCardClick={handleClick}>
        <div data-testid="card-content">Clickable Item</div>
      </KanbanItem>
    );

    const button = screen.getByRole('button');
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });

  it('handles Space key on card with onCardClick', () => {
    const handleClick = vi.fn();
    render(
      <KanbanItem id="item-1" onCardClick={handleClick}>
        <div data-testid="card-content">Clickable Item</div>
      </KanbanItem>
    );

    const button = screen.getByRole('button');
    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
  });

  it('always renders as a button element', () => {
    const { container } = render(
      <KanbanItem id="item-1">
        <div>Non-clickable Item</div>
      </KanbanItem>
    );

    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <KanbanItem id="item-1" className="custom-class">
        <div>Item</div>
      </KanbanItem>
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('applies base styling classes', () => {
    const { container } = render(
      <KanbanItem id="item-1">
        <div>Item</div>
      </KanbanItem>
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('w-full', 'text-left', 'cursor-grab');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    const { container } = render(
      <KanbanItem id="item-1" ref={ref as any}>
        <div>Item</div>
      </KanbanItem>
    );
    expect(ref.current).toBe(container.firstChild);
    expect((container.firstChild as HTMLElement).tagName).toBe('BUTTON');
  });

  it('renders multiple kanban items with different ids', () => {
    render(
      <>
        <KanbanItem id="item-1">
          <div>Item 1</div>
        </KanbanItem>
        <KanbanItem id="item-2">
          <div>Item 2</div>
        </KanbanItem>
      </>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders as a button with cursor-grab styling', () => {
    const { container } = render(
      <KanbanItem id="item-1">
        <div>Item</div>
      </KanbanItem>
    );
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('cursor-grab');
  });

  it('is a native button element', () => {
    const { container } = render(
      <KanbanItem id="item-1" onCardClick={vi.fn()}>
        <div>Item</div>
      </KanbanItem>
    );

    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('calls onCardClick when button is clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <KanbanItem id="item-1" onCardClick={handleClick}>
        <div>Item</div>
      </KanbanItem>
    );

    const button = screen.getByRole('button');
    await user.click(button);
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders with disabled sortable', () => {
    render(
      <KanbanItem id="item-1" disabled={true}>
        <div>Disabled Item</div>
      </KanbanItem>
    );
    expect(screen.getByText('Disabled Item')).toBeInTheDocument();
  });

  it('applies transition styles', () => {
    const { container } = render(
      <KanbanItem id="item-1">
        <div>Item</div>
      </KanbanItem>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.transition).toBeDefined();
  });

  it('applies transform styles', () => {
    const { container } = render(
      <KanbanItem id="item-1">
        <div>Item</div>
      </KanbanItem>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.transform).toBeDefined();
  });

  it('applies custom className to button', () => {
    const { container } = render(
      <KanbanItem id="item-1" className="custom-class">
        <div>Item</div>
      </KanbanItem>
    );
    const button = container.firstChild;
    expect(button).toHaveClass('custom-class');
  });

  it('handles card click with event', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <KanbanItem id="item-1" onCardClick={handleClick}>
        <div data-testid="card-content">Clickable</div>
      </KanbanItem>
    );

    const cardContent = screen.getByTestId('card-content');
    await user.click(cardContent);

    expect(handleClick).toHaveBeenCalled();
  });

  it('renders with children as complex react elements', () => {
    render(
      <KanbanItem id="item-1">
        <div>
          <h3>Title</h3>
          <p>Description</p>
        </div>
      </KanbanItem>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});
