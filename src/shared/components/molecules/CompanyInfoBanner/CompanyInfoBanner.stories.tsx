import type { Meta, StoryObj } from '@storybook/nextjs';
import { CompanyInfoBanner } from './CompanyInfoBanner';

const meta = {
  title: 'Molecules/CompanyInfoBanner',
  component: CompanyInfoBanner,
} satisfies Meta<typeof CompanyInfoBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message:
      'Pengaturan ini berlaku untuk company yang dipilih. Semua bobot, threshold, reward, punishment, dan komponen KPI akan diterapkan pada company tersebut.',
    companyId: 'comp-1',
    companyOptions: [
      { value: 'comp-1', label: 'PT. Curva 1' },
      { value: 'comp-2', label: 'PT. Curva 2' },
    ],
    placeholder: 'Pilih Company',
  },
};
