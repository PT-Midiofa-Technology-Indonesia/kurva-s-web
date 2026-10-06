import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui';
import { formatCurrencyIDR, formatNumber } from '@/shared/utils/format';
import {
  getPayrollSignedAmount,
  type PayrollDraftEmployeeGroup,
} from '../services/group-payroll-draft-items';

interface PayrollDraftSnapshotProps {
  groups: PayrollDraftEmployeeGroup[];
}

export function PayrollDraftSnapshot({ groups }: PayrollDraftSnapshotProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Snapshot Payroll</CardTitle>
        <CardDescription>
          Rincian tersimpan saat draft di-generate dan tidak mengikuti perubahan struktur gaji.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            Snapshot payroll tidak memiliki rincian karyawan.
          </p>
        ) : (
          <Accordion type="multiple" className="rounded-lg border px-4">
            {groups.map((group) => (
              <AccordionItem key={group.employeeId} value={group.employeeId}>
                <AccordionTrigger className="hover:no-underline">
                  <span className="flex flex-1 flex-col gap-1 pr-4 sm:flex-row sm:items-center sm:justify-between">
                    <span>{group.employeeName}</span>
                    <span className="text-sm font-semibold">
                      {formatCurrencyIDR(group.subtotal)}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Komponen</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="text-right">Kehadiran / Referensi</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.items.map((item) => {
                        const signedAmount = getPayrollSignedAmount(item);

                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.componentName}</TableCell>
                            <TableCell>
                              {item.componentCategoryLabel || item.componentCategory}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.referenceCount === null
                                ? '-'
                                : formatNumber(item.referenceCount)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrencyIDR(signedAmount)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
