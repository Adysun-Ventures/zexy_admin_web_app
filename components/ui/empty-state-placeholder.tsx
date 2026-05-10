import { LucideIcon } from 'lucide-react';

interface EmptyStatePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyStatePlaceholder({
  icon: Icon,
  title,
  description,
}: EmptyStatePlaceholderProps) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-6 w-6 text-slate-500" />
      </div>
      <p className="font-medium text-slate-700">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  );
}
