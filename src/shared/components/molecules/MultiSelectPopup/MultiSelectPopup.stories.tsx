import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MultiSelectPopup, type MultiSelectPopupItem } from './MultiSelectPopup';

const MOCK_VENDORS: MultiSelectPopupItem[] = [
  { id: '1', label: 'Vendor A', description: 'PT Supplier Utama' },
  { id: '2', label: 'Vendor B', description: 'CV Berkah Material' },
  { id: '3', label: 'Vendor C', description: 'PT Sentosa Jaya' },
  { id: '4', label: 'Vendor D', description: 'CV Mitra Sejahtera' },
  { id: '5', label: 'Vendor E', description: 'PT Abadi Makmur' },
  { id: '6', label: 'Vendor F', description: 'CV Permata Supply' },
  { id: '7', label: 'Vendor G', description: 'PT Logistik Nusantara' },
  { id: '8', label: 'Vendor H', description: 'CV Jaya Bersama' },
  { id: '9', label: 'Vendor I', description: 'PT Sumber Rezeki' },
  { id: '10', label: 'Vendor J', description: 'CV Cahaya Terang' },
  { id: '11', label: 'Vendor K', description: 'PT Mulia Jaya' },
  { id: '12', label: 'Vendor L', description: 'CV Sejahtera Abadi' },
];

const meta = {
  title: 'Molecules/MultiSelectPopup',
  component: MultiSelectPopup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    open: true,
    onClose: () => {},
    onSelect: () => {},
    onToggle: () => {},
    title: 'Pilih Vendor',
    items: MOCK_VENDORS,
    selectedIds: [],
    searchPlaceholder: 'Cari vendor...',
  },
} satisfies Meta<typeof MultiSelectPopup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default: closed popup. Click button to open.
 * Popup stays open on checkbox toggle — only closes on "Tambah" confirm.
 */
export const Default: Story = {
  args: { open: false },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<MultiSelectPopupItem[]>([]);
    const [search, setSearch] = useState('');

    const filtered = MOCK_VENDORS.filter((v) =>
      v.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <>
        <Button onClick={() => setOpen(true)}>
          Buka Popup{selected.length > 0 ? ` (${selected.length})` : ''}
        </Button>
        <MultiSelectPopup
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onToggle={setSelected}
          onSelect={(items) => {
            setSelected(items);
            setOpen(false);
          }}
          items={filtered}
          selectedIds={selected.map((s) => s.id)}
          onSearch={setSearch}
        />
      </>
    );
  },
};

/**
 * With pre-selected items.
 */
export const WithPreselected: Story = {
  args: { open: false },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<MultiSelectPopupItem[]>([
      MOCK_VENDORS[0],
      MOCK_VENDORS[2],
    ]);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Buka Popup ({selected.length} dipilih)</Button>
        <MultiSelectPopup
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onToggle={setSelected}
          onSelect={(items) => {
            setSelected(items);
            setOpen(false);
          }}
          items={MOCK_VENDORS}
          selectedIds={selected.map((s) => s.id)}
        />
      </>
    );
  },
};

/**
 * Loading state: shows spinner when fetching initial data.
 */
export const Loading: Story = {
  args: {
    items: [],
    isLoading: true,
  },
};

/**
 * Empty state: no results found.
 */
export const Empty: Story = {
  args: {
    items: [],
    emptyMessage: 'Tidak ada vendor ditemukan',
  },
};

/**
 * Infinite scroll: fires onLoadMore when scrolling near bottom.
 * Simulates loading more items in batches of 5.
 */
export const InfiniteScroll: Story = {
  args: { open: false },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<MultiSelectPopupItem[]>([]);
    const [items, setItems] = useState<MultiSelectPopupItem[]>(MOCK_VENDORS.slice(0, 5));
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadMore = () => {
      setLoading(true);
      setTimeout(() => {
        setItems((prev) => {
          const next = MOCK_VENDORS.slice(0, prev.length + 5);
          if (next.length >= MOCK_VENDORS.length) setHasMore(false);
          return next;
        });
        setLoading(false);
      }, 800);
    };

    return (
      <>
        <Button onClick={() => setOpen(true)}>Buka Popup ({selected.length} dipilih)</Button>
        <MultiSelectPopup
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onToggle={setSelected}
          onSelect={(items) => {
            setSelected(items);
            setOpen(false);
          }}
          items={items}
          selectedIds={selected.map((s) => s.id)}
          isLoading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </>
    );
  },
};
