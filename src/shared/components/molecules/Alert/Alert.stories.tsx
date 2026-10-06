import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './Alert';

const meta = {
  title: 'Molecules/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'warning', 'success'],
    },
    showDismiss: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>This is a default alert message.</AlertDescription>
      </>
    ),
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: (
      <>
        <AlertTitle>Email atau password yang anda masukan salah! Silahkan coba lagi.</AlertTitle>
      </>
    ),
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: (
      <>
        <AlertTitle>Akun Anda terkunci sementara!</AlertTitle>
        <AlertDescription>
          Silahkan coba lagi dalam 15 menit atau hubungi Admin untuk mengakses kembali akun Anda.
        </AlertDescription>
      </>
    ),
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: (
      <>
        <AlertTitle>Berhasil disimpan</AlertTitle>
        <AlertDescription>Data Anda telah berhasil diperbarui.</AlertDescription>
      </>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Alert Variants</h3>
      <div className="space-y-4 w-[497px]">
        <Alert variant="destructive">
          <AlertTitle>Email atau password yang anda masukan salah! Silahkan coba lagi.</AlertTitle>
        </Alert>

        <Alert variant="warning">
          <AlertTitle>Akun Anda terkunci sementara!</AlertTitle>
          <AlertDescription>
            Silahkan coba lagi dalam 15 menit atau hubungi Admin untuk mengakses kembali akun Anda.
          </AlertDescription>
        </Alert>

        <Alert variant="success">
          <AlertTitle>Berhasil disimpan</AlertTitle>
          <AlertDescription>Data Anda telah berhasil diperbarui.</AlertDescription>
        </Alert>

        <Alert variant="default">
          <AlertTitle>Informasi</AlertTitle>
          <AlertDescription>This is a default alert message.</AlertDescription>
        </Alert>
      </div>
    </div>
  ),
};

export const WithDismiss: Story = {
  args: {},
  render: () => (
    <div className="space-y-4 w-[497px]">
      <h3 className="text-lg font-semibold">With Dismiss Button</h3>
      <Alert variant="destructive" showDismiss onDismiss={() => {}}>
        <AlertTitle>Error occurred</AlertTitle>
      </Alert>

      <Alert variant="warning" showDismiss onDismiss={() => {}}>
        <AlertTitle>Warning message</AlertTitle>
        <AlertDescription>This alert can be dismissed.</AlertDescription>
      </Alert>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-[497px]">
      <h3 className="text-lg font-semibold">Alert Examples</h3>
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertTitle className="text-sm">Small alert</AlertTitle>
        </Alert>

        <Alert variant="destructive">
          <AlertTitle>Medium alert (default)</AlertTitle>
          <AlertDescription>With description text below.</AlertDescription>
        </Alert>

        <Alert variant="warning">
          <AlertTitle>Warning with longer content</AlertTitle>
          <AlertDescription>
            This alert contains multiple lines of text to demonstrate how the component handles
            longer content. The description text uses slate-500 color.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  args: {},
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <div className="space-y-4 w-[497px]">
        <h3 className="text-lg font-semibold">Interactive Alerts</h3>
        <div className="space-y-3">
          {visible && (
            <Alert variant="destructive" showDismiss onDismiss={() => setVisible(false)}>
              <AlertTitle>Login failed</AlertTitle>
              <AlertDescription>Your credentials are incorrect.</AlertDescription>
            </Alert>
          )}
          {!visible && <div className="text-sm text-slate-500">Alert dismissed</div>}
        </div>
      </div>
    );
  },
};
