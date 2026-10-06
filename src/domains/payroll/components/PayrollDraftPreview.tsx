import { Alert, AlertDescription, AlertTitle } from '@/shared/components/molecules';
import {
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
import type { PayrollDraftPreview as PayrollDraftPreviewData } from '../types';

interface PayrollDraftPreviewProps {
  preview: PayrollDraftPreviewData;
}

export function PayrollDraftPreview({ preview }: PayrollDraftPreviewProps) {
  const estimatedTotal = preview.manpower.reduce(
    (total, employee) => total + employee.estimated_amount,
    0
  );

  return (
    <div className="flex flex-col gap-4">
      {preview.skipped_no_company.length > 0 && (
        <Alert variant="warning">
          <div>
            <AlertTitle>Karyawan bukan primary</AlertTitle>
            <AlertDescription>
              {preview.skipped_no_company.length} karyawan bukan primary di company ini dan
              dilewati: {preview.skipped_no_company.map((employee) => employee.name).join(', ')}.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {preview.skipped_no_grade_or_type.length > 0 && (
        <Alert variant="warning">
          <div>
            <AlertTitle>Data payroll belum lengkap</AlertTitle>
            <AlertDescription>
              {preview.skipped_no_grade_or_type.length} karyawan tidak memiliki golongan atau salary
              type yang sesuai. Perbarui melalui Employee Detail:{' '}
              {preview.skipped_no_grade_or_type.map((employee) => employee.name).join(', ')}.
            </AlertDescription>
          </div>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Preview Payroll</CardTitle>
          <CardDescription>
            Perhitungan ini masih live dan belum disimpan sebagai snapshot payroll.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Karyawan diproses</p>
              <p className="mt-1 text-lg font-semibold">{formatNumber(preview.manpower.length)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Karyawan dilewati</p>
              <p className="mt-1 text-lg font-semibold">
                {formatNumber(
                  preview.skipped_no_company.length + preview.skipped_no_grade_or_type.length
                )}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Estimasi total</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrencyIDR(estimatedTotal)}</p>
            </div>
          </div>

          {preview.manpower.length === 0 ? (
            <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
              Tidak ada karyawan yang dapat diproses pada periode ini.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Karyawan</TableHead>
                  <TableHead>Golongan</TableHead>
                  <TableHead>Salary Type</TableHead>
                  <TableHead className="text-right">Komponen</TableHead>
                  <TableHead className="text-right">Kehadiran</TableHead>
                  <TableHead className="text-right">Estimasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.manpower.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.grade}</TableCell>
                    <TableCell className="capitalize">{employee.salary_type}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(employee.component_count)}
                    </TableCell>
                    <TableCell className="text-right">
                      {employee.attendance_count === null
                        ? '-'
                        : formatNumber(employee.attendance_count)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrencyIDR(employee.estimated_amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
