import { z } from 'zod';

export const purchaseOrderInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Nomor invoice wajib diisi'),
  invoiceDate: z.string().min(1, 'Tanggal invoice wajib diisi'),
  invoiceDueDate: z.string().min(1, 'Tanggal jatuh tempo invoice wajib diisi'),
  invoiceAmount: z.number().default(0),
  taxInvoiceNumber: z.string().optional().default(''),
  taxInvoiceDate: z.string().optional().default(''),
  taxInvoiceStatus: z.string().optional().default(''),
  taxpayerNpwp: z.string().optional().default(''),
  taxes: z
    .array(
      z.object({
        taxTypeId: z.string().min(1, 'Tipe pajak wajib diisi'),
        rate: z.number({ message: 'Tarif pajak wajib diisi' }).min(0, 'Tarif pajak tidak valid'),
      })
    )
    .default([]),
  documents: z
    .array(
      z.object({
        documentTypeId: z.string().default(''),
        files: z.array(z.instanceof(File)).default([]),
        existingIds: z.array(z.string()).default([]),
      })
    )
    .default([]),
  invoiceDocuments: z.array(z.instanceof(File)).optional().default([]),
  invoiceDocuments__existingIds: z.array(z.string()).optional().default([]),
  taxDocuments: z.array(z.instanceof(File)).optional().default([]),
  taxDocuments__existingIds: z.array(z.string()).optional().default([]),
});

export type PurchaseOrderInvoiceFormSchema = z.infer<typeof purchaseOrderInvoiceSchema>;
