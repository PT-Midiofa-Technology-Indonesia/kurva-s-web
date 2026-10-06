'use client';

import { Download, FileText, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useMe } from '@/domains/auth/hooks/use-me';
import { InputCurrency } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules';
import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { useEnum } from '@/shared/hooks/use-enums';
import { formatFileSize } from '@/shared/utils/format';
import type { TaxFilingInformation, TaxFilingPayload, TaxFilingPayment } from '../types';

interface FormProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: TaxFilingPayload) => void;
  isPending?: boolean;
  isReadOnly?: boolean;
  payment?: TaxFilingPayment;
}

export function TaxFilingPaymentDrawer({
  title,
  open,
  onOpenChange,
  onSubmit,
  isPending,
  isReadOnly,
  payment,
}: FormProps) {
  const { data: meData } = useMe();
  const currentUser = meData;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [paymentDate, setPaymentDate] = useState<Date | null>(
    payment?.paymentDate ? new Date(payment.paymentDate) : null
  );
  const { data: paymentTypeOptions, isLoading: isLoadingPaymentTypes } = useEnum('payment-methods');

  const [paymentMethod, setPaymentMethod] = useState<string>(payment?.paymentType?.id ?? '');
  const [paymentStatus, setPaymentStatus] = useState<string>(
    payment?.paymentStatus ? payment.paymentStatus.toLowerCase() : ''
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    let amountPaid = String(formData.get('amountPaid') ?? '');
    amountPaid = amountPaid.replace(/[^0-9.-]/g, '');

    onSubmit({
      billingCode: String(formData.get('billingCode') ?? ''),
      paymentDate: paymentDate ? paymentDate.toISOString().split('T')[0] : '',
      paymentMethod,
      amountPaid,
      ntpn: String(formData.get('ntpn') ?? ''),
      submittedBy: currentUser?.id ?? String(formData.get('submittedBy') ?? ''),
      paymentStatus,
      files,
    });
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex flex-col w-[512px] sm:max-w-[512px] p-0 gap-0 h-full max-h-screen rounded-l-none">
        <DrawerHeader className="px-6 py-4 border-b border-slate-200">
          <DrawerTitle className="text-2xl font-semibold text-slate-950">{title}</DrawerTitle>
        </DrawerHeader>

        {isReadOnly ? (
          <div className="flex flex-1 flex-col justify-between overflow-y-auto">
            <div className="p-6 space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500">Billing Code</p>
                  <p className="font-medium text-slate-950">{payment?.billingCode || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Payment Date</p>
                  <p className="font-medium text-slate-950">{payment?.paymentDate || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-slate-500">Payment Method</p>
                <p className="font-medium text-slate-950">{payment?.paymentType?.name || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500">Amount Paid</p>
                  <p className="font-medium text-slate-950">
                    {payment?.amount ? `Rp${payment.amount.toLocaleString()}` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">NTPN</p>
                  <p className="font-medium text-slate-950">{payment?.ntpn || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500">Submit By</p>
                  <p className="font-medium text-slate-950">{payment?.submittedBy?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Payment Status</p>
                  <div className="mt-1">
                    <Badge variant="success">{payment?.paymentStatus || '-'}</Badge>
                  </div>
                </div>
              </div>

              {payment?.paymentProofs && payment.paymentProofs.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-slate-500">Bukti Pembayaran</p>
                  {payment.paymentProofs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
                    >
                      <div className="rounded-lg border border-slate-200 p-2.5 text-slate-700">
                        <FileText className="h-6 w-6" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-950">
                          {doc.fileName}
                        </p>
                        <p className="text-xs text-slate-500">{formatFileSize(doc.fileSize)}</p>
                      </div>
                      {doc.url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500"
                          asChild
                        >
                          <a href={doc.url} target="_blank" rel="noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DrawerFooter className="p-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Tutup
              </Button>
            </DrawerFooter>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col justify-between overflow-y-auto"
          >
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-950">
                    Billing Code <span className="text-teal-600">*</span>
                  </Label>
                  <Input
                    name="billingCode"
                    placeholder="Enter billing code"
                    defaultValue={payment?.billingCode ?? ''}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-950">
                    Payment Date <span className="text-teal-600">*</span>
                  </Label>
                  <DatePicker
                    mode="single"
                    value={paymentDate}
                    onChange={(date) => setPaymentDate(date instanceof Date ? date : null)}
                    placeholder="Select payment date"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-950">
                  Payment Method <span className="text-teal-600">*</span>
                </Label>
                <Select
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  disabled={isLoadingPaymentTypes}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTypeOptions?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-950">
                    Amount Paid <span className="text-teal-600">*</span>
                  </Label>
                  <InputCurrency
                    name="amountPaid"
                    currency="Rp"
                    prefix="Rp"
                    placeholder="Enter amount"
                    defaultValue={payment?.amount ? String(payment.amount) : ''}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-950">
                    NTPN <span className="text-teal-600">*</span>
                  </Label>
                  <Input
                    name="ntpn"
                    placeholder="Enter NTPN"
                    defaultValue={payment?.ntpn ?? ''}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-950">
                    Submit By <span className="text-teal-600">*</span>
                  </Label>
                  <Input
                    name="submittedBy"
                    placeholder="Enter submitter name"
                    defaultValue={payment?.submittedBy?.name ?? currentUser?.name ?? ''}
                    disabled
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-950">
                    Payment Status <span className="text-teal-600">*</span>
                  </Label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-950">
                    Bukti Pembayaran <span className="text-teal-600">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Add files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="space-y-2">
                  {files.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 bg-white"
                    >
                      <div className="rounded-lg border border-slate-200 p-2 text-slate-700">
                        <FileText className="h-6 w-6" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-950">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500"
                        onClick={() => handleRemoveFile(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DrawerFooter className="grid grid-cols-2 gap-4 p-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Tutup
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Add Payment
              </Button>
            </DrawerFooter>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}

export function TaxFilingInformationDrawer({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  information,
}: Omit<FormProps, 'title'> & {
  information?: TaxFilingInformation | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [formKey, setFormKey] = useState(0);
  const [bpeDate, setBpeDate] = useState<Date | null>(
    information?.bpeDate ? new Date(information.bpeDate) : null
  );
  const [status, setStatus] = useState<string>(information?.filingStatus ?? '');

  useEffect(() => {
    if (!open) return;

    setFiles([]);
    setBpeDate(information?.bpeDate ? new Date(information.bpeDate) : null);
    setStatus(information?.filingStatus ?? '');
    setFormKey((prev) => prev + 1);
  }, [information?.bpeDate, information?.filingStatus, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      bpeNumber: String(formData.get('bpeNumber') ?? ''),
      bpeDate: bpeDate ? bpeDate.toISOString().split('T')[0] : '',
      djpReferenceNo: String(formData.get('djpReferenceNo') ?? ''),
      status,
      files,
    });
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex flex-col w-[512px] sm:max-w-[512px] p-0 gap-0 h-full max-h-screen rounded-l-none">
        <DrawerHeader className="px-6 py-4 border-b border-slate-200">
          <DrawerTitle className="text-2xl font-semibold text-slate-950">
            Set Filling Information
          </DrawerTitle>
        </DrawerHeader>

        <form
          key={formKey}
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col justify-between overflow-y-auto"
        >
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-950">
                  BPE Number <span className="text-teal-600">*</span>
                </Label>
                <Input
                  name="bpeNumber"
                  placeholder="Enter BPE number"
                  defaultValue={information?.bpeNumber ?? ''}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-950">
                  BPE Date <span className="text-teal-600">*</span>
                </Label>
                <DatePicker
                  mode="single"
                  value={bpeDate}
                  onChange={(date) => setBpeDate(date instanceof Date ? date : null)}
                  placeholder="Select BPE date"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-950">
                  DJP Reference No <span className="text-teal-600">*</span>
                </Label>
                <Input
                  name="djpReferenceNo"
                  placeholder="Enter DJP reference no"
                  defaultValue={information?.djpReferenceNo ?? ''}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-950">
                  Status <span className="text-teal-600">*</span>
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-950">
                  BPE Attachment <span className="text-teal-600">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Add files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="space-y-2">
                {information?.attachments?.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 bg-slate-50"
                  >
                    <div className="rounded-lg border border-slate-200 p-2 text-slate-700">
                      <FileText className="h-6 w-6" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <a
                        href={attachment.url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-sm font-medium text-slate-950 hover:underline block"
                      >
                        {attachment.fileName}
                      </a>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(attachment.fileSize)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8 text-slate-500 shrink-0"
                    >
                      <a href={attachment.url} download target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
                {files.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 bg-white"
                  >
                    <div className="rounded-lg border border-slate-200 p-2 text-slate-700">
                      <FileText className="h-6 w-6" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-950">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500"
                      onClick={() => handleRemoveFile(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DrawerFooter className="grid grid-cols-2 gap-4 p-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Tutup
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Set
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
