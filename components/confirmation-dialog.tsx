import { Button } from '@/components/ui/button';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmationDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => onOpenChange(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      <div
        className="relative w-full max-w-md rounded-lg border bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-background text-slate-600 hover:bg-slate-100"
        >
          <i className="fa-solid fa-xmark text-sm" aria-hidden="true" />
        </button>

        <div className="space-y-2 text-center sm:text-left">
          <h2 id="confirmation-dialog-title" className="text-lg font-semibold">
            {title}
          </h2>
          <p id="confirmation-dialog-description" className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <i className="fa-solid fa-xmark mr-2 text-sm" aria-hidden="true" />
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={variant === 'destructive' ? 'bg-red-600 text-white hover:bg-red-700' : ''}
          >
            <i className="fa-regular fa-trash-can mr-2 text-sm" aria-hidden="true" />
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
