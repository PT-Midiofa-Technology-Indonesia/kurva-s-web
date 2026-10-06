import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@/shared/utils/test-utils';
import { Drawer, DrawerContent, DrawerTitle } from '../drawer';

function TestDrawer({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  return (
    <Drawer open onOpenChange={onOpenChange} direction="right">
      <DrawerContent>
        <DrawerTitle>Drawer Test</DrawerTitle>
        <button type="button">inside</button>
      </DrawerContent>
    </Drawer>
  );
}

async function flushPointerDownListener() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe('Drawer modal behavior', () => {
  it('renders an overlay when open', async () => {
    render(<TestDrawer onOpenChange={vi.fn()} />);

    await waitFor(() => {
      expect(document.querySelector('[data-slot="drawer-overlay"]')).toBeInTheDocument();
    });
  });

  it('closes on outside pointerdown', async () => {
    const onOpenChange = vi.fn();
    render(
      <>
        <TestDrawer onOpenChange={onOpenChange} />
        <button type="button" data-testid="outside">
          outside
        </button>
      </>
    );

    await flushPointerDownListener();
    fireEvent.pointerDown(document.querySelector('[data-testid="outside"]')!);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close when pointerdown originates inside popover content', async () => {
    const onOpenChange = vi.fn();
    render(
      <>
        <TestDrawer onOpenChange={onOpenChange} />
        <div data-slot="popover-content">
          <button type="button" data-testid="option">
            option
          </button>
        </div>
      </>
    );

    await flushPointerDownListener();
    fireEvent.pointerDown(document.querySelector('[data-testid="option"]')!);

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
