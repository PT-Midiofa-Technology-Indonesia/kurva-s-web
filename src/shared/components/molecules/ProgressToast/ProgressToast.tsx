import { Progress } from '@/shared/components/ui/progress';

export interface ProgressToastProps {
  label: string;
  percent: number;
}

export function ProgressToast({ label, percent }: ProgressToastProps) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-lg border bg-background p-4 shadow-md">
      <p className="text-sm font-medium">{label}</p>
      <Progress value={percent} />
    </div>
  );
}
