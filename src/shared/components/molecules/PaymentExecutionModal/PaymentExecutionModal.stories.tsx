import type { Meta, StoryObj } from '@storybook/nextjs';
import { useArgs } from 'storybook/preview-api';
import { PaymentExecutionModal } from './PaymentExecutionModal';

const meta = {
  title: 'Molecules/PaymentExecutionModal',
  component: PaymentExecutionModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PaymentExecutionModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const labels = {
  title: 'Proses Pembayaran',
  submit: 'Simpan',
  processing: 'Memproses...',
  cancel: 'Batal',
  paymentDate: 'Tanggal Pembayaran',
  paymentMethod: 'Metode Pembayaran',
  paymentAmount: 'Nominal Pembayaran',
  totalAmount: 'Total Tagihan',
  transferVia: 'Transfer Via',
  transferViaPlaceholder: 'Masukkan bank tujuan',
  checkNumber: 'Nomor Giro/Cek',
  checkNumberPlaceholder: 'Masukkan nomor giro/cek',
  checkIssueDate: 'Tanggal Terbit',
  checkEffectiveDate: 'Tanggal Efektif',
  notes: 'Catatan',
  notesPlaceholder: 'Tambahkan catatan bila perlu',
  paymentProof: 'Bukti Pembayaran',
  dragDrop: 'Tarik file ke sini atau pilih file',
  browseFiles: 'Pilih File',
  removeFile: 'Hapus file',
};

const paymentMethodOptions = [
  { value: 'transfer', label: 'Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Giro / Cek' },
];

function InteractiveStory(args: React.ComponentProps<typeof PaymentExecutionModal>) {
  const [{ open }, updateArgs] = useArgs();

  return (
    <PaymentExecutionModal
      {...args}
      open={open}
      onClose={() => updateArgs({ open: false })}
      onSubmit={async () => {
        updateArgs({ open: false });
      }}
    />
  );
}

export const Default: Story = {
  render: (args) => <InteractiveStory {...args} />,
  args: {
    open: true,
    sourceTypeLabel: 'Kode Billing',
    sourceCode: 'BILL-2026-0001',
    amount: 25000000,
    labels,
    paymentMethodOptions,
    onClose: () => {},
    onSubmit: async () => {},
  },
};

export const WithProofFiles: Story = {
  render: (args) => <InteractiveStory {...args} />,
  args: {
    open: true,
    sourceTypeLabel: 'Kode Payment Request',
    sourceCode: 'PR-2026-0102',
    amount: 18500000,
    labels,
    paymentMethodOptions,
    requireProof: true,
    onClose: () => {},
    onSubmit: async () => {},
    displayFiles: [
      {
        key: '1',
        name: 'invoice.pdf',
        size: 280000,
      },
      {
        key: '2',
        name: 'bukti-transfer.png',
        size: 540000,
        url: 'https://placehold.co/96x96/png',
      },
    ],
  },
};

export const LoadingProofRequirements: Story = {
  render: (args) => <InteractiveStory {...args} />,
  args: {
    open: true,
    sourceTypeLabel: 'Kode Billing',
    sourceCode: 'BILL-2026-0002',
    amount: 9900000,
    labels,
    paymentMethodOptions,
    requireProof: true,
    isLoadingFiles: true,
    isPending: true,
    onClose: () => {},
    onSubmit: async () => {},
  },
};
